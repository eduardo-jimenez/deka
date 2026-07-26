import { Fragment, useState } from 'react'
import { calcAthleteTotalRunTime, calcAthleteTotalZonesTime, timeToSeconds } from '../utils/timeUtils'
import { percentileLabel, durationLabel } from '../utils/analysisUtils'
import type { AnalysisResults, AthleteResult } from '../utils/types'
import { getTotalTimeForIndexInChartStr, getIndexForTotalTimeInChart, TotalTimesLineColor, TotalTimesGradientColor, TotalTimesMarkLineColor } from '../utils/chartUtils'
import { getTotalRunTimeForIndexInChartStr, getIndexForTotalRunTimeInChart, RunLineColor, RunGradientColor, RunMarkLineColor } from '../utils/chartUtils'
import { getTotalZonesTimeForIndexInChartStr, getIndexForTotalZonesTimeInChart, ZonesLineColor, ZonesGradientColor, ZonesMarkLineColor } from '../utils/chartUtils'
import { PercentilesChart } from './charts/PercentilesChart'
import { RaceProgressionChart } from './charts/RaceProgressionChart'
import { RadarZonesAndRunsChart } from './charts/RadarZonesAndRunsChart'

interface AnalysisTotalsPanelProps {
  results: AnalysisResults | null
  athlete: AthleteResult | null
}


export function AnalysisTotalsPanel({ results, athlete }: AnalysisTotalsPanelProps) {

  if (!results || !athlete) 
    return null

  const athleteTotalTime: number = timeToSeconds(athlete?.total_time) ?? 0;
  const athleteTotalTimeIndex = getIndexForTotalTimeInChart(athleteTotalTime, results.total_time_buckets.length);
  const athleteTotalRunTime: number = calcAthleteTotalRunTime(athlete);
  const athleteTotalRunTimeIndex = getIndexForTotalRunTimeInChart(athleteTotalRunTime, results.total_run_time_buckets.length);
  const athleteTotalZonesTime: number = calcAthleteTotalZonesTime(athlete);
  const athleteTotalZonesTimeIndex = getIndexForTotalZonesTimeInChart(athleteTotalZonesTime, results.total_zone_time_buckets.length);

  return (
    <Fragment>
      <div className="analysis-metrics single-card">
        <article className="analysis-metric-card total">
          <div className="analysis-metric-title">
            <div className="analysis-metric-label total">
              <strong>DEKA Mark</strong>
              <span>#{results.num_better_total_times + 1}/{results.total_count}</span>
            </div>
            <div className="analysis-metric-values total">
              <strong>{athlete?.total_time ?? '—'}</strong>
              <span>{percentileLabel(results.total_time_perc)}</span>
            </div>
          </div>
          <div className="analysis-metric-chart">
            <PercentilesChart 
              data={results.total_time_buckets}
              athleteTimeIndex={athleteTotalTimeIndex}
              xAxisValuesFunc={getTotalTimeForIndexInChartStr} 
              lineColor={TotalTimesLineColor}
              gradientColor={TotalTimesGradientColor}
              markLineColor={TotalTimesMarkLineColor}
            />
          </div>
        </article>
      </div>
      <div className="analysis-metrics">
        <article className="analysis-metric-card run">
          <div className="analysis-metric-title">
            <div className="analysis-metric-label run">
              <strong>Total Run Time</strong>
              <span>#{results.num_better_total_run_times + 1}/{results.total_count}</span>
            </div>
            <div className="analysis-metric-values run">
              <strong>{athlete ? durationLabel(calcAthleteTotalRunTime(athlete)) : '—'}</strong>
              <span>{percentileLabel(results.total_run_time_perc)}</span>
            </div>
          </div>
          <div className="analysis-metric-chart">
            <PercentilesChart 
              data={results.total_run_time_buckets}
              athleteTimeIndex={athleteTotalRunTimeIndex}
              xAxisValuesFunc={getTotalRunTimeForIndexInChartStr} 
              lineColor={RunLineColor}
              gradientColor={RunGradientColor}
              markLineColor={RunMarkLineColor}
            />
          </div>
        </article>
        <article className="analysis-metric-card zones">
          <div className="analysis-metric-title">
            <div className="analysis-metric-label zones">
              <strong>Total Zones Time</strong>
              <span>#{results.num_better_total_zone_times + 1}/{results.total_count}</span>
            </div>
            <div className="analysis-metric-values zones">
              <strong>{athlete ? durationLabel(calcAthleteTotalZonesTime(athlete)) : '—'}</strong>
              <span>{percentileLabel(results.total_zone_time_perc)}</span>
            </div>
          </div>
          <div className="analysis-metric-chart">
            <PercentilesChart 
              data={results.total_zone_time_buckets}
              athleteTimeIndex={athleteTotalZonesTimeIndex}
              xAxisValuesFunc={getTotalZonesTimeForIndexInChartStr} 
              lineColor={ZonesLineColor}
              gradientColor={ZonesGradientColor}
              markLineColor={ZonesMarkLineColor}
            />
          </div>
        </article>
        <article className="analysis-metric-card total">
          <div className="analysis-metric-title">
            <div className="analysis-metric-label total">
              <strong>Race Position Evolution</strong>
            </div>
            <div className="analysis-metric-values total">
              <strong>#{results.num_better_total_times + 1}/{results.total_count}</strong>
            </div>
          </div>
          <div className="analysis-metric-chart">
            <RaceProgressionChart 
              data={results.race_progression}
              totalCount={results.total_count}
              athlete={athlete}
              lineColor={TotalTimesLineColor}
            />
          </div>
        </article>
        <article className="analysis-metric-card total">
          <div className="analysis-metric-title">
            <div className="analysis-metric-label total">
              <strong>Athlete Performance per Station</strong>
            </div>
            <div className="analysis-metric-values total">
              <strong>{athlete?.total_time ?? '—'}</strong>
            </div>
          </div>
          <div className="analysis-metric-chart radar">
            <RadarZonesAndRunsChart 
              results={results}
              athlete={athlete}
              lineColor={TotalTimesLineColor}
            />
          </div>
        </article>
      </div>
    </Fragment>
  )
}
