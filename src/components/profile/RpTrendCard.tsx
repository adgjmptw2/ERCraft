import { useMemo, useState } from 'react'

import { EmptyState, SectionHeader, SurfaceCard } from '@/components/shared'
import type { RpTrendPoint } from '@/mocks/loader'
import { cn } from '@/lib/utils'

export interface RpTrendCardProps {
  points: RpTrendPoint[]
  title?: string
  description?: string
  className?: string
}

const CHART_WIDTH = 360
const CHART_HEIGHT = 140
const PADDING = { top: 16, right: 28, bottom: 28, left: 44 }

function buildChartGeometry(points: RpTrendPoint[]) {
  const rpValues = points.map((p) => p.rpAfter)
  const minRp = Math.min(...rpValues)
  const maxRp = Math.max(...rpValues)
  const range = maxRp - minRp || 1

  const innerW = CHART_WIDTH - PADDING.left - PADDING.right
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom
  const baselineY = CHART_HEIGHT - PADDING.bottom

  const coords = points.map((p, i) => {
    const x = PADDING.left + (i / Math.max(points.length - 1, 1)) * innerW
    const y = PADDING.top + innerH - ((p.rpAfter - minRp) / range) * innerH
    return { x, y, point: p }
  })

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ')

  const first = coords[0]
  const last = coords[coords.length - 1]
  const areaPath =
    first && last
      ? `${linePath} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`
      : ''

  return { coords, linePath, areaPath, minRp, maxRp, baselineY }
}

export function RpTrendCard({
  points,
  title = '데모 RP 흐름',
  description = '샘플 매치 기준 경기 후 RP 변화입니다.',
  className,
}: RpTrendCardProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const hasChart = points.length >= 2
  const geometry = useMemo(() => (hasChart ? buildChartGeometry(points) : null), [hasChart, points])
  const latestRp = points.at(-1)?.rpAfter
  const startRp = points.at(0)?.rpAfter
  const activePoint = activeIndex != null ? geometry?.coords[activeIndex] : null

  return (
    <SurfaceCard variant="default" padding="lg" className={cn('space-y-5', className)}>
      <SectionHeader title={title} description={description} size="default" />
      {!hasChart ? (
        <EmptyState title="RP 흐름 데이터 없음" description="샘플 매치에 RP 기록이 없습니다." />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">최근 RP</p>
              <p className="text-foreground text-3xl font-extrabold tracking-tight">{latestRp}</p>
            </div>
            <div className="text-muted-foreground text-sm">
              <span>
                시작 {startRp} → 최근 {latestRp}
              </span>
              <span className="mx-2 opacity-40">·</span>
              <span>
                범위 {geometry!.minRp}–{geometry!.maxRp}
              </span>
            </div>
          </div>
          <div className="relative overflow-x-auto px-1">
            {activePoint ? (
              <div
                className="border-border/80 bg-popover/95 pointer-events-none absolute z-10 rounded-md border px-2.5 py-1.5 text-xs shadow-md backdrop-blur-sm"
                style={{
                  left: `${(activePoint.x / CHART_WIDTH) * 100}%`,
                  top: `${(activePoint.y / CHART_HEIGHT) * 100 - 12}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <p className="text-muted-foreground">{activePoint.point.dateLabel}</p>
                <p className="text-foreground font-bold">RP {activePoint.point.rpAfter}</p>
                {activePoint.point.rpDelta != null ? (
                  <p
                    className={cn(
                      'font-medium',
                      activePoint.point.rpDelta >= 0 ? 'text-green-400' : 'text-red-400',
                    )}
                  >
                    {activePoint.point.rpDelta >= 0 ? '+' : ''}
                    {activePoint.point.rpDelta}
                  </p>
                ) : null}
              </div>
            ) : null}
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="text-primary h-auto w-full min-w-[300px] max-w-full"
              role="img"
              aria-label="데모 RP 흐름 차트"
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id="rp-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line
                x1={PADDING.left}
                y1={geometry!.baselineY}
                x2={CHART_WIDTH - PADDING.right}
                y2={geometry!.baselineY}
                className="stroke-border"
                strokeWidth="1"
              />
              <path d={geometry!.areaPath} fill="url(#rp-area-gradient)" />
              <path
                d={geometry!.linePath}
                fill="none"
                className="stroke-primary"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {geometry!.coords.map(({ x, y, point }, index) => (
                <g key={point.matchId}>
                  <circle
                    cx={x}
                    cy={y}
                    r={activeIndex === index ? 6 : 8}
                    className="fill-transparent"
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={activeIndex === index ? 5 : 4}
                    className={cn(
                      'fill-primary stroke-background transition-all',
                      activeIndex === index && 'fill-primary/90',
                    )}
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                </g>
              ))}
              {geometry!.coords
                .filter((_, i) => i === 0 || i === geometry!.coords.length - 1 || i % 3 === 0)
                .map(({ x, point }) => (
                  <text
                    key={`${point.matchId}-label`}
                    x={x}
                    y={CHART_HEIGHT - 8}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[9px]"
                  >
                    {point.dateLabel}
                  </text>
                ))}
            </svg>
          </div>
        </div>
      )}
    </SurfaceCard>
  )
}
