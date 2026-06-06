import { cn } from '@/lib/utils'
import { tierToken } from '@/utils/gameLabels'

type TierTone = 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'other'

function toneForTier(tier: string): TierTone {
  const token = tierToken(tier)
  if (token.startsWith('아이언')) return 'iron'
  if (token.startsWith('브론즈')) return 'bronze'
  if (token.startsWith('실버')) return 'silver'
  if (token.startsWith('골드')) return 'gold'
  if (token.startsWith('플래티넘')) return 'platinum'
  if (token.startsWith('다이아')) return 'diamond'
  return 'other'
}

const toneClass: Record<TierTone, string> = {
  iron: 'border-zinc-500/50 bg-zinc-500/15 text-zinc-300',
  bronze: 'border-amber-700/50 bg-amber-900/25 text-amber-200',
  silver: 'border-slate-400/50 bg-slate-400/15 text-slate-200',
  gold: 'border-yellow-500/50 bg-yellow-500/15 text-yellow-200',
  platinum: 'border-teal-400/50 bg-teal-500/15 text-teal-200',
  diamond: 'border-blue-500/50 bg-blue-500/15 text-blue-200',
  other: 'border-border bg-muted/60 text-muted-foreground',
}

export interface CompactTierBadgeProps {
  tier: string
  className?: string
}

export function CompactTierBadge({ tier, className }: CompactTierBadgeProps) {
  const tone = toneForTier(tier)
  const short = tier.split(/\s+/).slice(0, 2).join(' ')

  return (
    <span
      className={cn(
        'inline-flex max-w-[5.5rem] shrink-0 items-center truncate rounded px-1.5 py-0.5 text-[10px] font-semibold',
        toneClass[tone],
        className,
      )}
      title={tier}
    >
      {short}
    </span>
  )
}
