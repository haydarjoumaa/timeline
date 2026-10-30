<template>
  <svg ref="svgRef" :width="svgWidth * zoomLevel" :height="svgHeight * zoomLevel">
    <g :transform="`scale(${zoomLevel}, ${zoomLevel})`">
      <RowLines :rows="rows" :svgWidth="svgWidth" :rowY="rowLineY" />

      <LaneGroup
        v-for="lane in lanesWithLayout"
        :key="lane.id"
        :lane="lane"
        :svgHeight="svgHeight"
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
import LaneGroup from './LaneGroup.vue'
import { useTimelineData } from '@/composables/useTimelineData'
import { useTimelineGeometry } from '@/composables/useTimelineGeometry'
import { useTimelineZoom } from '@/composables/useTimelineZoom'

const { svgHeight, svgWidth, rows, lanesWithLayout, handleLaneDrag } = useTimelineData()
const { zoomLevel } = useTimelineZoom()

// Shared geometry helpers are centralized in a composable
const { rowLineY, nodeTranslate, getLanePeriods } = useTimelineGeometry()

const svgRef = ref<SVGSVGElement | null>(null)
let laneDragBehavior: d3.DragBehavior<SVGGElement, unknown, unknown> | null = null

// Re-apply drag behavior to lane groups (after mount or DOM changes)
const applyDragToLanes = () => {
  if (!svgRef.value || !laneDragBehavior) return
  d3.select<SVGSVGElement, unknown>(svgRef.value)
    .selectAll<SVGGElement, unknown>('g.lane-group')
    .call(laneDragBehavior)
}

// D3 drag setup; deltas are divided by zoom so lanes follow the cursor
const setupDrag = () => {
  laneDragBehavior = d3
    .drag<SVGGElement, unknown>()
    // Ignore drag when clicking inside interactive node content
    .filter((event) => {
      const target = event.target as Element | null
      return !(target && typeof target.closest === 'function' && target.closest('.node-foreign'))
    })
    .on('drag', function (event) {
      const laneId = (this as SVGGElement).dataset.laneId
      if (!laneId) return
      handleLaneDrag({ laneId, deltaX: event.dx / zoomLevel.value })
    })

  applyDragToLanes()
}

onMounted(() => {
  setupDrag()
})

watch(
  () => lanesWithLayout.value.map((l) => l.id).join(','),
  async () => {
    await nextTick()
    applyDragToLanes()
  },
)
</script>
