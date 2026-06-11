import { useState } from 'react'

import { cn } from '@/lib/utils'
import {
  equipmentGradeBgClass,
  type EquipmentItemGrade,
} from '@/utils/equipmentItemGrade'

export type GameAssetIconSize = 'sm' | 'md' | 'gear' | 'lg'

const SIZE_DIM: Record<GameAssetIconSize, { w: number; h: number }> = {
  sm: { w: 24, h: 24 },
  md: { w: 27, h: 27 },
  gear: { w: 36, h: 30 },
  lg: { w: 32, h: 32 },
}

export type GameAssetIconShape = 'square' | 'circle'

export interface GameAssetIconProps {
  src?: string | null
  label?: string
  size?: GameAssetIconSize
  shape?: GameAssetIconShape
  className?: string
  fallbackText?: string
  decorative?: boolean
  /** 전설·영웅·혈액 등급 배경 */
  grade?: EquipmentItemGrade
}

function fallbackGlyph(label?: string, fallbackText?: string): string {
  if (fallbackText?.trim()) return fallbackText.trim().slice(0, 2)
  return label?.trim().charAt(0).toUpperCase() || ''
}

const shapeClass: Record<GameAssetIconShape, string> = {
  square: 'rounded-[3px]',
  circle: 'rounded-full',
}

export function GameAssetIcon({
  src,
  label,
  size = 'sm',
  shape = 'square',
  className,
  fallbackText,
  decorative = true,
  grade,
}: GameAssetIconProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const { w: widthPx, h: heightPx } = SIZE_DIM[size]
  const showImage = src != null && src.length > 0 && failedUrl !== src
  const alt = decorative ? '' : `${label?.trim() || '아이콘'} 아이콘`
  const glyph = fallbackGlyph(label, fallbackText)
  const gradeBg = equipmentGradeBgClass(grade)

  if (!showImage) {
    return (
      <div
        className={cn(
          'border-border/70 bg-muted/30 text-muted-foreground flex shrink-0 items-center justify-center border text-[9px] font-medium',
          shapeClass[shape],
          gradeBg,
          !glyph && 'opacity-40',
          className,
        )}
        style={{ width: widthPx, height: heightPx }}
        aria-hidden={decorative || undefined}
        title={label}
      >
        {glyph || null}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width={widthPx}
      height={heightPx}
      loading="lazy"
      decoding="async"
      className={cn(
        'border-border/70 shrink-0 border object-cover',
        shapeClass[shape],
        gradeBg,
        className,
      )}
      style={{ width: widthPx, height: heightPx }}
      title={label}
      onError={() => {
        if (src) setFailedUrl(src)
      }}
    />
  )
}
