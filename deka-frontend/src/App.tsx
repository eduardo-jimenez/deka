import { Fragment, useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { Filters, AthleteResult, PaginatedResponse } from './types'

const pageSizes = [25, 50, 100]
const selectedAthletesStorageKey = 'deka-selected-athletes'
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const ZoneNames = [
  "Zona 1 - RAM Lunges",
  "Zona 2 - Row",
  "Zona 3 - Box Step Over",
  "Zona 4 - Medball Sit-Ups",
  "Zona 5 - SkiErg",
  "Zona 6 - Farmer's Carry",
  "Zona 7 - Air Bike",
  "Zona 8 - Dead Ball Over Wall",
  "Zona 9 - Sled Push/Pull",
  "Zona 10 - RAM Burpees"
]


function fetchResults(params: Record<string, string | number>) {
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

function formatTimeFromResults(totalTime?: string) {
  if (!totalTime)
    return '—'

  const s = totalTime.trim()
  // numeric seconds (e.g. "123.45")
  if (/^\d+(?:\:\d+)+(?:\:\d+)+(?:\.\d+)?$/.test(s)) {
    const parts = s.split(/[:]/);
    const [hStr = "0", mStr = "0", secStr = "0.0"] = parts;
    const secsFloat = parseFloat(secStr)
    const hours = parseInt(hStr);
    const minutes = parseInt(mStr);
    const seconds = Math.floor(secsFloat);
    const ds = Math.floor((secsFloat - seconds) * 10)

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${'.' + String(ds).padStart(1, '0')}`
  }

  // otherwise assume already formatted (e.g. "00:12:34")
  return totalTime
}

function timeToSeconds(value?: string): number | undefined {
  if (!value) return undefined

  const parts = value.trim().split(':').map(Number)

  if (parts.some(Number.isNaN)) return undefined

  return parts.reduce((total, part) => total * 60 + part, 0)
}

function secondsToMinSecsStr(value?: number): string | undefined {
  if (!value) return undefined

  const minutes = Math.floor(value / 60);
  const secondsFloat = value - minutes * 60;
  const seconds = Math.floor(secondsFloat);
  const dsecsFloat = secondsFloat - seconds;
  const dsecs = Math.floor(dsecsFloat * 10);

  return `${minutes}:${String(seconds).padStart(2, '0')}.${dsecs}`;
}

function App() {
  // `inputs` are the staged values the user edits.
  // `filters` are the applied values used for querying.
  const [inputs, setInputs] = useState<Filters>({
    athlete_name: '',
    event_name: '',
    deka_type: '',
    category: '',
    gender: '',
    age_group: '',
  })
  const [filters, setFilters] = useState<Filters>({
    athlete_name: '',
    event_name: '',
    deka_type: '',
    category: '',
    gender: '',
    age_group: '',
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [expandedResultId, setExpandedResultId] = useState<number | null>(null)
  const [selectedAthletes, setSelectedAthletes] = useState<Record<number, AthleteResult>>(() => {
    try {
      const storedAthletes = localStorage.getItem(selectedAthletesStorageKey)
      return storedAthletes ? JSON.parse(storedAthletes) : {}
    } catch {
      return {}
    }
  })

  const resultQuery = useQuery<PaginatedResponse, Error>({
    queryKey: ['results', filters, page, pageSize],
    queryFn: () =>
      fetchResults({
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

  const onChange = (key: keyof Filters, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const applySearch = () => {
    setFilters(inputs)
    setPage(1)
  }

  const toggleAthleteSelection = (athlete: AthleteResult) => {
    setSelectedAthletes(current => {
      if (current[athlete.id]) {
        const { [athlete.id]: _, ...remainingAthletes } = current
        return remainingAthletes
      }

      return { ...current, [athlete.id]: athlete }
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

  const getSelectedAthletesRunInfo = (index: number) => {
    return selectedAthleteList.map((athlete, athleteIndex) => {
      const runTime = athlete[`run_${index + 1}` as keyof AthleteResult] as string | undefined;
      const compAthlete = (athleteIndex > 0) ? selectedAthleteList[0] : undefined;
      
      if (compAthlete === undefined)
      {
        return (
          <td>{runTime}</td>
        )
      }
      else
      {
        return (
          <td>{runTime} {getTimeDifferenceForRunFormatted(athlete, compAthlete, index)}</td>
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
          <td>{zoneTime}</td>
        )
      }
      else
      {
        return (
          <td>{zoneTime}  {getTimeDifferenceForZoneFormatted(athlete, compAthlete, index)}</td>
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
                    <th>{athlete.athlete_name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Evento</td>
                  {selectedAthleteList.map(athlete => (
                    <td>{athlete.event_name}</td>
                  ))}
                </tr>
                <tr>
                  <td>DEKA Type</td>
                  {selectedAthleteList.map(athlete => (
                    <td>{athlete.deka_type}</td>
                  ))}
                </tr>
                <tr>
                  <td>Género</td>
                  {selectedAthleteList.map(athlete => (
                    <td>{athlete.gender}</td>
                  ))}
                </tr>
                <tr>
                  <td>Categoría</td>
                  {selectedAthleteList.map(athlete => (
                    <td>{athlete.category}</td>
                  ))}
                </tr>
                <tr>
                  <td>Grupo de Edad</td>
                  {selectedAthleteList.map(athlete => (
                    <td>{athlete.age_group}</td>
                  ))}
                </tr>
                <tr>
                  <td>DEKA Mark</td>
                  {selectedAthleteList.map(athlete => (
                    <td>{athlete.total_time}</td>
                  ))}
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
      <header>
        <h1>DEKA results</h1>
      </header>

      <section className="selected-athletes">
        {showSelectedAthletesComparison()}
      </section>

      <section className="filters">
        <div className="filter-line line-1">
          <div className="filter-row">
            <label>Athlete</label>
            <input value={inputs.athlete_name} onChange={e => onChange('athlete_name', e.target.value)} />
          </div>
        </div>

        <div className="filter-line line-2">
          <div className="filter-row">
            <label>DEKA type</label>
            <select value={inputs.deka_type} onChange={e => onChange('deka_type', e.target.value)}>
              <option value="">Any</option>
              <option value="DEKA Fit">DEKA Fit</option>
              <option value="DEKA Fit Teams">DEKA Fit Teams</option>
            </select>
          </div>

          <div className="filter-row">
            <label>Event</label>
            <input value={inputs.event_name} onChange={e => onChange('event_name', e.target.value)} />
          </div>
        </div>

        <div className="filter-line line-3">
          <div className="filter-row">
            <label>Gender</label>
            <select value={inputs.gender} onChange={e => onChange('gender', e.target.value)}>
              <option value="">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div className="filter-row">
            <label>Category</label>
            <input value={inputs.category} onChange={e => onChange('category', e.target.value)} />
          </div>

          <div className="filter-row">
            <label>Age group</label>
            <input value={inputs.age_group} onChange={e => onChange('age_group', e.target.value)} />
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={applySearch}>Search</button>
        </div>
      </section>

      <section className="pagination-controls">
        <div>
          <label>Page size</label>
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
          >
            {pageSizes.map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div>
          <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page <= 1}>
            Previous
          </button>
          <span>Page {page}</span>
          <button onClick={() => setPage(prev => prev + 1)} disabled={!resultQuery.data || page >= totalPages}>
            Next
          </button>
        </div>
      </section>

      <section className="results">
        {resultQuery.isLoading && <p>Loading…</p>}
        {resultQuery.isError && <p>Error loading results</p>}
        {resultQuery.data && results.length === 0 && <p>No results found.</p>}

        {results.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Atleta</th>
                <th>Evento</th>
                <th>DEKA Type</th>
                <th>Categoría</th>
                <th>Género</th>
                <th>Grupo de Edad</th>
                <th>DEKA Mark</th>
                <th>Tiempos</th>
                <th>Comparar</th>
              </tr>
            </thead>
            <tbody>
              {results.map(item => {
                const isExpanded = expandedResultId === item.id
                const isSelected = Boolean(selectedAthletes[item.id])

                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td>{item.athlete_name}</td>
                      <td>{item.event_name}</td>
                      <td>{item.deka_type}</td>
                      <td>{item.category}</td>
                      <td>{item.gender}</td>
                      <td>{item.age_group}</td>
                      <td>{item.total_time}</td>
                      <td>
                        <button
                          className="times-button"
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedResultId(isExpanded ? null : item.id)}
                        >
                          {isExpanded ? 'Hide times' : 'View times'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="selection-button"
                          type="button"
                          aria-label={isSelected ? `Deselect ${item.athlete_name}` : `Select ${item.athlete_name}`}
                          aria-pressed={isSelected}
                          onClick={() => toggleAthleteSelection(item)}
                        >
                          <img
                            src={isSelected ? '/icons/star_full.png' : '/icons/star_empty.png'}
                            alt=""
                            width="24"
                            height="24"
                          />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="times-details">
                        <td colSpan={9}>
                          <table className="times-table">
                            <thead>
                              <tr>
                                <th>Zone Name</th>
                                <th>Run Time</th>
                                <th>Zone Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: 10 }, (_, index) => {
                                const position = index + 1
                                const run = item[`run_${position}` as keyof AthleteResult] as string | undefined
                                const zone = item[`zone_${position}` as keyof AthleteResult] as string | undefined
                                const zoneName = ZoneNames[index]

                                return (
                                  <tr key={position}>
                                    <td>{zoneName}</td>
                                    <td>{run}</td>
                                    <td>{zone}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default App
