/** 장비 아이콘 배경 — 전설(노랑) · 영웅(보라) · 혈액/초월(빨강) */
export type EquipmentItemGrade = 'legend' | 'epic' | 'blood'

const DAKGG_GRADE_TO_UI: Readonly<Record<string, EquipmentItemGrade>> = {
  Legend: 'legend',
  Epic: 'epic',
  Mythic: 'blood',
}

/** dak.gg equipmentGrade 숫자 (API 관례) */
const DAKGG_EQUIPMENT_GRADE_NUM: Readonly<Record<number, EquipmentItemGrade>> = {
  5: 'legend',
  4: 'epic',
  6: 'blood',
}

export function equipmentGradeFromDakggLabel(
  grade: string | null | undefined,
): EquipmentItemGrade | undefined {
  if (!grade) return undefined
  return DAKGG_GRADE_TO_UI[grade]
}

export function equipmentGradeFromDakggNumber(
  grade: number | null | undefined,
): EquipmentItemGrade | undefined {
  if (grade === null || grade === undefined) return undefined
  return DAKGG_EQUIPMENT_GRADE_NUM[grade]
}

export function equipmentGradeBgClass(grade: EquipmentItemGrade | undefined): string | undefined {
  if (!grade) return undefined
  switch (grade) {
    case 'legend':
      return 'bg-yellow-400/30 border-yellow-500/70'
    case 'epic':
      return 'bg-purple-500/30 border-purple-500/70'
    case 'blood':
      return 'bg-red-500/30 border-red-500/70'
    default:
      return undefined
  }
}
