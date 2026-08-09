import { Fragment, useState } from 'react'
import { calcAthleteTotalRunTime, calcAthleteTotalZonesTime, secondsToMinSecsStr } from '../utils/timeUtils'
import { percentileLabel, durationLabel } from '../utils/analysisUtils'
import type { AnalysisResults, AthleteResult } from '../utils/types'
import { AnalysisTotalsPanel } from './AnalysisTotalsPanel'
import { AnalysisRunPanel } from './AnalysisRunPanel'
import { AnalysisZonesPanel } from './AnalysisZonesPanel'

interface AnalysisPanelProps {
  results: AnalysisResults | null
  athlete: AthleteResult | null
}

type AnalysisTab = 'totals' | 'runs' | 'zones'

const tabs: Array<{ id: AnalysisTab; label: string }> = [
  { id: 'totals', label: 'Totals' },
  { id: 'runs', label: 'Runs' },
  { id: 'zones', label: 'Zones' },
]

export function AnalysisPanel({ results, athlete }: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('totals')

  if (!results) return null

  // choose what to show based on the currently active tab
  let tabContent

  switch (activeTab) {
    case 'totals':
      tabContent = (
        <AnalysisTotalsPanel
          results={results}
          athlete={athlete}
        />
      )
      break

    case 'runs':
      tabContent = (
        <AnalysisRunPanel
          results={results}
          athlete={athlete}
        />
      )
      break

    case 'zones':
      tabContent = (
        <AnalysisZonesPanel
          results={results}
          athlete={athlete}
        />
      )
      break
  }

  return (
    <section className="analysis-panel" aria-labelledby="analysis-heading">
      <div className="analysis-panel-header">
        <div>
          <p className="analysis-panel-eyebrow">Performance analysis</p>
          <h2 id="analysis-heading">Race breakdown</h2>
        </div>
        <p className="analysis-panel-comparison">Compared with {results.total_count} athletes</p>
      </div>

      <div className="analysis-tabs" role="tablist" aria-label="Analysis categories">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'is-active' : ''}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabContent}
    </section>
  )
}
