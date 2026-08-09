import { secondsToMinSecsStr } from './timeUtils'


export function percentileLabel(value: number) {
  return `Top ${value.toFixed(1)}%`
}

export function durationLabel(value?: number) {
  return secondsToMinSecsStr(value) ?? '—'
}
