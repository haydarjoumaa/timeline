import { defineStore } from 'pinia'
import type { Lane, Period, Row } from '@/types'

interface TimelineState {
  lanes: Lane[]
  rows: Row[]
  lanePositions: Record<string, number>
  periods: Period[]
  nextRowIndex: number
  zoomLevel: number
  nodeClickedId: string
  laneClickedId: string
}

const defaultColor = '#2F5597'

// Built fresh each time so resetting never reuses a mutated lane object
const createDefaultLanes = (): Lane[] => [
  {
    id: 'lane-1',
    name: 'Default Lane',
    order: 1,
    color: defaultColor,
    datePointsColor: defaultColor,
    periodColor: defaultColor,
    filters: { vertices: [], edges: [] },
  },
]

const createInitialState = (): TimelineState => ({
  lanes: createDefaultLanes(),
  rows: [],
  lanePositions: {},
  periods: [],
  nextRowIndex: 1,
  zoomLevel: 1,
  nodeClickedId: '',
  laneClickedId: '',
})

export const useTimelineStore = defineStore('timeline', {
  state: createInitialState,
  actions: {
    setZoomLevel(level: number) {
      this.zoomLevel = level
    },
    setNodeClickedId(id: string) {
      this.nodeClickedId = id
    },
    setLaneClickedId(id: string) {
      this.laneClickedId = id
    },
  },
})
