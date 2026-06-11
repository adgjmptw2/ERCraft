import type { RpTrendPoint } from '@/mocks/loader'
import { computeYAxisTicks } from '@/utils/rpTrendTicks'

export interface RpChartLayout {
  width: number
  height: number
  padding: { top: number; right: number; bottom: number; left: number }
  strokeWidth: number
  labelSize: number
  markerSize: number
  activeMarkerSize: number
}

/** 참고 UI — 얇은 라인 + 다이아몬드 마커 */
export const RP_CHART_LINE_COLOR = '#c4a484'

export const RP_CHART_LAYOUTS = {
  default: {
    width: 360,
    height: 132,
    padding: { top: 12, right: 16, bottom: 26, left: 44 },
    strokeWidth: 1.5,
    labelSize: 10,
    markerSize: 4,
    activeMarkerSize: 5,
  },
  sidebar: {
    width: 280,
    height: 108,
    padding: { top: 10, right: 8, bottom: 22, left: 34 },
    strokeWidth: 1.5,
    labelSize: 9,
    markerSize: 3.5,
    activeMarkerSize: 4.5,
  },
} satisfies Record<string, RpChartLayout>

export function diamondPath(cx: number, cy: number, radius: number): string {
  return `M ${cx.toFixed(1)} ${(cy - radius).toFixed(1)} L ${(cx + radius).toFixed(1)} ${cy.toFixed(1)} L ${cx.toFixed(1)} ${(cy + radius).toFixed(1)} L ${(cx - radius).toFixed(1)} ${cy.toFixed(1)} Z`
}

export function buildRpChartGeometry(points: RpTrendPoint[], layout: RpChartLayout) {
  const { width, height, padding } = layout
  const rpValues = points.map((p) => p.rpAfter)
  const dataMin = Math.min(...rpValues)
  const dataMax = Math.max(...rpValues)
  const { ticks, domainMin, domainMax } = computeYAxisTicks(dataMin, dataMax)
  const range = domainMax - domainMin || 1

  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const baselineY = height - padding.bottom

  const valueToY = (rp: number) =>
    padding.top + innerH - ((rp - domainMin) / range) * innerH

  const coords = points.map((p, i) => {
    const x = padding.left + (i / Math.max(points.length - 1, 1)) * innerW
    const y = valueToY(p.rpAfter)
    return { x, y, point: p }
  })

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ')

  const yTicks = ticks.map((value) => ({
    value,
    y: valueToY(value),
  }))

  return {
    coords,
    linePath,
    baselineY,
    yTicks,
    dataMin,
    dataMax,
    domainMin,
    domainMax,
    width,
    height,
    padding,
  }
}
