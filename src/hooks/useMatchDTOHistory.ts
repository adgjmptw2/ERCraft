import { useInfiniteQuery } from '@tanstack/react-query'

import { fetchMatchDTOHistory } from '@/api/player'

export function useMatchDTOHistory(userNum: number) {
  return useInfiniteQuery({
    queryKey: ['player', 'matches-dto', userNum],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchMatchDTOHistory(userNum, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage.data.hasNext) return undefined
      return lastPage.data.page + 1
    },
    enabled: userNum > 0,
  })
}
