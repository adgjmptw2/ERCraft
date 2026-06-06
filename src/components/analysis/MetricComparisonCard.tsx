import { GradeBadge } from '@/components/analysis/GradeBadge'
import type { MetricComparison } from '@/analysis/types'
import { SurfaceCard } from '@/components/shared/SurfaceCard'

function formatValue(key: MetricComparison['key'], value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '-'
  if (key === 'top3Rate' || key === 'winRate') return `${value.toFixed(1)}%`
  if (key === 'avgPlacement') return value.toFixed(2)
  return value.toFixed(2)
}

export interface MetricComparisonCardProps {
  metric: MetricComparison
  baselineLabel: string
}

export function MetricComparisonCard({ metric, baselineLabel }: MetricComparisonCardProps) {
  return (
    <SurfaceCard padding="md" variant="default" className="h-full text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-foreground min-w-0 flex-1 font-medium">{metric.label}</h4>
        <GradeBadge grade={metric.grade} className="shrink-0" />
      </div>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-muted-foreground">내 값</dt>
          <dd className="text-xl font-bold tracking-tight">
            {formatValue(metric.key, metric.playerValue)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <dt className="text-muted-foreground">{baselineLabel}</dt>
          <dd className="font-medium">{formatValue(metric.key, metric.populationMean)}</dd>
        </div>
        <div className="border-border/60 flex items-baseline justify-between gap-2 border-t pt-2">
          <dt className="text-muted-foreground">샘플 대비 백분위</dt>
          <dd className="font-medium">
            {metric.percentile != null ? `${metric.percentile.toFixed(0)}%` : '데이터 없음'}
          </dd>
        </div>
      </dl>
      <p className="text-muted-foreground mt-3 text-xs leading-relaxed break-words">
        {metric.description}
      </p>
    </SurfaceCard>
  )
}
