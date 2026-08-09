import { useQuery } from '@tanstack/react-query'
import { Header } from './Header'
import { fetchAvailableEvents } from './utils/dbUtils'
import type { EventAvailableResponse } from './utils/types'

export function HomeApp() {
  const eventsQuery = useQuery<EventAvailableResponse, Error>({
    queryKey: ['available-events'],
    queryFn: fetchAvailableEvents,
  })

  return (
    <div className="app-shell">
      <Header currentPage='home' />
      <main className="info-page">
        <h1>DEKA Results Analyzer</h1>
        <p>Home page to the DEKA Results Analyzer</p>
        <p>This is a small web app developed by a DEKA athlete obsessed with numbers for improving his performance.</p>
        <p>Here you can search for athletes and view their times on different events (from the ones stored in the database), you can also compare times of different athletes and finally (and it's still work in progress) tools to analyze the performance of an athlete and points of improvement</p>

        <section className="available-events" aria-labelledby="available-events-heading">
          <h2 id="available-events-heading">Available events</h2>
          {eventsQuery.isLoading && <p>Loading events…</p>}
          {eventsQuery.isError && <p>Unable to load the available events.</p>}
          {eventsQuery.data && (
            eventsQuery.data.results.length > 0 ? (
              <ul>
                {eventsQuery.data.results.map(event => (
                  <li key={event.id}>
                    <a href={event.url}>{event.name}</a>
                    {(event.city || event.start_date) && (
                      <span>
                        {' — '}
                        {[event.city, event.start_date, event.end_date]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : <p>No events are currently available.</p>
          )}
        </section>
      </main>
    </div>
  )
}
