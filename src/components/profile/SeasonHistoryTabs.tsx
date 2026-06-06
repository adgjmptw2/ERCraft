import type { DemoSeasonRecord } from '@/mocks/seasonHistory'
import { CompactTierBadge } from '@/components/profile/CompactTierBadge'
import { cn } from '@/lib/utils'

export interface SeasonHistoryTabsProps {
  seasons: DemoSeasonRecord[]
  selectedSeason: number
  onSelect: (seasonNumber: number) => void
  className?: string
}

export function SeasonHistoryTabs({
  seasons,
  selectedSeason,
  onSelect,
  className,
}: SeasonHistoryTabsProps) {
  if (seasons.length === 0) return null

  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-widest uppercase">
        시즌
      </p>
      <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
        {seasons.map((season) => {
          const isActive = season.seasonNumber === selectedSeason
          return (
            <button
              key={season.seasonNumber}
              type="button"
              onClick={() => onSelect(season.seasonNumber)}
              className={cn(
                'border-border/70 flex shrink-0 flex-col items-start gap-1.5 rounded-lg border px-3 py-2 transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                isActive
                  ? 'border-primary/60 bg-primary/10 ring-primary/20 ring-1'
                  : 'hover:border-border hover:bg-muted/30 bg-transparent',
              )}
              aria-pressed={isActive}
            >
              <span
                className={cn(
                  'text-sm font-bold',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                S{season.seasonNumber}
              </span>
              <CompactTierBadge tier={season.tier} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
