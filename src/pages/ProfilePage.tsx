import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'

import { fetchPlayerByNickname } from '@/api/player'
import { useMatchDTOHistory } from '@/hooks/useMatchDTOHistory'
import { usePlayerStatsDTO } from '@/hooks/usePlayerStatsDTO'
import { getErrorMessage } from '@/utils/errorMessage'

export function ProfilePage() {
  const { nickname: nicknameParam } = useParams()
  const nickname = nicknameParam ? decodeURIComponent(nicknameParam) : ''

  const summaryQuery = useQuery({
    queryKey: ['player', 'summary', nickname],
    queryFn: async () => {
      const res = await fetchPlayerByNickname(nickname)
      return res.data
    },
    enabled: nickname.length > 0,
  })

  const userNum = summaryQuery.data?.userNum ?? 0
  const statsQuery = usePlayerStatsDTO(userNum)
  const matchesQuery = useMatchDTOHistory(userNum)

  if (!nickname.trim()) {
    return (
      <div className="mx-auto max-w-lg p-6 text-left">
        <p className="text-muted-foreground text-sm">URL에 플레이어 닉네임이 없습니다.</p>
        <Link className="text-primary mt-4 inline-block text-sm underline-offset-4 hover:underline" to="/">
          홈으로
        </Link>
      </div>
    )
  }

  if (summaryQuery.isPending) {
    return (
      <div className="mx-auto max-w-lg p-6 text-left">
        <p className="text-muted-foreground text-sm">프로필 불러오는 중…</p>
      </div>
    )
  }

  if (summaryQuery.isError) {
    return (
      <div className="mx-auto max-w-lg p-6 text-left">
        <p className="text-destructive text-sm" role="alert">
          {getErrorMessage(summaryQuery.error, '프로필 정보를 불러오지 못했습니다')}
        </p>
        <Link className="text-primary mt-4 inline-block text-sm underline-offset-4 hover:underline" to="/">
          홈으로
        </Link>
      </div>
    )
  }

  if (summaryQuery.data === null) {
    return (
      <div className="mx-auto max-w-lg p-6 text-left">
        <p className="text-muted-foreground text-sm">플레이어를 찾을 수 없습니다.</p>
        <Link className="text-primary mt-4 inline-block text-sm underline-offset-4 hover:underline" to="/">
          홈으로
        </Link>
      </div>
    )
  }

  const summary = summaryQuery.data
  const matchItems = matchesQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 p-6 text-left">
      <Link className="text-primary text-sm underline-offset-4 hover:underline" to="/">
        ← 검색으로
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{summary.nickname}</h1>
        <p className="text-muted-foreground text-sm">
          레벨 {summary.level} · {summary.tier}
        </p>
      </header>

      <section className="space-y-2 text-sm">
        <h2 className="text-foreground font-medium">통계</h2>
        {statsQuery.isPending ? (
          <p className="text-muted-foreground">통계 불러오는 중…</p>
        ) : statsQuery.isError ? (
          <p className="text-destructive" role="alert">
            {getErrorMessage(statsQuery.error, '통계 정보를 불러오지 못했습니다')}
          </p>
        ) : statsQuery.isSuccess ? (
          <div className="space-y-1">
            <p>승률: {statsQuery.data.data.winRate}%</p>
            <p>KDA: {statsQuery.data.data.kdaString}</p>
            <p>총 판수: {statsQuery.data.data.games}</p>
            <p>평균 순위: {statsQuery.data.data.avgPlacement.toFixed(2)}</p>
            <p>평균 킬: {statsQuery.data.data.avgKills.toFixed(2)}</p>
            <p>가장 많이 한 캐릭터: {statsQuery.data.data.mostPlayedCharacter.name}</p>
          </div>
        ) : null}
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="text-foreground font-medium">최근 전적</h2>
        {matchesQuery.isPending ? (
          <p className="text-muted-foreground">전적 불러오는 중…</p>
        ) : matchesQuery.isError ? (
          <p className="text-destructive" role="alert">
            {getErrorMessage(matchesQuery.error, '전적 정보를 불러오지 못했습니다')}
          </p>
        ) : matchItems.length === 0 ? (
          <p className="text-muted-foreground">기록된 전적이 없습니다.</p>
        ) : (
          <ul className="divide-border divide-y rounded-md border">
            {matchItems.map((m) => (
              <li key={m.matchId} className="space-y-1 px-3 py-2">
                <p className="font-medium">{m.characterName}</p>
                <p>
                  {m.placementLabel} · KDA {m.kdaString}
                  {m.victory ? ' · 승리' : ''}
                </p>
                <p className="text-muted-foreground text-xs">{m.relativeTime}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
