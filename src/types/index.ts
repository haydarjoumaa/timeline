export type RowNote = { timestampProperty: string; laneId: string; color: string }

export type Row = {
  id: string
  date: string
  note: RowNote[]
}

export type Vertex = {
  id: string
  rowId: string
  label?: string
  backgroundImage?: string
  backgroundColor?: string
  dateTime: string
}

export type Edge = {
  id: string
  rowId: string
  source: string
  target: string
  relationType: string
  timestampPropertyType: string
  dateTime: string
  backgroundImage?: string
}

export type Lane = {
  id: string
  name: string
  order?: number
  color: string
  filters: { vertices: Vertex[]; edges: Edge[] }
  datePointsColor: string
  periodColor: string
}

export type LaneWithLayout = Lane & { x: number }

export type Period = {
  id: string
  from: { laneId: string; vertexId: string }
  to: { laneId: string; vertexId: string }
  color?: string
  annotation?: string
}

// Input for adding a relation to a lane (replaces the backend chronograph edge)
export type RelationInput = {
  id: string
  source: string
  target: string
  label: string
  property: string
  value: string
}

export type DatePointType = 'periodStart' | 'periodEnd'

export type PeriodType = 'periodStartDatePoint' | 'periodEndDatePoint'

export type PeriodRow = {
  laneId: string
  periodStart: PeriodType | 'undefined'
  periodEnd: PeriodType | 'undefined'
  periodAnnotation: string | undefined
  periodRowId: Record<PeriodType, { id: string; date: string }>
}

export type LaneUndefinedPeriodType = boolean | 'startUndefined' | 'endUndefined'

export type LanePeriod = {
  id: string
  y: number
  height: number
  width: number
  color: string
  undefinedPeriod: LaneUndefinedPeriodType
  from: string
  to: string
  xOffset: number
  annotation?: string
}

export type Grouped = { date: string; items: Row[] }
