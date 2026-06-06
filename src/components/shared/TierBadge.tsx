import { cn } from '@/lib/utils'
import { tierToken } from '@/utils/gameLabels'

type TierBucket = 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'meteorite' | 'other'

function bucketForTier(tier: string): TierBucket {
  const token = tierToken(tier)
  if (token.startsWith('아이언')) return 'iron'
  if (token.startsWith('브론즈')) return 'bronze'
  if (token.startsWith('실버')) return 'silver'
  if (token.startsWith('골드')) return 'gold'
  if (token.startsWith('플래티넘')) return 'platinum'
  if (token.startsWith('다이아')) return 'diamond'
  if (token.startsWith('메테오') || token.startsWith('미스릴')) return 'meteorite'
  return 'other'
}

const bucketClass: Record<TierBucket, string> = {
  iron: 'border-zinc-500/40 bg-zinc-500/15 text-zinc-800 dark:text-zinc-200',
  bronze: 'border-amber-700/40 bg-amber-800/20 text-amber-950 dark:text-amber-100',
  silver: 'border-slate-400/40 bg-slate-400/15 text-slate-900 dark:text-slate-100',
  gold: 'border-yellow-500/40 bg-yellow-500/15 text-yellow-950 dark:text-yellow-100',
  platinum: 'border-teal-500/40 bg-teal-500/15 text-teal-950 dark:text-teal-100',
  diamond: 'border-blue-500/40 bg-blue-500/15 text-blue-950 dark:text-blue-100',
  meteorite:
    'border-violet-500/40 bg-violet-500/15 text-violet-950 dark:text-violet-100',
  other: 'border-border bg-muted/80 text-muted-foreground',
}

export interface TierBadgeProps {
  tier: string
}

export function TierBadge({ tier }: TierBadgeProps) {
  const bucket = bucketForTier(tier)

  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        bucketClass[bucket],
      )}
    >
      <span className="truncate">{tier.trim() || '—'}</span>
    </span>
  )
}
