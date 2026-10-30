import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useTimelineStore } from '@/stores/timeline'
import {
  minZoom,
  zoomStep,
  maxZoom,
  rowHeight,
  leftPanelBasePaddingX,
  leftPanelBasePaddingY,
  leftPanelBaseWidth,
  leftPanelMaxWidth,
  leftPanelMinWidth,
  leftPanelDateColWidth,
  leftPanelDateColMaxWidth,
  leftPanelHeaderFontSize,
  leftPanelHeaderHeight,
  leftPanelRowFontSize,
} from '@/utils/constants'

// Shared across callers so the resize handle and the panel agree on width
const leftPanelBaseWidthRef = ref(leftPanelBaseWidth)

export const useTimelineZoom = () => {
  const store = useTimelineStore()
  const { zoomLevel } = storeToRefs(store)

  const leftPanelWidth = computed(() =>
    Math.min(leftPanelBaseWidthRef.value * zoomLevel.value, leftPanelMaxWidth),
  )

  const setLeftPanelBaseWidth = (value: number) => {
    leftPanelBaseWidthRef.value = Math.min(leftPanelMaxWidth, Math.max(leftPanelMinWidth, value))
  }

  const dateColWidth = computed(() =>
    Math.min(leftPanelDateColWidth * zoomLevel.value, leftPanelDateColMaxWidth),
  )

  // Y zoom (layout height)
  const headerHeight = computed(() => leftPanelHeaderHeight * zoomLevel.value)
  const scaledRowHeight = computed(() => rowHeight * zoomLevel.value)

  // Text scaling
  const headerFontSize = computed(() => `${leftPanelHeaderFontSize * zoomLevel.value}px`)
  const rowFontSize = computed(() => `${leftPanelRowFontSize * zoomLevel.value}px`)
  const paddingX = computed(() => `${leftPanelBasePaddingX * zoomLevel.value}px`)
  const paddingY = computed(() => `${leftPanelBasePaddingY * zoomLevel.value}px`)

  const clampZoom = (value: number) =>
    Math.min(maxZoom, Math.max(minZoom, Number(value.toFixed(2))))

  const zoomIn = () => store.setZoomLevel(clampZoom(zoomLevel.value + zoomStep))
  const zoomOut = () => store.setZoomLevel(clampZoom(zoomLevel.value - zoomStep))
  const resetZoom = () => store.setZoomLevel(1)

  return {
    zoomIn,
    zoomOut,
    paddingY,
    paddingX,
    zoomLevel,
    resetZoom,
    rowFontSize,
    dateColWidth,
    headerHeight,
    headerFontSize,
    leftPanelWidth,
    scaledRowHeight,
    setLeftPanelBaseWidth,
  }
}
