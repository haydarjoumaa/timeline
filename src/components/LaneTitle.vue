<template>
  <div class="lane-title">
    <span class="lane-name" :style="{ color: lane.color }">{{ lane.name }}</span>
    <button
      class="icon-button"
      :style="{ backgroundColor: lane.color }"
      title="Edit lane"
      @click="openLaneModal(lane)"
    >
      ✎
    </button>
    <button
      class="icon-button"
      :style="{ backgroundColor: lane.color }"
      title="Delete lane"
      @click="deleteLane(lane.id)"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Lane } from '@/types'
import { useLaneForm } from '@/composables/useLaneForm'
import { useTimelineData } from '@/composables/useTimelineData'

defineProps<{
  lane: Lane
}>()

const { deleteLane } = useTimelineData()
const { openLaneModal } = useLaneForm()
</script>

<style scoped>
.lane-title {
  display: flex;
  align-items: center;
  gap: 4px;
}

.lane-name {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.icon-button {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 11px;
  line-height: 20px;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
