import { useInfiniteQuery } from '@tanstack/react-query'

import { fetchMatchDTOHistory } from '@/api/player'

export function useMatchDTOHistory(nickname: string) {
  return useInfiniteQuery({
    queryKey: ['player', 'matches-dto', nickname],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchMatchDTOHistory(nickname, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage.data.hasNext) return undefined
      return lastPage.data.page + 1
    },
    enabled: nickname.length > 0,
  })
}
