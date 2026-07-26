import { Fragment, useState } from 'react'
import { ZoneNames } from '../utils/types'
import { calcAthleteTotalRunTime, calcAthleteTotalZonesTime, secondsToMinSecsStr } from '../utils/timeUtils'
import { percentileLabel, durationLabel } from '../utils/analysisUtils'
import type { AnalysisResults, AthleteResult } from '../utils/types'

interface AnalysisTotalsPanelProps {
  results: AnalysisResults | null
  athlete: AthleteResult | null
}


export function AnalysisTotalsPanel({ results, athlete }: AnalysisTotalsPanelProps) {

  if (!results) 
    return null

  return (
    <Fragment>
      <div className="analysis-metrics single-card">
        <article className="analysis-metric-card total">
          <div className="analysis-metric-label total">
            <strong>DEKA Mark</strong>
            <span>#{results.num_better_total_times}/{results.total_count}</span>
          </div>
          <div className="analysis-metric-values total">
            <strong>{athlete?.total_time ?? '—'}</strong>
            <span>{percentileLabel(results.total_time_perc)}</span>
          </div>
        </article>
      </div>
      <div className="analysis-metrics">
        <article className="analysis-metric-card run">
          <div className="analysis-metric-label run">
            <strong>Total Run Time</strong>
            <span>#{results.num_better_total_run_times}/{results.total_count}</span>
          </div>
          <div className="analysis-metric-values run">
            <strong>{athlete ? durationLabel(calcAthleteTotalRunTime(athlete)) : '—'}</strong>
            <span>{percentileLabel(results.total_run_time_perc)}</span>
          </div>
        </article>
        <article className="analysis-metric-card zones">
          <div className="analysis-metric-label zones">
            <strong>Total Zones Time</strong>
            <span>#{results.num_better_total_zone_times}/{results.total_count}</span>
          </div>
          <div className="analysis-metric-values zones">
            <strong>{athlete ? durationLabel(calcAthleteTotalZonesTime(athlete)) : '—'}</strong>
            <span>{percentileLabel(results.total_zone_time_perc)}</span>
          </div>
        </article>
      </div>
    </Fragment>
  )
}
