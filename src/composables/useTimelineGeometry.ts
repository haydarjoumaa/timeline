import type { Edge, Lane, LanePeriod, LaneUndefinedPeriodType, Vertex } from '@/types'
import {
  foreignNodeHeight,
  foreignRelationHeight,
  foreignRelationWidth,
  lanePeriodArrowHeight,
  laneTopOffset,
  offsetBetweenPeriods,
  periodWidth,
  rowHeight,
} from '@/utils/constants'
import { useTimelineData } from './useTimelineData'

/**
 * Centralizes geometry helpers so multiple components can share positioning math.
 */
export const useTimelineGeometry = () => {
  const { rowIndexById, lanesWithLayout, svgHeight, periods } = useTimelineData()

  // Compute y center for a given row index
  const rowY = (rowIndex: number) => rowIndex * rowHeight + rowHeight / 2

  // Top edge of a row's background, including the lane header offset
  const rowLineY = (rowIndex: number) => rowIndex * rowHeight + laneTopOffset

  // Position a vertex relative to the lane origin
  const vertexYRelative = (vertex: Vertex | Edge) => rowY(rowIndexById.value[vertex.rowId] ?? 0)

  // Size of a node depending on whether the lane holds relations
  const vertexSize = (isRelationExist: boolean) =>
    isRelationExist
      ? { width: offsetBetweenPeriods, height: foreignNodeHeight }
      : { width: foreignRelationWidth, height: foreignRelationHeight }

  const nodeTranslate = (vertex: Vertex | Edge) => `translate(0, ${vertexYRelative(vertex)})`

  const findVertex = (laneId: string, vertexId: string) => {
    const lane = lanesWithLayout.value.find((l) => l.id === laneId)
    if (!lane) return null
    const vertex =
      lane.filters.vertices.find((v) => v.id === vertexId) ??
      lane.filters.edges.find((e) => e.id === vertexId)
    return { lane, vertex }
  }

  // Period bars within a single lane; a missing endpoint means an open-ended period
  const getLanePeriods = (lane: Lane) => {
    const lanePeriods: LanePeriod[] = []

    for (const period of periods.value) {
      // Only consider periods that touch this lane
      if (period.from.laneId !== lane.id && period.to.laneId !== lane.id) continue

      const from = findVertex(period.from.laneId, period.from.vertexId)
      const to = findVertex(period.to.laneId, period.to.vertexId)
      if (!from || !to) continue

      const startPeriodUndefined: LaneUndefinedPeriodType = !from.vertex && 'startUndefined'
      const endPeriodUndefined: LaneUndefinedPeriodType = !to.vertex && 'endUndefined'

      const y1 = from.vertex ? vertexYRelative(from.vertex) : laneTopOffset / 2
      const y2 = to.vertex
        ? vertexYRelative(to.vertex)
        : svgHeight.value - laneTopOffset - lanePeriodArrowHeight + foreignNodeHeight / 6
      const size = vertexSize(!lane.filters.edges.length)

      // Shift each additional period sideways so they don't overlap
      const existingForLane = lanePeriods.filter((p) => p.from === period.to.laneId)
      const xOffset = existingForLane.length * offsetBetweenPeriods + 20

      const minY = Math.min(y1, y2) - foreignNodeHeight / 6
      const maxY = Math.max(y1, y2) + foreignNodeHeight / 6

      lanePeriods.push({
        id: period.id,
        y: minY,
        undefinedPeriod: startPeriodUndefined || endPeriodUndefined,
        height: maxY - minY,
        width: Math.max(periodWidth, size.width),
        color: lane.color,
        from: period.from.laneId,
        to: period.to.laneId,
        annotation: period.annotation,
        xOffset,
      })
    }
    return lanePeriods
  }

  return {
    rowLineY,
    nodeTranslate,
    getLanePeriods,
  }
}
