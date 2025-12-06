<template>
  <svg ref="svgRef" :width="svgWidth" :height="svgHeight">
    <g :transform="`translate(0, 0)`">
      <RowLines :rows="rows" :svgWidth="svgWidth" :rowY="rowY" />

      <GlobalPeriods :periodLayouts="periodLayouts" />

      <LaneGroup
        v-for="lane in lanesWithLayout"
        :key="lane.id"
        :lane="lane"
        :laneTopOffset="laneTopOffset"
        :svgHeight="svgHeight"
        :nodeRadius="nodeRadius"
        :foreignNodeWidth="foreignNodeWidth"
        :foreignNodeHeight="foreignNodeHeight"
        :lanePeriods="getLanePeriods(lane)"
        :nodeTranslate="nodeTranslate"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import RowLines from './RowLines.vue'
import GlobalPeriods from './GlobalPeriods.vue'
import LaneGroup from './LaneGroup.vue'
import {
  useTimelineGeometry,
  type Row,
  type LaneWithLayout,
  type Period,
  type Vertex,
} from '../composables/useTimelineGeometry'

// Display-only props for the timeline; data and sizing come from the parent
const props = defineProps<{
  rows: Row[]
  rowIndexById: Record<string, number>
  rowHeight: number
  laneTopOffset: number
  lanesWithLayout: LaneWithLayout[]
  svgWidth: number
  svgHeight: number
  nodeRadius: number
  foreignNodeWidth: number
  foreignNodeHeight: number
  periods: Period[]
  periodWidth: number
}>()

const emit = defineEmits<{
  (e: 'lane-drag', payload: { laneId: string; deltaX: number }): void
}>()

const svgRef = ref<SVGSVGElement | null>(null)
let laneDragBehavior: d3.DragBehavior<SVGGElement, unknown, unknown> | null = null

// Shared geometry helpers are centralized in a composable
const { rowY, nodeTranslate, periodLayouts, getLanePeriods } = useTimelineGeometry({
  rows: () => props.rows,
  rowIndexById: () => props.rowIndexById,
  rowHeight: props.rowHeight,
  laneTopOffset: props.laneTopOffset,
  nodeRadius: props.nodeRadius,
  foreignNodeWidth: props.foreignNodeWidth,
  foreignNodeHeight: props.foreignNodeHeight,
  periodWidth: props.periodWidth,
  periods: () => props.periods,
  lanesWithLayout: () => props.lanesWithLayout,
})

// Re-apply drag behavior to lane groups (after mount or DOM changes)
const applyDragToLanes = () => {
  if (!svgRef.value || !laneDragBehavior) return
  const svg = d3.select<SVGSVGElement, unknown>(svgRef.value)
  svg.selectAll<SVGGElement, unknown>('g.lane-group').call(laneDragBehavior as any)
}

// D3 drag setup; emits lane-drag for state mutation upstream
const setupDrag = () => {
  laneDragBehavior = d3
    .drag<SVGGElement, unknown>()
    // Ignore drag when clicking inside a foreignObject node
    .filter((event) => {
      const target = event.target as Element | null
      return !(target && typeof target.closest === 'function' && target.closest('.node-foreign'))
    })
    .on('drag', function (event) {
      const el = this as SVGGElement
      const laneId = el.dataset.laneId
      if (!laneId) return
      emit('lane-drag', { laneId, deltaX: event.dx })
    })

  applyDragToLanes()
}

onMounted(() => {
  setupDrag()
})

watch(
  () => props.lanesWithLayout.map((l) => l.id).join(','),
  async () => {
    await nextTick()
    applyDragToLanes()
  },
)
</script>
