import type { CharacterAnalysisReport } from '@/analysis/types'
import type { RoleSummaryResult } from '@/analysis/roleClassifier'
import type { DemoPlayerCompactSummary } from '@/mocks/loader'
import type { RpTrendPoint } from '@/mocks/loader'
import type { DemoSeasonSnapshot } from '@/mocks/seasonHistory'
import { CharacterStats } from '@/components/profile/CharacterStats'
import { ProfileAnalysisHeroCard } from '@/components/profile/ProfileAnalysisHeroCard'
import { SurfaceCard } from '@/components/shared'
import { cn } from '@/lib/utils'

export interface ProfileRecordsSidebarProps {
  seasonSnapshot: DemoSeasonSnapshot
  rpTrend: RpTrendPoint[]
  compactSummary: DemoPlayerCompactSummary | null
  roleSummary: RoleSummaryResult | null
  characterReports: CharacterAnalysisReport[]
  userNum: number
  className?: string
}

export function ProfileRecordsSidebar({
  seasonSnapshot,
  rpTrend,
  compactSummary,
  roleSummary,
  characterReports,
  userNum,
  className,
}: ProfileRecordsSidebarProps) {
  return (
    <aside className={cn('flex min-w-0 flex-col gap-3', className)}>
      <ProfileAnalysisHeroCard
        variant="sidebar"
        seasonNumber={seasonSnapshot.seasonNumber}
        rank={seasonSnapshot.rank}
        tierDetail={seasonSnapshot.tierDetail}
        rpTrend={rpTrend}
        compactSummary={compactSummary}
        roleSummary={roleSummary}
      />

      <SurfaceCard padding="md" className="min-w-0 px-2 py-4 md:px-3">
        <CharacterStats
          characterReports={characterReports}
          userNum={userNum}
          seasonNumber={seasonSnapshot.seasonNumber}
        />
      </SurfaceCard>
    </aside>
  )
}
