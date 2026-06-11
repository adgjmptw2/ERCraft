import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ItemIcon } from '@/components/shared/ItemIcon'
import { LoadoutIcon } from '@/components/shared/LoadoutIcon'
import { TraitIcon } from '@/components/shared/TraitIcon'

describe('ItemIcon', () => {
  it('URL 없으면 fallback 슬롯', () => {
    const { container } = render(<ItemIcon slug="unknown-item" label="테스트" />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('검증된 slug면 img 렌더', () => {
    const { container } = render(<ItemIcon slug="material/battery" label="배터리" decorative={false} />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/assets/items/material/battery.webp')
    expect(img).toHaveAttribute('alt', '배터리 아이콘')
  })

  it('onError 시 fallback', () => {
    const { container } = render(
      <ItemIcon slug="material/battery" label="배터리" decorative={false} />,
    )
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    fireEvent.error(img!)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByTitle('배터리')).toBeInTheDocument()
  })
})

describe('TraitIcon / LoadoutIcon', () => {
  it('TraitIcon 검증 slug — 원형', () => {
    const { container } = render(<TraitIcon slug="chaos/stopping-power" />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/assets/loadout/chaos/stopping-power.webp')
    expect(img?.className).toContain('rounded-full')
  })

  it('LoadoutIcon 미검증 slug fallback', () => {
    const { container } = render(<LoadoutIcon slug="not-a-real-trait" />)
    expect(container.querySelector('img')).toBeNull()
  })
})
