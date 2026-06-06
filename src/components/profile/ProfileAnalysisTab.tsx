import type { CharacterAnalysisReport } from '@/analysis/types'
import type { PlayerAnalysisReport } from '@/analysis/types'
import { CharacterReportPanel, PlayerReportPanel } from '@/components/analysis'
import { RpTrendCard } from '@/components/profile/RpTrendCard'
import type { RpTrendPoint } from '@/mocks/loader'
import { SectionHeader, SurfaceCard } from '@/components/shared'

export interface ProfileAnalysisTabProps {
  analysisReport: PlayerAnalysisReport | null
  characterReports: CharacterAnalysisReport[]
  rpTrend: RpTrendPoint[]
  seasonNumber: number
}

export function ProfileAnalysisTab({
  analysisReport,
  characterReports,
  rpTrend,
  seasonNumber,
}: ProfileAnalysisTabProps) {
  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <RpTrendCard
        points={rpTrend}
        title={`S${seasonNumber} 데모 RP 흐름`}
        description={
          rpTrend.length > 0
            ? `S${seasonNumber} 샘플 매치 기준 RP 변화입니다.`
            : '이 시즌 샘플 RP 기록이 없습니다.'
        }
      />

      <SurfaceCard variant="inset" padding="lg" className="space-y-10 lg:space-y-12 p-5 sm:p-6">
        <SectionHeader title={`S${seasonNumber} 플레이 분석`} size="lg" />
        {analysisReport ? <PlayerReportPanel report={analysisReport} /> : null}
        <CharacterReportPanel reports={characterReports} />
      </SurfaceCard>
    </div>
  )
}
