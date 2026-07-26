import { Fragment, useState } from 'react'
import { percentileLabel, durationLabel } from '../utils/analysisUtils'
import type { AnalysisResults, AthleteResult } from '../utils/types'
import { ZoneNames } from '../utils/types'

interface AnalysisTotalsPanelProps {
  results: AnalysisResults | null
  athlete: AthleteResult | null
}


export function AnalysisZonesPanel({ results, athlete }: AnalysisTotalsPanelProps) {

  if (!results) return null

  const partialZonesInfo = results.run_time_percs.map((percentile, index) => ({
    label: ZoneNames[index],
    percentile: percentileLabel(percentile),
    time: durationLabel(athlete?.zoneTimes[index]),
    number: `#${results.num_better_zone_times[index]}/${results.total_count}`,
  }))

  return (
    <Fragment>
      <div className="analysis-metrics">
        {partialZonesInfo.map(({ label, percentile, time, number }) => (
          <article className="analysis-metric-card zones" key={label}>
            <div className="analysis-metric-label zones">
              <strong>{label}</strong>
              <span>{number}</span>
            </div>
            <div className="analysis-metric-values zones">
              <strong>{time}</strong>
              <span>{percentile}</span>
            </div>
          </article>
        ))}
      </div>
    </Fragment>
  )
}
