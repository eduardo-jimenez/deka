import type { Filters, HybridRace } from '../utils/types'

interface FiltersPanelProps {
  inputs: Filters
  onChange: (key: keyof Filters, value: string) => void
  races: HybridRace[]
  onSearch: () => void
  onRaceChanged?: (raceName: string) => void
}

export function SearchPanel({
  inputs,
  onChange,
  races,
  onSearch,
  onRaceChanged,
}: FiltersPanelProps) {
  return (
    <section className="filters">
      <form
        onSubmit={e => {
          e.preventDefault()
          onSearch()
        }}
      >
        <div className="filter-row">
          <label>Race</label>
          <select value={inputs.race_name} onChange={e => {
            onChange('race_name', e.target.value)
            if (onRaceChanged) {
              onRaceChanged(e.target.value)
            }
          }}>
            <option value="" disabled>Select a race</option>
            {races.map(race => (
              <option key={race.id} value={race.name}>
                {race.name}
              </option>
            ))}
          </select>
        </div>

      {inputs.race_name && (
        <>
          <div className="filter-line line-1">
            <div className="filter-row">
              <label>Athlete</label>
              <input value={inputs.athlete_name} onChange={e => onChange('athlete_name', e.target.value)} />
            </div>
          </div>

          <div className="filter-line line-2">
            <div className="filter-row">
              <label>Event</label>
              <input value={inputs.event_name} onChange={e => onChange('event_name', e.target.value)} />
            </div>

            <div className="filter-row">
              <label>Gender</label>
              <select value={inputs.gender} onChange={e => onChange('gender', e.target.value)}>
                <option value="">Any</option>
                <option value="Masc">Masculino</option>
                <option value="Fem">Femenino</option>
                <option value="Mixt">Mixto</option>
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
            <button type="submit">Search</button>
          </div>
        </>
      )}
      </form>
    </section>
  )
}