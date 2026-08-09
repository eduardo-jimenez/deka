import ReactECharts from "echarts-for-react";
import type { EChartsOption, TooltipComponentFormatterCallbackParams } from "echarts";
import { secondsToMinSecsStr, secondsToHourMinSecsStr } from "../../utils/timeUtils";
import { getTotalTimeForIndexInChartStr } from "../../utils/chartUtils";
import { AthleteResult, ZoneNames } from "../../utils/types";


interface RaceProgressionChartProps {
  data: number[] | null
  totalCount: number
  athlete: AthleteResult | null
  lineColor: string
}

export function RaceProgressionChart({
  data,
  totalCount,
  athlete,
  lineColor,
}: RaceProgressionChartProps) {

  if (!data || data.length != 20 || !athlete) 
    return null

  // calculate the race times
  let totalRaceTime:number = 0.0;
  const raceTimes: number[] = data.map((_, index) => {
    const i:number = Math.floor(index / 2)
    if (index % 2 == 0) {
      totalRaceTime += athlete.runTimes[i] ?? 0;
      return totalRaceTime;
    } else {
      totalRaceTime += athlete.zoneTimes[i] ?? 0;
      return totalRaceTime;
    }
  });

  // fill the chart options
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: TooltipComponentFormatterCallbackParams) => {
        const xIndex:number = Array.isArray(params) ? params[0].dataIndex : params.dataIndex;
        const xAxisName:string = Array.isArray(params) ? params[0].name : params.name;
        const posStr:string = `${data[xIndex] + 1}/${totalCount}`;
        const timeStr:string = `${secondsToHourMinSecsStr(raceTimes[xIndex])}`;

        return `${xAxisName}<br />
                position ${posStr}<br />
                time ${timeStr}`
      },
    },

    legend: {
      top: 0,
    },

    grid: {
      top: 20,
      right: 30,
      bottom: 20,
      left: 30,
      containLabel: true,
    },

    xAxis: {
      type: "category",
      data: data.map((_, index) => {
        const i = Math.floor(index / 2);
        if (index % 2 == 0) {
          return `Run ${i}`;
        } else {
          return ZoneNames[i];
        }
      }),
      axisLabel: {
        interval: (index) => index % 2 === 0,
      },
      axisLine: {
        show: false,
      },
    },

    yAxis: {
      type: "value",
      show: false,
      inverse: true,
    },
    
    series: [
      {
        type: 'line',
        data: data,
        showSymbol: true,
        smooth: false,
        color: lineColor,
        lineStyle: {
          width: 3,
        },
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}