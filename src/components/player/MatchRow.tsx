import { useState, type ReactNode } from 'react'

import { ChevronDown, ChevronUp } from 'lucide-react'



import { resolveVerifiedGearItemSlug } from '@/assets/itemAssetMap'
import { MatchGearSlotGrid, MatchLoadoutSlotGrid } from '@/components/player/MatchEquipmentStrip'

import { CharacterAvatar } from '@/components/shared'

import { cn } from '@/lib/utils'

import type { MatchSummaryDTO } from '@/types/match'

import {

  formatMatchNumber,

  formatRpDelta,

  matchGradeColor,

} from '@/utils/matchDemoStats'

import { isRankGameMode } from '@/utils/gameMode'

import type { CharacterFineGrade } from '@/utils/characterGrade'



export interface MatchRowProps {

  match: MatchSummaryDTO

  variant?: 'default' | 'record'

}



interface PlacementRowStyle {

  borderColor: string

  rankColor: string

}



function placementRowBgClass(placement: number): string {

  if (placement === 1) {

    return 'bg-[rgba(34,197,94,0.06)] dark:bg-[rgba(34,197,94,0.08)]'

  }



  if (placement >= 2 && placement <= 3) {

    return 'bg-[rgba(96,165,250,0.06)] dark:bg-[rgba(96,165,250,0.06)]'

  }



  return 'bg-card dark:bg-transparent'

}



function placementRowStyle(placement: number): PlacementRowStyle {

  if (placement === 1) {

    return {

      borderColor: '#22c55e',

      rankColor: '#22c55e',

    }

  }



  if (placement >= 2 && placement <= 3) {

    return {

      borderColor: '#60a5fa',

      rankColor: '#60a5fa',

    }

  }



  return {

    borderColor: 'var(--border)',

    rankColor: 'var(--muted-foreground)',

  }

}



function RowDot() {

  return <span className="text-muted-foreground shrink-0 px-0.5">·</span>

}



function ColDivider({ className }: { className?: string }) {

  return (

    <div className={cn('bg-border/70 mx-px w-px shrink-0 self-stretch', className)} />

  )

}



function StatColumn({

  label,

  children,

  className,

}: {

  label: string

  children: ReactNode

  className?: string

}) {

  return (

    <div className={cn('flex min-w-0 flex-col justify-center gap-px leading-none', className)}>

      <span className="text-label text-xs">{label}</span>

      {children}

    </div>

  )

}



function MatchRecordStats({

  match,

  grade,

  showsRp,

  rpPositive,

  rpDisplay,

  layout,

  className,

}: {

  match: MatchSummaryDTO

  grade: CharacterFineGrade

  showsRp: boolean

  rpPositive: boolean

  rpDisplay: string

  layout: 'desktop' | 'mobile-inline'

  className?: string

}) {

  if (layout === 'mobile-inline') {

    return (

      <div

        className={cn(

          'border-border/60 text-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 border-t pt-1 text-xs leading-snug',

          className,

        )}

      >

        <span className="tabular-nums">

          <span className="text-muted-foreground">딜량: </span>

          <span className="font-bold">{formatMatchNumber(match.playerDamage)}</span>

        </span>

        <span className="tabular-nums">

          <span className="text-muted-foreground">RP: </span>

          <span

            className={cn(

              'font-bold',

              !showsRp && 'text-muted-foreground',

              showsRp && rpPositive && 'text-green-500',

              showsRp && !rpPositive && 'text-muted-foreground',

            )}

          >

            {rpDisplay}

          </span>

        </span>

        <span className="min-w-0 truncate">

          <span className="text-muted-foreground">팀운: </span>

          <span className="font-medium">

            {match.teamLuckIcon} {match.teamLuckLabel}

          </span>

        </span>

      </div>

    )

  }



  return (

    <div className={cn('flex min-w-0 flex-1 items-center justify-between gap-2', className)}>

      <StatColumn label="딜량" className="shrink-0">

        <span className="text-stat-value text-[13px] font-bold tabular-nums">

          {formatMatchNumber(match.playerDamage)}

        </span>

      </StatColumn>



      <StatColumn label="RP" className="shrink-0">

        <span

          className={cn(

            'text-[13px] font-bold tabular-nums',

            !showsRp && 'text-muted-foreground',

            showsRp && rpPositive && 'text-green-500',

            showsRp && !rpPositive && 'text-muted-foreground',

          )}

        >

          {rpDisplay}

        </span>

      </StatColumn>



      <StatColumn label="등급" className="shrink-0">

        <span

          className="inline-flex w-fit rounded px-1 py-0.5 text-[13px] font-bold tabular-nums"

          style={{

            color: matchGradeColor(grade),

            backgroundColor: `${matchGradeColor(grade)}18`,

          }}

        >

          {match.matchGrade}

        </span>

      </StatColumn>



      <StatColumn label="팀운" className="min-w-0 max-w-[5.5rem]">

        <span className="text-stat-value truncate text-[12px] font-medium leading-none">

          {match.teamLuckIcon} {match.teamLuckLabel}

        </span>

      </StatColumn>

    </div>

  )

}



function MatchRecordRow({ match }: { match: MatchSummaryDTO }) {

  const [detailOpen, setDetailOpen] = useState(false)

  const style = placementRowStyle(match.placement)

  const grade = match.matchGrade as CharacterFineGrade

  const rpPositive = match.rpDeltaValue > 0

  const showsRp = isRankGameMode(match.gameMode)

  const rpDisplay = showsRp ? formatRpDelta(match.rpDeltaValue) : '-'



  return (

    <article

      className={cn(

        'border-border/60 relative min-h-0 overflow-hidden rounded-lg border border-l-[3px] md:min-h-[90px]',

        placementRowBgClass(match.placement),

      )}

      style={{

        borderLeftColor: style.borderColor,

      }}

    >

      <div className="px-1 py-1.5 pr-7 md:px-2 md:py-3 md:pr-6">

        <div className="flex min-w-0 items-center justify-between gap-1.5 pb-0.5 md:pb-1">

          <div className="text-muted-foreground flex min-w-0 flex-wrap items-center text-xs leading-none sm:text-[10px]">

            <span className="font-bold tabular-nums" style={{ color: style.rankColor }}>

              #{match.placement}

            </span>

            <RowDot />

            <span>{match.gameModeLabel}</span>

            <RowDot />

            <span className="tabular-nums">{match.gameDurationLabel}</span>

            <RowDot />

            <span className="leading-none">{match.relativeTime}</span>

          </div>

          <span className="text-muted-foreground shrink-0 text-xs leading-none tabular-nums md:text-[10px]">

            루트 #{match.routeNumber}

          </span>

        </div>



        <div className="min-w-0">

          <div className="space-y-1 md:hidden">

            <div className="grid grid-cols-[3.5rem_1fr] items-center gap-x-1.5">

              <div className="flex w-[3.5rem] flex-col items-center gap-px">

                <div className="relative shrink-0">

                <CharacterAvatar

                  characterNum={match.characterNum}

                  characterName={match.characterName}

                  size="lg"

                  className="border-border border bg-transparent"

                />

                <span className="bg-muted text-muted-foreground absolute -right-0.5 -bottom-0.5 rounded px-0.5 text-[10px] font-medium leading-none tabular-nums">

                  Lv.{match.characterLevel}

                </span>

              </div>

              <p className="text-muted-foreground w-full truncate text-center text-[10px] leading-none">

                {match.characterName}

              </p>

              </div>

              <div className="flex min-w-0 items-center gap-1.5">
                <div className="shrink-0 leading-none">
                  <p className="text-muted-foreground text-xs">TK · K · A</p>
                  <p className="text-stat-value text-base font-bold tabular-nums">
                    {match.teamKill} / {match.kills} / {match.assists}
                  </p>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-1">
                  <div className="space-y-0.5" aria-label="장비">
                    {(
                      [
                        [
                          {
                            slug: match.equipmentPreview?.gear?.weapon,
                            label: '무기',
                          },
                          {
                            slug: match.equipmentPreview?.gear?.chest,
                            label: '상의',
                          },
                          {
                            slug: match.equipmentPreview?.gear?.head,
                            label: '모자',
                          },
                        ],
                        [
                          {
                            slug: match.equipmentPreview?.gear?.arm,
                            label: '팔',
                          },
                          {
                            slug: match.equipmentPreview?.gear?.leg,
                            label: '신발',
                          },
                        ],
                      ] as const
                    ).map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-end gap-0.5">
                        {row.map((slot) => {
                          const verified = resolveVerifiedGearItemSlug(slot.slug)
                          const iconUrl = verified ? `/assets/items/${verified}.webp` : null
                          return (
                            <div
                              key={slot.label}
                              className="border-border/70 bg-muted/30 text-muted-foreground flex h-7 w-8 shrink-0 items-center justify-center rounded-[3px] border text-[8px] font-medium"
                              title={slot.label}
                            >
                              {iconUrl ? (
                                <img
                                  src={iconUrl}
                                  alt=""
                                  width={32}
                                  height={28}
                                  className="h-full w-full rounded-[3px] object-contain px-px py-px"
                                  loading="lazy"
                                />
                              ) : (
                                '·'
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  <span
                    className="inline-flex shrink-0 rounded px-1 py-px text-xs font-bold tabular-nums"
                    style={{
                      color: matchGradeColor(grade),
                      backgroundColor: `${matchGradeColor(grade)}18`,
                    }}
                  >
                    {match.matchGrade}
                  </span>
                </div>
              </div>

            </div>



            <MatchRecordStats

              layout="mobile-inline"

              match={match}

              grade={grade}

              showsRp={showsRp}

              rpPositive={rpPositive}

              rpDisplay={rpDisplay}

            />

          </div>



          <div className="hidden w-full min-w-0 items-center gap-2 md:flex">

            <div className="flex shrink-0 items-center">

              <div className="flex w-[124px] shrink-0 items-start gap-1.5">

                <div className="w-[54px] shrink-0">

                  <div className="relative">

                    <CharacterAvatar

                      characterNum={match.characterNum}

                      characterName={match.characterName}

                      size="lg"

                      className="border-border border bg-transparent"

                    />

                    <span className="bg-muted text-muted-foreground absolute -right-0.5 -bottom-0.5 rounded px-0.5 text-[13px] font-medium leading-none tabular-nums">

                      Lv.{match.characterLevel}

                    </span>

                  </div>

                  <p className="text-muted-foreground mt-0.5 text-center text-[10px] leading-none">

                    {match.characterName}

                  </p>

                </div>

                <MatchLoadoutSlotGrid preview={match.equipmentPreview} />

              </div>



              <ColDivider />



              <div className="flex w-[204px] shrink-0 items-center gap-1.5">

                <div className="w-[78px] shrink-0 pl-3 leading-none">
                  <div className="grid grid-cols-3 text-center">
                    <div className="min-w-0">
                      <p className="text-stat-value text-[15px] font-bold tabular-nums leading-none">
                        {match.teamKill}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[10px] leading-none">TK</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-stat-value text-[15px] font-bold tabular-nums leading-none">
                        {match.kills}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[10px] leading-none">K</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-stat-value text-[15px] font-bold tabular-nums leading-none">
                        {match.assists}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[10px] leading-none">A</p>
                    </div>
                  </div>
                </div>

                <MatchGearSlotGrid preview={match.equipmentPreview} />

              </div>

            </div>



            <ColDivider className="shrink-0" />



            <MatchRecordStats

              layout="desktop"

              match={match}

              grade={grade}

              showsRp={showsRp}

              rpPositive={rpPositive}

              rpDisplay={rpDisplay}

            />

          </div>

        </div>

      </div>



      <button

        type="button"

        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 flex size-5 shrink-0 -translate-y-1/2 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

        aria-expanded={detailOpen}

        aria-label={detailOpen ? '매치 상세 접기' : '매치 상세 펼치기'}

        onClick={() => setDetailOpen((v) => !v)}

      >

        {detailOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}

      </button>



      {detailOpen ? (

        <div className="border-border/60 bg-muted/40 flex h-16 items-center justify-center border-t dark:bg-black/5">

          <p className="text-muted-foreground text-xs">매치 상세 데이터 (준비 중)</p>

        </div>

      ) : null}

    </article>

  )

}



export function MatchRow({ match, variant = 'default' }: MatchRowProps) {

  if (variant === 'record') {

    return (

      <li className="min-w-0">

        <MatchRecordRow match={match} />

      </li>

    )

  }



  const style = placementRowStyle(match.placement)



  return (

    <li className="min-w-0">

      <article

        className={cn(

          'border-border/60 overflow-hidden rounded-lg border border-l-[3px] p-3',

          placementRowBgClass(match.placement),

        )}

        style={{

          borderLeftColor: style.borderColor,

        }}

      >

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-1 text-xs">

          <span className="font-bold tabular-nums" style={{ color: style.rankColor }}>

            #{match.placement}

          </span>

          <RowDot />

          <span className="tabular-nums">{match.gameDurationLabel}</span>

          <RowDot />

          <span>{match.relativeTime}</span>

        </div>

      </article>

    </li>

  )

}


