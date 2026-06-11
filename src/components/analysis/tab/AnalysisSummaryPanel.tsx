import type { AnalysisCharacterRow } from '@/analysis/analysisTabViewModel'
import { CharacterAvatar, SurfaceCard } from '@/components/shared'
import { cn } from '@/lib/utils'

export interface AnalysisSummaryPanelProps {
  characters: AnalysisCharacterRow[]
  selectedCharacterKey: string | null
  onCharacterSelect: (characterKey: string | null) => void
  className?: string
}

export function AnalysisSummaryPanel({
  characters,
  selectedCharacterKey,
  onCharacterSelect,
  className,
}: AnalysisSummaryPanelProps) {
  return (
    <section className={cn('min-w-0', className)} aria-labelledby="analysis-characters-heading">
      <SurfaceCard
        variant="elevated"
        padding="md"
        className="flex h-full min-w-0 flex-col gap-3"
      >
        <div className="space-y-0.5">
          <h3 id="analysis-characters-heading" className="text-foreground text-sm font-semibold">
            대표 캐릭터 · 최근 픽
          </h3>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            캐릭터를 선택하면 왼쪽 6축·통계가 해당 캐릭터 기준으로 바뀝니다
          </p>
        </div>

        <ul className="flex min-h-0 flex-1 flex-col gap-2">
          <li>
            <button
              type="button"
              onClick={() => onCharacterSelect(null)}
              aria-pressed={selectedCharacterKey == null}
              className={cn(
                'border-border/60 hover:border-border w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                selectedCharacterKey == null && 'border-primary/40 bg-primary/10 ring-primary/20 ring-1',
              )}
            >
              <span className="text-foreground font-medium">전체 캐릭터</span>
              <span className="text-muted-foreground mt-0.5 block text-[11px]">
                최근 경기 전체 기준 분석
              </span>
            </button>
          </li>

          {characters.length === 0 ? (
            <li className="text-muted-foreground border-border/50 rounded-lg border border-dashed px-3 py-6 text-center text-sm">
              캐릭터별 표본이 부족합니다
            </li>
          ) : (
            characters.map((row) => {
              const isSelected = selectedCharacterKey === row.id

              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => onCharacterSelect(isSelected ? null : row.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      'border-border/60 hover:border-border w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                      row.featured && !isSelected && selectedCharacterKey == null && 'border-primary/30 bg-primary/5',
                      isSelected && 'border-primary/40 bg-primary/10 ring-primary/20 ring-1',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <CharacterAvatar
                        characterNum={row.characterNum}
                        characterName={row.name}
                        size={row.featured ? 'lg' : 'md'}
                        decorative={false}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                          <p className="text-foreground truncate text-sm font-semibold">{row.name}</p>
                          {row.featured && selectedCharacterKey == null ? (
                            <span className="text-primary shrink-0 text-[10px] font-medium">
                              대표 픽
                            </span>
                          ) : null}
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-[11px] tabular-nums">
                          {row.games}경기 · 승률 {row.winRate} · 평균 #{row.avgPlacement}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </SurfaceCard>
    </section>
  )
}
