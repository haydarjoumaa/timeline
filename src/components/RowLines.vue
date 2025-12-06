<template>
  <!-- Horizontal guides lining up with each data row -->
  <g class="rows-bg">
    <line
      v-for="(row, rowIndex) in rows"
      :key="'bg-' + row.id"
      :x1="0"
      :x2="svgWidth"
      :y1="rowY(rowIndex)"
      :y2="rowY(rowIndex)"
      stroke="#f0f0f0"
      stroke-width="1"
    />
  </g>
</template>

<script setup lang="ts">
import type { Row } from '../composables/useTimelineGeometry'

defineProps<{
  rows: Row[]
  svgWidth: number
  rowY: (rowIndex: number) => number
}>()
</script>

<style scoped>
.rows-bg line {
  stroke: #f5f5f5;
}
</style>
