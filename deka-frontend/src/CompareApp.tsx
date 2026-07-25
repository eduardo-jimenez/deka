import { Fragment, useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchSearchResults } from './utils/dbUtils'
import { secondsToMinSecsStr } from './utils/timeUtils'
import type { Filters, AthleteResult, PaginatedResponse } from './utils/types'
import { getSavedFilters, saveFilters } from './utils/filtersStorage'
import { SearchPanel } from './controls/SearchPanel'
import { PaginationControls } from './controls/PaginationControls'
import { SearchResults } from './controls/SearchResults'
import { Header } from './Header'

const selectedAthletesStorageKey = 'deka-selected-athletes'


function CompareApp() {
  // `inputs` are the staged values the user edits.
  // `filters` are the applied values used for querying.
  const [inputs, setInputs] = useState<Filters>(getSavedFilters())
  const [filters, setFilters] = useState<Filters>(getSavedFilters())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [expandedResultId, setExpandedResultId] = useState<number | null>(null)
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
    const thisTime = athlete?.dekaMarkTime;
    const prevTime = compAthlete?.dekaMarkTime;
    return getTimeDifferenceFormatted(thisTime, prevTime);
  }

  const getSelectedAthletesRunInfo = (index: number) => {
    return selectedAthleteList.map((athlete, athleteIndex) => {
      const runTime = athlete[`run_${index + 1}` as keyof AthleteResult] as string | undefined;
      const compAthlete = (athleteIndex > 0) ? selectedAthleteList[0] : undefined;
      
      if (compAthlete === undefined)
      {
        return (
          <td key={athlete.id}>{runTime}</td>
        )
      }
      else
      {
        return (
          <td key={athlete.id}>{runTime} {getTimeDifferenceForRunFormatted(athlete, compAthlete, index)}</td>
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
          <td key={athlete.id}>{zoneTime}</td>
        )
      }
      else
      {
        return (
          <td key={athlete.id}>{zoneTime}  {getTimeDifferenceForZoneFormatted(athlete, compAthlete, index)}</td>
        )
      }
    })
  }

  const getSelectedAthleteFinalTime = () => {
    return selectedAthleteList.map((athlete, athleteIndex) => {
      const zoneTime = athlete.total_time;
      const compAthlete = (athleteIndex > 0) ? selectedAthleteList[0] : undefined;
      
      if (compAthlete === undefined)
      {
        return (
          <td key={athlete.id}>{zoneTime}</td>
        )
      }
      else
      {
        return (
          <td key={athlete.id}>{zoneTime}  {getFinalTimeDifferenceFormatted(athlete, compAthlete)}</td>
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
                  <th>Atleta</th>
                  {selectedAthleteList.map(athlete => (
                    <th key={athlete.id}>
                      {athlete.athlete_name}
                      <button 
                        className="close-button"
                        type="button"
                        onClick={() => removeAthleteFromSelection(athlete)}>
                        <img src="icons/close.png" height="24px" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Evento</td>
                  {selectedAthleteList.map(athlete => (
                    <td key={athlete.id}>{athlete.event_name}</td>
                  ))}
                </tr>
                <tr>
                  <td>DEKA Type</td>
                  {selectedAthleteList.map(athlete => (
                    <td key={athlete.id}>{athlete.deka_type}</td>
                  ))}
                </tr>
                <tr>
                  <td>Género</td>
                  {selectedAthleteList.map(athlete => (
                    <td key={athlete.id}>{athlete.gender}</td>
                  ))}
                </tr>
                <tr>
                  <td>Categoría</td>
                  {selectedAthleteList.map(athlete => (
                    <td key={athlete.id}>{athlete.category}</td>
                  ))}
                </tr>
                <tr>
                  <td>Grupo de Edad</td>
                  {selectedAthleteList.map(athlete => (
                    <td key={athlete.id}>{athlete.age_group}</td>
                  ))}
                </tr>
                <tr>
                  <td>DEKA Mark</td>
                  {getSelectedAthleteFinalTime()}
                </tr>
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

      <h2>
        Search for Athletes
      </h2>

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
        onToggleAthleteSelection={toggleAthleteSelection}
        allowShowingTimes={false}
        onShowTimesForAthlete={() => {}}
      />
    </div>
  )
}

export default CompareApp
