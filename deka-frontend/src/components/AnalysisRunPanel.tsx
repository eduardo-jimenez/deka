import { Fragment, useState } from 'react'
import { percentileLabel, durationLabel } from '../utils/analysisUtils'
import type { AnalysisResults, AthleteResult } from '../utils/types'
import { PercentilesChart } from './charts/PercentilesChart'
import { getIndexForRunTimeInChart, getRunTimeForIndexInChartStr, RunLineColor, RunGradientColor, RunMarkLineColor } from '../utils/chartUtils'

interface AnalysisTotalsPanelProps {
  results: AnalysisResults | null
  athlete: AthleteResult | null
}


export function AnalysisRunPanel({ results, athlete }: AnalysisTotalsPanelProps) {

  if (!results || !athlete) 
    return null

  const partialRunsInfo = results.run_time_percs.map((percentile, index) => ({
    label: `Run ${index + 1}`,
    percentile: percentileLabel(percentile),
    time: durationLabel(athlete.runTimes[index]),
    number: `#${results.num_better_run_times[index]}/${results.total_count}`,
    athleteTimeIndex: getIndexForRunTimeInChart(athlete.runTimes[index] ?? 0, results.run_time_buckets[0].length),
  }))

  return (
    <Fragment>
      <div className="analysis-metrics">
        {partialRunsInfo.map(({ label, percentile, time, number, athleteTimeIndex }, index) => (
          <article className="analysis-metric-card run" key={label}>
            <div className="analysis-metric-title">
              <div className="analysis-metric-label run">
                <strong>{label}</strong>
                <span>{number}</span>
              </div>
              <div className="analysis-metric-values run">
                <strong>{time}</strong>
                <span>{percentile}</span>
              </div>
            </div>
            <div className="analysis-metric-chart">
              <PercentilesChart 
                data={results.run_time_buckets[index]}
                athleteTimeIndex={athleteTimeIndex}
                xAxisValuesFunc={getRunTimeForIndexInChartStr} 
                lineColor={RunLineColor}
                gradientColor={RunGradientColor}
                markLineColor={RunMarkLineColor}
              />
            </div>
          </article>
        ))}
      </div>
    </Fragment>
  )
}
