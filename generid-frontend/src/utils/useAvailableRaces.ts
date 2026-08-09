import { useQuery } from '@tanstack/react-query'
import { fetchAvailableRaces } from './dbUtils'
import type { RacesAvailableResponse } from './types'

export function useAvailableRaces() {
  return useQuery<RacesAvailableResponse, Error>({
    queryKey: ['available-races'],
    queryFn: fetchAvailableRaces,
    staleTime: 1000 * 60 * 5, // optional, cache for 5 minutes
  })
}
