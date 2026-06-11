export const ANALYSIS_AXES = [
  'survival',
  'combat',
  'macro',
  'support',
  'finish',
  'consistency',
] as const

export type AnalysisAxis = (typeof ANALYSIS_AXES)[number]

export const ANALYSIS_AXIS_LABELS: Record<AnalysisAxis, string> = {
  survival: '생존',
  combat: '교전',
  macro: '운영',
  support: '지원',
  finish: '마무리',
  consistency: '일관성',
}

export const PLAYER_ROLES = [
  'basicAttackDealer',
  'skillAmpDealer',
  'bruiser',
  'support',
  'tank',
  'assassin',
] as const

export type PlayerRole = (typeof PLAYER_ROLES)[number]

export const PLAYER_ROLE_LABELS: Record<PlayerRole, string> = {
  basicAttackDealer: '평타 딜러',
  skillAmpDealer: '스킬 딜러',
  bruiser: '브루저',
  support: '서폿',
  tank: '탱커',
  assassin: '암살자',
}

export type AxisScores = Partial<Record<AnalysisAxis, number>>

export type RoleFitScores = Partial<Record<PlayerRole, number>>

export interface PlayStyleRadarChartPoint {
  subject: string
  axis: AnalysisAxis
  value: number
  tierAvg: number
  fullMark: number
}

export interface PlayerPlayStyleAnalysis {
  status: 'ok' | 'insufficient'
  sampleSize: number
  axisScores: AxisScores
  tierAverageAxes: AxisScores
  roleFitScores: RoleFitScores
  primaryRole: PlayerRole | null
  secondaryRole: PlayerRole | null
  unavailableMetrics: string[]
  overallScore: number | null
  strengths: string[]
  improvements: string[]
  comment: string
  chartData: PlayStyleRadarChartPoint[]
  basisLabel: string
}
