import { AthleteResult } from "./types";

export function formatTimeFromResults(totalTime?: string) {
  if (!totalTime)
    return '—'

  const s = totalTime.trim()
  // numeric seconds (e.g. "123.45")
  if (/^\d+(?:\:\d+)+(?:\:\d+)+(?:\.\d+)?$/.test(s)) {
    const parts = s.split(/[:]/);
    const [hStr = "0", mStr = "0", secStr = "0.0"] = parts;
    const secsFloat = parseFloat(secStr)
    const hours = parseInt(hStr);
    const minutes = parseInt(mStr);
    const seconds = Math.floor(secsFloat);
    const ds = Math.floor((secsFloat - seconds) * 10)

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${'.' + String(ds).padStart(1, '0')}`
  }

  // otherwise assume already formatted (e.g. "00:12:34")
  return totalTime
}

export function timeToSeconds(value?: string): number | undefined {
  if (!value) return undefined

  const parts = value.trim().split(':').map(Number)

  if (parts.some(Number.isNaN)) return undefined

  return parts.reduce((total, part) => total * 60 + part, 0)
}

export function secondsToMinSecsStr(value?: number): string | undefined {
  if (!value) return undefined

  const minutes = Math.floor(value / 60);
  const secondsFloat = value - minutes * 60;
  const seconds = Math.floor(secondsFloat);
  const dsecsFloat = secondsFloat - seconds;
  const dsecs = Math.floor(dsecsFloat * 10);

  return `${minutes}:${String(seconds).padStart(2, '0')}.${dsecs}`;
}

export function calcAthleteTotalRunTime(athlete: AthleteResult): number {
  if (!athlete)
    return 0

  const totalRunTime = athlete.runTimes?.reduce(
    (sum, runTime) => Number(sum) + Number(runTime),
    0) 
    ?? 0;

  return totalRunTime;
}

export function calcAthleteTotalZonesTime(athlete: AthleteResult): number {
  if (!athlete)
    return 0

  const totalZonesTime = athlete.zoneTimes?.reduce(
    (sum, zoneTime) => Number(sum) + Number(zoneTime),
    0) 
    ?? 0;

  return totalZonesTime;
}
