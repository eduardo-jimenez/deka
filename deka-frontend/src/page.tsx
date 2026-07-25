import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InfoPage } from './InfoPage'
import './index.css'

const queryClient = new QueryClient()
const page = document.body.dataset.page

if (page !== 'home' && page !== 'compare' && page !== 'analyze') {
  throw new Error('Unknown information page.')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <InfoPage page={page} />
    </QueryClientProvider>
  </React.StrictMode>,
)
