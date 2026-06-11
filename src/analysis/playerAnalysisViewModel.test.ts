import { describe, expect, it } from 'vitest'

import { buildPlayerAnalysisViewModel } from '@/analysis/playerAnalysisViewModel'
import {
  getDemoAnalysisMatchesForSeason,
  getDemoPlayStyleAnalysisForSeason,
  getDemoPlayerAnalysisReportForSeason,
} from '@/mocks/loader'

describe('buildPlayerAnalysisViewModel', () => {
  it('마인 mock player view model 생성', () => {
    const vm = buildPlayerAnalysisViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: '랭크 · 최근 20판 기준',
    })

    expect(vm.dataConfidence).not.toBe('insufficient')
    expect(vm.summaryMetrics.length).toBeGreaterThan(0)
    expect(vm.sections.length).toBeGreaterThan(0)
    expect(vm.futureMetrics.length).toBeGreaterThan(0)
  })

  it('requiresDataset 지표는 ready가 아님', () => {
    const vm = buildPlayerAnalysisViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: 'test',
    })

    const datasetFuture = vm.futureMetrics.filter((m) => m.availability === 'requiresDataset')
    expect(datasetFuture.every((m) => m.status === 'future')).toBe(true)
    expect(datasetFuture.every((m) => m.formattedValue === '데이터 축적 후 제공')).toBe(true)
  })

  it('requiresMatchDetail 지표는 실제값처럼 표시되지 않음', () => {
    const vm = buildPlayerAnalysisViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: 'test',
    })

    const teamFuture = vm.futureMetrics.filter((m) => m.availability === 'requiresMatchDetail')
    expect(teamFuture.length).toBeGreaterThan(0)
    for (const metric of teamFuture) {
      expect(metric.status).toBe('future')
      expect(metric.value).toBeNull()
      expect(metric.formattedValue).toBe('상세 경기 데이터 필요')
    }
  })

  it('백분위·SSS 문자열이 생성되지 않음', () => {
    const vm = buildPlayerAnalysisViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: 'test',
    })

    const allText = [
      ...vm.summaryMetrics,
      ...vm.sections.flatMap((s) => s.metrics),
      ...vm.futureMetrics,
    ]
      .map((m) => m.formattedValue)
      .join(' ')

    expect(allText).not.toMatch(/SSS/i)
    expect(allText).not.toMatch(/샘플\s*상위/)
    expect(allText).not.toMatch(/상위\s*[\d.]+\s*%/)
  })

  it('표본 부족 시 partial/insufficient', () => {
    const vm = buildPlayerAnalysisViewModel({
      playStyleAnalysis: null,
      analysisReport: null,
      analysisMatches: [],
      basisLabel: 'test',
    })

    expect(vm.dataConfidence).toBe('insufficient')
    const sampleMetric = vm.summaryMetrics.find((m) => m.id === 'sampleSize')
    expect(sampleMetric?.formattedValue).toBe('0')
  })

  it('20판 미만일 때 medium confidence', () => {
    const matches = getDemoAnalysisMatchesForSeason('마인', 11, 'recent20').slice(0, 5)
    const vm = buildPlayerAnalysisViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      analysisMatches: matches,
      basisLabel: 'test',
    })

    expect(vm.dataConfidence).toBe('medium')
  })

  it('역할 추정은 약한 표현', () => {
    const vm = buildPlayerAnalysisViewModel({
      playStyleAnalysis: getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20'),
      analysisReport: getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20'),
      analysisMatches: getDemoAnalysisMatchesForSeason('마인', 11, 'recent20'),
      basisLabel: 'test',
    })

    if (vm.estimatedTendency) {
      expect(vm.estimatedTendency).toMatch(/^추정:/)
    }
  })
})
