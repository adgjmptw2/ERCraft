import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CharacterAvatar } from '@/components/shared/CharacterAvatar'

describe('CharacterAvatar', () => {
  it('characterNum 없으면 이니셜 fallback', () => {
    render(<CharacterAvatar characterName="유키" />)
    expect(screen.getByText('유')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('characterNum 있으면 img 렌더', () => {
    const { container } = render(<CharacterAvatar characterNum={11} characterName="유키" />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', '/assets/characters/11.webp')
  })

  it('characterNum 변경 시 새 초상화 URL을 시도', () => {
    const { container, rerender } = render(<CharacterAvatar characterNum={11} characterName="유키" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/assets/characters/11.webp')
    rerender(<CharacterAvatar characterNum={19} characterName="엠마" />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/assets/characters/19.webp')
  })

  it('이미지 로드 실패 시 후보 URL을 순서대로 시도', () => {
    const { container } = render(<CharacterAvatar characterNum={49} characterName="펠릭스" />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', '/assets/characters/49.webp')
    fireEvent.error(img!)
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      '/assets/characters/49/mini-1.webp',
    )
  })

  it('모든 후보 실패 시 이니셜 fallback', () => {
    const { container } = render(<CharacterAvatar characterNum={49} characterName="펠릭스" />)
    fireEvent.error(container.querySelector('img')!)
    fireEvent.error(container.querySelector('img')!)
    fireEvent.error(container.querySelector('img')!)
    expect(screen.getByText('펠')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
