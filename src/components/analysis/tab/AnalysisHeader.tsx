import { AnalysisRoleBadge } from '@/components/analysis/tab/AnalysisRoleBadge'
import { AnalysisScopeToggle } from '@/components/analysis/AnalysisScopeToggle'
import { SurfaceCard } from '@/components/shared'
import type { AnalysisScope } from '@/utils/analysisAggregation'
import { cn } from '@/lib/utils'

export interface AnalysisHeaderProps {
  basisLabel: string
  headline: string
  insightLine: string
  estimatedTendency: string | null
  secondaryTendency: string | null
  sampleSize: number
  confidenceLabel: string
  dataConfidence: string
  readyMetricCount: number
  disclaimer: string
  scope: AnalysisScope
  showScopeToggle: boolean
  onScopeChange: (scope: AnalysisScope) => void
  className?: string
}

export function AnalysisHeader({
  basisLabel,
  headline,
  insightLine,
  estimatedTendency,
  secondaryTendency,
  sampleSize,
  confidenceLabel,
  dataConfidence,
  readyMetricCount,
  disclaimer,
  scope,
  showScopeToggle,
  onScopeChange,
  className,
}: AnalysisHeaderProps) {
  return (
    <SurfaceCard variant="accent" padding="md" className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-primary/90 text-[11px] font-semibold tracking-wide uppercase">
              {basisLabel}
            </p>
            <span className="text-muted-foreground text-[11px]">· 표본 {sampleSize}경기</span>
            {readyMetricCount > 0 ? (
              <span className="text-muted-foreground text-[11px]">
                · 계산 가능 지표 {readyMetricCount}개
              </span>
            ) : null}
            <span
              className={cn(
                'rounded-md border px-2 py-0.5 text-[10px] font-medium',
                dataConfidence === 'high'
                  ? 'border-emerald-500/25 bg-emerald-500/8 text-emerald-900 dark:text-emerald-100'
                  : dataConfidence === 'medium'
                    ? 'border-amber-500/25 bg-amber-500/8 text-amber-900 dark:text-amber-100'
                    : 'border-border bg-muted/50 text-muted-foreground',
              )}
            >
              {confidenceLabel}
            </span>
          </div>
          <h2 className="text-foreground text-lg font-bold tracking-tight sm:text-xl">{headline}</h2>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{insightLine}</p>
        </div>
        {showScopeToggle ? (
          <AnalysisScopeToggle value={scope} onChange={onScopeChange} />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {estimatedTendency ? (
          <AnalysisRoleBadge label={estimatedTendency} variant="primary" />
        ) : null}
        {secondaryTendency ? <AnalysisRoleBadge label={secondaryTendency} /> : null}
      </div>

      <p className="text-muted-foreground border-border/50 border-t pt-2 text-[11px] leading-relaxed">
        {disclaimer}
      </p>
    </SurfaceCard>
  )
}
