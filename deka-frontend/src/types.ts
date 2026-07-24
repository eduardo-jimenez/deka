export interface Filters {
  athlete_name: string
  event_name: string
  deka_type: string
  category: string
  gender: string
  age_group: string
}

export interface AthleteResult {
  id: number
  athlete_name: string
  event_name: string
  deka_type: string
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
}

export interface PaginatedResponse {
  count: number
  pages: number
  results: AthleteResult[]
}
