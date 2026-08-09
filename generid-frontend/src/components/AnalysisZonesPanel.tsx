import { Fragment, useState } from 'react'
import { percentileLabel, durationLabel } from '../utils/analysisUtils'
import type { AnalysisResults, AthleteResult } from '../utils/types'
import { getIndexForZoneTimeInChart, getZoneTimeForIndexInChartStr, ZonesLineColor, ZonesGradientColor, ZonesMarkLineColor } from '../utils/chartUtils'
import { PercentilesChart } from './charts/PercentilesChart'


interface AnalysisTotalsPanelProps {
  results: AnalysisResults | null
  athlete: AthleteResult | null
}


export function AnalysisZonesPanel({ results, athlete }: AnalysisTotalsPanelProps) {

  if (!results || !athlete) 
    return null

  const partialZonesInfo = results.zone_time_percs.map((percentile, index) => ({
    label: `Ejercicio ${index + 1}`,
    percentile: percentileLabel(percentile),
    time: durationLabel(athlete.zoneTimes[index]),
    number: `#${results.num_better_zone_times[index] + 1}/${results.total_count}`,
    athleteTimeIndex: getIndexForZoneTimeInChart(athlete.zoneTimes[index] ?? 0, results.zone_time_buckets[0].length),
  }))

  return (
    <Fragment>
      <div className="analysis-metrics">
        {partialZonesInfo.map(({ label, percentile, time, number, athleteTimeIndex }, index) => (
          <article className="analysis-metric-card zones" key={label}>
            <div className="analysis-metric-title">
              <div className="analysis-metric-label zones">
                <strong>{label}</strong>
                <span>{number}</span>
              </div>
              <div className="analysis-metric-values zones">
                <strong>{time}</strong>
                <span>{percentile}</span>
              </div>
            </div>
            <div className="analysis-metric-chart">
              <PercentilesChart 
                data={results.zone_time_buckets[index]}
                athleteTimeIndex={athleteTimeIndex}
                xAxisValuesFunc={getZoneTimeForIndexInChartStr} 
                lineColor={ZonesLineColor}
                gradientColor={ZonesGradientColor}
                markLineColor={ZonesMarkLineColor}
              />
            </div>
          </article>
        ))}
      </div>
    </Fragment>
  )
}
