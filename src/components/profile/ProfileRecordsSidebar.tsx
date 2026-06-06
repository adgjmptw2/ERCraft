import type { CharacterAnalysisReport } from '@/analysis/types'
import type { DemoSeasonSnapshot } from '@/mocks/seasonHistory'
import { CharacterStats } from '@/components/profile/CharacterStats'
import { WinLossBar } from '@/components/profile/WinLossBar'
import { SurfaceCard } from '@/components/shared'
import { tierToken } from '@/utils/gameLabels'
import { cn } from '@/lib/utils'

export interface ProfileRecordsSidebarProps {
  seasonSnapshot: DemoSeasonSnapshot
  characterReports: CharacterAnalysisReport[]
  userNum: number
  className?: string
}

const GRID_DIVIDER = '#2a2a2a'

function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR')
}

function tierAccentColor(tier: string): string {
  const token = tierToken(tier)
  if (token.startsWith('아이언')) return '#9ca3af'
  if (token.startsWith('브론즈')) return '#cd7f32'
  if (token.startsWith('실버')) return '#aaaaaa'
  if (token.startsWith('골드')) return '#f0b429'
  if (token.startsWith('플래티넘')) return '#4fc3b0'
  if (token.startsWith('다이아')) return '#5b8dd9'
  return '#9ca3af'
}

function compactTierLabel(tier: string): string {
  const parts = tier.trim().split(/\s+/)
  if (parts.length <= 1) return parts[0] ?? tier
  return `${parts[0]}${parts[1]}`
}

function SeasonSummaryBadges({
  seasonNumber,
  tier,
}: {
  seasonNumber: number
  tier: string
}) {
  const accent = tierAccentColor(tier)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="bg-muted text-foreground inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-md px-2 text-xs font-bold tabular-nums">
        S{seasonNumber}
      </span>
      <span
        className="inline-flex h-7 items-center rounded-md px-2 text-xs font-bold"
        style={{ color: accent, backgroundColor: `${accent}18` }}
      >
        {compactTierLabel(tier)}
      </span>
    </div>
  )
}

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-md">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            'flex flex-col gap-y-0.5 p-3',
            index % 2 === 0 && 'border-r',
            index < 2 && 'border-b',
          )}
          style={{ borderColor: GRID_DIVIDER }}
        >
          <p
            className="text-xs uppercase tracking-[0.05em]"
            style={{ color: '#6b7280' }}
          >
            {item.label}
          </p>
          <p className="text-base font-semibold tabular-nums text-white">{item.value}</p>
        </div>
      ))}
    </div>
  )
}

export function ProfileRecordsSidebar({
  seasonSnapshot,
  characterReports,
  userNum,
  className,
}: ProfileRecordsSidebarProps) {
  const coreStats = [
    { label: 'KDA', value: seasonSnapshot.kdaString },
    { label: '평균 순위', value: seasonSnapshot.avgPlacement.toFixed(2) },
    { label: 'TOP 3 비율', value: `${seasonSnapshot.top3Rate.toFixed(0)}%` },
    { label: '총 게임', value: `${seasonSnapshot.games}게임` },
  ]

  const extraStats = [
    { label: '평균 생존시간', value: seasonSnapshot.avgSurvivalLabel },
    { label: '평균 피해량', value: formatNumber(seasonSnapshot.avgDamage) },
    { label: '평균 힐량', value: formatNumber(seasonSnapshot.avgHeal) },
    {
      label: '오브젝트 기여',
      value: `${seasonSnapshot.objectiveContribution.toFixed(0)}%`,
    },
  ]

  return (
    <aside className={cn('flex flex-col gap-3', className)}>
      <SurfaceCard padding="md" className="space-y-3">
        <SeasonSummaryBadges
          seasonNumber={seasonSnapshot.seasonNumber}
          tier={seasonSnapshot.tier}
        />

        <WinLossBar
          wins={seasonSnapshot.wins}
          losses={seasonSnapshot.losses}
          winRate={seasonSnapshot.winRate}
        />

        <StatGrid items={coreStats} />
        <StatGrid items={extraStats} />
      </SurfaceCard>

      <SurfaceCard padding="md">
        <CharacterStats
          characterReports={characterReports}
          userNum={userNum}
          seasonNumber={seasonSnapshot.seasonNumber}
        />
      </SurfaceCard>
    </aside>
  )
}
