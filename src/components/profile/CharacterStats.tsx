import { useMemo, useState } from 'react'

import type { CharacterAnalysisReport } from '@/analysis/types'
import {
  fineGradeColor,
  getDemoCharacterAvgDamage,
  getDemoCharacterFineGrade,
  type CharacterFineGrade,
} from '@/utils/characterGrade'
import { cn } from '@/lib/utils'

const VISIBLE_DEFAULT = 5

type CharacterStatsTabId = 'all'

const TABS: { id: CharacterStatsTabId; label: string }[] = [{ id: 'all', label: '전체' }]

const COLUMN_HEADER_CLASS =
  'text-muted-foreground px-1 text-[9px] font-semibold uppercase tracking-wide'

function CharacterAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className="bg-primary/10 text-primary border-primary/20 flex size-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold"
      aria-hidden
    >
      {initial}
    </div>
  )
}

function winRateClass(rate: number): string {
  if (rate >= 60) return 'text-amber-400'
  if (rate >= 50) return 'text-sky-400'
  return 'text-red-400/75'
}

function FineGradeBadge({ grade }: { grade: CharacterFineGrade }) {
  return (
    <span
      className="inline-flex min-w-8 shrink-0 items-center justify-center whitespace-nowrap rounded px-0.5 py-0.5 text-xs font-bold tabular-nums"
      style={{ color: fineGradeColor(grade), backgroundColor: `${fineGradeColor(grade)}18` }}
    >
      {grade}
    </span>
  )
}

function formatDamage(value: number): string {
  return value.toLocaleString('ko-KR')
}

export interface CharacterStatsProps {
  characterReports: CharacterAnalysisReport[]
  userNum: number
  seasonNumber: number
  className?: string
}

export function CharacterStats({
  characterReports,
  userNum,
  seasonNumber,
  className,
}: CharacterStatsProps) {
  const [expanded, setExpanded] = useState(false)
  const activeTab: CharacterStatsTabId = 'all'

  const sorted = useMemo(
    () => [...characterReports].sort((a, b) => b.matchCount - a.matchCount),
    [characterReports],
  )

  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_DEFAULT)
  const canExpand = sorted.length > VISIBLE_DEFAULT

  return (
    <div className={cn('space-y-3', className)}>
      <nav className="border-border/60 border-b" aria-label="캐릭터 통계 모드">
        <div className="flex gap-4">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                className={cn(
                  'text-muted-foreground hover:text-foreground -mb-px border-b-2 pb-2 text-xs font-semibold transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                  isActive ? 'border-primary text-foreground' : 'border-transparent',
                )}
                aria-selected={isActive}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground py-2 text-sm">캐릭터 데이터 없음</p>
      ) : (
        <>
          <div className="w-full overflow-x-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '28%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/25 border-border/60 border-y">
                  <th className="py-1.5 text-left" scope="col" aria-label="캐릭터" />
                  <th className={cn(COLUMN_HEADER_CLASS, 'text-right')} scope="col">
                    승률
                  </th>
                  <th className={cn(COLUMN_HEADER_CLASS, 'text-right')} scope="col">
                    KDA
                  </th>
                  <th className={cn(COLUMN_HEADER_CLASS, 'text-right')} scope="col">
                    TK/K
                  </th>
                  <th className={cn(COLUMN_HEADER_CLASS, 'text-right')} scope="col">
                    평균딜량
                  </th>
                  <th className={cn(COLUMN_HEADER_CLASS, 'text-center')} scope="col">
                    등급
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {visible.map((char) => {
                  const totalKills = Math.round(char.avgKills * char.matchCount * 10) / 10
                  const grade = getDemoCharacterFineGrade(userNum, seasonNumber, char.characterName)
                  const avgDamage = getDemoCharacterAvgDamage(
                    userNum,
                    seasonNumber,
                    char.characterName,
                  )

                  return (
                    <tr key={char.characterName} className="hover:bg-muted/35 transition-colors">
                      <td className="py-2 pr-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <CharacterAvatar name={char.characterName} />
                          <div className="min-w-0">
                            <p className="text-foreground truncate text-xs font-semibold">
                              {char.characterName}
                            </p>
                            <p className="text-muted-foreground tabular-nums text-[10px]">
                              {char.matchCount}게임
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-right">
                        <p
                          className={cn(
                            'tabular-nums text-xs font-bold',
                            winRateClass(char.winRate),
                          )}
                        >
                          {char.winRate.toFixed(0)}%
                        </p>
                      </td>
                      <td className="px-1 py-2 text-right">
                        <p className="text-foreground tabular-nums text-xs font-semibold">
                          {char.kda.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-1 py-2 text-right">
                        <p className="tabular-nums text-[11px] leading-tight">
                          <span className="text-sky-400 text-[9px] font-semibold">TK</span>{' '}
                          <span className="text-foreground font-semibold">
                            {totalKills.toFixed(1)}
                          </span>
                        </p>
                        <p className="tabular-nums text-[11px] leading-tight">
                          <span className="text-muted-foreground text-[9px] font-semibold">K</span>{' '}
                          <span className="text-muted-foreground font-medium">
                            {char.avgKills.toFixed(1)}
                          </span>
                        </p>
                      </td>
                      <td className="px-0.5 py-2 text-right">
                        <p className="text-foreground tabular-nums text-[11px] font-semibold leading-none">
                          {formatDamage(avgDamage)}
                        </p>
                      </td>
                      <td className="overflow-visible px-0 py-2 text-center">
                        <FineGradeBadge grade={grade} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {canExpand ? (
            <button
              type="button"
              className="text-primary hover:text-primary/80 text-xs font-medium underline-offset-4 hover:underline"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? '접기' : `더 보기 (${sorted.length - VISIBLE_DEFAULT}개)`}
            </button>
          ) : null}
        </>
      )}
    </div>
  )
}
