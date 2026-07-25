import { Header } from './Header'

type InfoPageName = 'home' | 'search' | 'compare' | 'analyze'

const content: Record<InfoPageName, { title: string; description: string }> = {
  home: {
    title: 'DEKA Results Analyzer',
    description: 'Home page to the DEKA Results Analyzer',
  },
  search: {
    title: 'Search Athletes',
    description: 'Search and visualize the times of the search results',
  },
  compare: {
    title: 'Compare Athlete Results',
    description: 'Compare the times of all runs and zones for 2 athletes.',
  },
  analyze: {
    title: 'Analyze Athlete Results',
    description: 'Use this page for deeper performance analysis and trends for a single athlete.',
  },
}

interface InfoPageProps {
  page: InfoPageName
}

export function InfoPage({ page }: InfoPageProps) {
  const pageContent = content[page]

  return (
    <div className="app-shell">
      <Header currentPage={page} />
      <main className="info-page">
        <h1>{pageContent.title}</h1>
        <p>{pageContent.description}</p>
        {page === 'home' && (
          <a className="primary-link" href="/search.html">Search results</a>
        )}
      </main>
    </div>
  )
}
