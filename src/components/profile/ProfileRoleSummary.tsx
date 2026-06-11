import type { RoleSummaryResult } from '@/analysis/roleClassifier'
import { cn } from '@/lib/utils'

export interface ProfileRoleSummaryProps {
  roleSummary: RoleSummaryResult
  className?: string
}

function roleLabel(value: string | null): string {
  if (!value) return '판단 보류'
  return value
}

export function ProfileRoleSummary({ roleSummary, className }: ProfileRoleSummaryProps) {
  const secondary =
    roleSummary.secondaryRole != null ? roleLabel(roleSummary.secondaryRole) : '보조 역할군 없음'

  return (
    <div className={cn('border-border/60 space-y-2 border-t pt-3', className)}>
      <div className="space-y-0.5">
        <h3 className="text-foreground text-xs font-semibold">역할군 요약</h3>
        <p className="text-muted-foreground text-[10px]">최근 데모 매치 기준 · 룰 기반 역할 요약</p>
      </div>

      {roleSummary.status === 'insufficient' ? (
        <p className="text-muted-foreground text-xs">역할군 표본 부족 ({roleSummary.sampleSize}경기)</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
            주 {roleLabel(String(roleSummary.primaryRole))}
          </span>
          <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium">
            보조 {secondary}
          </span>
        </div>
      )}
    </div>
  )
}
