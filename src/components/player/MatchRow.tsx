import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import type { MatchSummaryDTO } from '@/types/match'
import { SurfaceCard } from '@/components/shared/SurfaceCard'

export interface MatchRowProps {
  match: MatchSummaryDTO
  variant?: 'default' | 'record'
}

export function MatchRow({ match, variant = 'default' }: MatchRowProps) {
  const isRecord = variant === 'record'

  return (
    <li className="min-w-0">
      <Link
        to={`/matches/${encodeURIComponent(match.matchId)}`}
        className="block rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`${match.characterName} 매치 상세 보기`}
      >
        <SurfaceCard
          padding={isRecord ? 'sm' : 'md'}
          variant={match.victory ? 'muted' : 'default'}
          interactive
          className={cn(
            isRecord ? 'border-l-[3px]' : 'border-l-4',
            match.victory
              ? isRecord
                ? 'border-l-green-500 bg-green-500/5'
                : 'border-l-green-500/90'
              : isRecord
                ? 'border-l-muted-foreground/50 bg-muted/20'
                : 'border-l-red-500/80',
          )}
        >
          <div
            className={cn(
              'flex gap-2',
              isRecord
                ? 'flex-row flex-wrap items-center justify-between'
                : 'flex-col md:flex-row md:items-center md:justify-between',
            )}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="text-foreground font-semibold break-all">{match.characterName}</p>
              <span
                className={cn(
                  'shrink-0 rounded-md px-2 py-0.5 text-xs font-medium',
                  match.victory
                    ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-500/10 text-red-800 dark:text-red-200',
                )}
              >
                {match.victory ? '승리' : '패배'}
              </span>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="text-foreground font-bold">{match.placementLabel}</span>
              <span>
                KDA{' '}
                <span className="text-foreground font-semibold">{match.kdaString}</span>
              </span>
              <span className="text-xs">{match.relativeTime}</span>
              <span className="text-primary text-xs font-medium">상세 →</span>
            </div>
          </div>
        </SurfaceCard>
      </Link>
    </li>
  )
}
