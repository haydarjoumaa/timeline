<template>
  <div class="entity-node">
    <img
      :src="backgroundImage"
      class="entity-image"
      :class="{ clickable: !!vertexId }"
      :style="{
        backgroundColor: backgroundColor || color,
        width: `${laneEntityNodeWidth}px`,
        height: `${laneEntityNodeHeight}px`,
        ...(isClicked && entityNodeSelectedStyle),
      }"
      alt=""
      @click="vertexId && laneId && handleEntityNodeClick(laneId, vertexId)"
    />
    <div v-if="label" class="entity-label" :title="label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useColorDatePoints } from '@/composables/useColorDatePoints'
import {
  entityNodeSelectedStyle,
  laneEntityNodeHeight,
  laneEntityNodeWidth,
} from '@/utils/constants'

// vertexId/laneId are omitted for display-only nodes (e.g. relation endpoints)
const props = defineProps<{
  vertexId?: string
  laneId?: string
  color?: string
  label?: string
  backgroundColor?: string
  backgroundImage?: string
}>()

const { nodeClickedId, handleEntityNodeClick } = useColorDatePoints()

const isClicked = computed(() => !!props.vertexId && nodeClickedId.value === props.vertexId)
</script>

<style scoped>
.entity-node {
  display: flex;
  align-items: center;
  gap: 4px;
}

.entity-image {
  box-sizing: border-box;
  border-radius: 50%;
  padding: 5px;
  flex-shrink: 0;
}

.entity-image.clickable {
  cursor: pointer;
}

.entity-label {
  font-size: 11px;
  max-width: 30ch;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
