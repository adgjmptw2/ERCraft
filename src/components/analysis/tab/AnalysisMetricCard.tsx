import type { AnalysisMetricCardModel } from '@/analysis/analysisTabViewModel'
import { AnalysisMetricStatusBadge } from '@/components/analysis/tab/AnalysisMetricStatusBadge'
import { SurfaceCard } from '@/components/shared'
import { cn } from '@/lib/utils'

export type AnalysisMetricCardVariant = 'default' | 'summary' | 'secondary' | 'future'

export interface AnalysisMetricCardProps {
  card: AnalysisMetricCardModel
  variant?: AnalysisMetricCardVariant
}

const valueClass: Record<AnalysisMetricCardVariant, string> = {
  default: 'text-xl sm:text-2xl',
  summary: 'text-2xl sm:text-3xl',
  secondary: 'text-lg sm:text-xl',
  future: 'text-sm sm:text-base',
}

export function AnalysisMetricCard({ card, variant = 'default' }: AnalysisMetricCardProps) {
  const isFuture = card.status === 'future'
  const isMuted = card.status !== 'ready' && !isFuture

  return (
    <SurfaceCard
      variant={variant === 'summary' ? 'accent' : 'default'}
      padding="none"
      className={cn(
        'flex h-full flex-col justify-between gap-2 p-3 sm:p-4',
        'hover:border-border/80 transition-[border-color,box-shadow]',
        variant === 'future' && 'border-dashed bg-muted/15',
        variant === 'secondary' && 'bg-muted/10',
        isMuted && 'opacity-90',
      )}
    >
      <div className="space-y-1.5">
        <p
          className={cn(
            'text-foreground font-bold tabular-nums tracking-tight',
            valueClass[variant],
            isFuture && 'text-muted-foreground font-semibold',
            isMuted && !isFuture && 'text-muted-foreground',
          )}
        >
          {card.value}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-foreground text-xs font-semibold">{card.label}</p>
          <AnalysisMetricStatusBadge status={card.status} className="shrink-0" />
        </div>
        {card.hint ? (
          <p className="text-muted-foreground line-clamp-2 text-[10px] leading-snug">{card.hint}</p>
        ) : null}
      </div>
    </SurfaceCard>
  )
}
