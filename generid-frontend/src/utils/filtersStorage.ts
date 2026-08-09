import type { Filters } from './types'
import { getStoredValue, setStoredValue } from './storage'

export const filtersStorageKey = 'generic-search-filters'

export const emptyFilters: Filters = {
  athlete_name: '',
  event_name: '',
  race_name: '',
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