import type { Filters } from './utils/types'

interface FiltersPanelProps {
  inputs: Filters
  onChange: (key: keyof Filters, value: string) => void
  onSearch: () => void
}

export function SearchPanel({
  inputs,
  onChange,
  onSearch,
}: FiltersPanelProps) {
  return (
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
        <button onClick={onSearch}>Search</button>
      </div>
    </section>
  )
}