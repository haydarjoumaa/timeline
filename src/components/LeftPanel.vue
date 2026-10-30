<template>
  <!-- Dates and per-lane notes aligned with the timeline rows; rows sharing a date are grouped -->
  <div class="left-panel" :style="{ width: `${leftPanelWidth}px` }">
    <div
      class="panel-header"
      :style="{
        height: `${headerHeight}px`,
        gridTemplateColumns: `${dateColWidth}px 1fr`,
        fontSize: headerFontSize,
      }"
    >
      <div :style="cellPadding">Date</div>
      <div :style="cellPadding">Note</div>
    </div>

    <div
      v-for="group in groupedRows"
      :key="group.date"
      class="row-group"
      :style="{
        gridTemplateColumns: `${dateColWidth}px 1fr`,
        gridTemplateRows: `repeat(${group.items.length}, ${scaledRowHeight}px)`,
      }"
    >
      <div
        class="cell-date"
        :style="{ gridRow: `1 / span ${group.items.length}`, fontSize: headerFontSize, ...cellPadding }"
      >
        {{ group.date }}
      </div>

      <div
        v-for="item in group.items"
        :key="item.id"
        class="cell-note"
        :style="{ fontSize: rowFontSize, ...cellPadding }"
      >
        <!-- Edit mode: one input per lane note -->
        <div v-if="rowToEdit === item.id" class="note-editor" @focusout="onEditorFocusOut($event, item.id)">
          <input
            v-for="(note, noteIndex) in item.note"
            :key="noteIndex"
            ref="inputRefs"
            v-model="rowNoteDraft[noteIndex]"
            class="note-input"
            :style="{ borderColor: note.color, fontSize: rowFontSize }"
            @keydown.enter="handleSaveRowNote(item.id)"
            @keydown.esc="rowToEdit = ''"
          />
        </div>

        <!-- View mode: colored tags -->
        <div v-else class="note-tags">
          <button class="edit-button" title="Edit notes" @click="handleEditNote(item)">✎</button>
          <template v-for="(note, noteIndex) in item.note" :key="noteIndex">
            <span v-if="note.timestampProperty" class="note-tag" :style="{ backgroundColor: note.color }">
              {{ note.timestampProperty }}
              <button class="tag-remove" @click="handleDeleteTag(item.id, noteIndex)">×</button>
            </span>
          </template>
        </div>
      </div>
    </div>

    <div
      class="resize-handle"
      :class="{ active: isResizing }"
      title="Drag to resize"
      @pointerdown="startResize"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import type { Grouped, Row } from '@/types'
import { useTimelineData } from '@/composables/useTimelineData'
import { useRowNote } from '@/composables/useRowNote'
import { useTimelineZoom } from '@/composables/useTimelineZoom'
import { useLeftPanelResize } from '@/composables/useLeftPanelResize'

const { rows } = useTimelineData()

const { rowToEdit, inputRefs, rowNoteDraft, handleEditNote, handleDeleteTag, handleSaveRowNote } =
  useRowNote()

const {
  paddingY,
  paddingX,
  zoomLevel,
  rowFontSize,
  dateColWidth,
  headerHeight,
  headerFontSize,
  leftPanelWidth,
  scaledRowHeight,
  setLeftPanelBaseWidth,
} = useTimelineZoom()

const { isResizing, startResize, stopResize } = useLeftPanelResize(
  setLeftPanelBaseWidth,
  zoomLevel,
  leftPanelWidth,
)

const cellPadding = computed(() => ({ padding: `${paddingY.value} ${paddingX.value}` }))

const groupedRows = computed<Grouped[]>(() => {
  const map = new Map<string, Row[]>()
  for (const row of rows.value) {
    const group = map.get(row.date) ?? []
    group.push(row)
    map.set(row.date, group)
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
})

// Save once focus leaves the whole editor (not when moving between its inputs)
const onEditorFocusOut = (event: FocusEvent, rowId: string) => {
  const editor = event.currentTarget as HTMLElement
  if (editor.contains(event.relatedTarget as Node | null)) return
  handleSaveRowNote(rowId)
}

onBeforeUnmount(() => {
  stopResize()
})
</script>

<style scoped>
.left-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #ddd;
}

.panel-header {
  display: grid;
  box-sizing: border-box;
  font-weight: 600;
  background: #f7f7f7;
  border-bottom: 1px solid #ddd;
}

.row-group {
  display: grid;
}

.cell-date {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  color: #012c43;
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.cell-note {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-width: 0;
  color: #012c43;
  border-bottom: 1px solid #f0f0f0;
}

.note-tags,
.note-editor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.note-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 6px;
  color: white;
}

.tag-remove,
.edit-button {
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  font-size: inherit;
}

.edit-button {
  color: #012c43;
  font-size: 16px;
}

.note-input {
  width: 120px;
  padding: 2px 4px;
  border: 2px solid;
  border-radius: 4px;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
  touch-action: none;
  z-index: 1;
}

.resize-handle:hover,
.resize-handle.active {
  background: #7589af66;
}
</style>
