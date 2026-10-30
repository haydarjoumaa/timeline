import { nextTick, ref } from 'vue'
import type { Row } from '@/types'
import { useTimelineData } from './useTimelineData'

/**
 * Inline editing of the per-lane note tags shown in the left panel.
 */
export const useRowNote = () => {
  const { rows } = useTimelineData()
  const rowToEdit = ref('')
  // Draft values, aligned by index with row.note
  const rowNoteDraft = ref<string[]>([])
  const inputRefs = ref<HTMLInputElement[]>([])

  const handleEditNote = async (row: Row) => {
    rowToEdit.value = row.id
    rowNoteDraft.value = row.note.map((n) => n.timestampProperty)
    await nextTick()
    inputRefs.value[0]?.focus()
  }

  const updateRowNotes = (rowId: string, update: (note: Row['note']) => Row['note']) => {
    rows.value = rows.value.map((r) => (r.id === rowId ? { ...r, note: update(r.note) } : r))
  }

  const handleSaveRowNote = (rowId: string) => {
    if (rowToEdit.value !== rowId) return
    rowToEdit.value = ''
    updateRowNotes(rowId, (note) =>
      note.map((n, index) => ({ ...n, timestampProperty: rowNoteDraft.value[index] ?? '' })),
    )
  }

  const handleDeleteTag = (rowId: string, index: number) => {
    updateRowNotes(rowId, (note) =>
      note.map((n, i) => (i === index ? { ...n, timestampProperty: '' } : n)),
    )
  }

  return {
    rowToEdit,
    inputRefs,
    rowNoteDraft,
    handleEditNote,
    handleDeleteTag,
    handleSaveRowNote,
  }
}
