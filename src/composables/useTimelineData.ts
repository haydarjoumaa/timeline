import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTimelineStore } from '@/stores/timeline'
import type { Edge, Lane, RelationInput, Vertex } from '@/types'
import {
  laneSpacing,
  laneStartOffset,
  laneTopOffset,
  minSvgWidth,
  rowHeight,
} from '@/utils/constants'
import { parseDate } from '@/utils/timelineUtils'
import entityNodeIcon from '@/assets/entity-node.svg'

/**
 * Single source of truth for timeline data (lanes, rows, periods) and its mutations.
 */
export const useTimelineData = () => {
  const store = useTimelineStore()
  const { lanes, rows, lanePositions, periods, nextRowIndex } = storeToRefs(store)

  // Map rowId -> index for quick lookups
  const rowIndexById = computed(() => {
    const map: Record<string, number> = {}
    for (const [index, row] of rows.value.entries()) {
      map[row.id] = index
    }
    return map
  })

  const laneBaseX = (lane: Lane, idx: number) =>
    laneStartOffset + (lane.order ?? idx + 1) * laneSpacing

  // Attach x layout to each lane for rendering
  const lanesWithLayout = computed(() =>
    lanes.value.map((lane, idx) => ({
      ...lane,
      x: lanePositions.value[lane.id] ?? laneBaseX(lane, idx),
    })),
  )

  const svgWidth = computed(() => {
    const margin = 160
    const laneXs = lanesWithLayout.value.map((l) => l.x)
    const maxLaneX = laneXs.length ? Math.max(...laneXs) : minSvgWidth
    return Math.max(minSvgWidth, maxLaneX + margin)
  })

  const svgHeight = computed(() => rows.value.length * rowHeight + laneTopOffset)

  const getLane = (laneId: string) => lanes.value.find((l) => l.id === laneId)

  const getLaneVertices = (laneId: string): (Vertex | Edge)[] => {
    const lane = getLane(laneId)
    return lane ? [...lane.filters.vertices, ...lane.filters.edges] : []
  }

  const isRowUsedByLane = (lane: Lane, rowId: string) =>
    lane.filters.vertices.some((v) => v.rowId === rowId) ||
    lane.filters.edges.some((e) => e.rowId === rowId)

  // Reuse the row for this date unless the lane already has a node on it
  const ensureRowIdForLaneDate = (dateTime: string, lane: Lane, timestampProperty: string) => {
    const note = { timestampProperty, laneId: lane.id, color: lane.color }
    const existingRow = rows.value.find((r) => r.date === dateTime)

    if (existingRow && !isRowUsedByLane(lane, existingRow.id)) {
      existingRow.note.push(note)
      return existingRow.id
    }

    const newRow = { id: `R${nextRowIndex.value++}`, date: dateTime, note: [note] }
    rows.value = [...rows.value, newRow].sort((a, b) => parseDate(a.date) - parseDate(b.date))
    return newRow.id
  }

  /** Delete row only if no vertex/edge references it anywhere */
  const cleanupRowIfUnused = (rowId: string, laneId: string) => {
    const stillUsed = lanes.value.some((lane) => isRowUsedByLane(lane, rowId))
    if (!stillUsed) {
      rows.value = rows.value.filter((r) => r.id !== rowId)
      return
    }
    rows.value = rows.value.map((r) =>
      r.id === rowId ? { ...r, note: r.note.filter((n) => n.laneId !== laneId) } : r,
    )
  }

  const touchLanes = () => {
    lanes.value = [...lanes.value]
  }

  const addNodeEntity = (
    dateTime: string,
    laneId: string,
    id: string,
    timestampProperty: string,
    entityName: string,
  ) => {
    const lane = getLane(laneId)
    if (!lane) return
    // avoid duplicates
    if (lane.filters.vertices.some((v) => v.id === id)) return

    const rowId = ensureRowIdForLaneDate(dateTime, lane, timestampProperty)
    lane.filters.vertices.push({
      id,
      rowId,
      dateTime,
      backgroundImage: entityNodeIcon,
      label: entityName,
    })
    touchLanes()
  }

  const addRelationEntity = (data: RelationInput, laneId: string) => {
    const lane = getLane(laneId)
    if (!lane) return
    // avoid duplicates
    if (lane.filters.edges.some((e) => e.id === data.id)) return

    const rowId = ensureRowIdForLaneDate(data.value, lane, data.property)
    lane.filters.edges.push({
      id: data.id,
      rowId,
      source: data.source,
      target: data.target,
      relationType: data.label,
      timestampPropertyType: data.property,
      dateTime: data.value,
      backgroundImage: entityNodeIcon,
    })
    touchLanes()
  }

  // Apply drag delta to the lane's x position
  const handleLaneDrag = (payload: { laneId: string; deltaX: number }) => {
    const idx = lanes.value.findIndex((l) => l.id === payload.laneId)
    const lane = lanes.value[idx]
    if (!lane) return
    const currentX = lanePositions.value[payload.laneId] ?? laneBaseX(lane, idx)
    lanePositions.value = {
      ...lanePositions.value,
      [payload.laneId]: currentX + payload.deltaX,
    }
  }

  // Find the id of the vertex/edge a lane has on the given row
  const findVertexById = (laneId: string, rowId: string) => {
    if (!rowId) return
    return getLaneVertices(laneId).find((v) => v.rowId === rowId)?.id
  }

  const getPeriodColor = (laneId: string): string => {
    const lane = getLane(laneId)
    if (!lane) return '#000000'
    return lane.periodColor ?? lane.color
  }

  const setColorForDatePointForVertex = (laneId: string, vertexId: string, color: string) => {
    const vertex = getLane(laneId)?.filters.vertices.find((v) => v.id === vertexId)
    if (!vertex) return
    vertex.backgroundColor = color
    touchLanes()
  }

  const setColorForDatePointRowNote = (laneId: string, vertexId: string, color: string) => {
    const vertex = getLane(laneId)?.filters.vertices.find((v) => v.id === vertexId)
    const rowToUpdate = vertex && rows.value.find((r) => r.id === vertex.rowId)
    if (!rowToUpdate) return
    rowToUpdate.note = rowToUpdate.note.map((n) => (n.laneId === laneId ? { ...n, color } : n))
    rows.value = [...rows.value]
  }

  const getPeriodById = (id: string) => periods.value.find((p) => p.id === id)

  const deleteLane = (laneId: string) => {
    if (!window.confirm('Are you sure you want to delete this lane?')) return

    const laneToDelete = getLane(laneId)
    if (!laneToDelete) return
    lanes.value = lanes.value.filter((l) => l.id !== laneId)
    periods.value = periods.value.filter((p) => p.from.laneId !== laneId && p.to.laneId !== laneId)
    for (const v of [...laneToDelete.filters.vertices, ...laneToDelete.filters.edges]) {
      cleanupRowIfUnused(v.rowId, laneId)
    }
  }

  return {
    rows,
    lanes,
    periods,
    svgWidth,
    svgHeight,
    deleteLane,
    rowIndexById,
    getPeriodById,
    lanePositions,
    getPeriodColor,
    handleLaneDrag,
    findVertexById,
    getLaneVertices,
    lanesWithLayout,
    addNodeEntity,
    addRelationEntity,
    setColorForDatePointRowNote,
    setColorForDatePointForVertex,
  }
}
