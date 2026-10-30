<template>
  <!-- Single lane: title, vertical line, periods, and nodes -->
  <g class="lane-group" :data-lane-id="lane.id" :transform="`translate(${lane.x}, ${laneTopOffset})`">
    <foreignObject
      :x="laneTitleXOffset"
      :y="-laneTopOffset"
      :width="laneTitleWidth"
      :height="laneTitleHeight"
    >
      <div xmlns="http://www.w3.org/1999/xhtml">
        <LaneTitle :lane="lane" />
      </div>
    </foreignObject>

    <line
      class="lane-line"
      :x1="0"
      :x2="0"
      :y1="0"
      :y2="svgHeight"
      :stroke="lane.color"
      :stroke-width="laneLineStrokeWidth"
    />

    <g class="lane-periods">
      <g
        v-for="period in lanePeriods"
        :key="period.id"
        :transform="`translate(${-period.width / 2 - period.xOffset}, ${period.y})`"
      >
        <PeriodShape :period="period" :color="lane.periodColor ?? lane.color" :laneId="lane.id" />
      </g>
    </g>

    <g
      v-for="node in getSortedNodes(lane.filters)"
      :key="node.id"
      class="lane-node"
      :transform="nodeTranslate(node)"
    >
      <foreignObject
        v-if="isEdge(node)"
        :x="-foreignRelationWidth / 2"
        :y="-foreignRelationHeight / 2"
        :width="foreignRelationWidth"
        :height="foreignRelationHeight"
      >
        <div xmlns="http://www.w3.org/1999/xhtml" class="node-foreign">
          <RelationDetails :edge="node" :color="lane.datePointsColor" />
        </div>
      </foreignObject>
      <foreignObject
        v-else
        :x="-laneEntityNodeWidth / 2"
        :y="-foreignNodeHeight / 2 - 3"
        :width="foreignNodeWidth"
        :height="foreignNodeHeight"
      >
        <div xmlns="http://www.w3.org/1999/xhtml" class="node-foreign">
          <EntityNode
            :laneId="lane.id"
            :vertexId="node.id"
            :label="node.label"
            :backgroundColor="node.backgroundColor"
            :backgroundImage="node.backgroundImage"
            :color="lane.datePointsColor"
          />
        </div>
      </foreignObject>
    </g>
  </g>
</template>

<script setup lang="ts">
import type { Edge, LanePeriod, LaneWithLayout, Vertex } from '@/types'
import { getSortedNodes, isEdge } from '@/utils/timelineUtils'
import {
  foreignNodeHeight,
  foreignNodeWidth,
  foreignRelationHeight,
  foreignRelationWidth,
  laneEntityNodeWidth,
  laneLineStrokeWidth,
  laneTitleHeight,
  laneTitleWidth,
  laneTitleXOffset,
  laneTopOffset,
} from '@/utils/constants'
import LaneTitle from './LaneTitle.vue'
import EntityNode from './EntityNode.vue'
import PeriodShape from './PeriodShape.vue'
import RelationDetails from './RelationDetails.vue'

defineProps<{
  lane: LaneWithLayout
  svgHeight: number
  lanePeriods: LanePeriod[]
  nodeTranslate: (node: Vertex | Edge) => string
}>()
</script>

<style scoped>
.lane-line {
  pointer-events: none;
}

.node-foreign {
  width: 100%;
  height: 100%;
}
</style>
