import { useQuery } from '@tanstack/react-query'

import { fetchPlayerStatsDTO } from '@/api/player'

export function usePlayerStatsDTO(userNum: number) {
  return useQuery({
    queryKey: ['player', 'stats-dto', userNum],
    queryFn: () => fetchPlayerStatsDTO(userNum),
    enabled: userNum > 0,
  })
}
