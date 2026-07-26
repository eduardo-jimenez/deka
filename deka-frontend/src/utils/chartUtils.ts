import { secondsToHourMinSecsStr, secondsToMinSecsStr } from "./timeUtils";


// Colors
export const TotalTimesLineColor = "#B01010";
export const TotalTimesGradientColor = "#800808";
export const TotalTimesMarkLineColor = "rgba(64, 8, 8, 0.5)";

export const ZonesLineColor = "#10b0a8";
export const ZonesGradientColor = "#088080";
export const ZonesMarkLineColor = "rgba(8, 64, 61, 0.5)";

export const RunLineColor = "#b0a010";
export const RunGradientColor = "#806008";
export const RunMarkLineColor = "rgba(64, 54, 8, 0.5)";


// Total Time 
export const MinTotalTime = 1500.0;
export const MaxTotalTime = 4200.0;


export function getTotalTimeForIndexInChart(index:number, numDivs:number): number {
  const time = MinTotalTime + (MaxTotalTime - MinTotalTime) * (index / numDivs);
  return time;
}

export function getTotalTimeForIndexInChartStr(index:number, numDivs:number): string {
  const timeStr = secondsToHourMinSecsStr(getTotalTimeForIndexInChart(index, numDivs)) ?? '';
  return timeStr;
}

export function getIndexForTotalTimeInChart(time: number, numDivs: number): number {
  const step = (MaxTotalTime - MinTotalTime) / numDivs;
  const indexFloat = (time - MinTotalTime) / step;
  const index = Math.round(indexFloat);

  return index;
}


// Zones Total Time 
export const MinZonesTotalTime = 600.0;
export const MaxZonesTotalTime = 1800.0;


export function getTotalZonesTimeForIndexInChart(index:number, numDivs:number): number {
  const time = MinZonesTotalTime + (MaxZonesTotalTime - MinZonesTotalTime) * (index / numDivs);
  return time;
}

export function getTotalZonesTimeForIndexInChartStr(index:number, numDivs:number): string {
  const timeStr = secondsToHourMinSecsStr(getTotalZonesTimeForIndexInChart(index, numDivs)) ?? '';
  return timeStr;
}

export function getIndexForTotalZonesTimeInChart(time: number, numDivs: number): number {
  const step = (MaxZonesTotalTime - MinZonesTotalTime) / numDivs;
  const indexFloat = (time - MinZonesTotalTime) / step;
  const index = Math.round(indexFloat);

  return index;
}


// Run Total Time 
export const MinRunTotalTime = 840.0;
export const MaxRunTotalTime = 2400.0;


export function getTotalRunTimeForIndexInChart(index:number, numDivs:number): number {
  const time = MinRunTotalTime + (MaxRunTotalTime - MinRunTotalTime) * (index / numDivs);
  return time;
}

export function getTotalRunTimeForIndexInChartStr(index:number, numDivs:number): string {
  const timeStr = secondsToHourMinSecsStr(getTotalRunTimeForIndexInChart(index, numDivs)) ?? '';
  return timeStr;
}

export function getIndexForTotalRunTimeInChart(time: number, numDivs: number): number {
  const step = (MaxRunTotalTime - MinRunTotalTime) / numDivs;
  const indexFloat = (time - MinRunTotalTime) / step;
  const index = Math.round(indexFloat);

  return index;
}
