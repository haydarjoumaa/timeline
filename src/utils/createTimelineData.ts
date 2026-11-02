import { createPinia } from 'pinia'
import type { Lane, Period, RelationInput, TimelineData } from '@/types'
import { createTimelineContext, withTimelineContext } from '@/composables/useTimelineContext'
import { useTimelineData } from '@/composables/useTimelineData'
import { snapshotTimeline } from './timelineSnapshot'

export type TimelineDataBuilder = {
  setLanes: (lanes: Lane[]) => void
  setPeriods: (periods: Period[]) => void
  addNodeEntity: (
    dateTime: string,
    laneId: string,
    id: string,
    timestampProperty: string,
    entityName: string,
  ) => void
  addRelationEntity: (data: RelationInput, laneId: string) => void
}

/**
 * Builds timeline data (lanes, rows, periods) from raw events, outside any component.
 */
export const createTimelineData = (build: (builder: TimelineDataBuilder) => void): TimelineData => {
  const context = createTimelineContext({ pinia: createPinia() })
  return withTimelineContext(context, () => {
    const { store } = context
    const { addNodeEntity, addRelationEntity } = useTimelineData()
    build({
      setLanes: (lanes) => {
        store.lanes = lanes
      },
      setPeriods: (periods) => {
        store.periods = periods
      },
      addNodeEntity,
      addRelationEntity,
    })
    const data = snapshotTimeline(store)
    store.$dispose()
    return data
  })
}
