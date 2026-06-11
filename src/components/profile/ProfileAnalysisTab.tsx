import type { CharacterAnalysisReport } from '@/analysis/types'
import type { PlayerAnalysisReport } from '@/analysis/types'
import type { PlayerPlayStyleAnalysis } from '@/analysis/playStyleTypes'
import { AnalysisTabLayout } from '@/components/analysis/tab'
import type { MatchSummary } from '@/types/match'
import type { AnalysisScope } from '@/utils/analysisAggregation'

export interface ProfileAnalysisTabProps {
  nickname: string
  analysisReport: PlayerAnalysisReport | null
  analysisCharacterReports: CharacterAnalysisReport[]
  analysisMatches: MatchSummary[]
  populationMatchSets: MatchSummary[][]
  tierPopulationMatchSets: MatchSummary[][]
  populationMatches: MatchSummary[]
  analysisBasisLabel: string
  analysisScope: AnalysisScope
  onAnalysisScopeChange: (scope: AnalysisScope) => void
  showAnalysisScopeToggle: boolean
  playStyleAnalysis: PlayerPlayStyleAnalysis | null
}

export function ProfileAnalysisTab({
  nickname,
  analysisReport,
  analysisCharacterReports,
  analysisMatches,
  populationMatchSets,
  tierPopulationMatchSets,
  populationMatches,
  analysisBasisLabel,
  analysisScope,
  onAnalysisScopeChange,
  showAnalysisScopeToggle,
  playStyleAnalysis,
}: ProfileAnalysisTabProps) {
  return (
    <AnalysisTabLayout
      nickname={nickname}
      playStyleAnalysis={playStyleAnalysis}
      analysisReport={analysisReport}
      characterReports={analysisCharacterReports}
      analysisMatches={analysisMatches}
      populationMatchSets={populationMatchSets}
      tierPopulationMatchSets={tierPopulationMatchSets}
      populationMatches={populationMatches}
      basisLabel={analysisBasisLabel}
      analysisScope={analysisScope}
      showScopeToggle={showAnalysisScopeToggle}
      onScopeChange={onAnalysisScopeChange}
    />
  )
}
