import { MatchRow } from '@/components/player/MatchRow'
import { EmptyState, SectionHeader, SkeletonCard, SourceBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import type { DataSource } from '@/types/api'
import type { MatchSummaryDTO } from '@/types/match'
import { getErrorMessage } from '@/utils/errorMessage'
import { SurfaceCard } from '@/components/shared/SurfaceCard'

export interface RecentMatchListProps {
  matches: MatchSummaryDTO[]
  matchesSource?: DataSource
  isPending: boolean
  isError: boolean
  error: unknown
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
}

export function RecentMatchList({
  matches,
  matchesSource,
  isPending,
  isError,
  error,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: RecentMatchListProps) {
  return (
    <SurfaceCard
      padding="lg"
      className="flex h-full min-h-0 min-w-0 flex-col gap-5 px-2 py-5 sm:px-5 md:px-6"
    >
      <SectionHeader
        title="최근 매치"
        badge={matchesSource ? <SourceBadge source={matchesSource} /> : undefined}
      />
      {isPending ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isError ? (
        <EmptyState
          title="전적 정보를 불러오지 못했습니다"
          description={getErrorMessage(error, '잠시 후 다시 시도해주세요.')}
        />
      ) : matches.length === 0 ? (
        <EmptyState title="기록된 전적이 없습니다" />
      ) : (
        <>
          <ul className="divide-border/60 flex min-w-0 flex-col divide-y [&>li]:min-w-0 [&>li]:py-1.5">
            {matches.map((m) => (
              <MatchRow key={m.matchId} match={m} variant="record" />
            ))}
          </ul>
          {hasNextPage ? (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isFetchingNextPage}
              onClick={onLoadMore}
            >
              {isFetchingNextPage ? '불러오는 중…' : '더 보기'}
            </Button>
          ) : null}
        </>
      )}
    </SurfaceCard>
  )
}
