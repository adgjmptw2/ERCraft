import type { AnalysisMetricCardModel } from '@/analysis/analysisTabViewModel'
import { AnalysisMetricCard } from '@/components/analysis/tab/AnalysisMetricCard'
import { SectionHeader } from '@/components/shared'
import { cn } from '@/lib/utils'

export interface AnalysisSummaryCardsProps {
  cards: AnalysisMetricCardModel[]
  className?: string
}

export function AnalysisSummaryCards({ cards, className }: AnalysisSummaryCardsProps) {
  if (cards.length === 0) return null

  return (
    <section className={cn('space-y-3', className)} aria-labelledby="analysis-summary-heading">
      <SectionHeader
        id="analysis-summary-heading"
        title="핵심 요약"
        description="승률·순위·교전·생존 — 최근 20판 핵심 지표"
        size="default"
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <AnalysisMetricCard key={card.id} card={card} variant="summary" />
        ))}
      </div>
    </section>
  )
}
