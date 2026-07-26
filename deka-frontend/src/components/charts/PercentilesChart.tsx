import ReactECharts from "echarts-for-react";
import type { EChartsOption, TooltipComponentFormatterCallbackParams } from "echarts";
import { secondsToMinSecsStr, secondsToHourMinSecsStr } from "../../utils/timeUtils";
import { getTotalTimeForIndexInChartStr } from "../../utils/chartUtils";


interface PercentilesChartProps {
  data: number[] | null
  athleteTimeIndex: number
  xAxisValuesFunc: (index:number, total:number) => string
  lineColor: string
  gradientColor: string
  markLineColor?: string
}

export function PercentilesChart({
  data,
  athleteTimeIndex,
  xAxisValuesFunc,
  lineColor,
  gradientColor,
  markLineColor,
}: PercentilesChartProps) {

  if (!data) 
    return null

  const numXAxisValues = 7;
  const xAxisInterval = Math.floor(data.length / numXAxisValues);

  const markLineCol = markLineColor ? markLineColor : 'rgba(20, 20, 20, 0.5)';

  // calculate the percentiles per bucket
  const sumBuckets: number[] = data.map((_, index) => 
    data
      .slice(0, index + 1)
      .reduce((sum, value) => sum + value, 0),
  );
  const totalSum = sumBuckets[sumBuckets.length - 1];
  const percentilesPerIndex: number[] = sumBuckets.map((_, index) => (index > 0) ? sumBuckets[index - 1] / totalSum : 0);

  // fill the chart options
  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      formatter: (params: TooltipComponentFormatterCallbackParams) => {
        const xIndex:number = Array.isArray(params) ? params[0].dataIndex : params.dataIndex;
        const xAxisName:string = Array.isArray(params) ? params[0].name : params.name;
        const percentile = (xIndex !== undefined) ? percentilesPerIndex[xIndex] : 0;
        const percentilePerc = 100 * percentile;
        const percentilePercUnits = Math.floor(percentilePerc);
        const percentilePercDecs = Math.floor(10 * (percentilePerc - percentilePercUnits));
        const percentileFormatted = `${percentilePercUnits}.${percentilePercDecs}`;

        return `${xAxisName}<br />
                top ${percentileFormatted}%`
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
      data: data.map((_, index) => xAxisValuesFunc(index, data.length)),
      axisLabel: {
        interval: xAxisInterval,
      },
    },

    yAxis: {
      type: "value",
      show: false,
    },

    series: [
      {
        type: 'line',
        data: data,
        showSymbol: false,
        smooth: true,
        color: lineColor,
        lineStyle: {
          width: 3,
        },

        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {offset: 0, color: gradientColor },
              {offset: 1, color: '#ffffff' },
            ],
          },
        },

        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {
            type: 'solid',
            width: 5,
            color: markLineCol,
          },
          label: {
            show: false,
            formatter: 'Athlete Time',
          },
          data: [
            {
              xAxis: athleteTimeIndex,
            },
          ],
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