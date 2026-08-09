import { Fragment, useEffect, useState, useRef } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchSearchResults } from './utils/dbUtils'
import { secondsToMinSecsStr, calcAthleteTotalRunTime, calcAthleteTotalZonesTime } from './utils/timeUtils'
import type { Filters, AthleteResult, PaginatedResponse } from './utils/types'
import { getSavedFilters, saveFilters } from './utils/filtersStorage'
import { SearchPanel } from './components/SearchPanel'
import { PaginationControls } from './components/PaginationControls'
import { SearchResults } from './components/SearchResults'
import { Header } from './Header'

const selectedAthletesStorageKey = 'deka-selected-athletes'
const MaxNumSelectedAthletes = 4;


function CompareApp() {
  // `inputs` are the staged values the user edits.
  // `filters` are the applied values used for querying.
  const [inputs, setInputs] = useState<Filters>(getSavedFilters())
  const [filters, setFilters] = useState<Filters>(getSavedFilters())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [expandedResultId, setExpandedResultId] = useState<number | null>(null)
  const [isAdvancedSearchVisible, setIsAdvancedSearchVisible] = useState(true)
  const [selectedAthletes, setSelectedAthletes] = useState<AthleteResult[]>(() => {
    try {
      const storedAthletes = localStorage.getItem(selectedAthletesStorageKey)
      if (!storedAthletes)
        return []
      const parsedAthletes = storedAthletes ? JSON.parse(storedAthletes) : {}

      return Array.isArray(parsedAthletes) ? parsedAthletes : Object.values(parsedAthletes)
    } catch {
      return []
    }
  })
  const advancedSearchRef = useRef<HTMLElement>(null)

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
  const selectedAthleteList = Object.values(selectedAthletes)

  useEffect(() => {
    localStorage.setItem(selectedAthletesStorageKey, JSON.stringify(selectedAthletes))
  }, [selectedAthletes])

  const onChangeInputs = (key: keyof Filters, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const applySearch = () => {
    saveFilters(inputs)
    setFilters(inputs)
    setPage(1)
  }

  const isAthleteSelected = (athlete: AthleteResult) => {
    return selectedAthletes.some(a => a.id == athlete.id);
  }

  const toggleAthleteSelection = (athlete: AthleteResult) => {
    if (isAthleteSelected(athlete)) {
      removeAthleteFromSelection(athlete);
    } else {
      setSelectedAthletes(current => [...current, athlete]);
    }
  }

  const removeAthleteFromSelection = (athlete: AthleteResult) => {
    setSelectedAthletes(current => 
      current.filter(item => item.id != athlete.id)
    )
  }

  const scrollToAdvancedSearch = () => {
    advancedSearchRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  // Comparer

  const getTimeDifferenceFormatted = (thisTime?:number, prevTime?:number) => {
    const diffTime = (thisTime !== undefined && prevTime !== undefined) ? thisTime - prevTime : 0.0;

    return (diffTime >= 0.0) ? 
      (<span className="time-difference-positive">+{secondsToMinSecsStr(diffTime)}</span>) : 
      (<span className="time-difference-negative">-{secondsToMinSecsStr(Math.abs(diffTime))}</span>);
  }

  const getTimeDifferenceForRunFormatted = (athlete:AthleteResult, compAthlete:AthleteResult, index:number) => {
    const thisTime = athlete?.runTimes?.[index];
    const prevTime = compAthlete?.runTimes?.[index];
    return getTimeDifferenceFormatted(thisTime, prevTime);
  }

  const getTimeDifferenceForZoneFormatted = (athlete:AthleteResult, compAthlete:AthleteResult, index:number) => {
    const thisTime = athlete?.zoneTimes?.[index];
    const prevTime = compAthlete?.zoneTimes?.[index];
    return getTimeDifferenceFormatted(thisTime, prevTime);
  }

  const getFinalTimeDifferenceFormatted = (athlete:AthleteResult, compAthlete:AthleteResult) => {
    const thisTime = athlete?.finalTime;
    const prevTime = compAthlete?.finalTime;
    return getTimeDifferenceFormatted(thisTime, prevTime);
  }

  const getSelectedAthletesRunInfo = (index: number) => {
    return selectedAthleteList.map((athlete, athleteIndex) => {
      const runTime = athlete[`run_${index + 1}` as keyof AthleteResult] as string | undefined;
      const compAthlete = (athleteIndex > 0) ? selectedAthleteList[0] : undefined;
      
      if (compAthlete === undefined)
      {
        return (
          <td colSpan={2} key={athlete.id}>{runTime}</td>
        )
      }
      else
      {
        return (
          <Fragment>
            <td key={athlete.id}>{runTime}</td><td>{getTimeDifferenceForRunFormatted(athlete, compAthlete, index)}</td>
          </Fragment>
        )
      }
    })
  }

  const getSelectedAthletesZoneInfo = (index: number) => {
    return selectedAthleteList.map((athlete, athleteIndex) => {
      const zoneTime = athlete[`zone_${index + 1}` as keyof AthleteResult] as string | undefined;
      const compAthlete = (athleteIndex > 0) ? selectedAthleteList[0] : undefined;
      
      if (compAthlete === undefined)
      {
        return (
          <td colSpan={2} key={athlete.id}>{zoneTime}</td>
        )
      }
      else
      {
        return (
          <Fragment>
            <td key={athlete.id}>{zoneTime}</td><td>{getTimeDifferenceForZoneFormatted(athlete, compAthlete, index)}</td>
          </Fragment>
        )
      }
    })
  }

  const getSelectedAthletesFinalTime = () => {
    return selectedAthleteList.map((athlete, athleteIndex) => {
      const zoneTime = athlete.total_time;
      const compAthlete = (athleteIndex > 0) ? selectedAthleteList[0] : undefined;
      
      if (compAthlete === undefined)
      {
        return (
          <td colSpan={2} key={athlete.id}>{zoneTime}</td>
        )
      }
      else
      {
        return (
          <Fragment>
            <td key={athlete.id}>{zoneTime}</td><td>{getFinalTimeDifferenceFormatted(athlete, compAthlete)}</td>
          </Fragment>
        )
      }
    })
  }

  const getSelectedAthletesTotalRunTime = () => {
    return selectedAthleteList.map((athlete, athleteIndex) => {
      const compAthlete = (athleteIndex > 0) ? selectedAthleteList[0] : undefined;
      const totalRunTime = calcAthleteTotalRunTime(athlete);
      const totalRunTimeStr = secondsToMinSecsStr(totalRunTime);
      
      if (compAthlete === undefined)
      {
        return (
          <td colSpan={2} key={athlete.id}>{totalRunTimeStr}</td>
        )
      }
      else
      {
        const compTotalRunTime = calcAthleteTotalRunTime(compAthlete);
        const diffTimeFormatted = getTimeDifferenceFormatted(totalRunTime, compTotalRunTime);

        return (
          <Fragment>
            <td key={athlete.id}>{totalRunTimeStr}</td><td>{diffTimeFormatted}</td>
          </Fragment>
        )
      }
    })
  }

  const getSelectedAthletesTotalZonesTime = () => {
    return selectedAthleteList.map((athlete, athleteIndex) => {
      const compAthlete = (athleteIndex > 0) ? selectedAthleteList[0] : undefined;
      const totalZonesTime = calcAthleteTotalZonesTime(athlete);
      const totalZonesTimeStr = secondsToMinSecsStr(totalZonesTime);
      
      if (compAthlete === undefined)
      {
        return (
          <td colSpan={2} key={athlete.id}>{totalZonesTimeStr}</td>
        )
      }
      else
      {
        const comptotalZonesTime = calcAthleteTotalZonesTime(compAthlete);
        const diffTimeFormatted = getTimeDifferenceFormatted(totalZonesTime, comptotalZonesTime);

        return (
          <Fragment>
            <td key={athlete.id}>{totalZonesTimeStr}</td><td>{diffTimeFormatted}</td>
          </Fragment>
        )
      }
    })
  }


  const showSelectedAthletesComparison = () => {
    const returnStr = selectedAthleteList.length === 0 ? (
          <p>Select athletes with the star button to see their times here.</p>
        ) : (
          <div className="comparer-table">
            <h2>Selected athletes</h2>
            <table className="times-table">
              <thead>
                <tr>
                  <th></th>
                  {selectedAthleteList.map(athlete => (
                    <th key={athlete.id} colSpan={2}>
                      {athlete.athlete_name}
                      <button 
                        className="close-button"
                        type="button"
                        onClick={() => removeAthleteFromSelection(athlete)}>
                        <img src="icons/close.png" height="24px" />
                      </button>
                    </th>
                  ))}
                  {selectedAthletes.length < MaxNumSelectedAthletes ? (
                    <th>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdvancedSearchVisible(true)
                          requestAnimationFrame(scrollToAdvancedSearch)
                          }}>
                        Add Athlete
                      </button>
                    </th>
                  ) : (
                    <Fragment></Fragment>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Evento</td>
                  {selectedAthleteList.map(athlete => (
                    <td colSpan={2} key={athlete.id}>{athlete.event_name}</td>
                  ))}
                </tr>
                <tr>
                  <td>Comeptición</td>
                  {selectedAthleteList.map(athlete => (
                    <td colSpan={2} key={athlete.id}>{athlete.deka_type} - {athlete.gender}</td>
                  ))}
                </tr>
                <tr>
                  <td>Categoría</td>
                  {selectedAthleteList.map(athlete => {
                    return (athlete.age_group && athlete.age_group.length > 0) ? (
                      <td colSpan={2} key={athlete.id}>{athlete.category} ({athlete.age_group})</td>
                    ) : (
                      <td colSpan={2} key={athlete.id}>{athlete.category}</td>
                    )}
                  )}
                </tr>
              </tbody>
              <h4>Total Times</h4>
              <tbody>
                <tr>
                  <th></th>
                  {selectedAthleteList.map(athlete => (
                    <th key={athlete.id} colSpan={2}>
                      {athlete.athlete_name}
                    </th>
                  ))}
                </tr>
                <tr>
                  <td>Total Run Time</td>
                  {getSelectedAthletesTotalRunTime()}
                </tr>
                <tr>
                  <td>Total Zones Time</td>
                  {getSelectedAthletesTotalZonesTime()}
                </tr>
                <tr>
                  <td>Final Time</td>
                  {getSelectedAthletesFinalTime()}
                </tr>
              </tbody>
              <h4>Run and Zones Times</h4>
              <tbody>
                {Array.from({ length: 10 }, (_, index) => {
                  const position = index + 1

                  return (
                    <Fragment key={position}>
                      <tr>
                        <td>Run {position}</td>
                        {getSelectedAthletesRunInfo(index)}
                      </tr>
                      <tr>
                        <td>Zone {position}</td>
                        {getSelectedAthletesZoneInfo(index)}
                      </tr>
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )

      return returnStr
  }

  return (
    <div className="app-shell">
      <Header currentPage="compare" />

      <section className="selected-athletes">
        {showSelectedAthletesComparison()}
      </section>

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
              canSelectNewAthletes={selectedAthletes.length < MaxNumSelectedAthletes}
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

export default CompareApp
