import { useEffect, useState, useRef } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchAvailableEvents, fetchSearchResults, fetchAnalyzeAthlete } from './utils/dbUtils'
import { secondsToMinSecsStr } from './utils/timeUtils'
import type { Filters, AthleteResult, EventAvailableResponse, PaginatedResponse, AnalysisParams } from './utils/types'
import { getSavedFilters, saveFilters } from './utils/filtersStorage'
import { SearchPanel } from './controls/SearchPanel'
import { PaginationControls } from './controls/PaginationControls'
import { SearchResults } from './controls/SearchResults'
import { Header } from './Header'

const analyzedAthleteStorageKey = 'deka-analyzed-athlete'

export const emptyAnalyzeParams: AnalysisParams = {
  athlete_id: -1,
  event_name: '',
  gender: '',
}


function AnalyzeApp() {
  // `inputs` are the staged values the user edits.
  // `filters` are the applied values used for querying.
  const [inputs, setInputs] = useState<Filters>(getSavedFilters())
  const [filters, setFilters] = useState<Filters>(getSavedFilters())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [expandedResultId, setExpandedResultId] = useState<number | null>(null)
  const [analyzeAthlete, setAnalyzeAthlete] = useState<AthleteResult | null>(() => {
    try {
      const storedAthlete = localStorage.getItem(analyzedAthleteStorageKey)
      return storedAthlete ? JSON.parse(storedAthlete) : null
    } catch {
      return null
    }
  })
  const [analysisEvent, setAnalysisEvent] = useState(() => analyzeAthlete?.event_name ?? '')
  const [analysisGender, setAnalysisGender] = useState(() => analyzeAthlete?.gender ?? '')
  const [selectedAthletes, setSelectedAthletes] = useState<AthleteResult[]>([])
  const [isAdvancedSearchVisible, setIsAdvancedSearchVisible] = useState(true)
  const [analysisFilters, setAnalysisFilters] = useState<AnalysisParams>(() => emptyAnalyzeParams)

  const advancedSearchRef = useRef<HTMLElement>(null)
  const analyzeAthleteRef = useRef<HTMLElement>(null)

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

  const eventsQuery = useQuery<EventAvailableResponse, Error>({
    queryKey: ['available-events'],
    queryFn: fetchAvailableEvents,
  })

  useEffect(() => {
    localStorage.setItem(analyzedAthleteStorageKey, JSON.stringify(analyzeAthlete))
  }, [analyzeAthlete])

  const onChangeInputs = (key: keyof Filters, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const applySearch = () => {
    saveFilters(inputs)
    setFilters(inputs)
    setPage(1)
  }

  const scrollToAnalyzeAthlete = () => {
    analyzeAthleteRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const toggleAthleteSelection = (athlete: AthleteResult) => {
    setAnalyzeAthlete(athlete)
    setSelectedAthletes(() => [athlete])
    setAnalysisEvent(athlete.event_name)
    setAnalysisGender(athlete.gender)
    //setIsAdvancedSearchVisible(false)
    requestAnimationFrame(scrollToAnalyzeAthlete)
  }

  const analyzeAthleteRace = () => {
    if (!analyzeAthlete)
      return

    const params: AnalysisParams = {
      athlete_id: analyzeAthlete.id,
      event_name: analysisEvent,
      gender: analysisGender,
    }

    setAnalysisFilters(params)

    fetchAnalyzeAthlete(params)
  }

  return (
    <div className="app-shell app-shell--wide">
      <Header currentPage="analyze" />

      {analyzeAthlete !== null && (
        <section className="athelete-to-analyze-info" ref={analyzeAthleteRef}>
          <div className="athlete-summary">
            <div className="athlete-summary-athlete">
              <span className="athlete-summary-label">Athlete</span>
              <strong>{analyzeAthlete.athlete_name}</strong>
            </div>
            <div className="athlete-summary-event">
              <span className="athlete-summary-label">Event</span>
              <strong>{analyzeAthlete.event_name}</strong>
            </div>
            <div className="athlete-summary-deka-type">
              <span className="athlete-summary-label">DEKA type</span>
              <strong>{analyzeAthlete.deka_type}</strong>
            </div>
            <div className="athlete-summary-gender">
              <span className="athlete-summary-label">Gender</span>
              <strong>{analyzeAthlete.gender}</strong>
            </div>
            <div className="athlete-summary-time">
              <span className="athlete-summary-label">Time</span>
              <strong>{analyzeAthlete.total_time ?? '—'}</strong>
            </div>
            <div>
              <button
                className="athlete-summary-close-button"
                type="button"
                aria-label="Clear selected athlete"
                onClick={() => {
                  setAnalyzeAthlete(null)
                  setSelectedAthletes([])
                  setAnalysisEvent('')
                  setAnalysisGender('')
                  setAnalysisFilters(emptyAnalyzeParams)
                }}
              >
                <img src="/icons/close.png" alt="Clear" height="24px" />
              </button>
            </div>
          </div>

          <div className="analysis-controls">
            <label>
              Event
              <select value={analysisEvent} onChange={event => setAnalysisEvent(event.target.value)}>
                <option value="">Any event</option>
                {eventsQuery.data?.results.map(event => (
                  <option key={event.id} value={event.name}>{event.name}</option>
                ))}
              </select>
            </label>
            <label>
              Gender
              <select value={analysisGender} onChange={event => setAnalysisGender(event.target.value)}>
                <option value="">Any gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Mixed">Mixed</option>
              </select>
            </label>
            <button type="button" onClick={analyzeAthleteRace}>Analyze Athlete Race</button>
          </div>
        </section>
      )}

      <section className="advanced-search" ref={advancedSearchRef}>
        <div className="advanced-search-heading">
          <h2>Search for Athletes</h2>
          <button
            className="advanced-search-toggle"
            type="button"
            aria-expanded={isAdvancedSearchVisible}
            aria-controls="advanced-search-content"
            onClick={() => setIsAdvancedSearchVisible(visible => !visible)}
          >
            {isAdvancedSearchVisible ? 'Hide search' : 'Show search'}
          </button>
        </div>

        {isAdvancedSearchVisible && (
          <div id="advanced-search-content">
            <SearchPanel
              inputs={inputs}
              onChange={onChangeInputs}
              onSearch={applySearch}
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
              selectedAthletes={selectedAthletes}
              showSelectAthlete={true}
              canSelectNewAthletes={true}
              onToggleAthleteSelection={toggleAthleteSelection}
              allowShowingTimes={false}
              onShowTimesForAthlete={() => {}}
            />
          </div>
        )}
      </section>
    </div>
  )
}

export default AnalyzeApp
