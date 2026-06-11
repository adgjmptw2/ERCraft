import { describe, expect, it } from 'vitest'

import { buildAnalysisTabViewModel } from '@/analysis/analysisTabViewModel'
import {
  getDemoAnalysisMatchesForSeason,
  getDemoPlayStyleAnalysisForSeason,
  getDemoPlayerAnalysisReportForSeason,
  getDemoPlayerAnalysisCharacterReportsForSeason,
} from '@/mocks/loader'

describe('buildAnalysisTabViewModel', () => {
  it('마인 분석탭 view model 생성', () => {
    const vm = buildAnalysisTabViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      characterReports: getDemoPlayerAnalysisCharacterReportsForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: '랭크 · 최근 20판 기준',
    })

    expect(vm.status).toBe('ok')
    expect(vm.summaryCards.length).toBeGreaterThan(0)
    expect(vm.metricSections.length).toBeGreaterThan(0)
    expect(vm.characters.length).toBeGreaterThan(0)
    for (const row of vm.characters) {
      const rate = Number.parseFloat(row.winRate.replace('%', ''))
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(100)
    }
    expect(vm.chartData.length).toBe(6)
    expect(vm.confidenceLabel).toBeTruthy()
    expect(vm.readyMetricCount).toBeGreaterThan(0)
    expect(vm.disclaimer).toContain('ERCraft')
  })

  it('핵심 요약 카드는 future가 아님', () => {
    const vm = buildAnalysisTabViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      characterReports: getDemoPlayerAnalysisCharacterReportsForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: 'test',
    })

    for (const card of vm.summaryCards) {
      expect(card.status).not.toBe('future')
    }
  })

  it('표본 부족 시 insufficient', () => {
    const vm = buildAnalysisTabViewModel({
      playStyleAnalysis: null,
      analysisReport: null,
      characterReports: [],
      analysisMatches: [],
      basisLabel: 'test',
    })
    expect(vm.status).toBe('insufficient')
  })

  it('metric card에 백분위 badge 없음', () => {
    const vm = buildAnalysisTabViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      characterReports: getDemoPlayerAnalysisCharacterReportsForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: 'test',
    })

    const allValues = [
      ...vm.summaryCards,
      ...vm.metricSections.flatMap((s) => s.metrics),
    ]
      .map((c) => c.value)
      .join(' ')

    expect(allValues).not.toMatch(/샘플\s*상위/)
    expect(allValues).not.toMatch(/SSS/i)

    for (const card of allValues.split(' ')) {
      expect(card).not.toMatch(/NaN|Infinity/)
    }
  })

  it('팀 미리보기 섹션에 future 지표', () => {
    const vm = buildAnalysisTabViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      characterReports: getDemoPlayerAnalysisCharacterReportsForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: 'test',
    })

    const teamSection = vm.metricSections.find((s) => s.id === 'teamPreview')
    expect(teamSection).toBeDefined()
    expect(teamSection?.metrics.every((m) => m.status === 'future')).toBe(true)
  })

  it('역할 적합도 카드 미노출', () => {
    const vm = buildAnalysisTabViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      characterReports: getDemoPlayerAnalysisCharacterReportsForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: 'test',
    })

    const ids = vm.metricSections.flatMap((s) => s.metrics.map((m) => m.id))
    expect(ids).not.toContain('roleFitScore')
  })
})
