<template>
  <div class="toolbar-wrapper">
    <div class="toolbar">
      <button @click="openLaneModal(null)">Add lane</button>
      <button @click="togglePanel('datePoint')">Add date point</button>
      <button @click="togglePanel('period')">Add period</button>

      <label class="color-picker" :class="{ disabled: !nodeClickedId }">
        Color date point
        <input
          type="color"
          :disabled="!nodeClickedId"
          :title="nodeClickedId ? 'Pick a color for the selected node' : 'Click a node first'"
          @change="onColorChange"
        />
      </label>

      <span class="separator" />

      <button title="Zoom out" @click="zoomOut">−</button>
      <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
      <button title="Zoom in" @click="zoomIn">+</button>
      <button @click="resetZoom">Reset</button>
    </div>

    <div v-if="openPanel === 'datePoint'" class="panel">
      <DatePointForm @close="openPanel = null" />
    </div>
    <div v-if="periodFormVisible" class="panel">
      <PeriodForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePointForm from './DatePointForm.vue'
import PeriodForm from './PeriodForm.vue'
import { useLaneForm } from '@/composables/useLaneForm'
import { usePeriodForm } from '@/composables/usePeriodForm'
import { useColorDatePoints } from '@/composables/useColorDatePoints'
import { useTimelineZoom } from '@/composables/useTimelineZoom'

const { openLaneModal } = useLaneForm()
const { visible: periodFormVisible, openAddPeriod, closeByCancel } = usePeriodForm()
const { nodeClickedId, setColorForDatePoint } = useColorDatePoints()
const { zoomIn, zoomOut, zoomLevel, resetZoom } = useTimelineZoom()

const openPanel = ref<'datePoint' | null>(null)

// Only one form panel open at a time
const togglePanel = (panel: 'datePoint' | 'period') => {
  if (panel === 'period') {
    openPanel.value = null
    if (periodFormVisible.value) closeByCancel()
    else openAddPeriod()
    return
  }
  closeByCancel()
  openPanel.value = openPanel.value === panel ? null : panel
}

const onColorChange = (event: Event) => {
  setColorForDatePoint((event.target as HTMLInputElement).value)
}
</script>

<style scoped>
.toolbar-wrapper {
  position: relative;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.toolbar button {
  padding: 4px 10px;
  font-size: 13px;
  cursor: pointer;
}

.color-picker {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}

.color-picker.disabled {
  opacity: 0.5;
}

.separator {
  width: 1px;
  height: 20px;
  background: #ddd;
}

.zoom-level {
  min-width: 40px;
  font-size: 13px;
  text-align: center;
}

.panel {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 5;
}
</style>
