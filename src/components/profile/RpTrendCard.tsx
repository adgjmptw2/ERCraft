import { EmptyState, SectionHeader, SurfaceCard } from '@/components/shared'
import type { RpTrendPoint } from '@/mocks/loader'
import { cn } from '@/lib/utils'

export interface RpTrendCardProps {
  points: RpTrendPoint[]
  title?: string
  description?: string
  className?: string
}

const CHART_WIDTH = 320
const CHART_HEIGHT = 120
const PADDING = { top: 12, right: 12, bottom: 24, left: 36 }

function buildChartGeometry(points: RpTrendPoint[]) {
  const rpValues = points.map((p) => p.rpAfter)
  const minRp = Math.min(...rpValues)
  const maxRp = Math.max(...rpValues)
  const range = maxRp - minRp || 1

  const innerW = CHART_WIDTH - PADDING.left - PADDING.right
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom

  const coords = points.map((p, i) => {
    const x = PADDING.left + (i / Math.max(points.length - 1, 1)) * innerW
    const y = PADDING.top + innerH - ((p.rpAfter - minRp) / range) * innerH
    return { x, y, point: p }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')

  return { coords, linePath, minRp, maxRp }
}

export function RpTrendCard({
  points,
  title = '데모 RP 흐름',
  description = '샘플 매치 기준 경기 후 RP 변화입니다.',
  className,
}: RpTrendCardProps) {
  const hasChart = points.length >= 2
  const geometry = hasChart ? buildChartGeometry(points) : null
  const latestRp = points.at(-1)?.rpAfter
  const startRp = points.at(0)?.rpAfter

  return (
    <SurfaceCard variant="default" padding="lg" className={cn('space-y-4', className)}>
      <SectionHeader title={title} description={description} size="default" />
      {!hasChart ? (
        <EmptyState title="RP 흐름 데이터 없음" description="샘플 매치에 RP 기록이 없습니다." />
      ) : (
        <div className="space-y-3">
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-xs">
            <span>
              시작 {startRp} → 최근 {latestRp}
            </span>
            <span>
              범위 {geometry!.minRp}–{geometry!.maxRp}
            </span>
          </div>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="text-primary h-auto w-full min-w-[280px] max-w-full"
              role="img"
              aria-label="데모 RP 흐름 차트"
            >
              <line
                x1={PADDING.left}
                y1={CHART_HEIGHT - PADDING.bottom}
                x2={CHART_WIDTH - PADDING.right}
                y2={CHART_HEIGHT - PADDING.bottom}
                className="stroke-border"
                strokeWidth="1"
              />
              <path
                d={geometry!.linePath}
                fill="none"
                className="stroke-primary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {geometry!.coords.map(({ x, y, point }) => (
                <g key={point.matchId}>
                  <circle cx={x} cy={y} r="4" className="fill-primary stroke-background" strokeWidth="2" />
                </g>
              ))}
              {geometry!.coords
                .filter((_, i) => i === 0 || i === geometry!.coords.length - 1 || i % 3 === 0)
                .map(({ x, point }) => (
                  <text
                    key={`${point.matchId}-label`}
                    x={x}
                    y={CHART_HEIGHT - 6}
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
