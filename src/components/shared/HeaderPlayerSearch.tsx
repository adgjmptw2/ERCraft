import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Input } from '@/components/ui/input'
import { fetchPlayerByNickname } from '@/api/player'
import { cn } from '@/lib/utils'

export function HeaderPlayerSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setError(null)
    setIsSearching(true)
    try {
      const result = await fetchPlayerByNickname(trimmed)
      if (result.data) {
        navigate(`/player/${encodeURIComponent(result.data.nickname)}`)
        return
      }
      setError('존재하지 않는 닉네임입니다.')
    } catch {
      setError('검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="relative w-full min-w-0 sm:w-44 md:w-52">
      <form onSubmit={handleSubmit} className="w-full" role="search" aria-label="플레이어 검색">
        <Input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            if (error) setError(null)
          }}
          placeholder="닉네임 검색"
          autoComplete="off"
          disabled={isSearching}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'header-search-error' : undefined}
          className={cn(
            'bg-background/80 h-9 text-sm',
            error && 'border-destructive/60 focus-visible:ring-destructive/40',
          )}
        />
      </form>
      {error ? (
        <p
          id="header-search-error"
          role="alert"
          className="border-destructive/30 bg-background text-destructive absolute top-full right-0 z-50 mt-1 max-w-[min(16rem,80vw)] rounded-md border px-2 py-1 text-xs shadow-sm"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
