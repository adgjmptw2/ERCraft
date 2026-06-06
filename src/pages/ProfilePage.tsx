import { Link, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'

import {
  ProfileAnalysisTab,
  ProfileHero,
  ProfileRecordsTab,
  ProfileTabNav,
  type ProfileTabId,
} from '@/components/profile'
import {
  DEMO_LATEST_SEASON,
  getDemoPlayerAnalysisReportForSeason,
  getDemoPlayerCharacterReportsForSeason,
  getDemoPlayerRankingPosition,
  getDemoPlayerRpTrendForSeason,
  getDemoPlayerSeasonHistory,
  getDemoSeasonSnapshot,
} from '@/mocks/loader'
import { getErrorMessage } from '@/utils/errorMessage'
import {
  EmptyState,
  Skeleton,
  SkeletonCard,
} from '@/components/shared'
import { useMatchDTOHistory } from '@/hooks/useMatchDTOHistory'
import { usePlayerStatsDTO } from '@/hooks/usePlayerStatsDTO'
import { usePlayerSummary } from '@/hooks/usePlayerSummary'

export function ProfilePage() {
  const { nickname: nicknameParam } = useParams()
  const nickname = nicknameParam ? decodeURIComponent(nicknameParam) : ''
  const [activeTab, setActiveTab] = useState<ProfileTabId>('records')
  const [selectedSeason, setSelectedSeason] = useState(DEMO_LATEST_SEASON)

  const summaryQuery = usePlayerSummary(nickname)
  const userNum = summaryQuery.data?.userNum ?? 0
  const statsQuery = usePlayerStatsDTO(userNum, summaryQuery.data?.tier)
  const matchesQuery = useMatchDTOHistory(userNum)

  const seasonHistory = useMemo(
    () => (userNum > 0 ? getDemoPlayerSeasonHistory(userNum) : []),
    [userNum],
  )

  const seasonSnapshot = useMemo(
    () => (userNum > 0 ? getDemoSeasonSnapshot(userNum, selectedSeason) : null),
    [userNum, selectedSeason],
  )

  const characterReports = useMemo(
    () =>
      summaryQuery.data
        ? getDemoPlayerCharacterReportsForSeason(summaryQuery.data.nickname, selectedSeason)
        : [],
    [summaryQuery.data, selectedSeason],
  )

  const analysisReport = useMemo(
    () =>
      summaryQuery.data
        ? getDemoPlayerAnalysisReportForSeason(summaryQuery.data.nickname, selectedSeason)
        : null,
    [summaryQuery.data, selectedSeason],
  )

  const rankingPosition = useMemo(
    () => (summaryQuery.data ? getDemoPlayerRankingPosition(summaryQuery.data.nickname) : null),
    [summaryQuery.data],
  )

  const rpTrend = useMemo(
    () =>
      summaryQuery.data
        ? getDemoPlayerRpTrendForSeason(summaryQuery.data.nickname, selectedSeason)
        : [],
    [summaryQuery.data, selectedSeason],
  )

  const matchItems = useMemo(() => {
    const all = matchesQuery.data?.pages.flatMap((page) => page.data.items) ?? []
    return all.filter((m) => (m.seasonNumber ?? DEMO_LATEST_SEASON) === selectedSeason)
  }, [matchesQuery.data, selectedSeason])

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
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-[35%_1fr]">
          <div className="min-h-80">
            <SkeletonCard />
          </div>
          <div className="min-h-96">
            <SkeletonCard />
          </div>
        </div>
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
  const matchesSource = matchesQuery.data?.pages[0]?.source
  const rp = statsQuery.data?.data?.mmr

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <ProfileHero
        summary={summary}
        rankingPosition={rankingPosition}
        seasons={seasonHistory}
        selectedSeason={selectedSeason}
        selectedTier={seasonSnapshot?.tier ?? summary.tier}
        onSeasonChange={setSelectedSeason}
        rp={rp}
      />

      <ProfileTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div role="tabpanel" aria-label={activeTab === 'records' ? '전적' : '분석'}>
        {activeTab === 'records' ? (
          seasonSnapshot ? (
            <ProfileRecordsTab
              seasonSnapshot={seasonSnapshot}
              characterReports={characterReports}
              userNum={userNum}
              matchItems={matchItems}
              matchesSource={matchesSource}
              matchesPending={matchesQuery.isPending}
              matchesError={matchesQuery.isError}
              matchesErrorObj={matchesQuery.error}
              hasNextPage={
                selectedSeason === DEMO_LATEST_SEASON ? (matchesQuery.hasNextPage ?? false) : false
              }
              isFetchingNextPage={matchesQuery.isFetchingNextPage}
              onLoadMore={() => void matchesQuery.fetchNextPage()}
            />
          ) : (
            <EmptyState title="해당 시즌 데이터가 없습니다" />
          )
        ) : (
          <ProfileAnalysisTab
            analysisReport={analysisReport}
            characterReports={characterReports}
            rpTrend={rpTrend}
            seasonNumber={selectedSeason}
          />
        )}
      </div>
    </div>
  )
}
