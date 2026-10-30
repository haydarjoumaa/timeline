<template>
  <!-- Top-level layout: toolbar + split left/right panels -->
  <div class="timeline-wrapper">
    <TimelineToolbar />

    <div class="scroll-wrapper">
      <div class="timeline-layout">
        <LeftPanel />

        <div class="right-panel">
          <div
            ref="panContainer"
            class="pan-container"
            :class="{ 'is-panning': isPanning }"
            @mousedown="startPan"
          >
            <TimelineSvg />
          </div>
        </div>
      </div>
    </div>

    <LaneFormModal />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LeftPanel from './components/LeftPanel.vue'
import TimelineSvg from './components/TimelineSvg.vue'
import TimelineToolbar from './components/TimelineToolbar.vue'
import LaneFormModal from './components/LaneFormModal.vue'
import { seedDemoData } from './utils/demoData'

seedDemoData()

const panContainer = ref<HTMLDivElement | null>(null)
const isPanning = ref(false)
let panStartX = 0
let panStartScrollLeft = 0

const startPan = (event: MouseEvent) => {
  if (!panContainer.value) return
  if (event.button !== 0) return
  const target = event.target as HTMLElement | null
  // Avoid hijacking lane dragging and node interactions
  if (target && target.closest('.lane-group')) return
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

.scroll-wrapper {
  max-height: 85vh;
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

.pan-container :deep(foreignObject),
.pan-container :deep(.lane-group),
.pan-container :deep(.lane-group *) {
  cursor: default;
}
</style>
