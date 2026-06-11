import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'

import type { DemoRankingPosition } from '@/mocks/loader'
import type { DemoSeasonRecord } from '@/mocks/seasonHistory'
import type { PlayerSummary } from '@/types/player'
import { SeasonHistoryGrid } from '@/components/profile/SeasonHistoryGrid'
import { DemoDataNotice, SurfaceCard, TierBadge } from '@/components/shared'
import { cn } from '@/lib/utils'

export interface ProfileHeroProps {
  summary: PlayerSummary
  rankingPosition: DemoRankingPosition | null
  seasons: DemoSeasonRecord[]
  selectedSeason: number
  selectedTier: string
  tierDetail?: string
  onSeasonChange: (seasonNumber: number) => void
  rp?: number
}

export function ProfileHero({
  summary,
  rankingPosition,
  seasons,
  selectedSeason,
  selectedTier,
  tierDetail,
  onSeasonChange,
  rp,
}: ProfileHeroProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const rankingLabel = rankingPosition
    ? `데모 RP #${rankingPosition.position}`
    : null

  async function handleRefresh() {
    setIsRefreshing(true)
    // TODO: API 연동 시 실제 갱신 호출
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  return (
    <SurfaceCard
      variant="accent"
      padding="lg"
      className="relative overflow-hidden p-3 sm:p-5 lg:p-6"
    >
      <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-r via-transparent to-transparent" />
      <div className="relative flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Link
            className="text-muted-foreground hover:text-foreground inline-flex min-h-8 items-center text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            to="/"
          >
            ← 검색으로
          </Link>
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-foreground text-xl font-bold tracking-tight break-all sm:text-2xl lg:text-3xl">
              {summary.nickname}
            </h1>
            {tierDetail ? (
              <span className="text-foreground text-sm font-semibold tabular-nums sm:text-base">
                {tierDetail}
              </span>
            ) : (
              <>
                <TierBadge tier={selectedTier} />
                {rp != null ? (
                  <span className="text-foreground text-base font-extrabold tabular-nums sm:text-lg">
                    RP {rp.toLocaleString('ko-KR')}
                  </span>
                ) : null}
              </>
            )}
            <span className="text-muted-foreground text-sm tabular-nums">Lv.{summary.level}</span>
            {rankingLabel ? (
              <span className="text-muted-foreground text-xs sm:text-sm">{rankingLabel}</span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <DemoDataNotice compact />
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <RefreshCw className={cn('size-3', isRefreshing && 'animate-spin')} />
              {isRefreshing ? '갱신 중...' : '전적 갱신'}
            </button>
          </div>
        </div>
        <SeasonHistoryGrid
          seasons={seasons}
          selectedSeason={selectedSeason}
          onSelect={onSeasonChange}
          className="w-full lg:max-w-sm lg:shrink-0"
        />
      </div>
    </SurfaceCard>
  )
}
