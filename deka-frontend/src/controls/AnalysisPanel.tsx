import { Fragment } from 'react/jsx-runtime'
import type { AnalysisResults } from '../utils/types'

interface AnalysisPanelProps {
  results: AnalysisResults | null
}

export function AnalysisPanel({
  results,
}: AnalysisPanelProps) {
  return results ? (
    <section className="analysis-panel">
      ...
    </section>
  ) : (
    <Fragment>
    </Fragment>
  )
}