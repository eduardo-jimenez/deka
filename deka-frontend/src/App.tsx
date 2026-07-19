import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const pageSizes = [25, 50, 100]

interface Filters {
  athlete_name: string
  event_name: string
  deka_type: string
  category: string
  gender: string
  age_group: string
}

interface AthleteResult {
  id: number
  athlete_name: string
  event_name: string
  deka_type: string
  category: string
  gender: string
  age_group: string
  total_time?: string
}

interface PaginatedResponse {
  count: number
  pages: number
  results: AthleteResult[]
}

function fetchResults(params: Record<string, string | number>) {
  return axios
    .get<PaginatedResponse>('/api/athlete-results/', { params })
    .then(res => res.data)
}

function App() {
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

  const resultQuery = useQuery<PaginatedResponse, Error>({
    queryKey: ['results', filters, page, pageSize],
    queryFn: () =>
      fetchResults({
        ...filters,
        page,
        page_size: pageSize,
      }),
    keepPreviousData: true,
  })

  const onChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <div className="app-shell">
      <header>
        <h1>DEKA results</h1>
      </header>

      <section className="filters">
        {[
          { label: 'Athlete', key: 'athlete_name' },
          { label: 'Event', key: 'event_name' },
          { label: 'DEKA type', key: 'deka_type' },
          { label: 'Category', key: 'category' },
          { label: 'Gender', key: 'gender' },
          { label: 'Age group', key: 'age_group' },
        ].map(field => (
          <div className="filter-row" key={field.key}>
            <label>{field.label}</label>
            <input
              value={filters[field.key]}
              onChange={e => onChange(field.key, e.target.value)}
            />
          </div>
        ))}
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
          <button onClick={() => setPage(prev => prev + 1)} disabled={!resultQuery.data || page >= resultQuery.data.pages}>
            Next
          </button>
        </div>
      </section>

      <section className="results">
        {resultQuery.isLoading && <p>Loading…</p>}
        {resultQuery.isError && <p>Error loading results</p>}
        {resultQuery.data?.results.length === 0 && <p>No results found.</p>}

        {resultQuery.data?.results.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Athlete</th>
                <th>Event</th>
                <th>DEKA type</th>
                <th>Category</th>
                <th>Gender</th>
                <th>Age group</th>
                <th>Total time</th>
              </tr>
            </thead>
            <tbody>
              {resultQuery.data.results.map(item => (
                <tr key={item.id}>
                  <td>{item.athlete_name}</td>
                  <td>{item.event_name}</td>
                  <td>{item.deka_type}</td>
                  <td>{item.category}</td>
                  <td>{item.gender}</td>
                  <td>{item.age_group}</td>
                  <td>{item.total_time ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default App
