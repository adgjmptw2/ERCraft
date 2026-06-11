import type { DemoSeasonRecord } from '@/mocks/seasonHistory'
import { formatTierBadgeCompact, tierAccentColor } from '@/utils/rankTier'
import { cn } from '@/lib/utils'

export interface SeasonHistoryGridProps {
  seasons: DemoSeasonRecord[]
  selectedSeason: number
  onSelect: (seasonNumber: number) => void
  className?: string
}

export function SeasonHistoryGrid({
  seasons,
  selectedSeason,
  onSelect,
  className,
}: SeasonHistoryGridProps) {
  if (seasons.length === 0) return null

  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
        시즌
      </p>
      <div className="flex flex-wrap gap-1 sm:gap-1.5">
        {seasons.map((season) => {
          const isActive = season.seasonNumber === selectedSeason
          const accent = tierAccentColor(season.rank.tier)
          const tierLabel = formatTierBadgeCompact(season.rank)

          return (
            <button
              key={season.seasonNumber}
              type="button"
              onClick={() => onSelect(season.seasonNumber)}
              aria-pressed={isActive}
              aria-label={`S${season.seasonNumber} ${tierLabel}`}
              className={cn(
                'flex h-9 w-14 shrink-0 flex-col items-center justify-center rounded-md border px-1 py-1 transition-colors sm:h-11 sm:w-16',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                isActive
                  ? 'bg-primary/15 ring-primary/30 ring-1'
                  : 'border-border/70 bg-card/40 hover:bg-muted/40',
              )}
              style={
                isActive
                  ? { borderColor: accent }
                  : { borderColor: `${accent}55` }
              }
            >
              <span
                className={cn(
                  'text-[10px] leading-none font-bold tabular-nums sm:text-[11px]',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                S{season.seasonNumber}
              </span>
              <span
                className="mt-1 max-w-full px-0.5 text-[9px] leading-none font-semibold sm:text-[10px]"
                style={{ color: accent }}
              >
                {tierLabel}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
