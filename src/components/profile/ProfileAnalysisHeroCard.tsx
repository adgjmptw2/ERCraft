import type { RoleSummaryResult } from '@/analysis/roleClassifier'
import type { DemoPlayerCompactSummary } from '@/mocks/loader'
import type { RpTrendPoint } from '@/mocks/loader'
import type { SeasonRank } from '@/types/rank'
import { ProfileCompactSummary } from '@/components/profile/ProfileCompactSummary'
import { ProfileRoleSummary } from '@/components/profile/ProfileRoleSummary'
import { RpTrendCard } from '@/components/profile/RpTrendCard'
import { SeasonSummaryBadges } from '@/components/profile/SeasonSummaryBadges'
import { SurfaceCard } from '@/components/shared'
import { cn } from '@/lib/utils'

export interface ProfileAnalysisHeroCardProps {
  seasonNumber: number
  rank: SeasonRank
  tierDetail: string
  rpTrend: RpTrendPoint[]
  compactSummary: DemoPlayerCompactSummary | null
  roleSummary: RoleSummaryResult | null
  /** sidebar — 전적 탭 좌측 카드 폭에 맞춤 */
  variant?: 'default' | 'sidebar'
  className?: string
}

export function ProfileAnalysisHeroCard({
  seasonNumber,
  rank,
  tierDetail,
  rpTrend,
  compactSummary,
  roleSummary,
  variant = 'default',
  className,
}: ProfileAnalysisHeroCardProps) {
  const isSidebar = variant === 'sidebar'

  return (
    <SurfaceCard
      padding="md"
      className={cn('min-w-0 space-y-0', isSidebar && 'w-full max-w-full', className)}
    >
      <SeasonSummaryBadges seasonNumber={seasonNumber} rank={rank} tierDetail={tierDetail} />

      <div className="border-border/60 my-2.5 border-t sm:my-3" aria-hidden />

      <RpTrendCard
        points={rpTrend}
        embedded
        compact
        size={isSidebar ? 'sidebar' : 'default'}
      />

      {compactSummary ? <ProfileCompactSummary summary={compactSummary} /> : null}

      {roleSummary ? <ProfileRoleSummary roleSummary={roleSummary} /> : null}
    </SurfaceCard>
  )
}
