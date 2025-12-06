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
</template>

<script setup lang="ts">
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
}
</style>
