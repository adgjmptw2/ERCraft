import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AnalysisTabLayout } from '@/components/analysis/tab/AnalysisTabLayout'
import {
  getDemoAnalysisMatchesForSeason,
  getDemoAnalysisPopulationMatches,
  getDemoPlayStyleAnalysisForSeason,
  getDemoPlayStylePopulationMatchSets,
  getDemoPlayStyleTierPopulationMatchSets,
  getDemoPlayerAnalysisCharacterReportsForSeason,
  getDemoPlayerAnalysisReportForSeason,
} from '@/mocks/loader'

function renderMineAnalysis() {
  return render(
    <AnalysisTabLayout
      nickname="마인"
      playStyleAnalysis={getDemoPlayStyleAnalysisForSeason('마인', 11, 'recent20')}
      analysisReport={getDemoPlayerAnalysisReportForSeason('마인', 11, 'recent20')}
      characterReports={getDemoPlayerAnalysisCharacterReportsForSeason('마인', 11, 'recent20')}
      analysisMatches={getDemoAnalysisMatchesForSeason('마인', 11, 'recent20')}
      populationMatchSets={getDemoPlayStylePopulationMatchSets(11, 'recent20')}
      tierPopulationMatchSets={getDemoPlayStyleTierPopulationMatchSets('마인', 11, 'recent20')}
      populationMatches={getDemoAnalysisPopulationMatches()}
      basisLabel="랭크 · 최근 20판 기준"
      analysisScope="recent20"
      showScopeToggle={false}
      onScopeChange={() => {}}
    />,
  )
}

describe('AnalysisTabLayout', () => {
  it('마인 분석탭 — view model 기반 섹션 렌더', () => {
    renderMineAnalysis()

    expect(screen.getByText('핵심 요약')).toBeInTheDocument()
    expect(screen.getByText('성향 · 6축 분석')).toBeInTheDocument()
    expect(screen.getByText('대표 캐릭터 · 최근 픽')).toBeInTheDocument()
    expect(screen.getByText('카테고리별 지표')).toBeInTheDocument()
    expect(screen.getByText(/ERCraft 자체 분석 기준/)).toBeInTheDocument()
  })

  it('캐릭터 선택 시 6축·지표가 해당 캐릭터 기준으로 전환', () => {
    renderMineAnalysis()

    expect(screen.getByText('성향 · 6축 분석')).toBeInTheDocument()

    const characterButton = screen.getAllByRole('button').find((button) =>
      button.textContent?.includes('경기 · 승률'),
    )
    expect(characterButton).toBeTruthy()
    fireEvent.click(characterButton!)

    expect(screen.getByText(/· 6축 분석/)).toBeInTheDocument()
    expect(screen.queryByText('성향 · 6축 분석')).not.toBeInTheDocument()
    expect(screen.getByText(/카테고리별 지표/)).toBeInTheDocument()
    expect(screen.getAllByText(/선택한 캐릭터의 최근 경기만 집계/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/· 유키/).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { pressed: true })).toBe(characterButton)
  })

  it('대표 캐릭터 — CharacterAvatar characterNum 전달', () => {
    const { container } = renderMineAnalysis()

    const imgs = container.querySelectorAll('img[src*="/assets/characters/"]')
    expect(imgs.length).toBeGreaterThan(0)
    expect(imgs[0]?.getAttribute('src')).toMatch(/\/assets\/characters\/\d+\.webp/)
  })

  it('백분위·SSS 문구 미노출', () => {
    renderMineAnalysis()
    const text = document.body.textContent ?? ''

    expect(text).not.toMatch(/SSS/i)
    expect(text).not.toMatch(/상위\s*[\d.]+\s*%/)
    expect(text).not.toMatch(/샘플\s*상위/)
  })

  it('팀 지표 future — 실제값처럼 숫자 미표시', () => {
    renderMineAnalysis()

    expect(screen.getAllByText('상세 데이터 필요').length).toBeGreaterThan(0)
    expect(screen.getByText('팀 지표 미리보기')).toBeInTheDocument()
  })

  it('표본 부족 — empty state', () => {
    render(
      <AnalysisTabLayout
        nickname="없음"
        playStyleAnalysis={null}
        analysisReport={null}
        characterReports={[]}
        analysisMatches={[]}
        populationMatchSets={[]}
        tierPopulationMatchSets={[]}
        populationMatches={[]}
        basisLabel="test"
        analysisScope="recent20"
        showScopeToggle={false}
        onScopeChange={() => {}}
      />,
    )

    expect(screen.getByText('분석 데이터 부족')).toBeInTheDocument()
  })
})
