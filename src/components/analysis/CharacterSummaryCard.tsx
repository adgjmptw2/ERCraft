import { GradeBadge } from '@/components/analysis/GradeBadge'
import { gradeTopAccentClass } from '@/components/analysis/gradeAccent'
import type { CharacterAnalysisReport } from '@/analysis/types'
import { SurfaceCard } from '@/components/shared/SurfaceCard'
import { cn } from '@/lib/utils'

function fmtRate(value: number): string {
  return `${value.toFixed(1)}%`
}

export interface CharacterSummaryCardProps {
  report: CharacterAnalysisReport
}

export function CharacterSummaryCard({ report }: CharacterSummaryCardProps) {
  const insufficient = report.matchCount < 2
  const topAccent = !insufficient && report.overallGrade ? gradeTopAccentClass(report.overallGrade) : ''

  return (
    <SurfaceCard
      padding="md"
      variant={insufficient ? 'default' : 'elevated'}
      interactive
      className={cn(
        'h-full overflow-hidden text-sm',
        topAccent && 'border-t-2',
        topAccent,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="text-foreground min-w-0 flex-1 text-base font-semibold break-all">
          {report.characterName}
        </h4>
        {insufficient ? (
          <span className="inline-flex shrink-0 items-center rounded-md border border-border bg-muted/80 px-2 py-0.5 text-xs font-medium">
            표본 부족 · {report.matchCount}경기
          </span>
        ) : (
          <GradeBadge grade={report.overallGrade} />
        )}
      </div>

      {!insufficient ? (
        <p className="text-muted-foreground mt-1 text-sm">{report.matchCount}경기 · 룰 기반</p>
      ) : null}

      <div className="border-border/80 mt-4 grid grid-cols-2 gap-3 border-b pb-4">
        <div>
          <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">평균 순위</p>
          <p className="text-foreground mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {report.avgPlacement.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">KDA</p>
          <p className="text-foreground mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {report.kda.toFixed(2)}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">평균 킬</dt>
          <dd className="text-foreground mt-0.5 font-semibold">{report.avgKills.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">평균 어시스트</dt>
          <dd className="text-foreground mt-0.5 font-semibold">{report.avgAssists.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">상위 3위 비율</dt>
          <dd className="text-foreground mt-0.5 font-semibold">{fmtRate(report.top3Rate)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs tracking-wide uppercase">승리 비율</dt>
          <dd className="text-foreground mt-0.5 font-semibold">{fmtRate(report.winRate)}</dd>
        </div>
      </dl>

      <p className={cn('text-muted-foreground mt-3 text-sm leading-relaxed break-words')}>
        {report.feedback}
      </p>
    </SurfaceCard>
  )
}
