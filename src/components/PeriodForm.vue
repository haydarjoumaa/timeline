<template>
  <!-- Add/edit a period: pick a lane, then a start/end row on the timeline (or leave open-ended) -->
  <div class="form-panel">
    <label class="field">
      <span>Lane:</span>
      <select v-model="periodForm.laneId">
        <option value="" disabled>Select a lane</option>
        <option v-for="lane in lanes" :key="lane.id" :value="lane.id">{{ lane.name }}</option>
      </select>
    </label>

    <div v-for="option in periodOptions" :key="option.prop" class="field">
      <span>{{ option.label }}:</span>
      <label class="radio">
        <input
          v-model="periodForm[option.prop]"
          type="radio"
          :value="option.type"
          @change="handlePeriodChange(option.type)"
        />
        Date point
      </label>
      <template v-if="periodForm[option.prop] === option.type">
        <span v-if="periodForm.periodRowId[option.type].id" class="picked-date">
          {{ periodForm.periodRowId[option.type].date }}
          <button class="link-button" @click="handlePeriodChange(option.type)">×</button>
        </span>
        <button v-else @click="toggleHovering(option.type)">
          {{ allowHovering && selectPeriodType === option.type ? 'Click a row…' : 'Select' }}
        </button>
      </template>
      <label class="radio">
        <input
          v-model="periodForm[option.prop]"
          type="radio"
          value="undefined"
          @change="handlePeriodChange(option.type)"
        />
        Undefined
      </label>
    </div>

    <label class="field">
      <span>Annotation:</span>
      <input v-model="periodForm.periodAnnotation" type="text" />
    </label>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <div class="actions">
      <button @click="closeByCancel">Cancel</button>
      <button class="primary" @click="submitPeriod">
        {{ editingPeriodId ? 'Save period' : 'Add period' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DatePointType, PeriodType } from '@/types'
import { usePeriodForm } from '@/composables/usePeriodForm'
import { useTimelineData } from '@/composables/useTimelineData'

const periodOptions: { label: string; prop: DatePointType; type: PeriodType }[] = [
  { label: 'Period start', prop: 'periodStart', type: 'periodStartDatePoint' },
  { label: 'Period end', prop: 'periodEnd', type: 'periodEndDatePoint' },
]

const { lanes } = useTimelineData()
const {
  periodForm,
  errorMessage,
  submitPeriod,
  closeByCancel,
  allowHovering,
  toggleHovering,
  editingPeriodId,
  selectPeriodType,
  handlePeriodChange,
} = usePeriodForm()
</script>

<style scoped>
@import './form.css';

.radio {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.picked-date {
  font-weight: 600;
}
</style>
