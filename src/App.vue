<template>
  <!-- Top-level layout: toolbar + split left/right panels -->
  <div class="timeline-wrapper">
    <div class="toolbar">
      <button @click="addRowInMiddle">Add row in middle</button>
      <button @click="addLane">Add lane</button>
    </div>

    <div class="scroll-wrapper">
      <div class="timeline-layout">
        <LeftPanel :rows="rows" :rowHeight="rowHeight" />

        <div class="right-panel">
          <div
            ref="panContainer"
            class="pan-container"
            :class="{ 'is-panning': isPanning }"
            @mousedown="startPan"
          >
            <TimelineSvg
              :rows="rows"
              :rowIndexById="rowIndexById"
              :rowHeight="rowHeight"
              :laneTopOffset="laneTopOffset"
              :lanesWithLayout="lanesWithLayout"
              :svgWidth="svgWidth"
              :svgHeight="svgHeight"
              :nodeRadius="nodeRadius"
              :foreignNodeWidth="foreignNodeWidth"
              :foreignNodeHeight="foreignNodeHeight"
              :periods="periods"
              :periodWidth="periodWidth"
              @lane-drag="handleLaneDrag"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LeftPanel from './components/LeftPanel.vue'
import TimelineSvg from './components/TimelineSvg.vue'
import { useTimelineState } from './composables/useTimelineState'

// All state and actions come from the composable to keep this file declarative
const {
  rowHeight,
  laneTopOffset,
  svgWidth,
  nodeRadius,
  foreignNodeWidth,
  foreignNodeHeight,
  periodWidth,
  rows,
  rowIndexById,
  lanesWithLayout,
  svgHeight,
  periods,
  addRowInMiddle,
  addLane,
  handleLaneDrag,
} = useTimelineState()

const panContainer = ref<HTMLDivElement | null>(null)
const isPanning = ref(false)
let panStartX = 0
let panStartScrollLeft = 0

const startPan = (event: MouseEvent) => {
  if (!panContainer.value) return
  if (event.button !== 0) return
  const target = event.target as HTMLElement | null
  // Avoid hijacking lane dragging interactions
  if (target && target.closest('.lane-group')) return
  // Skip panning when clicking on period overlays or foreignObject content
  if (target && target.closest('.global-periods')) return
  if (target && target.closest('.node-foreign')) return

  isPanning.value = true
  panStartX = event.clientX
  panStartScrollLeft = panContainer.value.scrollLeft
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isPanning.value || !panContainer.value) return
  event.preventDefault()
  const deltaX = event.clientX - panStartX
  panContainer.value.scrollLeft = panStartScrollLeft - deltaX
}

const stopPan = () => {
  if (!isPanning.value) return
  isPanning.value = false
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopPan)
  window.addEventListener('mouseleave', stopPan)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', stopPan)
  window.removeEventListener('mouseleave', stopPan)
})
</script>

<style scoped>
.timeline-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.toolbar {
  padding: 4px 0;
  display: flex;
  gap: 8px;
}

.toolbar button {
  padding: 4px 10px;
  font-size: 13px;
  cursor: pointer;
}

.scroll-wrapper {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
}

.timeline-layout {
  display: flex;
  border: 1px solid #ddd;
}

.right-panel {
  flex: 1;
  min-width: 0;
}

.pan-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: default;
  scrollbar-width: none;
}

.pan-container::-webkit-scrollbar {
  height: 0;
}

.pan-container :deep(svg) {
  cursor: grab;
}

.pan-container.is-panning :deep(svg) {
  cursor: grabbing;
}

.pan-container :deep(.global-periods rect),
.pan-container :deep(.node-foreign),
.pan-container :deep(.node-foreign *),
.pan-container :deep(foreignObject),
.pan-container :deep(.lane-group),
.pan-container :deep(.lane-group *) {
  cursor: default;
}

.pan-container .global-periods rect,
.pan-container .node-foreign,
.pan-container .lane-group,
.pan-container .lane-group * {
  cursor: default;
}
</style>
