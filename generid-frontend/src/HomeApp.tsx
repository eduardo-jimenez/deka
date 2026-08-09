import { Header } from './Header'
import { useAvailableRaces } from './utils/useAvailableRaces'

export function HomeApp() {
  const racesQuery = useAvailableRaces()

  return (
    <div className="app-shell">
      <Header currentPage='home' />
      <main className="info-page">
        <h1>Hybrid Results Analyzer</h1>
        <p>Home page to the Hybrid Results Analyzer</p>
        <p>This is a small web app developed by a hybrid athlete obsessed with numbers for improving his performance.</p>
        <p>Here you can search for athletes and view their times on different events (from the ones stored in the database), you can also compare times of different athletes and finally (and it's still work in progress) tools to analyze the performance of an athlete and points of improvement</p>

        <section className="available-events" aria-labelledby="available-events-heading">
          <h2 id="available-events-heading">Available races</h2>
          {racesQuery.isLoading && <p>Loading races...</p>}
          {racesQuery.isError && <p>Unable to load the available races.</p>}
          {racesQuery.data && (
            racesQuery.data.results.length > 0 ? (
              <ul>
                {racesQuery.data.results.map(race => (
                  <li key={race.name}>
                    <a href={race.url}>{race.name}</a>
                  </li>
                ))}
              </ul>
            ) : <p>No races are currently available.</p>
          )}
        </section>
      </main>
    </div>
  )
}
