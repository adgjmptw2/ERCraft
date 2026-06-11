import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
} from 'recharts'

import type { AnalysisAxisRow } from '@/analysis/analysisTabViewModel'
import { formatAnalysisScore } from '@/analysis/analysisFormatters'
import { scoreBarColor } from '@/components/analysis/playStyleRadarDemo'
import { SurfaceCard } from '@/components/shared'
import { cn } from '@/lib/utils'

export interface AnalysisRadarCardProps {
  nickname: string
  chartData: { subject: string; value: number; tierAvg: number; fullMark: number }[]
  axisRows: AnalysisAxisRow[]
  embedded?: boolean
  className?: string
}

function RadarLegend({ nickname }: { nickname: string }) {
  return (
    <div className="absolute right-2 bottom-2 flex flex-col items-end gap-1 text-[10px]">
      <div className="flex items-center gap-1.5">
        <span className="bg-primary size-2 rounded-sm" aria-hidden />
        <span className="text-foreground max-w-[6rem] truncate font-medium">{nickname}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className="size-2 rounded-sm border bg-transparent"
          style={{ borderColor: 'var(--radar-tier-avg)' }}
          aria-hidden
        />
        <span className="text-muted-foreground">참조 샘플</span>
      </div>
    </div>
  )
}

export function AnalysisRadarCard({
  nickname,
  chartData,
  axisRows,
  embedded = false,
  className,
}: AnalysisRadarCardProps) {

  const content = (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,11rem)] lg:items-center">
        <div className="relative mx-auto flex w-full max-w-[280px] items-center justify-center">
          <RadarChart width={260} height={260} data={chartData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="var(--radar-grid)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'var(--radar-axis)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Radar
              dataKey="tierAvg"
              stroke="var(--radar-tier-avg)"
              fill="transparent"
              strokeWidth={1.5}
              dot={false}
            />
            <Radar
              dataKey="value"
              stroke="var(--radar-player)"
              fill="var(--radar-player-fill)"
              strokeWidth={2}
              dot={false}
            />
          </RadarChart>
          <RadarLegend nickname={nickname} />
        </div>

        <ul className="space-y-2">
          {axisRows.map((row) => (
            <li key={row.axis} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="text-foreground font-bold tabular-nums">
                  {formatAnalysisScore(row.score)}
                </span>
              </div>
              <div className="bg-border/80 h-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{ width: `${row.score}%`, backgroundColor: scoreBarColor(row.score) }}
                />
              </div>
              <p className="text-muted-foreground text-[10px]">{row.keyword}</p>
            </li>
          ))}
        </ul>
      </div>
  )

  if (embedded) {
    return <div className={cn('flex h-full flex-col gap-4', className)}>{content}</div>
  }

  return (
    <SurfaceCard variant="elevated" padding="md" className={cn('flex h-full flex-col gap-4', className)}>
      <div className="space-y-1">
        <h3 className="text-foreground text-sm font-semibold">6축 성향 레이더</h3>
        <p className="text-muted-foreground text-[11px]">
          생존 · 교전 · 운영 · 지원 · 마무리 · 일관성 — 최근 경기 기준 분석 점수
        </p>
      </div>
      {content}
    </SurfaceCard>
  )
}
