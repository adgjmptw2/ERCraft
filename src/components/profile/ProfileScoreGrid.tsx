import type { DemoRankingPosition } from '@/mocks/loader'
import type { PlayerStatsDTO } from '@/types/player'
import { cn } from '@/lib/utils'

export interface ProfileScoreGridProps {
  stats: PlayerStatsDTO
  rankingPosition?: DemoRankingPosition | null
  avgAssists?: number
  top3Rate?: number
  className?: string
}

interface MetricItem {
  label: string
  value: string
  accent?: boolean
}

function formatOptional(n: number | undefined, digits = 2): string {
  if (n == null || Number.isNaN(n)) return '-'
  return n.toFixed(digits)
}

function formatRanking(position: DemoRankingPosition | null | undefined): string {
  if (!position) return '랭킹 데이터 없음'
  return `#${position.position} · ${position.total}명 중 ${position.position}위`
}

export function ProfileScoreGrid({
  stats,
  rankingPosition,
  avgAssists,
  top3Rate,
  className,
}: ProfileScoreGridProps) {
  const metrics: MetricItem[] = [
    { label: '데모 RP', value: String(stats.mmr), accent: true },
    { label: '데모 RP 순위', value: formatRanking(rankingPosition), accent: true },
    { label: '승률', value: `${stats.winRate}%` },
    { label: '게임 수', value: String(stats.games) },
    { label: '평균 순위', value: stats.avgPlacement.toFixed(2) },
    { label: '평균 킬', value: stats.avgKills.toFixed(2) },
    { label: 'KDA', value: stats.kdaString, accent: true },
    {
      label: 'TOP 3 비율',
      value: top3Rate != null ? `${top3Rate.toFixed(0)}%` : '-',
    },
    { label: '평균 어시스트', value: formatOptional(avgAssists) },
    {
      label: '주 캐릭터',
      value: stats.mostPlayedCharacter.name,
      accent: true,
    },
  ]

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3',
        className,
      )}
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={cn(
            'border-border/70 bg-card/60 rounded-lg border px-3 py-2.5',
            metric.accent && 'border-primary/20 bg-primary/5',
          )}
        >
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {metric.label}
          </p>
          <p className="text-foreground mt-1 text-sm font-semibold break-words sm:text-base">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  )
}
