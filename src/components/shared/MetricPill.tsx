import { cn } from '@/lib/utils'

export interface MetricPillProps {
  label: string
  value: string
  className?: string
}

export function MetricPill({ label, value, className }: MetricPillProps) {
  return (
    <div
      className={cn(
        'border-border/80 bg-background/70 inline-flex min-w-0 flex-col rounded-lg border px-3 py-2 shadow-sm',
        className,
      )}
    >
      <span className="text-muted-foreground text-[0.65rem] font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-foreground text-sm font-semibold">{value}</span>
    </div>
  )
}
