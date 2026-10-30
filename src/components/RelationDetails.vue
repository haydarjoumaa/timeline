<template>
  <!-- Relation card: source entity -> relation type -> target entity -->
  <div class="relation-card">
    <EntityNode :backgroundImage="edge.backgroundImage" :backgroundColor="color" />
    <div class="relation-info">
      <div class="line-clamp">{{ edge.source }}</div>
      <div class="line-clamp relation-type">{{ edge.relationType }}</div>
      <div class="arrow">⟶</div>
      <div class="line-clamp">{{ edge.target }}</div>
    </div>
    <EntityNode :backgroundImage="edge.backgroundImage" :backgroundColor="color" />
  </div>
</template>

<script setup lang="ts">
import type { Edge } from '@/types'
import EntityNode from './EntityNode.vue'

defineProps<{
  edge: Edge
  color: string
}>()
</script>

<style scoped>
.relation-card {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 8px;
  background: #e8f4fe;
  border: 1px solid black;
  border-radius: 24px;
}

.relation-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  color: #111827;
  min-width: 0;
}

.line-clamp {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.relation-type {
  font-weight: 700;
  margin-top: 2px;
}

.arrow {
  font-size: 20px;
  line-height: 1;
}
</style>
