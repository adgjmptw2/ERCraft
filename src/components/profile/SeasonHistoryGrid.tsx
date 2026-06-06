import { useMemo, useState } from 'react'

import type { DemoSeasonRecord } from '@/mocks/seasonHistory'
import { cn } from '@/lib/utils'
import { tierToken } from '@/utils/gameLabels'

export interface SeasonHistoryGridProps {
  seasons: DemoSeasonRecord[]
  selectedSeason: number
  onSelect: (seasonNumber: number) => void
  className?: string
}

const COLLAPSE_THRESHOLD = 6

function tierAccentColor(tier: string): string {
  const token = tierToken(tier)
  if (token.startsWith('아이언')) return '#9ca3af'
  if (token.startsWith('브론즈')) return '#cd7f32'
  if (token.startsWith('실버')) return '#aaaaaa'
  if (token.startsWith('골드')) return '#f0b429'
  if (token.startsWith('플래티넘')) return '#4fc3b0'
  if (token.startsWith('다이아')) return '#5b8dd9'
  return '#9ca3af'
}

function compactTierLabel(tier: string): string {
  const parts = tier.trim().split(/\s+/)
  if (parts.length <= 1) return parts[0] ?? tier
  return `${parts[0]}${parts[1]}`
}

export function SeasonHistoryGrid({
  seasons,
  selectedSeason,
  onSelect,
  className,
}: SeasonHistoryGridProps) {
  const needsCollapse = seasons.length > COLLAPSE_THRESHOLD
  const [expanded, setExpanded] = useState(!needsCollapse)

  const visibleSeasons = useMemo(() => {
    if (expanded) return seasons

    const recent = seasons.slice(-COLLAPSE_THRESHOLD)
    if (recent.some((s) => s.seasonNumber === selectedSeason)) {
      return recent
    }

    const selected = seasons.find((s) => s.seasonNumber === selectedSeason)
    if (!selected) return recent

    return [...recent.slice(1), selected].sort((a, b) => a.seasonNumber - b.seasonNumber)
  }, [expanded, seasons, selectedSeason])

  if (seasons.length === 0) return null

  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
          시즌
        </p>
        {needsCollapse ? (
          <button
            type="button"
            className="text-primary hover:text-primary/80 text-[10px] font-medium underline-offset-2 hover:underline"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '접기' : `펼치기 (${seasons.length})`}
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visibleSeasons.map((season) => {
          const isActive = season.seasonNumber === selectedSeason
          const accent = tierAccentColor(season.tier)

          return (
            <button
              key={season.seasonNumber}
              type="button"
              onClick={() => onSelect(season.seasonNumber)}
              aria-pressed={isActive}
              className={cn(
                'flex h-11 w-[3.75rem] shrink-0 flex-col items-center justify-center rounded-md border px-1 py-1 transition-colors',
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
                  'text-[11px] leading-none font-bold tabular-nums',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                S{season.seasonNumber}
              </span>
              <span
                className="mt-1 max-w-full truncate text-[9px] leading-none font-semibold"
                style={{ color: accent }}
              >
                {compactTierLabel(season.tier)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
