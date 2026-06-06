import type { CharacterAnalysisReport } from '@/analysis/types'
import type { DemoSeasonSnapshot } from '@/mocks/seasonHistory'
import type { MatchSummaryDTO } from '@/types/match'
import type { DataSource } from '@/types/api'
import { ProfileRecordsSidebar } from '@/components/profile/ProfileRecordsSidebar'
import { RecentMatchList } from '@/components/player/RecentMatchList'

export interface ProfileRecordsTabProps {
  seasonSnapshot: DemoSeasonSnapshot
  characterReports: CharacterAnalysisReport[]
  userNum: number
  matchItems: MatchSummaryDTO[]
  matchesSource?: DataSource
  matchesPending: boolean
  matchesError: boolean
  matchesErrorObj: unknown
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

export function ProfileRecordsTab({
  seasonSnapshot,
  characterReports,
  userNum,
  matchItems,
  matchesSource,
  matchesPending,
  matchesError,
  matchesErrorObj,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ProfileRecordsTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,35%)_minmax(0,65%)] lg:items-start lg:gap-8">
      <ProfileRecordsSidebar
        seasonSnapshot={seasonSnapshot}
        characterReports={characterReports}
        userNum={userNum}
      />
      <RecentMatchList
        matches={matchItems}
        matchesSource={matchesSource}
        isPending={matchesPending}
        isError={matchesError}
        error={matchesErrorObj}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={onLoadMore}
      />
    </div>
  )
}
