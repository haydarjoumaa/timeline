<template>
  <!-- Row backgrounds lining up with each data row; clickable while picking a period end -->
  <g v-for="(row, rowIndex) in rows" :key="row.id" class="rows-bg">
    <rect
      :x="0"
      :width="svgWidth"
      :y="rowY(rowIndex)"
      :height="rowHeight"
      :stroke="rowLineColor"
      :stroke-width="rowLineStrokeWidth"
      :fill="getRowBackgroundColor(row.id)"
      :class="{ selectable: allowHovering }"
      @mouseenter="allowHovering && (hoveredRow = row.id)"
      @mouseleave="hoveredRow = null"
      @click="toggleRow(row)"
    />

    <!-- Dashed separator between consecutive rows sharing the same date -->
    <template v-if="rows[rowIndex - 1]?.date === row.date">
      <line
        :x1="0"
        :x2="svgWidth"
        :y1="rowY(rowIndex)"
        :y2="rowY(rowIndex)"
        :stroke="rowLineBackgroundColor"
        stroke-width="9"
      />
      <line
        :x1="0"
        :x2="svgWidth"
        :y1="rowY(rowIndex)"
        :y2="rowY(rowIndex)"
        :stroke="rowLineColor"
        stroke-width="3"
        stroke-dasharray="8 14"
        stroke-linecap="round"
      />
    </template>
  </g>
</template>

<script setup lang="ts">
import { usePeriodForm } from '@/composables/usePeriodForm'
import type { Row } from '@/types'
import {
  rowHeight,
  rowLineBackgroundColor,
  rowLineColor,
  rowLineStrokeWidth,
} from '@/utils/constants'

const { allowHovering, getRowBackgroundColor, hoveredRow, toggleRow } = usePeriodForm()

defineProps<{
  rows: Row[]
  svgWidth: number
  rowY: (rowIndex: number) => number
}>()
</script>

<style scoped>
.selectable {
  cursor: pointer;
}
</style>
