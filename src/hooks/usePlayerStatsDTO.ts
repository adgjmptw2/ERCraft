import { useQuery } from '@tanstack/react-query'

import { fetchPlayerStatsDTO } from '@/api/player'

export function usePlayerStatsDTO(nickname: string, tier?: string) {
  return useQuery({
    queryKey: ['player', 'stats-dto', nickname, tier ?? ''],
    queryFn: () => fetchPlayerStatsDTO(nickname, tier ? { tier } : undefined),
    // tier는 summary에서 오므로, summary 도착 전 불필요한 중복 호출을 막는다
    enabled: nickname.length > 0 && tier !== undefined,
  })
}
