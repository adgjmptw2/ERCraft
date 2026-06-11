import { describe, expect, it } from 'vitest'

import { CHARACTER_KO_RELEASE_ORDER } from '@/utils/characterMap'
import { localizeCharacter } from '@/utils/gameLabels'

describe('localizeCharacter', () => {
  it('Li Dailin → 리 다일린', () => {
    expect(localizeCharacter('Li Dailin')).toBe('리 다이린')
  })

  it('LiDailin (공백 없음) → 리 다이린', () => {
    expect(localizeCharacter('LiDailin')).toBe('리 다이린')
  })

  it('매핑 없는 이름은 원문 유지', () => {
    expect(localizeCharacter('Unknown Hero')).toBe('Unknown Hero')
  })

  it('출시 실험체 86명 한국어명 중복 없음', () => {
    const released = CHARACTER_KO_RELEASE_ORDER.slice(0, 86)
    expect(new Set(released).size).toBe(86)
  })
})
