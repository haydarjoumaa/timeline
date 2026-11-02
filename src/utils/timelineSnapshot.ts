import type { TimelineStore } from '@/stores/timeline'
import type { TimelineData } from '@/types'

// Data is plain JSON, so this also strips reactive proxies
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

export const snapshotTimeline = (store: TimelineStore): TimelineData =>
  clone({
    lanes: store.lanes,
    rows: store.rows,
    periods: store.periods,
    lanePositions: store.lanePositions,
  })

// Next "R<n>" row id must not collide with rows that came from outside
const nextRowIndexFor = (rows: TimelineData['rows']) =>
  rows.reduce((max, row) => Math.max(max, Number(row.id.match(/^R(\d+)$/)?.[1] ?? 0)), 0) + 1

export const loadTimeline = (store: TimelineStore, data: TimelineData) => {
  const { lanes, rows, periods, lanePositions = {} } = clone(data)
  store.$patch((state) => {
    state.lanes = lanes
    state.rows = rows
    state.periods = periods
    state.lanePositions = lanePositions
    state.nextRowIndex = nextRowIndexFor(rows)
  })
}
