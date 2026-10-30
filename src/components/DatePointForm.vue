<template>
  <!-- Add an entity or a relation to a lane at a given date/time -->
  <div class="form-panel">
    <label class="field">
      <span>Type:</span>
      <select v-model="form.kind">
        <option value="entity">Entity</option>
        <option value="relation">Relation</option>
      </select>
    </label>

    <label class="field">
      <span>Lane:</span>
      <select v-model="form.laneId">
        <option value="" disabled>Select a lane</option>
        <option v-for="lane in lanes" :key="lane.id" :value="lane.id">{{ lane.name }}</option>
      </select>
    </label>

    <template v-if="form.kind === 'entity'">
      <label class="field">
        <span>Entity name:</span>
        <input v-model="form.label" type="text" />
      </label>
    </template>
    <template v-else>
      <label class="field">
        <span>Entity A:</span>
        <input v-model="form.source" type="text" />
      </label>
      <label class="field">
        <span>Relation:</span>
        <input v-model="form.label" type="text" />
      </label>
      <label class="field">
        <span>Entity B:</span>
        <input v-model="form.target" type="text" />
      </label>
    </template>

    <label class="field">
      <span>Timestamp property:</span>
      <input v-model="form.property" type="text" />
    </label>

    <label class="field">
      <span>Date and time:</span>
      <input v-model="form.dateTime" type="datetime-local" step="1" />
    </label>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="actions">
      <button @click="emit('close')">Cancel</button>
      <button class="primary" @click="submit">Add</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useTimelineData } from '@/composables/useTimelineData'
import { fromDateTimeLocal, generateId } from '@/utils/timelineUtils'

const emit = defineEmits<{ (e: 'close'): void }>()

const { lanes, addNodeEntity, addRelationEntity } = useTimelineData()

const form = reactive({
  kind: 'entity' as 'entity' | 'relation',
  laneId: lanes.value[0]?.id ?? '',
  label: '',
  source: '',
  target: '',
  property: '',
  dateTime: '',
})
const error = ref('')

const submit = () => {
  const missingRelationFields = form.kind === 'relation' && (!form.source || !form.target)
  if (!form.laneId || !form.label || !form.dateTime || missingRelationFields) {
    error.value = 'Please fill in all fields'
    return
  }
  const dateTime = fromDateTimeLocal(form.dateTime)
  if (form.kind === 'entity') {
    addNodeEntity(dateTime, form.laneId, generateId(), form.property, form.label)
  } else {
    addRelationEntity(
      {
        id: generateId(),
        source: form.source,
        target: form.target,
        label: form.label,
        property: form.property,
        value: dateTime,
      },
      form.laneId,
    )
  }
  emit('close')
}
</script>

<style scoped>
@import './form.css';
</style>
