import axios from 'axios'
import type { AnalysisParams, EventAvailableResponse, PaginatedResponse, AnalysisResults } from './types'
import { formatTimeFromResults, timeToSeconds } from './timeUtils'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')


export function fetchSearchResults(params: Record<string, string | number>) {
  return axios
    .get<PaginatedResponse>(`${apiBaseUrl}/api/athlete-results/`, { params })
    .then(res => ({
      ...res.data,
      results: res.data.results.map(result => ({
        ...result,
        // format the times
        total_time: formatTimeFromResults(result.total_time),
        run_1: formatTimeFromResults(result.run_1),
        run_2: formatTimeFromResults(result.run_2),
        run_3: formatTimeFromResults(result.run_3),
        run_4: formatTimeFromResults(result.run_4),
        run_5: formatTimeFromResults(result.run_5),
        run_6: formatTimeFromResults(result.run_6),
        run_7: formatTimeFromResults(result.run_7),
        run_8: formatTimeFromResults(result.run_8),
        run_9: formatTimeFromResults(result.run_9),
        run_10: formatTimeFromResults(result.run_10),
        zone_1: formatTimeFromResults(result.zone_1),
        zone_2: formatTimeFromResults(result.zone_2),
        zone_3: formatTimeFromResults(result.zone_3),
        zone_4: formatTimeFromResults(result.zone_4),
        zone_5: formatTimeFromResults(result.zone_5),
        zone_6: formatTimeFromResults(result.zone_6),
        zone_7: formatTimeFromResults(result.zone_7),
        zone_8: formatTimeFromResults(result.zone_8),
        zone_9: formatTimeFromResults(result.zone_9),
        zone_10: formatTimeFromResults(result.zone_10),

        // convert the numbers to seconds
        dekaMarkTime: timeToSeconds(result.total_time),
        runTimes: [
          timeToSeconds(result.run_1), timeToSeconds(result.run_2), timeToSeconds(result.run_3), timeToSeconds(result.run_4), timeToSeconds(result.run_5),
          timeToSeconds(result.run_6), timeToSeconds(result.run_7), timeToSeconds(result.run_8), timeToSeconds(result.run_9), timeToSeconds(result.run_10),
        ],
        zoneTimes: [
          timeToSeconds(result.zone_1), timeToSeconds(result.zone_2), timeToSeconds(result.zone_3), timeToSeconds(result.zone_4), timeToSeconds(result.zone_5),
          timeToSeconds(result.zone_6), timeToSeconds(result.zone_7), timeToSeconds(result.zone_8), timeToSeconds(result.zone_9), timeToSeconds(result.zone_10),
        ],
      }))
  }))
}

export function fetchAvailableEvents() {
  return axios
    .get<EventAvailableResponse>(`${apiBaseUrl}/api/events/`)
    .then(res => res.data)
}

export function fetchAnalyzeAthlete(params: AnalysisParams) {
  return axios
    .get<{ data: AnalysisResults }>(`${apiBaseUrl}/api/analyze-athlete/`, { params })
    .then(res => res.data.data)
}


