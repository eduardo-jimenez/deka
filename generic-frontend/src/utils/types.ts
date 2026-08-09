
export interface Filters {
  race_name: string
  athlete_name: string
  event_name: string
  category: string
  gender: string
  age_group: string
}

export interface AthleteResult {
  id: number
  athlete_name: string
  event_name: string
  category: string
  gender: string
  age_group: string
  total_time?: string
  run_1?: string
  run_2?: string
  run_3?: string
  run_4?: string
  run_5?: string
  run_6?: string
  run_7?: string
  run_8?: string
  run_9?: string
  run_10?: string
  zone_1?: string
  zone_2?: string
  zone_3?: string
  zone_4?: string
  zone_5?: string
  zone_6?: string
  zone_7?: string
  zone_8?: string
  zone_9?: string
  zone_10?: string

  finalTime?: number
  runTimes: Array<number | undefined>
  zoneTimes: Array<number | undefined>
}

export interface PaginatedResponse {
  count: number
  pages: number
  results: AthleteResult[]
}

export interface HybridRace {
  id: number
  name: string
  url: string
}

export interface HybridEvent {
  id: number
  name: string
  city: string
  start_date: string
  end_date: string
}

export interface RacesAvailableResponse {
  count: number
  results: HybridRace[]
}

export interface EventsAvailableResponse {
  count: number
  results: HybridEvent[]
}

export interface AnalysisParams {
  athlete_id: number
  race_name: string
  event_name: string
  gender: string
}

export interface AnalysisResults {
  athlete_id: number
  total_count: number
  total_time_perc: number
  total_run_time_perc: number
  total_zone_time_perc: number
  run_time_percs: number[]
  zone_time_percs: number[]
  total_time_buckets: number[]
  total_run_time_buckets: number[]
  total_zone_time_buckets: number[]
  run_time_buckets: number[][]
  zone_time_buckets: number[][]
  num_better_total_times: number
  num_better_total_run_times: number
  num_better_total_zone_times: number
  num_better_run_times: number[]
  num_better_zone_times: number[]
  race_progression: number[]
  zone_names: string[]
}