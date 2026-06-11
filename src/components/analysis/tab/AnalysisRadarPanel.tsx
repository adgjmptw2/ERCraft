import type { AnalysisAxisRow } from '@/analysis/analysisTabViewModel'
import { formatAnalysisScore } from '@/analysis/analysisFormatters'
import { AnalysisRadarCard } from '@/components/analysis/tab/AnalysisRadarCard'
import { SurfaceCard } from '@/components/shared'
import { cn } from '@/lib/utils'

export interface AnalysisRadarPanelProps {
  nickname: string
  headline: string
  insightLine: string
  analysisScore: number | null
  chartData: { subject: string; value: number; tierAvg: number; fullMark: number }[]
  axisRows: AnalysisAxisRow[]
  characterLabel?: string | null
  className?: string
}

export function AnalysisRadarPanel({
  nickname,
  headline,
  insightLine,
  analysisScore,
  chartData,
  axisRows,
  characterLabel,
  className,
}: AnalysisRadarPanelProps) {
  return (
    <section
      className={cn('flex min-w-0 flex-col gap-3', className)}
      aria-labelledby="analysis-playstyle-heading"
    >
      <div className="space-y-0.5 px-0.5">
        <h3 id="analysis-playstyle-heading" className="text-foreground text-sm font-semibold">
          {characterLabel ? `${characterLabel} · 6축 분석` : '성향 · 6축 분석'}
        </h3>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          {characterLabel
            ? '선택한 캐릭터의 최근 경기만 집계한 ERCraft 내부 분석 점수입니다'
            : '생존 · 교전 · 운영 · 지원 · 마무리 · 일관성 — 전체 유저 백분위가 아닌 ERCraft 내부 분석 점수입니다'}
        </p>
      </div>

      <SurfaceCard variant="default" padding="md" className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="bg-muted/25 border-border/40 min-w-0 flex-1 rounded-lg border px-3 py-2.5">
            <p className="text-foreground text-sm font-medium">{headline}</p>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{insightLine}</p>
          </div>
          {analysisScore != null ? (
            <div className="shrink-0 text-right">
              <p className="text-muted-foreground text-[10px]">종합 분석 점수</p>
              <p className="text-foreground text-xl font-bold tabular-nums">
                {formatAnalysisScore(analysisScore)}
              </p>
            </div>
          ) : null}
        </div>

        <AnalysisRadarCard
          nickname={nickname}
          chartData={chartData}
          axisRows={axisRows}
          embedded
        />
      </SurfaceCard>
    </section>
  )
}
