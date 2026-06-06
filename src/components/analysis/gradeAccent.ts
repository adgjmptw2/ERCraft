import type { AnalysisGrade } from '@/analysis/types'

/** 카드 accent border — S=purple, A=green, B=blue, C=yellow */
export const GRADE_LEFT_ACCENT: Record<AnalysisGrade, string> = {
  S: 'border-l-purple-500',
  A: 'border-l-green-500',
  B: 'border-l-blue-500',
  C: 'border-l-yellow-500',
  D: 'border-l-muted-foreground/40',
}

export const GRADE_TOP_ACCENT: Record<AnalysisGrade, string> = {
  S: 'border-t-purple-500',
  A: 'border-t-green-500',
  B: 'border-t-blue-500',
  C: 'border-t-yellow-500',
  D: 'border-t-muted-foreground/40',
}

export function gradeLeftAccentClass(grade: AnalysisGrade | null): string {
  if (!grade) return 'border-l-muted-foreground/30'
  return GRADE_LEFT_ACCENT[grade]
}

export function gradeTopAccentClass(grade: AnalysisGrade | null): string {
  if (!grade) return ''
  return GRADE_TOP_ACCENT[grade]
}
