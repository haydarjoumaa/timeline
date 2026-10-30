<template>
  <!-- Period bar: start circle (or fade-in), body, end arrow (or fade-out), optional annotation -->
  <g class="period-shape" @click="isEditPeriod = !isEditPeriod">
    <rect
      :x="-lanePeriodWidth / 2"
      :y="0"
      :width="lanePeriodWidth"
      :height="period.height - lanePeriodArrowHeight + 1"
      :fill="lanePeriodBackgroundColor"
      :stroke="color"
      :stroke-width="lanePeriodStrokeWidth"
    />
    <rect
      v-if="period.undefinedPeriod"
      :x="-lanePeriodWidth / 2"
      :y="dashedRectYOffset"
      :width="lanePeriodWidth"
      :height="lanePeriodDashedRectHeight"
      :fill="lanePeriodBackgroundColor"
      :stroke="lanePeriodBackgroundColor"
      :stroke-width="lanePeriodStrokeWidth + 1"
      stroke-dasharray="6 4"
    />

    <circle
      v-if="period.undefinedPeriod !== 'startUndefined'"
      :cx="0"
      :cy="lanePeriodCircleYOffset"
      :r="lanePeriodCircleRadius"
      :fill="color"
    />
    <rect
      v-else
      :x="-lanePeriodWidth / 2 + 2"
      :y="dashedRectYOffset - 2"
      :width="lanePeriodWidth - 4"
      :height="lanePeriodDashedRectHeight"
      :fill="lanePeriodBackgroundColor"
      :stroke="lanePeriodBackgroundColor"
      :stroke-width="lanePeriodStrokeWidth"
    />
    <polygon :points="arrowPoints" :fill="color" />

    <foreignObject
      v-if="period.annotation"
      :x="-lanePeriodAnnotationWidth / 2"
      :y="period.height / 2 - lanePeriodAnnotationHeight / 2"
      :width="lanePeriodAnnotationWidth"
      :height="lanePeriodAnnotationHeight"
    >
      <div xmlns="http://www.w3.org/1999/xhtml" class="annotation-wrapper">
        <div class="annotation" :style="{ backgroundColor: color }">{{ period.annotation }}</div>
      </div>
    </foreignObject>
  </g>

  <foreignObject v-if="isEditPeriod" :x="-35" :y="0" :width="30" :height="60">
    <div xmlns="http://www.w3.org/1999/xhtml" class="node-foreign period-actions">
      <button
        class="icon-button"
        :style="{ backgroundColor: color }"
        title="Edit period"
        @click="editPeriod"
      >
        ✎
      </button>
      <button
        class="icon-button"
        :style="{ backgroundColor: color }"
        title="Delete period"
        @click="deletePeriod(period.id)"
      >
        ✕
      </button>
    </div>
  </foreignObject>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  lanePeriodWidth,
  lanePeriodArrowWidth,
  lanePeriodArrowHeight,
  lanePeriodStrokeWidth,
  lanePeriodCircleRadius,
  lanePeriodCircleYOffset,
  lanePeriodAnnotationWidth,
  lanePeriodBackgroundColor,
  lanePeriodDashedRectHeight,
  lanePeriodAnnotationHeight,
} from '@/utils/constants'
import type { LanePeriod } from '@/types'
import { usePeriodForm } from '@/composables/usePeriodForm'

const props = defineProps<{
  period: LanePeriod
  color: string
  laneId: string
}>()

const { deletePeriod, openEditPeriod } = usePeriodForm()

// Clicking the bar toggles the edit/delete actions for this period only
const isEditPeriod = ref(false)

const editPeriod = () => {
  isEditPeriod.value = false
  openEditPeriod(props.period, props.laneId)
}

// The dashed rect fades out the open end of an undefined period
const dashedRectYOffset = computed(() =>
  props.period.undefinedPeriod === 'startUndefined'
    ? 0
    : props.period.height - lanePeriodArrowHeight - lanePeriodDashedRectHeight,
)

const arrowPoints = computed(() => {
  const { height } = props.period
  const arrowTop = height - lanePeriodArrowHeight
  return `0,${height} ${-lanePeriodArrowWidth},${arrowTop} ${lanePeriodArrowWidth},${arrowTop}`
})
</script>

<style scoped>
.period-shape {
  cursor: pointer;
}

.annotation-wrapper {
  display: flex;
  justify-content: center;
}

.annotation {
  box-sizing: border-box;
  min-width: 35px;
  width: max-content;
  height: 100%;
  padding: 2px;
  color: white;
  font-size: 12px;
  text-align: center;
}

.period-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.icon-button {
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
}
</style>
