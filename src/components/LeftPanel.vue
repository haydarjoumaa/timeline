<template>
  <!-- Static table for dates/notes aligned with the timeline rows -->
  <div class="left-panel">
    <div class="panel-header-left">
      <div class="cell cell-date">Date</div>
      <div class="cell cell-note">Note</div>
    </div>

    <div
      v-for="(row, rowIndex) in rows"
      :key="row.id"
      class="row-item"
      :style="{ height: rowHeight + 'px' }"
    >
      <div class="cell cell-date">{{ row.date }}</div>
      <div class="cell cell-note">{{ row.note }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
type Row = { id: string; date: string; note: string }

defineProps<{
  rows: Row[]
  rowHeight: number
}>()
</script>

<style scoped>
.left-panel {
  width: 320px;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
}

.panel-header-left {
  display: grid;
  grid-template-columns: 110px 1fr;
  font-size: 12px;
  font-weight: 600;
  background: #f7f7f7;
  border-bottom: 1px solid #ddd;
}

.row-item {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  box-sizing: border-box;
  padding: 0 8px;
  border-bottom: 1px solid #f0f0f0;
}

.cell {
  padding: 4px 4px;
}

.cell-date {
  color: #666;
  font-size: 12px;
}

.cell-note {
  font-size: 13px;
}
</style>
