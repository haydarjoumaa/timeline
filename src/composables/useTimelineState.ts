import { ref, computed } from 'vue'
import type { Lane, Period, Vertex } from './useTimelineGeometry'

/**
 * Centralizes timeline state (rows, lanes, periods) and mutations.
 * Keeps App.vue lean and provides a single source of truth for layout constants.
 */
export function useTimelineState() {
  // Layout constants (tweak here to change the entire view)
  const rowHeight = 50
  const laneTopOffset = 30
  const laneSpacing = 140
  const svgWidth = 800
  const nodeRadius = 8
  const foreignNodeWidth = 90
  const foreignNodeHeight = 36
  const periodWidth = 16

  // Rows
  const rows = ref([
    { id: 'R1', date: '2024-01-01', note: 'First event' },
    { id: 'R2', date: '2024-01-05', note: 'Important call' },
    { id: 'R3', date: '2024-01-10', note: 'Money transfer' },
    { id: 'R4', date: '2024-01-15', note: 'Meeting' },
  ])

  // Map rowId -> index for quick lookups
  const rowIndexById = computed(() => {
    const map: Record<string, number> = {}
    rows.value.forEach((row, index) => {
      map[row.id] = index
    })
    return map
  })

  // Lanes
  const lanes = ref<Lane[]>([
    {
      id: 'lane-1',
      name: 'Communications',
      order: 1,
      color: '#66BBEE',
      filters: {
        vertices: [
          { id: 'v-1', rowId: 'R1' },
          { id: 'v-2', rowId: 'R3', useHtml: true, label: 'Note' },
        ],
      },
    },
    {
      id: 'lane-2',
      name: 'Money',
      order: 2,
      color: '#FF9900',
      filters: {
        vertices: [
          { id: 'v-3', rowId: 'R2' },
          { id: 'v-4', rowId: 'R4' },
        ],
      },
    },
  ])

  // Track current x position per lane (mutated by drag)
  const lanePositions = ref<Record<string, number>>({})

  const laneBaseX = (lane: Lane, idx: number) => (lane.order ?? idx + 1) * laneSpacing

  // Seed initial lane positions from order/index
  lanes.value.forEach((lane, idx) => {
    lanePositions.value[lane.id] = laneBaseX(lane, idx)
  })

  // Attach x layout to each lane for rendering
  const lanesWithLayout = computed(() =>
    lanes.value.map((lane, idx) => ({
      ...lane,
      x: lanePositions.value[lane.id] ?? laneBaseX(lane, idx),
    })),
  )

  // Periods (can reference nodes on any lane)
  const periods = ref<Period[]>([
    {
      id: 'period-1',
      from: { laneId: 'lane-1', vertexId: 'v-2' },
      to: { laneId: 'lane-2', vertexId: 'v-3' },
      color: '#555',
      opacity: 0.16,
      padding: 8,
    },
  ])

  // Derived sizing
  const svgHeight = computed(() => rows.value.length * rowHeight + laneTopOffset + 40)

  // Actions
  const nextRowIndex = ref(5)
  const addRowInMiddle = () => {
    const currentLength = rows.value.length
    const middleIndex = Math.floor(currentLength / 2)
    const newNumber = nextRowIndex.value++
    const newRow = {
      id: `R${newNumber}`,
      date: `2024-02-${String(newNumber).padStart(2, '0')}`,
      note: `Inserted row #${newNumber}`,
    }
    rows.value.splice(middleIndex, 0, newRow)
  }

  const nextLaneIndex = ref(3)
  const laneColors = ['#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c']

  const addLane = () => {
    // Place new lane just after the rightmost current lane (respects drag position)
    const maxX =
      lanesWithLayout.value.length === 0
        ? 0
        : Math.max(...lanesWithLayout.value.map((lane) => lane.x))
    const newX = maxX + laneSpacing
    const idx = nextLaneIndex.value++
    const color = laneColors[(idx - 1) % laneColors.length]

    lanes.value.push({
      id: `lane-${idx}`,
      name: `Lane ${idx}`,
      order: lanes.value.length + 1,
      color,
      filters: {
        vertices: [{ id: `v-${idx}-1`, rowId: 'R1' }],
      },
    })

    lanePositions.value = { ...lanePositions.value, [`lane-${idx}`]: newX }
  }

  // Apply drag delta to the lane's x position
  const handleLaneDrag = (payload: { laneId: string; deltaX: number }) => {
    const lane = lanes.value.find((l) => l.id === payload.laneId)
    if (!lane) return
    const idx = lanes.value.findIndex((l) => l.id === payload.laneId)
    const currentX = lanePositions.value[payload.laneId] ?? laneBaseX(lane, idx)
    lanePositions.value = {
      ...lanePositions.value,
      [payload.laneId]: currentX + payload.deltaX,
    }
  }

  return {
    // constants
    rowHeight,
    laneTopOffset,
    laneSpacing,
    svgWidth,
    nodeRadius,
    foreignNodeWidth,
    foreignNodeHeight,
    periodWidth,
    // state
    rows,
    rowIndexById,
    lanes,
    lanesWithLayout,
    periods,
    lanePositions,
    // derived
    svgHeight,
    // actions
    addRowInMiddle,
    addLane,
    handleLaneDrag,
  }
}
