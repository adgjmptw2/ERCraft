import { cn } from '@/lib/utils'
import type { MatchSummaryDTO } from '@/types/match'
import { SurfaceCard } from '@/components/shared/SurfaceCard'

export interface MatchRowProps {
  match: MatchSummaryDTO
}

export function MatchRow({ match }: MatchRowProps) {
  return (
    <li className="min-w-0">
      <SurfaceCard
        padding="md"
        variant={match.victory ? 'muted' : 'default'}
        interactive
        className={cn(match.victory && 'border-l-4 border-l-emerald-500/80')}
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="text-foreground font-semibold break-all">{match.characterName}</p>
            <span
              className={cn(
                'shrink-0 rounded-md px-2 py-0.5 text-xs font-medium',
                match.victory
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {match.victory ? '승리' : '패배'}
            </span>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-foreground font-medium">{match.placementLabel}</span>
            <span>KDA {match.kdaString}</span>
            <span className="text-xs">{match.relativeTime}</span>
          </div>
        </div>
      </SurfaceCard>
    </li>
  )
}
