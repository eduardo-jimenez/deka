import type { Filters } from './types'
import { getStoredValue, setStoredValue } from './storage'

export const filtersStorageKey = 'deka-search-filters'

export const emptyFilters: Filters = {
  athlete_name: '',
  event_name: '',
  deka_type: '',
  category: '',
  gender: '',
  age_group: '',
}

export function getSavedFilters(): Filters {
  return {
    ...emptyFilters,
    ...getStoredValue<Partial<Filters>>(filtersStorageKey, {}),
  }
}

export function saveFilters(filters: Filters) {
  setStoredValue(filtersStorageKey, filters)
}