<template>
  <div v-if="isLaneModalOpen" class="modal-overlay" @click.self="closeLaneModal">
    <div class="form-panel" role="dialog">
      <h3>{{ editingLaneId ? 'Edit lane' : 'Add lane' }}</h3>

      <label class="field">
        <span>Lane name:</span>
        <input v-model="laneForm.name" type="text" @keydown.enter="submitLaneForm" />
      </label>
      <label class="field">
        <span>Lane color:</span>
        <input
          v-model="laneForm.laneColor"
          type="color"
          @input="handleLaneColorChange(laneForm.laneColor)"
        />
      </label>
      <label class="field">
        <span>Date points color:</span>
        <input v-model="laneForm.datePointsColor" type="color" />
      </label>
      <label class="field">
        <span>Period color:</span>
        <input v-model="laneForm.periodColor" type="color" />
      </label>

      <div v-if="laneFormError" class="error">{{ laneFormError }}</div>

      <div class="actions">
        <button @click="closeLaneModal">Cancel</button>
        <button class="primary" @click="submitLaneForm">
          {{ editingLaneId ? 'Save' : 'Add' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLaneForm } from '@/composables/useLaneForm'

const {
  laneForm,
  laneFormError,
  editingLaneId,
  isLaneModalOpen,
  closeLaneModal,
  submitLaneForm,
  handleLaneColorChange,
} = useLaneForm()
</script>

<style scoped>
@import './form.css';

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

h3 {
  margin: 0 0 4px;
  font-size: 15px;
}
</style>
