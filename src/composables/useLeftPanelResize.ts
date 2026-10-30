import { ref, type Ref } from 'vue'

/**
 * Pointer-driven resizing of the left panel; width is stored unzoomed.
 */
export const useLeftPanelResize = (
  setLeftPanelBaseWidth: (value: number) => void,
  zoomLevel: Ref<number>,
  leftPanelWidth: Ref<number>,
) => {
  const isResizing = ref(false)
  let resizeStartX = 0
  let resizeStartWidth = 0
  let activePointerId: number | null = null
  let activePointerTarget: HTMLElement | null = null

  const handleResizeMove = (event: PointerEvent) => {
    if (!isResizing.value || event.pointerId !== activePointerId) return
    const nextWidth = resizeStartWidth + event.clientX - resizeStartX
    setLeftPanelBaseWidth(nextWidth / zoomLevel.value)
  }

  const stopResize = (event?: PointerEvent) => {
    if (!isResizing.value) return
    if (event && event.pointerId !== activePointerId) return
    if (activePointerTarget && activePointerId !== null) {
      activePointerTarget.releasePointerCapture(activePointerId)
    }
    isResizing.value = false
    activePointerId = null
    activePointerTarget = null
    window.removeEventListener('pointermove', handleResizeMove)
    window.removeEventListener('pointerup', stopResize)
    window.removeEventListener('pointercancel', stopResize)
  }

  const startResize = (event: PointerEvent) => {
    if (event.button !== 0) return
    const target = event.currentTarget as HTMLElement | null
    if (!target) return
    isResizing.value = true
    activePointerId = event.pointerId
    activePointerTarget = target
    resizeStartX = event.clientX
    resizeStartWidth = leftPanelWidth.value
    target.setPointerCapture(event.pointerId)
    event.preventDefault()
    window.addEventListener('pointermove', handleResizeMove)
    window.addEventListener('pointerup', stopResize)
    window.addEventListener('pointercancel', stopResize)
  }

  return { isResizing, startResize, stopResize }
}
