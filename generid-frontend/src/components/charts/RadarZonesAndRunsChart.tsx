import ReactECharts from "echarts-for-react";
import type { EChartsType } from 'echarts';
import { useEffect, useRef } from 'react'
import type { EChartsOption, RadarComponentOption, TooltipComponentFormatterCallbackParams } from "echarts";
import { secondsToMinSecsStr, secondsToHourMinSecsStr } from "../../utils/timeUtils";
import { getTotalTimeForIndexInChartStr } from "../../utils/chartUtils";
import { AnalysisResults, AthleteResult } from "../../utils/types";
import { RadarIndicatorOption } from "echarts/types/src/coord/radar/RadarModel.js";


interface RadarZonesAndRunsChartProps {
  results:AnalysisResults
  athlete:AthleteResult
  lineColor: string
}

function getNearestRadarIndex(
  mouseX: number,
  mouseY: number,
  values: number[],
  maxValue: number,
  centerX: number,
  centerY: number,
  radius: number,
) {
  const count = values.length

  return values.reduce(
    (nearest, value, index) => {
      const angle = Math.PI / 2 - (index * 2 * Math.PI) / count
      const distanceFromCenter = (value / maxValue) * radius

      const pointX = centerX + Math.cos(angle) * distanceFromCenter
      const pointY = centerY - Math.sin(angle) * distanceFromCenter

      const distance = Math.hypot(mouseX - pointX, mouseY - pointY)

      return distance < nearest.distance
        ? { index, distance }
        : nearest
    },
    { index: -1, distance: Infinity },
  )
}

export function RadarZonesAndRunsChart({
  results,
  athlete,
  lineColor,
}: RadarZonesAndRunsChartProps) {

  if (!results || !athlete) 
    return null

  const chartRef = useRef<ReactECharts>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const mouseHandlerRef = useRef<((event: { offsetX: number; offsetY: number }) => void) | null>(null);

  // generate the data with the percentiles of the athlete at the stations
  const percentiles: number[] = results.race_progression.map((_, index) => {
    const i:number = Math.floor(index / 2)
    if (index % 2 == 0) {
      return results.run_time_percs[i] ?? 0;
    } else {
      return results.zone_time_percs[i] ?? 0;
    }
  });

  // we invert the values to see them so that outwards is better
  const values: number[] = percentiles.map((value) => Math.max(100 - value, 0));

  // gather the actual athlete times at the stations
  const athleteTimes: number[] = results.race_progression.map((_, index) => {
    const i:number = Math.floor(index / 2)
    if (index % 2 == 0) {
      return athlete.runTimes[i] ?? 0;
    } else {
      return athlete.zoneTimes[i] ?? 0;
    }
  });

  // generate the radar axii names / values
  const radarIndicators: RadarIndicatorOption[] = results.race_progression.map((_, index) => {
    const i:number = Math.floor(index / 2)
    const name:string = (index % 2 == 0) ? `Run ${i + 1}` : `Ejercicio ${i + 1}`;
    
    return {
      name: name,
      min: 0,
      max: 100,
      axisType: 'value',
    }
  });

  // Tooltip mouse operations
  const handleChartReady = (chart: EChartsType) => {
    const zr = chart.getZr()

    const handleMouseMove = (event: { offsetX: number; offsetY: number }) => {
      // Your nearest-point calculation
      const centerX = chart.getWidth() / 2;
      const centerY = chart.getHeight() / 2;
      const radius = Math.min(chart.getWidth(), chart.getHeight()) * 0.25;
      const nearest = getNearestRadarIndex(event.offsetX, event.offsetY, values, 100, centerX, centerY, radius);

      if (nearest.distance < 20) {
        //console.log('Nearest point:', nearest.index);
        hoveredIndexRef.current = nearest.index;

        chart.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: 0,
          x: event.offsetX,
          y: event.offsetY,
        });
      } else {
        //console.log('Hiding tip')
        hoveredIndexRef.current = null;

        chart.dispatchAction({
          type: 'hideTip',
        })
      }
    }

    mouseHandlerRef.current = handleMouseMove
    zr.on('mousemove', handleMouseMove)
  }

  useEffect(() => {
    return () => {
      const chart = chartRef.current?.getEchartsInstance()
      const handler = mouseHandlerRef.current

      if (chart && handler) {
        chart.getZr().off('mousemove', handler)
      }
    }
  }, [])

  
  // fill the chart options
  const option: EChartsOption = {
    legend: {
      top: 0,
    },

    grid: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      containLabel: false,
    },

    tooltip: {
      show: true,
      trigger: 'item',
      triggerOn: 'none',
      transitionDuration: 0,
      alwaysShowContent: false,
      formatter: () => {
        const index = hoveredIndexRef.current
        if (index === null) 
          return '';

        return `
          ${radarIndicators[index].name}<br />
          top ${percentiles[index].toFixed(1)}% <br />
          ${secondsToMinSecsStr(athleteTimes[index])}`
      }
    },

    radar: {
      indicator: radarIndicators,
      clockwise: true,
    },

    series: [
      {
        type: 'radar',
        data: [
          {
            name: 'Zones percentile',
            value: values,
            lineStyle: {
              width: 3,
              color: lineColor,
            },
            itemStyle: {
              color: lineColor,
            },
            symbol: 'circle',
          },
        ],
      },
    ],
  }

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      onChartReady={handleChartReady}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}