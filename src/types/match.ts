import type { GameMode } from '@/utils/gameMode'
import type { EquipmentItemGrade } from '@/utils/equipmentItemGrade'

/** Fankit 검증 slug만 UI에 노출 — mock/API optional */
export interface MatchEquipmentGearPreview {
  /** 5 — 완성 무기 아이템 */
  weapon?: string
  /** 6 — 상의 */
  chest?: string
  /** 7 — 머리 */
  head?: string
  /** 8 — 팔/액세서리 */
  arm?: string
  /** 9 — 신발 */
  leg?: string
}

/** 슬롯별 장비 등급 (전설·영웅·혈액 배경색) */
export interface MatchEquipmentGearGrades {
  weapon?: EquipmentItemGrade
  chest?: EquipmentItemGrade
  head?: EquipmentItemGrade
  arm?: EquipmentItemGrade
  leg?: EquipmentItemGrade
}

export interface MatchEquipmentPreview {
  /** 1 — 무기 종류 (weapons/weapon-group/arcana 등) */
  weaponTypeSlug?: string
  /** 2 — 전술 스킬 (tactical-skills/blink 등) */
  tacticalSkillSlug?: string
  /** 3 — 메인 특성 */
  mainTraitSlug?: string
  /** 4 — 보조 특성 트리 그룹 아이콘 (저항·혼돈 등) */
  subTraitSlug?: string
  /** 5~9 — 장비 슬롯 */
  gear?: MatchEquipmentGearPreview
  gearGrade?: MatchEquipmentGearGrades
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  hasNext: boolean
}

export interface MatchSummary {
  matchId: string
  userNum: number
  characterNum?: number
  characterName: string
  placement: number
  kills: number
  deaths: number
  assists: number
  gameStartedAt: string
  victory: boolean
  seasonNumber?: number
  rpAfter?: number
  rpDelta?: number
  /** 게임 플레이 시간(초). mock 미지정 시 matchId 시드로 1200~2400 생성 */
  gameDuration?: number
  /** 플레이어 딜량 */
  playerDamage?: number
  /** 동물(몬스터) 딜량 */
  monsterDamage?: number
  /** 획득 크레딧 */
  credit?: number
  /** 팀 킬 (데모 optional) */
  teamKills?: number
  /** 플레이어 대상 딜량 (데모 optional) */
  damageToPlayers?: number
  /** 시야 점수 (데모 optional) */
  visionScore?: number
  /** 동물 킬 (데모 optional) */
  animalKills?: number
  /** 랭크 · 코발트 · 유니온 · 일반 */
  gameMode?: GameMode
  equipmentPreview?: MatchEquipmentPreview
}

export interface MatchDetail extends MatchSummary {
  damageToPlayers?: number
  visionScore?: number
}

export interface MatchSummaryDTO extends MatchSummary {
  gameMode: GameMode
  gameModeLabel: string
  kdaString: string
  placementLabel: string
  relativeTime: string
  gameDuration: number
  gameDurationLabel: string
  teamKill: number
  playerDamage: number
  rpDeltaValue: number
  matchGrade: string
  teamLuck: 'good' | 'normal' | 'bad'
  teamLuckLabel: string
  teamLuckIcon: string
  routeNumber: number
  characterLevel: number
  equipmentPreview?: MatchEquipmentPreview
}
