import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'

import { GradeBadge } from '@/components/analysis/GradeBadge'
import { CharacterReportPanel, PlayerReportPanel } from '@/components/analysis'
import { MatchRow } from '@/components/player'
import {
  DemoDataNotice,
  EmptyState,
  MetricPill,
  SectionHeader,
  Skeleton,
  SkeletonCard,
  SourceBadge,
  StatCard,
  SurfaceCard,
  TierBadge,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useMatchDTOHistory } from '@/hooks/useMatchDTOHistory'
import { usePlayerStatsDTO } from '@/hooks/usePlayerStatsDTO'
import { usePlayerSummary } from '@/hooks/usePlayerSummary'
import { getDemoPlayerAnalysisReport, getDemoPlayerCharacterReports } from '@/mocks/loader'
import { getErrorMessage } from '@/utils/errorMessage'

export function ProfilePage() {
  const { nickname: nicknameParam } = useParams()
  const nickname = nicknameParam ? decodeURIComponent(nicknameParam) : ''

  const summaryQuery = usePlayerSummary(nickname)
  const userNum = summaryQuery.data?.userNum ?? 0
  const statsQuery = usePlayerStatsDTO(userNum, summaryQuery.data?.tier)
  const matchesQuery = useMatchDTOHistory(userNum)

  const analysisReport = useMemo(
    () =>
      summaryQuery.data
        ? getDemoPlayerAnalysisReport(summaryQuery.data.nickname)
        : null,
    [summaryQuery.data],
  )

  const characterReports = useMemo(
    () =>
      summaryQuery.data
        ? getDemoPlayerCharacterReports(summaryQuery.data.nickname)
        : [],
    [summaryQuery.data],
  )

  if (!nickname.trim()) {
    return (
      <EmptyState
        title="URL에 플레이어 닉네임이 없습니다"
        action={
          <Link className="text-primary text-sm underline-offset-4 hover:underline" to="/">
            홈으로
          </Link>
        }
      />
    )
  }

  if (summaryQuery.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    )
  }

  if (summaryQuery.isError) {
    return (
      <EmptyState
        title="프로필 정보를 불러오지 못했습니다"
        description={getErrorMessage(summaryQuery.error, '잠시 후 다시 시도해주세요.')}
        action={
          <Link className="text-primary text-sm underline-offset-4 hover:underline" to="/">
            홈으로
          </Link>
        }
      />
    )
  }

  if (summaryQuery.data === null) {
    return (
      <EmptyState
        title="데모 데이터에 없는 플레이어입니다"
        description="홈에서 샘플 닉네임으로 검색해보세요."
        action={
          <Link className="text-primary text-sm underline-offset-4 hover:underline" to="/">
            홈으로
          </Link>
        }
      />
    )
  }

  const summary = summaryQuery.data
  const matchItems = matchesQuery.data?.pages.flatMap((page) => page.data.items) ?? []
  const matchesSource = matchesQuery.data?.pages[0]?.source
  const stats = statsQuery.data?.data

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <SurfaceCard variant="accent" padding="lg" className="relative overflow-hidden">
        <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-3">
            <Link
              className="text-muted-foreground hover:text-foreground inline-flex min-h-8 items-center text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              to="/"
            >
              ← 검색으로
            </Link>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight break-all sm:text-4xl">
                {summary.nickname}
              </h1>
              <div className="flex flex-wrap items-center gap-2.5">
                <TierBadge tier={summary.tier} />
                <span className="text-muted-foreground text-sm">Lv.{summary.level}</span>
                {stats ? (
                  <span className="text-muted-foreground text-sm">MMR {stats.mmr}</span>
                ) : null}
              </div>
            </div>
            <DemoDataNotice compact />
          </div>
          {stats ? (
            <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
              <MetricPill label="승률" value={`${stats.winRate}%`} />
              <MetricPill label="KDA" value={stats.kdaString} />
              <MetricPill label="평균 순위" value={stats.avgPlacement.toFixed(2)} />
              <MetricPill label="총 판수" value={String(stats.games)} />
            </div>
          ) : null}
        </div>
      </SurfaceCard>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <section className="space-y-4 lg:col-span-8">
          <SectionHeader
            title="시즌 요약"
            description="최근 데모 매치에서 집계한 기본 통계입니다."
            badge={
              statsQuery.isSuccess && statsQuery.data?.source ? (
                <SourceBadge source={statsQuery.data.source} />
              ) : undefined
            }
          />
          {statsQuery.isPending ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : statsQuery.isError ? (
            <EmptyState
              title="통계 정보를 불러오지 못했습니다"
              description={getErrorMessage(statsQuery.error, '잠시 후 다시 시도해주세요.')}
            />
          ) : statsQuery.isSuccess && stats ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="티어" value={stats.tier} highlight />
              <StatCard label="MMR" value={stats.mmr} highlight />
              <StatCard label="승률" value={`${stats.winRate}%`} highlight />
              <StatCard label="KDA" value={stats.kdaString} />
              <StatCard label="평균 순위" value={stats.avgPlacement.toFixed(2)} />
              <StatCard label="평균 킬" value={stats.avgKills.toFixed(2)} />
              <StatCard label="총 판수" value={stats.games} />
              <StatCard
                label="주 캐릭터"
                value={stats.mostPlayedCharacter.name}
                description={`${stats.mostPlayedCharacter.count}판`}
                highlight
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>
          ) : null}
        </section>

        {analysisReport?.status === 'ok' ? (
          <aside className="lg:col-span-4">
            <SurfaceCard variant="elevated" padding="lg" className="sticky top-20 space-y-4">
              <SectionHeader
                title="플레이 리포트 요약"
                description="최근 데모 매치 기준 룰 기반 분석"
                size="default"
              />
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    종합 등급
                  </p>
                  <div className="mt-2">
                    {analysisReport.overallGrade ? (
                      <GradeBadge grade={analysisReport.overallGrade} className="text-base" />
                    ) : (
                      <p className="text-sm font-medium">분석 데이터 부족</p>
                    )}
                  </div>
                </div>
                {analysisReport.overallPercentile != null ? (
                  <MetricPill
                    label="샘플 대비 백분위"
                    value={`${analysisReport.overallPercentile.toFixed(0)}%`}
                    className="w-full"
                  />
                ) : null}
                <p className="text-foreground text-sm leading-relaxed">{analysisReport.summary}</p>
              </div>
            </SurfaceCard>
          </aside>
        ) : null}
      </div>

      <SurfaceCard variant="inset" padding="lg" className="space-y-8 lg:space-y-10">
        <SectionHeader
          title="플레이 분석"
          description="최근 데모 매치를 바탕으로 플레이 흐름과 캐릭터별 안정성을 확인합니다."
          size="lg"
        />
        {analysisReport ? <PlayerReportPanel report={analysisReport} /> : null}
        <CharacterReportPanel reports={characterReports} />
      </SurfaceCard>

      <section className="space-y-4">
        <SectionHeader
          title="최근 매치"
          description="분석에 사용된 최근 전적 흐름을 확인합니다."
          badge={matchesSource ? <SourceBadge source={matchesSource} /> : undefined}
        />
        {matchesQuery.isPending ? (
          <div className="grid gap-3 md:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : matchesQuery.isError ? (
          <EmptyState
            title="전적 정보를 불러오지 못했습니다"
            description={getErrorMessage(matchesQuery.error, '잠시 후 다시 시도해주세요.')}
          />
        ) : matchItems.length === 0 ? (
          <EmptyState title="기록된 전적이 없습니다" />
        ) : (
          <>
            <ul className="grid gap-3 md:grid-cols-2">
              {matchItems.map((m) => (
                <MatchRow key={m.matchId} match={m} />
              ))}
            </ul>
            {matchesQuery.hasNextPage ? (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                disabled={matchesQuery.isFetchingNextPage}
                onClick={() => void matchesQuery.fetchNextPage()}
              >
                {matchesQuery.isFetchingNextPage ? '불러오는 중…' : '더 보기'}
              </Button>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}
