import { GradeBadge } from '@/components/analysis/GradeBadge'
import type { MetricComparison } from '@/analysis/types'
import { SurfaceCard } from '@/components/shared/SurfaceCard'
import { cn } from '@/lib/utils'

function formatValue(key: MetricComparison['key'], value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '-'
  if (key === 'top3Rate' || key === 'winRate') return `${value.toFixed(1)}%`
  if (key === 'avgPlacement') return value.toFixed(2)
  return value.toFixed(2)
}

function isAboveBaseline(metric: MetricComparison): boolean | null {
  const { playerValue, populationMean, direction } = metric
  if (playerValue == null || populationMean == null) return null
  return direction === 'higher-better'
    ? playerValue > populationMean
    : playerValue < populationMean
}

export interface MetricComparisonCardProps {
  metric: MetricComparison
  baselineLabel: string
}

export function MetricComparisonCard({ metric, baselineLabel }: MetricComparisonCardProps) {
  const aboveBaseline = isAboveBaseline(metric)
  const percentileGood = metric.percentile != null && metric.percentile >= 50

  return (
    <SurfaceCard padding="md" variant="default" className="h-full text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-muted-foreground min-w-0 flex-1 text-xs font-medium tracking-widest uppercase">
          {metric.label}
        </h4>
        <GradeBadge grade={metric.grade} className="shrink-0" />
      </div>
      <dl className="mt-3 space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">내 값</dt>
          <dd
            className={cn(
              'text-2xl font-extrabold tracking-tight sm:text-3xl',
              aboveBaseline === true && 'text-green-400',
              aboveBaseline === false && 'text-red-400',
              aboveBaseline === null && 'text-foreground',
            )}
          >
            {formatValue(metric.key, metric.playerValue)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <dt className="text-muted-foreground text-xs">{baselineLabel}</dt>
          <dd className="text-muted-foreground font-medium">
            {formatValue(metric.key, metric.populationMean)}
          </dd>
        </div>
        <div className="border-border/60 flex items-baseline justify-between gap-2 border-t pt-2.5">
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">샘플 대비 백분위</dt>
          <dd
            className={cn(
              'flex items-center gap-1 text-base font-bold',
              percentileGood ? 'text-green-400' : 'text-red-400',
            )}
          >
            {metric.percentile != null ? `${metric.percentile.toFixed(0)}%` : '데이터 없음'}
            {metric.percentile != null ? (
              <span className="text-xs" aria-hidden>
                {percentileGood ? '▲' : '▼'}
              </span>
            ) : null}
          </dd>
        </div>
      </dl>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed break-words">{metric.description}</p>
    </SurfaceCard>
  )
}
