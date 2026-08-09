import { Fragment } from "react/jsx-runtime"
import { AthleteResult } from "../utils/types"

interface SearchResultsProps {
  isLoading: boolean
  isError: boolean
  results: AthleteResult[]
  expandedResultId: number | null
  selectedAthletes: AthleteResult[]
  showSelectAthlete: boolean
  canSelectNewAthletes: boolean
  onToggleAthleteSelection: (value: AthleteResult) => void
  allowShowingTimes: boolean
  onShowTimesForAthlete: (athleteId: number | null) => void
}

export function SearchResults({
  isLoading,
  isError,
  results,
  expandedResultId,
  selectedAthletes,
  showSelectAthlete,
  canSelectNewAthletes,
  onToggleAthleteSelection,
  allowShowingTimes,
  onShowTimesForAthlete,
}: SearchResultsProps) {
  const numColumns = allowShowingTimes ? 8 : 7;

  const isAthleteSelected = (athlete: AthleteResult) => {
    return selectedAthletes.some(a => a.id == athlete.id);
  }

  return (
    <section className="results">
      {isLoading && <p>Loading…</p>}
      {isError && <p>Error loading results</p>}
      {results && results.length === 0 && <p>No results found.</p>}

      {(results && results.length > 0) && (
        <table>
          <thead>
            <tr>
              <th>Atleta</th>
              <th>Evento</th>
              <th>Categoría</th>
              <th>Género</th>
              <th>Grupo de Edad</th>
              <th>Final Time</th>
              {
                allowShowingTimes && (
                  <th>Tiempos</th>
                )
              }
            </tr>
          </thead>
          <tbody>
            {results.map(item => {
              const isExpanded = expandedResultId === item.id
              const isSelected = isAthleteSelected(item)

              return (
                <Fragment key={item.id}>
                  <tr>
                    <td>
                      {showSelectAthlete && (canSelectNewAthletes || isSelected) && (
                        <button
                          className="selection-button"
                          type="button"
                          aria-label={isSelected ? `Deselect ${item.athlete_name}` : `Select ${item.athlete_name}`}
                          aria-pressed={isSelected}
                          onClick={() => onToggleAthleteSelection(item)}
                        >
                          <img
                            src={isSelected ? '/icons/star_full.png' : '/icons/star_empty.png'}
                            alt=""
                            width="24"
                            height="24"
                          />
                        </button>
                      )}
                      {item.athlete_name}
                    </td>
                    <td>{item.event_name}</td>
                    <td>{item.category}</td>
                    <td>{item.gender}</td>
                    <td>{item.age_group}</td>
                    <td>{item.total_time}</td>
                    {
                      allowShowingTimes && (
                      <td>
                        <button
                          className="times-button"
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => onShowTimesForAthlete(isExpanded ? null : item.id)}
                        >
                          {isExpanded ? 'Hide times' : 'View times'}
                        </button>
                      </td>
                      )
                    }
                  </tr>
                  {allowShowingTimes && isExpanded && (
                    <tr className="times-details">
                      <td colSpan={numColumns}>
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
                              const zoneName = `Ejercicio ${position}`

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
  )
}
