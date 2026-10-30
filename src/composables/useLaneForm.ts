import { reactive, ref } from 'vue'
import type { Lane } from '@/types'
import { laneSpacing } from '@/utils/constants'
import { generateId } from '@/utils/timelineUtils'
import { useTimelineData } from './useTimelineData'

type LaneForm = { name: string; laneColor: string; datePointsColor: string; periodColor: string }

const defaultLaneColor = '#2F5597'

const laneForm = reactive<LaneForm>({
  name: '',
  laneColor: defaultLaneColor,
  datePointsColor: defaultLaneColor,
  periodColor: defaultLaneColor,
})
const isLaneModalOpen = ref(false)
const editingLaneId = ref<string | null>(null)
const laneFormError = ref('')

export const useLaneForm = () => {
  const { lanesWithLayout, lanes, lanePositions } = useTimelineData()

  const resetForm = () => {
    laneForm.name = ''
    laneForm.laneColor = defaultLaneColor
    laneForm.datePointsColor = defaultLaneColor
    laneForm.periodColor = defaultLaneColor
    laneFormError.value = ''
  }

  const addLane = () => {
    // Place new lane just after the rightmost current lane (respects drag position)
    const maxX = lanesWithLayout.value.length
      ? Math.max(...lanesWithLayout.value.map((lane) => lane.x))
      : 0
    const id = `lane-${generateId()}`

    lanes.value = [
      ...lanes.value,
      {
        id,
        name: laneForm.name,
        order: lanes.value.length + 1,
        color: laneForm.laneColor,
        datePointsColor: laneForm.datePointsColor,
        periodColor: laneForm.periodColor,
        filters: { vertices: [], edges: [] },
      },
    ]
    lanePositions.value = { ...lanePositions.value, [id]: maxX + laneSpacing }
  }

  const editLane = (laneId: string) => {
    lanes.value = lanes.value.map((lane) =>
      lane.id === laneId
        ? {
            ...lane,
            name: laneForm.name,
            color: laneForm.laneColor,
            datePointsColor: laneForm.datePointsColor,
            periodColor: laneForm.periodColor,
          }
        : lane,
    )
  }

  // Changing the lane color also recolors its date points and periods
  const handleLaneColorChange = (value: string) => {
    laneForm.datePointsColor = value
    laneForm.periodColor = value
  }

  const openLaneModal = (lane: Lane | null) => {
    resetForm()
    if (lane) {
      laneForm.name = lane.name
      laneForm.laneColor = lane.color
      laneForm.datePointsColor = lane.datePointsColor
      laneForm.periodColor = lane.periodColor
    }
    editingLaneId.value = lane?.id ?? null
    isLaneModalOpen.value = true
  }

  const closeLaneModal = () => {
    isLaneModalOpen.value = false
    editingLaneId.value = null
  }

  const submitLaneForm = () => {
    if (!laneForm.name.trim()) {
      laneFormError.value = 'Please enter a lane name'
      return
    }
    if (editingLaneId.value) editLane(editingLaneId.value)
    else addLane()
    closeLaneModal()
  }

  return {
    laneForm,
    laneFormError,
    editingLaneId,
    isLaneModalOpen,
    openLaneModal,
    closeLaneModal,
    submitLaneForm,
    handleLaneColorChange,
  }
}
