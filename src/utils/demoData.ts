import { useTimelineStore } from '@/stores/timeline'
import { useTimelineData } from '@/composables/useTimelineData'

/**
 * Seeds the store with sample lanes, events and a period so the timeline isn't empty.
 */
export const seedDemoData = () => {
  const store = useTimelineStore()
  const { addNodeEntity, addRelationEntity } = useTimelineData()

  store.lanes = [
    {
      id: 'lane-1',
      name: 'Communications',
      order: 1,
      color: '#2F5597',
      datePointsColor: '#2F5597',
      periodColor: '#2F5597',
      filters: { vertices: [], edges: [] },
    },
    {
      id: 'lane-2',
      name: 'Money',
      order: 2,
      color: '#E67E22',
      datePointsColor: '#E67E22',
      periodColor: '#E67E22',
      filters: { vertices: [], edges: [] },
    },
  ]

  addNodeEntity('2024/01/01 09:00:00', 'lane-1', 'v-1', 'First contact', 'John Doe')
  addNodeEntity('2024/01/05 14:30:00', 'lane-2', 'v-2', 'Account opened', 'Acme Bank')
  addRelationEntity(
    {
      id: 'e-1',
      source: 'John Doe',
      target: 'Jane Roe',
      label: 'CALLED',
      property: 'Call',
      value: '2024/01/10 11:00:00',
    },
    'lane-1',
  )
  addNodeEntity('2024/01/15 16:00:00', 'lane-2', 'v-3', 'Transfer', 'Acme Bank')
  addNodeEntity('2024/01/15 16:00:00', 'lane-1', 'v-4', 'Meeting', 'Jane Roe')

  store.periods = [
    {
      id: 'period-1',
      from: { laneId: 'lane-2', vertexId: 'v-2' },
      to: { laneId: 'lane-2', vertexId: 'v-3' },
      color: '#E67E22',
      annotation: 'Active',
    },
  ]
}
