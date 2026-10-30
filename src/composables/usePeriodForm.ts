import { computed, reactive, ref } from 'vue'
import type { LanePeriod, PeriodRow, PeriodType, Row } from '@/types'
import {
  rowLineActiveBackgroundColor,
  rowLineBackgroundColor,
  rowLineHoverBackgroundColor,
} from '@/utils/constants'
import { useTimelineData } from './useTimelineData'

// Form state is module-level so the toolbar form, row lines and period shapes share it
const allowHovering = ref(false)
const hoveredRow = ref<string | null>(null)
const selectPeriodType = ref<PeriodType | null>(null)
const visible = ref(false)
const editingPeriodId = ref<string | null>(null)
const errorMessage = ref('')

const emptyRowIds = (): PeriodRow['periodRowId'] => ({
  periodStartDatePoint: { id: '', date: '' },
  periodEndDatePoint: { id: '', date: '' },
})

const periodForm = reactive<PeriodRow>({
  laneId: '',
  periodStart: 'periodStartDatePoint',
  periodEnd: 'periodEndDatePoint',
  periodAnnotation: '',
  periodRowId: emptyRowIds(),
})

export const usePeriodForm = () => {
  const { periods, getPeriodById, findVertexById, getPeriodColor, getLaneVertices } =
    useTimelineData()

  // Start picking a row on the timeline for the given end of the period
  const toggleHovering = (type: PeriodType) => {
    selectPeriodType.value = type
    allowHovering.value = true
  }

  const toggleRow = (row: Row) => {
    if (!row.id || !selectPeriodType.value || !allowHovering.value) return
    periodForm.periodRowId[selectPeriodType.value] = { id: row.id, date: row.date }
    allowHovering.value = false
  }

  const openAddPeriod = () => {
    closeByCancel()
    visible.value = true
  }

  // Load an existing period into the form for editing
  const openEditPeriod = (period: LanePeriod, laneId: string) => {
    closeByCancel()
    const selectedPeriod = getPeriodById(period.id)
    if (!selectedPeriod) return
    const laneNodes = getLaneVertices(laneId)
    const start = laneNodes.find((v) => v.id === selectedPeriod.from.vertexId)
    const end = laneNodes.find((v) => v.id === selectedPeriod.to.vertexId)

    periodForm.laneId = laneId
    periodForm.periodAnnotation = period.annotation
    periodForm.periodRowId.periodStartDatePoint = { id: start?.rowId ?? '', date: start?.dateTime ?? '' }
    periodForm.periodRowId.periodEndDatePoint = { id: end?.rowId ?? '', date: end?.dateTime ?? '' }
    if (!start) periodForm.periodStart = 'undefined'
    if (!end) periodForm.periodEnd = 'undefined'
    editingPeriodId.value = period.id
    visible.value = true
  }

  const closeByCancel = () => {
    visible.value = false
    editingPeriodId.value = null
    selectPeriodType.value = null
    allowHovering.value = false
    hoveredRow.value = null
    errorMessage.value = ''
    periodForm.periodRowId = emptyRowIds()
    periodForm.periodAnnotation = ''
    periodForm.laneId = ''
    periodForm.periodStart = 'periodStartDatePoint'
    periodForm.periodEnd = 'periodEndDatePoint'
  }

  const getRowBackgroundColor = computed(() => (rowId: string): string => {
    const isSelected =
      periodForm.periodRowId.periodStartDatePoint.id === rowId ||
      periodForm.periodRowId.periodEndDatePoint.id === rowId
    if (isSelected) return rowLineActiveBackgroundColor
    if (hoveredRow.value === rowId && allowHovering.value) return rowLineHoverBackgroundColor
    return rowLineBackgroundColor
  })

  const generatePeriodId = () => `period-${Math.random().toString(36).slice(2, 11)}`

  const getVertexId = (type: PeriodType) =>
    findVertexById(periodForm.laneId, periodForm.periodRowId[type].id) ?? ''

  const buildPeriodPayload = (id?: string) => ({
    id: id ?? generatePeriodId(),
    from: { laneId: periodForm.laneId, vertexId: getVertexId('periodStartDatePoint') },
    to: { laneId: periodForm.laneId, vertexId: getVertexId('periodEndDatePoint') },
    color: getPeriodColor(periodForm.laneId),
    annotation: periodForm.periodAnnotation,
  })

  const validatePeriodForm = () => {
    errorMessage.value = ''
    if (!periodForm.laneId) {
      errorMessage.value = 'Please select a lane'
    } else if (periodForm.periodStart === 'undefined' && periodForm.periodEnd === 'undefined') {
      errorMessage.value = 'A period cannot have both ends undefined'
    } else if (
      (periodForm.periodStart !== 'undefined' && !getVertexId('periodStartDatePoint')) ||
      (periodForm.periodEnd !== 'undefined' && !getVertexId('periodEndDatePoint'))
    ) {
      errorMessage.value = 'Select a row that has a date point on this lane'
    }
    return !errorMessage.value
  }

  const submitPeriod = () => {
    if (!validatePeriodForm()) return
    if (editingPeriodId.value) {
      const periodId = editingPeriodId.value
      periods.value = periods.value.map((p) => (p.id === periodId ? buildPeriodPayload(periodId) : p))
    } else {
      periods.value = [...periods.value, buildPeriodPayload()]
    }
    closeByCancel()
  }

  // Switching between "date point" and "undefined" clears the picked row
  const handlePeriodChange = (periodType: PeriodType) => {
    errorMessage.value = ''
    periodForm.periodRowId[periodType] = { id: '', date: '' }
  }

  const deletePeriod = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this period?')) return
    periods.value = periods.value.filter((p) => p.id !== id)
  }

  return {
    visible,
    toggleRow,
    hoveredRow,
    periodForm,
    deletePeriod,
    errorMessage,
    submitPeriod,
    closeByCancel,
    allowHovering,
    openAddPeriod,
    openEditPeriod,
    toggleHovering,
    editingPeriodId,
    selectPeriodType,
    handlePeriodChange,
    getRowBackgroundColor,
  }
}
