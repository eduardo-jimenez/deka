type PageName = 'home' | 'search' | 'compare' | 'analyze'

interface HeaderProps {
  currentPage: PageName
}

const navigation = [
  { name: 'Home', href: '/index.html', page: 'home' },
  { name: 'Search', href: '/search.html', page: 'search' },
  { name: 'Compare', href: '/compare.html', page: 'compare' },
  { name: 'Analyze', href: '/analyze.html', page: 'analyze' },
] as const

export function Header({ currentPage }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="site-brand" href="/index.html">DEKA Analyzer</a>
      <button
        className="menu-button"
        type="button"
        aria-expanded={isMenuOpen}
        aria-controls="main-navigation"
        onClick={() => setIsMenuOpen(isOpen => !isOpen)}
      >
        ☰
      </button>
      <nav id="main-navigation" className={isMenuOpen ? 'is-open' : undefined} aria-label="Main navigation">
        {navigation.map(item => (
          <a
            key={item.page}
            className={item.page === currentPage ? 'is-active' : undefined}
            href={item.href}
            aria-current={item.page === currentPage ? 'page' : undefined}
          >
            {item.name}
          </a>
        ))}
      </nav>
    </header>
  )
}
import { useState } from 'react'
