import { hasInjectionContext, inject, provide, type InjectionKey } from 'vue'
import { createPinia, getActivePinia, setActivePinia, type Pinia } from 'pinia'
import { createTimelineStore, type TimelineStore } from '@/stores/timeline'

export type TimelineContextOptions = {
  pinia?: Pinia
  confirm?: (message: string) => boolean
  onNodeClick?: (payload: { laneId: string; vertexId: string }) => void
}

/**
 * Everything one <Timeline> instance owns: its store, UI state and host callbacks.
 */
export type TimelineContext = {
  store: TimelineStore
  confirm: (message: string) => boolean
  onNodeClick?: TimelineContextOptions['onNodeClick']
  // Per-instance UI state, keyed by the factory that creates it
  scopedState: Map<() => unknown, unknown>
}

const timelineContextKey: InjectionKey<TimelineContext> = Symbol('timeline-context')

let nextInstanceId = 1

export const createTimelineContext = (options: TimelineContextOptions = {}): TimelineContext => {
  const pinia = options.pinia ?? getActivePinia() ?? createPinia()
  return {
    store: createTimelineStore(`timeline-${nextInstanceId++}`)(pinia),
    confirm: options.confirm ?? ((message) => window.confirm(message)),
    onNodeClick: options.onNodeClick,
    scopedState: new Map(),
  }
}

export const provideTimelineContext = (context: TimelineContext) => {
  provide(timelineContextKey, context)
}

// Used outside components (e.g. building data); takes priority over the default context
let overrideContext: TimelineContext | null = null

export const withTimelineContext = <T>(context: TimelineContext, fn: () => T): T => {
  const previous = overrideContext
  overrideContext = context
  try {
    return fn()
  } finally {
    overrideContext = previous
  }
}

// Fallback for code running without a <Timeline> parent: one context per active Pinia
const defaultContexts = new WeakMap<Pinia, TimelineContext>()

const getDefaultContext = () => {
  let pinia = getActivePinia()
  if (!pinia) {
    pinia = createPinia()
    setActivePinia(pinia)
  }
  let context = defaultContexts.get(pinia)
  if (!context) {
    context = createTimelineContext({ pinia })
    defaultContexts.set(pinia, context)
  }
  return context
}

export const useTimelineContext = (): TimelineContext =>
  overrideContext ??
  (hasInjectionContext() ? inject(timelineContextKey, null) : null) ??
  getDefaultContext()

/** State created once per timeline instance instead of once per module */
export const useScopedState = <T>(factory: () => T): T => {
  const { scopedState } = useTimelineContext()
  if (!scopedState.has(factory)) scopedState.set(factory, factory())
  return scopedState.get(factory) as T
}
