import type { CharacterAnalysisReport } from '@/analysis/types'
import type { PlayerAnalysisReport } from '@/analysis/types'
import {
  ANALYSIS_DISCLAIMER,
  ANALYSIS_UI_SECTIONS,
  getConfidenceLabel,
  isSecondaryMetric,
  shouldShowMetricInSection,
  SUMMARY_CARD_METRIC_IDS,
} from '@/analysis/analysisUiLabels'
import {
  buildCharacterScopedPlayStyleAnalysis,
  buildCharacterScopedPlayerReport,
} from '@/analysis/characterScopedAnalysis'
import { buildPlayerAnalysisViewModel } from '@/analysis/playerAnalysisViewModel'
import type { AnalysisMetricStatus, AnalysisMetricViewModel } from '@/analysis/metricTypes'
import type { PlayerPlayStyleAnalysis } from '@/analysis/playStyleTypes'
import type { MatchEquipmentPreview, MatchSummary } from '@/types/match'
import { localizeCharacter } from '@/utils/gameLabels'

export type AnalysisMetricCardSize = 'small' | 'medium' | 'featured'

export interface AnalysisCharacterRow {
  /** 매치 필터용 영문 characterName */
  id: string
  name: string
  characterNum?: number
  games: number
  winRate: string
  avgPlacement: string
  featured: boolean
  /** 캐릭터별 상세 분석(다음 단계) 연결용 */
  equipmentPreview?: MatchEquipmentPreview
}

export interface AnalysisAxisRow {
  axis: string
  label: string
  score: number
  tierAvg: number
  keyword: string
}

export interface AnalysisMetricCardModel {
  id: string
  label: string
  value: string
  hint?: string
  size: AnalysisMetricCardSize
  unavailable?: boolean
  status: AnalysisMetricStatus
  isSecondary?: boolean
}

export interface AnalysisMetricSectionModel {
  id: string
  title: string
  description: string
  defaultExpanded: boolean
  futureOnly: boolean
  metrics: AnalysisMetricCardModel[]
}

export interface AnalysisTabViewModel {
  status: 'ok' | 'insufficient'
  selectedCharacterKey: string | null
  selectedCharacterLabel: string | null
  basisLabel: string
  headline: string
  insightLine: string
  estimatedTendency: string | null
  secondaryTendency: string | null
  summaryCards: AnalysisMetricCardModel[]
  characters: AnalysisCharacterRow[]
  axisRows: AnalysisAxisRow[]
  chartData: { subject: string; value: number; tierAvg: number; fullMark: number }[]
  metricSections: AnalysisMetricSectionModel[]
  teamPreviewMetrics: AnalysisMetricCardModel[]
  futureMetrics: AnalysisMetricViewModel[]
  strengths: string[]
  improvements: string[]
  analysisScore: number | null
  sampleSize: number
  dataConfidence: string
  confidenceLabel: string
  readyMetricCount: number
  disclaimer: string
  unavailableNote: string | null
  /** @deprecated flat grid — metricSections 사용 */
  metricCards: AnalysisMetricCardModel[]
}

function metricCardSize(
  metric: AnalysisMetricViewModel,
  variant: 'summary' | 'section',
): AnalysisMetricCardSize {
  if (variant === 'summary') return 'medium'
  if (metric.id === 'avgPlacement') return 'featured'
  if (metric.isPrimary && !isSecondaryMetric(metric.id)) return 'medium'
  return 'small'
}

function metricToCard(
  metric: AnalysisMetricViewModel,
  variant: 'summary' | 'section',
): AnalysisMetricCardModel {
  return {
    id: metric.id,
    label: metric.label,
    value: metric.formattedValue,
    hint: metric.description,
    size: metricCardSize(metric, variant),
    unavailable: metric.status !== 'ready',
    status: metric.status,
    isSecondary: isSecondaryMetric(metric.id),
  }
}

function findMetric(metrics: AnalysisMetricViewModel[], id: string): AnalysisMetricViewModel | undefined {
  return metrics.find((m) => m.id === id)
}

function buildAllMetrics(playerVm: ReturnType<typeof buildPlayerAnalysisViewModel>): AnalysisMetricViewModel[] {
  return [
    ...playerVm.summaryMetrics,
    ...playerVm.sections.flatMap((s) => s.metrics),
    ...playerVm.futureMetrics,
    ...playerVm.unavailableMetrics,
  ]
}

function countReadyMetrics(cards: AnalysisMetricCardModel[]): number {
  const seen = new Set<string>()
  let count = 0
  for (const card of cards) {
    if (seen.has(card.id) || card.status !== 'ready') continue
    seen.add(card.id)
    count += 1
  }
  return count
}

function uniqueMetrics(metrics: AnalysisMetricViewModel[]): AnalysisMetricViewModel[] {
  const seen = new Set<string>()
  return metrics.filter((m) => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })
}

function buildMetricSections(
  allMetrics: AnalysisMetricViewModel[],
): AnalysisMetricSectionModel[] {
  return ANALYSIS_UI_SECTIONS.map((sectionConfig) => {
    const sectionMetrics = uniqueMetrics(
      allMetrics.filter((m) => sectionConfig.categories.includes(m.category)),
    ).filter((m) => shouldShowMetricInSection(m.status, sectionConfig.futureOnly ?? false))

    return {
      id: sectionConfig.id,
      title: sectionConfig.title,
      description: sectionConfig.description,
      defaultExpanded: sectionConfig.defaultExpanded,
      futureOnly: sectionConfig.futureOnly ?? false,
      metrics: sectionMetrics.map((m) => metricToCard(m, 'section')),
    }
  }).filter((section) => section.metrics.length > 0 || section.futureOnly)
}

export interface BuildAnalysisTabViewModelParams {
  playStyleAnalysis: PlayerPlayStyleAnalysis | null
  analysisReport: PlayerAnalysisReport | null
  characterReports: CharacterAnalysisReport[]
  analysisMatches: MatchSummary[]
  basisLabel: string
  nickname?: string
  selectedCharacterKey?: string | null
  populationMatchSets?: MatchSummary[][]
  tierPopulationMatchSets?: MatchSummary[][]
  populationMatches?: MatchSummary[]
}

function resolveCharacterKey(reportName: string, matches: MatchSummary[]): string {
  const trimmed = reportName.trim()
  const byEnglish = matches.find((match) => match.characterName === trimmed)
  if (byEnglish?.characterName) return byEnglish.characterName

  const byLocalized = matches.find(
    (match) => localizeCharacter(match.characterName) === trimmed,
  )
  return byLocalized?.characterName ?? trimmed
}

export function buildAnalysisTabViewModel(
  params: BuildAnalysisTabViewModelParams,
): AnalysisTabViewModel {
  const {
    playStyleAnalysis,
    analysisReport,
    characterReports,
    analysisMatches,
    basisLabel,
    nickname,
    selectedCharacterKey = null,
    populationMatchSets,
    tierPopulationMatchSets,
    populationMatches,
  } = params

  const scopedCharacterKey = selectedCharacterKey?.trim() || null
  const scopedCharacterLabel = scopedCharacterKey
    ? localizeCharacter(scopedCharacterKey)
    : null
  const scopedBasisLabel = scopedCharacterLabel
    ? `${basisLabel} · ${scopedCharacterLabel}`
    : basisLabel

  let scopedPlayStyle = playStyleAnalysis
  let scopedReport = analysisReport
  let scopedMatches = analysisMatches

  if (
    scopedCharacterKey &&
    populationMatchSets &&
    populationMatchSets.length > 0 &&
    nickname
  ) {
    scopedMatches = analysisMatches.filter(
      (match) =>
        match.characterName === scopedCharacterKey ||
        localizeCharacter(match.characterName) === scopedCharacterKey ||
        localizeCharacter(match.characterName) === scopedCharacterLabel,
    )
    scopedPlayStyle = buildCharacterScopedPlayStyleAnalysis({
      characterKey: scopedCharacterKey,
      playerMatches: analysisMatches,
      populationMatchSets,
      tierPopulationMatchSets,
      basisLabel: scopedBasisLabel,
    })
    if (populationMatches) {
      scopedReport = buildCharacterScopedPlayerReport({
        characterKey: scopedCharacterKey,
        nickname,
        playerMatches: analysisMatches,
        populationMatches,
      })
    }
  }

  const playerVm = buildPlayerAnalysisViewModel({
    playStyleAnalysis: scopedPlayStyle,
    analysisReport: scopedReport,
    analysisMatches: scopedMatches,
    basisLabel: scopedBasisLabel,
  })

  const characters = [...characterReports]
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 5)
    .map((row, index) => {
      const characterKey = resolveCharacterKey(row.characterName, analysisMatches)
      const latestMatch = analysisMatches.find(
        (m) => m.characterName === characterKey && m.equipmentPreview,
      )
      return {
        id: characterKey,
        name: localizeCharacter(characterKey),
        characterNum: row.characterNum,
        games: row.matchCount,
        winRate: `${row.winRate.toFixed(1)}%`,
        avgPlacement: row.avgPlacement != null ? row.avgPlacement.toFixed(2) : '-',
        featured: index === 0,
        equipmentPreview: latestMatch?.equipmentPreview,
      }
    })

  const confidenceLabel = getConfidenceLabel(playerVm.dataConfidence)
  const emptyBase = {
    selectedCharacterKey: scopedCharacterKey,
    selectedCharacterLabel: scopedCharacterLabel,
    basisLabel: scopedBasisLabel,
    headline: scopedCharacterLabel
      ? `${scopedCharacterLabel} 표본 부족`
      : '표본 부족',
    insightLine: scopedCharacterLabel
      ? `${scopedCharacterLabel} 최근 경기가 부족해 분석을 표시할 수 없습니다.`
      : '최근 랭크 매치가 부족해 분석을 표시할 수 없습니다.',
    estimatedTendency: null as string | null,
    secondaryTendency: null as string | null,
    summaryCards: [] as AnalysisMetricCardModel[],
    characters,
    axisRows: [] as AnalysisAxisRow[],
    chartData: [] as AnalysisTabViewModel['chartData'],
    metricSections: [] as AnalysisMetricSectionModel[],
    teamPreviewMetrics: [] as AnalysisMetricCardModel[],
    futureMetrics: playerVm.futureMetrics,
    strengths: [] as string[],
    improvements: [] as string[],
    analysisScore: null as number | null,
    sampleSize: playerVm.sampleSize,
    dataConfidence: playerVm.dataConfidence,
    confidenceLabel,
    readyMetricCount: 0,
    disclaimer: ANALYSIS_DISCLAIMER,
    unavailableNote: null as string | null,
    metricCards: [] as AnalysisMetricCardModel[],
  }

  if (playerVm.dataConfidence === 'insufficient') {
    return { status: 'insufficient', ...emptyBase }
  }

  const allMetrics = buildAllMetrics(playerVm)

  const summaryCards = SUMMARY_CARD_METRIC_IDS.flatMap((id) => {
    const metric = findMetric(allMetrics, id)
    return metric ? [metricToCard(metric, 'summary')] : []
  })

  const axisRows: AnalysisAxisRow[] = playerVm.radarAxes.map((row) => ({
    axis: row.axis,
    label: row.label,
    score: row.score,
    tierAvg: playerVm.chartData.find((p) => p.subject === row.label)?.referenceAvg ?? 50,
    keyword: row.keyword,
  }))

  const chartData = playerVm.chartData.map((point) => ({
    subject: point.subject,
    value: point.value,
    tierAvg: point.referenceAvg,
    fullMark: point.fullMark,
  }))

  const metricSections = buildMetricSections(allMetrics)
  const teamPreviewMetrics =
    metricSections.find((s) => s.id === 'teamPreview')?.metrics ??
    playerVm.futureMetrics
      .filter((m) => m.category === 'team')
      .map((m) => metricToCard(m, 'section'))

  const flatCards = metricSections
    .filter((s) => !s.futureOnly)
    .flatMap((s) => s.metrics)

  const readyMetricCount = countReadyMetrics([...summaryCards, ...flatCards])

  return {
    status: 'ok',
    selectedCharacterKey: scopedCharacterKey,
    selectedCharacterLabel: scopedCharacterLabel,
    basisLabel: scopedBasisLabel,
    headline: playerVm.headline,
    insightLine: playerVm.insightLine,
    estimatedTendency: playerVm.estimatedTendency,
    secondaryTendency: playerVm.secondaryTendency,
    summaryCards,
    characters,
    axisRows,
    chartData,
    metricSections,
    teamPreviewMetrics,
    futureMetrics: playerVm.futureMetrics,
    strengths: playerVm.strengths,
    improvements: playerVm.improvements,
    analysisScore: playerVm.analysisScore,
    sampleSize: playerVm.sampleSize,
    dataConfidence: playerVm.dataConfidence,
    confidenceLabel,
    readyMetricCount,
    disclaimer: ANALYSIS_DISCLAIMER,
    unavailableNote: playerVm.dataNote,
    metricCards: flatCards,
  }
}
