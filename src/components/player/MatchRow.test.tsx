import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MatchRow } from '@/components/player/MatchRow'
import type { MatchSummaryDTO } from '@/types/match'
import { toMatchSummaryDTO } from '@/utils/dto'

function makeMatch(overrides: Partial<MatchSummaryDTO> = {}): MatchSummaryDTO {
  const base = toMatchSummaryDTO({
    matchId: 'test-match',
    userNum: 1,
    characterNum: 11,
    characterName: 'Yuki',
    placement: 1,
    kills: 3,
    deaths: 1,
    assists: 2,
    gameStartedAt: '2026-04-01T00:00:00.000Z',
    victory: true,
    gameMode: 'rank',
  })
  return { ...base, ...overrides }
}

describe('MatchRow', () => {
  it('record variant가 characterNum 초상화 URL을 사용', () => {
    const { container } = render(<MatchRow match={makeMatch()} variant="record" />)
    const img = container.querySelector('img[src*="/assets/characters/"]')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', '/assets/characters/11.webp')
  })

  it('characterNum 없으면 이니셜 fallback', () => {
    const { container } = render(
      <MatchRow match={makeMatch({ characterNum: undefined, characterName: '유키' })} variant="record" />,
    )
    expect(container.querySelector('img[src*="/assets/characters/"]')).toBeNull()
    expect(container.textContent).toContain('유')
  })

  it('equipmentPreview 없으면 빈 장비 슬롯만 렌더', () => {
    const { container } = render(<MatchRow match={makeMatch()} variant="record" />)
    expect(container.querySelectorAll('img[src*="/assets/items/"]')).toHaveLength(0)
    expect(container.querySelectorAll('img[src*="/assets/loadout/"]')).toHaveLength(0)
  })

  it('equipmentPreview — 슬롯별 검증 slug만 아이콘 요청', () => {
    const { container } = render(
      <MatchRow
        match={makeMatch({
          equipmentPreview: {
            weaponTypeSlug: 'weapons/weapon-group/arcana',
            tacticalSkillSlug: 'tactical-skills/blink',
            mainTraitSlug: 'havoc/vampiric-bloodline',
            subTraitSlug: 'invalid-trait',
            gear: {
              weapon: 'weapons/arcana/glass-bead',
              chest: 'armor/chest/battle-suit',
              head: 'fake-head',
            },
          },
        })}
        variant="record"
      />,
    )

    expect(container.querySelector('img[src*="/assets/items/weapons/weapon-group/arcana"]')).not.toBeNull()
    expect(container.querySelector('img[src*="/assets/loadout/tactical-skills/blink"]')).not.toBeNull()
    expect(container.querySelector('img[src*="/assets/loadout/havoc/vampiric-bloodline"]')).not.toBeNull()
    expect(container.querySelectorAll('img[src*="/assets/loadout/"]')).toHaveLength(2)
    expect(container.querySelectorAll('img[src*="/assets/items/"]')).toHaveLength(5)
    expect(container.innerHTML).not.toContain('fake-head')
    expect(container.innerHTML).not.toContain('invalid-trait')
  })

  it('특성 슬롯은 우측 열만 원형', () => {
    const { container } = render(
      <MatchRow
        match={makeMatch({
          equipmentPreview: {
            weaponTypeSlug: 'weapons/weapon-group/arcana',
            tacticalSkillSlug: 'tactical-skills/blink',
            mainTraitSlug: 'havoc/vampiric-bloodline',
            subTraitSlug: 'chaos/red-sprite',
          },
        })}
        variant="record"
      />,
    )
    const loadoutGrid = container.querySelector('[aria-label="무기·스킬·특성"]')
    const icons = loadoutGrid?.querySelectorAll('img') ?? []
    expect(icons).toHaveLength(4)
    expect(icons[0]?.className).not.toContain('rounded-full')
    expect(icons[1]?.className).toContain('rounded-full')
    expect(icons[2]?.className).not.toContain('rounded-full')
    expect(icons[3]?.className).toContain('rounded-full')
  })
})
