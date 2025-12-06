<template>
  <g class="global-periods">
    <rect
      v-for="period in periodLayouts"
      :key="period.id"
      :x="period.x"
      :y="period.y"
      :width="period.width"
      :height="period.height"
      :fill="period.color"
      :fill-opacity="period.opacity"
      :stroke="period.color"
      stroke-width="1"
      stroke-opacity="0.6"
      rx="8"
    />
  </g>
</template>

<script setup lang="ts">
import type { PeriodLayout } from '../composables/useTimelineGeometry'

defineProps<{
  periodLayouts: PeriodLayout[]
}>()
</script>
