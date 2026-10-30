import { storeToRefs } from 'pinia'
import { useTimelineStore } from '@/stores/timeline'
import { useTimelineData } from './useTimelineData'

export const useColorDatePoints = () => {
  const store = useTimelineStore()
  const { nodeClickedId, laneClickedId } = storeToRefs(store)
  const { setColorForDatePointForVertex, setColorForDatePointRowNote } = useTimelineData()

  // Clicking a node selects it; clicking it again deselects
  const handleEntityNodeClick = (laneId: string, vertexId: string) => {
    if (nodeClickedId.value === vertexId) {
      store.setNodeClickedId('')
      return
    }
    store.setNodeClickedId(vertexId)
    store.setLaneClickedId(laneId)
  }

  const setColorForDatePoint = (color: string): void => {
    setColorForDatePointForVertex(laneClickedId.value, nodeClickedId.value, color)
    setColorForDatePointRowNote(laneClickedId.value, nodeClickedId.value, color)
    store.setNodeClickedId('')
    store.setLaneClickedId('')
  }

  return { nodeClickedId, setColorForDatePoint, handleEntityNodeClick }
}
