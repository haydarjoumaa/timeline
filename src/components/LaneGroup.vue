<template>
  <g class="lane-group" :data-lane-id="lane.id" :transform="`translate(${lane.x}, ${laneTopOffset})`">
    <text x="0" y="-15" text-anchor="middle" fill="#333" font-size="12" font-weight="600">
      {{ lane.name }}
    </text>

    <line class="lane-line" :x1="0" :x2="0" :y1="0" :y2="svgHeight" :stroke="lane.color" stroke-width="2" />

    <g class="lane-periods">
      <rect
        v-for="period in lanePeriods"
        :key="period.id"
        :x="-period.width / 2"
        :y="period.y"
        :width="period.width"
        :height="period.height"
        :fill="lane.color"
        fill-opacity="0.18"
        :stroke="lane.color"
        stroke-width="1"
        stroke-opacity="0.6"
        rx="6"
      />
    </g>

    <g v-for="vertex in lane.filters.vertices" :key="vertex.id" class="lane-node" :transform="nodeTranslate(vertex)">
      <template v-if="vertex.useHtml">
        <foreignObject
          :x="-foreignNodeWidth / 2"
          :y="-foreignNodeHeight / 2 - 12"
          :width="foreignNodeWidth"
          :height="foreignNodeHeight"
        >
          <div xmlns="http://www.w3.org/1999/xhtml" class="node-foreign">
            {{ vertex.label || 'Card' }}
          </div>
        </foreignObject>
      </template>
      <template v-else>
        <circle :r="nodeRadius" :fill="lane.color" stroke="#000" stroke-width="1" />
        <circle :r="nodeRadius - 3" fill="#fff" />
      </template>
    </g>
  </g>
</template>

<script setup lang="ts">
import type { LaneWithLayout, Vertex } from '../composables/useTimelineGeometry'

defineProps<{
  lane: LaneWithLayout
  laneTopOffset: number
  svgHeight: number
  nodeRadius: number
  foreignNodeWidth: number
  foreignNodeHeight: number
  lanePeriods: { id: string; y: number; height: number; width: number }[]
  nodeTranslate: (vertex: Vertex) => string
}>()
</script>

<style scoped>
.lane-line {
  pointer-events: none;
}

.node-foreign {
  width: 100%;
  height: 100%;
  border: 1px solid #999;
  border-radius: 6px;
  background: #fffbea;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
</style>
