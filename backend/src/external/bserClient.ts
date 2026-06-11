// BSER Open API 클라이언트 (OpenAPI 2026-05-04 / v11 기준)
// - 모든 요청에 x-api-key 필요
// - 응답은 { code, message, ...payload } 래퍼. HTTP 200이어도 body.code가 에러일 수 있음
// - userNum 검색은 폐지됨 → 닉네임으로 uid를 얻은 뒤 uid 기반 엔드포인트 사용

const BSER_BASE_URL = 'https://open-api.bser.io'

/** 스쿼드 랭크만 지원 (문서 4.2 / 4.3) */
export const BSER_MATCHING_MODE_RANKED = 3
export const BSER_TEAM_MODE_SQUAD = 3

export class BserApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'BserApiError'
    this.status = status
  }
}

export interface BserUser {
  uid: string
  nickname: string
}

export interface BserUserRank {
  mmr: number
  nickname: string
  rank: number
  serverCode?: number
  serverRank?: number
}

export interface BserCharacterStat {
  characterCode: number
  totalGames: number
  maxKillings: number
  top3: number
  wins: number
  averageRank: number
}

export interface BserUserStat {
  seasonId: number
  matchingMode: number
  matchingTeamMode: number
  mmr: number
  nickname: string
  rank: number
  rankSize: number
  totalGames: number
  totalWins: number
  totalTeamKills: number
  totalDeaths: number
  averageRank: number
  averageKills: number
  averageAssistants: number
  top1: number
  top3: number
  characterStats?: BserCharacterStat[]
}

/** BattleUserResult 중 매핑에 쓰는 필드만 (문서 3.5) */
export interface BserUserGame {
  gameId: number
  seasonId: number
  matchingMode: number
  matchingTeamMode: number
  characterNum: number
  characterLevel: number
  gameRank: number
  playerKill: number
  playerDeaths?: number
  playerAssistant: number
  monsterKill: number
  teamKill?: number
  victory: number
  startDtm: string
  playTime?: number
  duration?: number
  damageToPlayer?: number
  totalGainVFCredit?: number
  mmrAfter?: number
  mmrGain?: number
  viewContribution?: number
  accountLevel?: number
}

interface BserEnvelope {
  code: number
  message: string
  [key: string]: unknown
}

interface BserSeasonRow {
  seasonID: number
  isCurrent: number
}

export class BserClient {
  private readonly apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0
  }

  private async request(path: string): Promise<BserEnvelope> {
    const res = await fetch(`${BSER_BASE_URL}${path}`, {
      headers: { 'x-api-key': this.apiKey, accept: 'application/json' },
    })

    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      // 비정상 응답(HTML 등) — 아래에서 상태 코드로 처리
    }

    const envelope =
      typeof body === 'object' && body !== null ? (body as BserEnvelope) : null
    const code = envelope?.code ?? res.status

    if (!res.ok || code !== 200) {
      const status = code === 200 ? res.status : code
      throw new BserApiError(status, envelope?.message ?? `BSER request failed (${res.status})`)
    }
    if (!envelope) {
      throw new BserApiError(502, 'BSER returned an empty body')
    }
    return envelope
  }

  /** UID 조회 (v1). 없는 닉네임이면 null */
  async getUserByNickname(nickname: string): Promise<BserUser | null> {
    try {
      const body = await this.request(`/v1/user/nickname?query=${encodeURIComponent(nickname)}`)
      const user = body.user as BserUser | undefined
      return user && typeof user.uid === 'string' ? user : null
    } catch (e) {
      if (e instanceof BserApiError && e.status === 404) return null
      throw e
    }
  }

  /** 사용자 경기 목록 (v1, 최근 90일). next 커서로 페이지네이션 */
  async getUserGames(uid: string, next?: number): Promise<{ games: BserUserGame[]; next?: number }> {
    const suffix = next !== undefined ? `?next=${next}` : ''
    const body = await this.request(`/v1/user/games/uid/${encodeURIComponent(uid)}${suffix}`)
    const games = Array.isArray(body.userGames) ? (body.userGames as BserUserGame[]) : []
    const cursor = typeof body.next === 'number' ? body.next : undefined
    return { games, next: cursor }
  }

  /** 사용자 랭크 (v1, 스쿼드 전용). 랭크 정보 없으면 null */
  async getUserRank(uid: string, seasonId: number): Promise<BserUserRank | null> {
    try {
      const body = await this.request(
        `/v1/rank/uid/${encodeURIComponent(uid)}/${seasonId}/${BSER_TEAM_MODE_SQUAD}`,
      )
      return (body.userRank as BserUserRank | undefined) ?? null
    } catch (e) {
      if (e instanceof BserApiError && e.status === 404) return null
      throw e
    }
  }

  /** 사용자 통계 (v2). 랭크 대전 기준 */
  async getUserStats(uid: string, seasonId: number): Promise<BserUserStat[]> {
    try {
      const body = await this.request(
        `/v2/user/stats/uid/${encodeURIComponent(uid)}/${seasonId}/${BSER_MATCHING_MODE_RANKED}`,
      )
      return Array.isArray(body.userStats) ? (body.userStats as BserUserStat[]) : []
    } catch (e) {
      if (e instanceof BserApiError && e.status === 404) return []
      throw e
    }
  }

  /** 게임 데이터의 Season 테이블에서 현재 시즌 ID 조회 */
  async getCurrentSeasonId(): Promise<number | null> {
    const body = await this.request('/v2/data/Season')
    const rows = Array.isArray(body.data) ? (body.data as BserSeasonRow[]) : []
    const current = rows.find((row) => row.isCurrent === 1)
    return current?.seasonID ?? null
  }

  /** l10n에서 캐릭터 코드 → 한국어 이름 매핑 다운로드 (문서 2.4.2) */
  async getCharacterNames(language = 'Korean'): Promise<Map<number, string>> {
    const meta = await this.request(`/v1/l10n/${language}`)
    const data = meta.data as { l10Path?: string } | undefined
    const url = data?.l10Path
    const names = new Map<number, string>()
    if (!url) return names

    const res = await fetch(url)
    if (!res.ok) {
      throw new BserApiError(res.status, 'Failed to download l10n data')
    }
    const text = await res.text()
    const prefix = 'Character/Name/'
    for (const line of text.split('\n')) {
      if (!line.startsWith(prefix)) continue
      const [key, value] = line.split('┃', 2)
      if (!key || value === undefined) continue
      const code = Number(key.slice(prefix.length))
      if (Number.isInteger(code) && code > 0) {
        names.set(code, value.trim())
      }
    }
    return names
  }
}
