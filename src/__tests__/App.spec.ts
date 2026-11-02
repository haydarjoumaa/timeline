import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'

import App from '../App.vue'
import Timeline from '../components/Timeline.vue'
import { createTimelineData } from '../utils/createTimelineData'
import type { TimelineData } from '../types'
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

describe('Timeline', () => {
  const buildData = (laneName: string, date: string) =>
    createTimelineData(({ setLanes, addNodeEntity }) => {
      setLanes([
        {
          id: 'lane-1',
          name: laneName,
          color: '#2F5597',
          datePointsColor: '#2F5597',
          periodColor: '#2F5597',
          filters: { vertices: [], edges: [] },
        },
      ])
      addNodeEntity(date, 'lane-1', 'v-1', 'Event', 'Someone')
    })

  it('keeps two instances independent', () => {
    const first = mount(Timeline, { props: { data: buildData('Alpha', '2024/01/01 10:00:00') } })
    const second = mount(Timeline, { props: { data: buildData('Beta', '2024/02/02 10:00:00') } })

    expect(first.text()).toContain('Alpha')
    expect(first.text()).not.toContain('Beta')
    expect(second.text()).toContain('Beta')
    expect(second.text()).not.toContain('2024/01/01 10:00:00')
  })

  it('emits update:data when the timeline changes', async () => {
    const wrapper = mount(Timeline, {
      props: { data: buildData('Alpha', '2024/01/01 10:00:00') },
    })
    wrapper.vm.addNodeEntity('2024/03/03 10:00:00', 'lane-1', 'v-2', 'Later', 'Other')
    await nextTick()

    const emitted = wrapper.emitted('update:data')
    const last = emitted?.at(-1)?.[0] as TimelineData
    expect(last.rows.map((r) => r.date)).toContain('2024/03/03 10:00:00')
  })
})

describe('Timeline v-model', () => {
  it('does not reload data it emitted itself', async () => {
    const Host = defineComponent({
      components: { Timeline },
      setup() {
        const data = ref(createTimelineData(() => {}))
        const timeline = ref<InstanceType<typeof Timeline>>()
        return { data, timeline }
      },
      template: '<Timeline ref="timeline" v-model:data="data" />',
    })
    const wrapper = mount(Host)
    const lanes = wrapper.vm.data.lanes.length
    wrapper.vm.timeline!.addNodeEntity('2024/01/01 10:00:00', 'lane-1', 'v-1', 'p', 'A')
    await flushPromises()

    expect(wrapper.vm.data.rows).toHaveLength(1)
    expect(wrapper.findComponent(Timeline).emitted('update:data')).toHaveLength(1)
    expect(wrapper.vm.data.lanes).toHaveLength(lanes)
  })
})
