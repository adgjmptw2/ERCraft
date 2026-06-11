import { Link, NavLink, Outlet } from 'react-router-dom'

import { HeaderPlayerSearch } from '@/components/shared/HeaderPlayerSearch'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { UI_BUILD_ID } from '@/lib/uiBuild'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex min-h-9 items-center rounded-lg px-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-3',
    isActive
      ? 'bg-muted text-foreground'
      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
  )

export function AppShell() {
  return (
    <div className="app-shell-bg flex min-h-svh flex-col">
      <header className="border-border/70 bg-background/85 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="shell-container flex items-center justify-between gap-3 py-3">
          <Link
            to="/"
            className="min-w-0 space-y-0.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <p className="text-foreground text-sm font-semibold tracking-tight">ERCraft</p>
            <p className="text-muted-foreground hidden text-xs sm:block">이터널리턴 플레이 리포트</p>
          </Link>
          <nav
            className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2"
            aria-label="주요 메뉴"
          >
            <HeaderPlayerSearch />
            <NavLink to="/ranking" className={navLinkClass}>
              랭킹
            </NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="shell-container flex min-w-0 flex-1 flex-col overflow-x-hidden py-9 sm:py-12 lg:py-14">
        <Outlet />
      </main>
      {import.meta.env.DEV ? (
        <p className="text-muted-foreground/50 pointer-events-none fixed bottom-1 right-2 z-50 text-[9px] tabular-nums select-none">
          {UI_BUILD_ID}
        </p>
      ) : null}
    </div>
  )
}
