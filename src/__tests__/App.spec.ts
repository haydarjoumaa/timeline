import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'

import App from '../App.vue'
import { useTimelineStore } from '../stores/timeline'
import { useTimelineData } from '../composables/useTimelineData'

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the seeded lanes and dates', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Communications')
    expect(wrapper.text()).toContain('2024/01/01 09:00:00')
  })
})

describe('useTimelineData', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('creates sorted rows and reuses a row for the same date on another lane', () => {
    const store = useTimelineStore()
    const { addNodeEntity, rows } = useTimelineData()
    store.lanes.push({ ...store.lanes[0]!, id: 'lane-2', filters: { vertices: [], edges: [] } })

    addNodeEntity('2024/02/01 10:00:00', 'lane-1', 'a', 'p', 'A')
    addNodeEntity('2024/01/01 10:00:00', 'lane-1', 'b', 'p', 'B')
    addNodeEntity('2024/01/01 10:00:00', 'lane-2', 'c', 'p', 'C')

    expect(rows.value.map((r) => r.date)).toEqual(['2024/01/01 10:00:00', '2024/02/01 10:00:00'])
    expect(rows.value[0]!.note).toHaveLength(2)
  })

  it('removes rows only used by a deleted lane', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const store = useTimelineStore()
    const { addNodeEntity, deleteLane, rows } = useTimelineData()
    store.lanes.push({ ...store.lanes[0]!, id: 'lane-2', filters: { vertices: [], edges: [] } })

    addNodeEntity('2024/01/01 10:00:00', 'lane-1', 'a', 'p', 'A')
    addNodeEntity('2024/01/01 10:00:00', 'lane-2', 'b', 'p', 'B')
    addNodeEntity('2024/02/01 10:00:00', 'lane-2', 'c', 'p', 'C')
    deleteLane('lane-2')

    expect(rows.value.map((r) => r.date)).toEqual(['2024/01/01 10:00:00'])
    expect(rows.value[0]!.note.map((n) => n.laneId)).toEqual(['lane-1'])
  })
})
