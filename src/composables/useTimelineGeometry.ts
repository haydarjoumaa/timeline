import { computed, type ComputedRef } from 'vue'

export type Row = { id: string; date: string; note: string }
export type Vertex = { id: string; rowId: string; useHtml?: boolean; label?: string }
export type Lane = {
  id: string
  name: string
  order?: number
  color: string
  filters: { vertices: Vertex[] }
}
export type LaneWithLayout = Lane & { x: number }
export type Period = {
  id: string
  from: { laneId: string; vertexId: string }
  to: { laneId: string; vertexId: string }
  color?: string
  opacity?: number
  padding?: number
}

export type PeriodLayout = {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  opacity: number
}

type GeometryOptions = {
  rows: () => Row[]
  rowIndexById: () => Record<string, number>
  rowHeight: number
  laneTopOffset: number
  nodeRadius: number
  foreignNodeWidth: number
  foreignNodeHeight: number
  periodWidth: number
  periods: () => Period[]
  lanesWithLayout: () => LaneWithLayout[]
}

/**
 * Centralizes geometry helpers so multiple components can share positioning math.
 */
export function useTimelineGeometry(options: GeometryOptions) {
  // Compute y center for a given row index, including header offset
  const rowY = (rowIndex: number) =>
    rowIndex * options.rowHeight + options.rowHeight / 2 + 21 + options.laneTopOffset

  // Position a vertex relative to the lane origin (applies different offsets for HTML vs circle)
  const vertexYRelative = (vertex: Vertex) => {
    const idx = options.rowIndexById()[vertex.rowId]
    const base = rowY(idx)
    const offset = vertex.useHtml ? options.rowHeight / 4 : options.rowHeight / 2
    return base - options.laneTopOffset - offset
  }

  // Size of a vertex depending on rendering mode
  const vertexSize = (vertex: Vertex) =>
    vertex.useHtml
      ? { width: options.foreignNodeWidth, height: options.foreignNodeHeight }
      : { width: options.nodeRadius * 2, height: options.nodeRadius * 2 }

  const nodeTranslate = (vertex: Vertex) => `translate(0, ${vertexYRelative(vertex)})`

  // Global SVG coordinates for a vertex
  const vertexGlobalPosition = (laneId: string, vertexId: string) => {
    const lane = options.lanesWithLayout().find((l) => l.id === laneId)
    if (!lane) return null
    const vertex = lane.filters.vertices.find((v) => v.id === vertexId)
    if (!vertex) return null
    const y = vertexYRelative(vertex) + options.laneTopOffset
    const size = vertexSize(vertex)
    return { x: lane.x, y, color: lane.color, size }
  }

  const periodLayouts: ComputedRef<PeriodLayout[]> = computed(() =>
    options.periods()
      .map((p) => {
        const from = vertexGlobalPosition(p.from.laneId, p.from.vertexId)
        const to = vertexGlobalPosition(p.to.laneId, p.to.vertexId)
        if (!from || !to) return null
        const pad = p.padding ?? 6
        const minX = Math.min(from.x - from.size.width / 2, to.x - to.size.width / 2) - pad
        const minY = Math.min(from.y - from.size.height / 2, to.y - to.size.height / 2) - pad
        const maxX = Math.max(from.x + from.size.width / 2, to.x + to.size.width / 2) + pad
        const maxY = Math.max(from.y + from.size.height / 2, to.y + to.size.height / 2) + pad
        const width = Math.max(maxX - minX, options.periodWidth)
        const height = Math.max(maxY - minY, options.periodWidth)
        return {
          id: p.id,
          x: minX,
          y: minY,
          width,
          height,
          color: p.color ?? from.color ?? '#777',
          opacity: p.opacity ?? 0.18,
        }
      })
      .filter(Boolean) as PeriodLayout[],
  )

  // Period rectangles within a single lane (between adjacent vertices)
  const getLanePeriods = (lane: Lane) => {
    const verts = lane.filters?.vertices ?? []
    const sorted = [...verts].sort(
      (a, b) => options.rowIndexById()[a.rowId] - options.rowIndexById()[b.rowId],
    )
    const periods: { id: string; y: number; height: number; width: number }[] = []
    for (let i = 0; i < sorted.length - 1; i++) {
      const v1 = sorted[i]
      const v2 = sorted[i + 1]
      const y1 = vertexYRelative(v1)
      const y2 = vertexYRelative(v2)
      const size1 = vertexSize(v1)
      const size2 = vertexSize(v2)
      const minY = Math.min(y1 - size1.height / 2, y2 - size2.height / 2)
      const maxY = Math.max(y1 + size1.height / 2, y2 + size2.height / 2)
      const width = Math.max(options.periodWidth, size1.width, size2.width)
      periods.push({
        id: `${v1.id}-${v2.id}`,
        y: minY,
        height: maxY - minY,
        width,
      })
    }
    return periods
  }

  return {
    rowY,
    vertexYRelative,
    vertexSize,
    nodeTranslate,
    vertexGlobalPosition,
    periodLayouts,
    getLanePeriods,
  }
}
