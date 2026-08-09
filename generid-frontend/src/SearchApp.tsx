import { Fragment, useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchSearchResults } from './utils/dbUtils'
import { secondsToMinSecsStr } from './utils/timeUtils'
import type { Filters, AthleteResult, PaginatedResponse } from './utils/types'
import { getSavedFilters, saveFilters } from './utils/filtersStorage'
import { SearchPanel } from './components/SearchPanel'
import { PaginationControls } from './components/PaginationControls'
import { SearchResults } from './components/SearchResults'
import { Header } from './Header'
import { useAvailableRaces } from './utils/useAvailableRaces'


function SearchApp() {
  // `inputs` are the staged values the user edits.
  // `filters` are the applied values used for querying.
  const [inputs, setInputs] = useState<Filters>(getSavedFilters())
  const [filters, setFilters] = useState<Filters>(getSavedFilters())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [expandedResultId, setExpandedResultId] = useState<number | null>(null)
  const racesQuery = useAvailableRaces();

  const resultQuery = useQuery<PaginatedResponse, Error>({
    queryKey: ['results', filters, page, pageSize],
    queryFn: () =>
      fetchSearchResults({
        ...filters,
        page,
        page_size: pageSize,
      }),
    placeholderData: keepPreviousData,
  })
  const results = resultQuery.data?.results ?? []
  const totalPages = resultQuery.data?.pages ?? 0

  const onChangeInputs = (key: keyof Filters, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const onRaceChanged = (raceName: string) => {
    const nextInputs = { ...inputs, race_name: raceName }
    setInputs(nextInputs)
    applySearch(nextInputs)
  }

  const applySearch = (nextInputs: Filters = inputs) => {
    saveFilters(nextInputs)
    setFilters(nextInputs)
    setPage(1)
  }

  return (
    <div className="app-shell">
      <Header currentPage="search" />

      <SearchPanel
        inputs={inputs}
        onChange={onChangeInputs}
        races={racesQuery.data?.results ?? []}
        onSearch={applySearch}
        onRaceChanged={onRaceChanged}
      />

      <PaginationControls
        pageSize={pageSize}
        pageIndex={page}
        totalPages={resultQuery.data ? totalPages : 0}
        onChangePageSize={setPageSize}
        onChangePageIndex={setPage}
      />

      <SearchResults
        isLoading={resultQuery.isLoading}
        isError={resultQuery.isError}
        results={results}
        expandedResultId={expandedResultId}
        selectedAthletes={[]}
        showSelectAthlete={false}
        canSelectNewAthletes={false}
        onToggleAthleteSelection={(value) => {}}
        allowShowingTimes={true}
        onShowTimesForAthlete={setExpandedResultId}
      />
    </div>
  )
}

export default SearchApp
