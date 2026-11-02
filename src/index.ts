import type { App, Plugin } from 'vue'
import Timeline from './components/Timeline.vue'

export { Timeline }
export { createTimelineData, type TimelineDataBuilder } from './utils/createTimelineData'
export type * from './types'

// Optional global registration: app.use(TimelinePlugin) then <VTimeline />
export const TimelinePlugin: Plugin = {
  install(app: App) {
    app.component('VTimeline', Timeline)
  },
}
