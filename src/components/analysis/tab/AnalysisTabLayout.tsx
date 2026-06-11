import { useEffect, useMemo, useState } from 'react'

import { buildAnalysisTabViewModel } from '@/analysis/analysisTabViewModel'
import type { CharacterAnalysisReport } from '@/analysis/types'
import type { PlayerAnalysisReport } from '@/analysis/types'
import type { PlayerPlayStyleAnalysis } from '@/analysis/playStyleTypes'
import { AnalysisBasisNote } from '@/components/analysis/AnalysisBasisNote'
import { AnalysisEmptyState } from '@/components/analysis/tab/AnalysisEmptyState'
import { AnalysisFutureMetricsSection } from '@/components/analysis/tab/AnalysisFutureMetricsSection'
import { AnalysisHeader } from '@/components/analysis/tab/AnalysisHeader'
import { AnalysisInsightChip } from '@/components/analysis/tab/AnalysisInsightChip'
import { AnalysisMetricSection } from '@/components/analysis/tab/AnalysisMetricSection'
import { AnalysisRadarPanel } from '@/components/analysis/tab/AnalysisRadarPanel'
import { AnalysisSummaryPanel } from '@/components/analysis/tab/AnalysisSummaryPanel'
import { AnalysisSummaryCards } from '@/components/analysis/tab/AnalysisSummaryCards'
import type { MatchSummary } from '@/types/match'
import type { AnalysisScope } from '@/utils/analysisAggregation'
import { cn } from '@/lib/utils'

export interface AnalysisTabLayoutProps {
  nickname: string
  playStyleAnalysis: PlayerPlayStyleAnalysis | null
  analysisReport: PlayerAnalysisReport | null
  characterReports: CharacterAnalysisReport[]
  analysisMatches: MatchSummary[]
  populationMatchSets: MatchSummary[][]
  tierPopulationMatchSets: MatchSummary[][]
  populationMatches: MatchSummary[]
  basisLabel: string
  analysisScope: AnalysisScope
  showScopeToggle: boolean
  onScopeChange: (scope: AnalysisScope) => void
  className?: string
}

export function AnalysisTabLayout({
  nickname,
  playStyleAnalysis,
  analysisReport,
  characterReports,
  analysisMatches,
  populationMatchSets,
  tierPopulationMatchSets,
  populationMatches,
  basisLabel,
  analysisScope,
  showScopeToggle,
  onScopeChange,
  className,
}: AnalysisTabLayoutProps) {
  const [selectedCharacterKey, setSelectedCharacterKey] = useState<string | null>(null)

  useEffect(() => {
    setSelectedCharacterKey(null)
  }, [basisLabel, analysisMatches])

  const viewModel = useMemo(
    () =>
      buildAnalysisTabViewModel({
        playStyleAnalysis,
        analysisReport,
        characterReports,
        analysisMatches,
        basisLabel,
        nickname,
        selectedCharacterKey,
        populationMatchSets,
        tierPopulationMatchSets,
        populationMatches,
      }),
    [
      playStyleAnalysis,
      analysisReport,
      characterReports,
      analysisMatches,
      basisLabel,
      nickname,
      selectedCharacterKey,
      populationMatchSets,
      tierPopulationMatchSets,
      populationMatches,
    ],
  )

  const headerProps = {
    basisLabel: viewModel.basisLabel,
    headline: viewModel.headline,
    insightLine: viewModel.insightLine,
    estimatedTendency: viewModel.estimatedTendency,
    secondaryTendency: viewModel.secondaryTendency,
    sampleSize: viewModel.sampleSize,
    confidenceLabel: viewModel.confidenceLabel,
    dataConfidence: viewModel.dataConfidence,
    readyMetricCount: viewModel.readyMetricCount,
    disclaimer: viewModel.disclaimer,
    scope: analysisScope,
    showScopeToggle,
    onScopeChange,
  }

  if (viewModel.status === 'insufficient') {
    return (
      <div className={cn('flex min-w-0 flex-col gap-5', className)}>
        <AnalysisHeader {...headerProps} />
        <AnalysisEmptyState
          description={
            viewModel.selectedCharacterLabel
              ? `${viewModel.selectedCharacterLabel} 표본이 부족해 분석을 표시할 수 없습니다.`
              : viewModel.insightLine
          }
        />
        <AnalysisFutureMetricsSection
          teamPreviewMetrics={viewModel.teamPreviewMetrics}
          futureMetrics={viewModel.futureMetrics}
        />
        {viewModel.characters.length > 0 ? (
          <AnalysisSummaryPanel
            characters={viewModel.characters}
            selectedCharacterKey={selectedCharacterKey}
            onCharacterSelect={setSelectedCharacterKey}
          />
        ) : null}
        <AnalysisBasisNote label={basisLabel} />
      </div>
    )
  }

  const metricSections = viewModel.metricSections.filter((s) => s.id !== 'teamPreview')

  return (
    <div className={cn('flex min-w-0 flex-col gap-5 lg:gap-6', className)}>
      <AnalysisHeader {...headerProps} />

      <AnalysisSummaryCards cards={viewModel.summaryCards} />

      <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:items-stretch">
        <AnalysisRadarPanel
          nickname={nickname}
          headline={viewModel.headline}
          insightLine={viewModel.insightLine}
          analysisScore={viewModel.analysisScore}
          chartData={viewModel.chartData}
          axisRows={viewModel.axisRows}
          characterLabel={viewModel.selectedCharacterLabel}
        />
        <AnalysisSummaryPanel
          characters={viewModel.characters}
          selectedCharacterKey={selectedCharacterKey}
          onCharacterSelect={setSelectedCharacterKey}
        />
      </div>

      <section className="space-y-3" aria-labelledby="analysis-sections-heading">
        <div className="space-y-0.5">
          <h2 id="analysis-sections-heading" className="text-foreground text-sm font-semibold">
            {viewModel.selectedCharacterLabel
              ? `${viewModel.selectedCharacterLabel} 카테고리별 지표`
              : '카테고리별 지표'}
          </h2>
          <p className="text-muted-foreground text-xs">
            {viewModel.selectedCharacterLabel
              ? '선택한 캐릭터의 최근 경기만 집계한 지표입니다'
              : '결과·교전·운영·지원·일관성 — 경기 요약 API 기준으로 계산된 지표입니다'}
          </p>
        </div>
        <div className="space-y-3">
          {metricSections.map((section) => (
            <AnalysisMetricSection key={section.id} section={section} />
          ))}
          {viewModel.metricSections
            .filter((s) => s.id === 'teamPreview')
            .map((section) => (
              <AnalysisMetricSection key={section.id} section={section} />
            ))}
        </div>
      </section>

      {(viewModel.strengths.length > 0 || viewModel.improvements.length > 0) && (
        <div className="border-border/60 bg-card/30 grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">강점</p>
            <div className="flex flex-wrap gap-1.5">
              {viewModel.strengths.map((item) => (
                <AnalysisInsightChip key={item} label={item} variant="strength" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              보완 포인트
            </p>
            <div className="flex flex-wrap gap-1.5">
              {viewModel.improvements.map((item) => (
                <AnalysisInsightChip key={item} label={item} variant="improvement" />
              ))}
            </div>
          </div>
        </div>
      )}

      {viewModel.unavailableNote ? (
        <p className="text-muted-foreground text-[11px] leading-relaxed">{viewModel.unavailableNote}</p>
      ) : null}

      <AnalysisFutureMetricsSection
        teamPreviewMetrics={viewModel.teamPreviewMetrics}
        futureMetrics={viewModel.futureMetrics}
      />

      <AnalysisBasisNote label={viewModel.basisLabel} className="border-border/60 border-t pt-3" />
    </div>
  )
}
