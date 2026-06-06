interface WinLossChartProps {
  wins: number
  losses: number
  winRate: number
  totalGames: number
}

export function WinLossChart({ wins, losses, winRate, totalGames }: WinLossChartProps) {
  const total = wins + losses
  const winRatio = total > 0 ? wins / total : 0
  const radius = 52
  const stroke = 10
  const cx = 64
  const cy = 64
  const circumference = Math.PI * radius
  const winLength = circumference * winRatio
  const lossLength = circumference - winLength

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          viewBox="0 0 128 72"
          className="h-auto w-36"
          role="img"
          aria-label={`최근 ${totalGames}게임 승률 ${winRate}%`}
        >
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            className="stroke-muted/40"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {winLength > 0 ? (
            <path
              d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
              fill="none"
              className="stroke-green-500"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${winLength} ${circumference}`}
            />
          ) : null}
          {lossLength > 0 && winLength > 0 ? (
            <path
              d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
              fill="none"
              className="stroke-red-500/70"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${lossLength} ${circumference}`}
              strokeDashoffset={-winLength}
            />
          ) : null}
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-foreground text-2xl font-extrabold">{winRate}%</span>
          <span className="text-muted-foreground text-xs">승률</span>
        </div>
      </div>
      <p className="text-muted-foreground text-center text-sm">
        최근 <span className="text-foreground font-semibold">{totalGames}</span>게임 ·{' '}
        <span className="text-green-400">{wins}승</span>{' '}
        <span className="text-red-400/90">{losses}패</span>
      </p>
    </div>
  )
}
