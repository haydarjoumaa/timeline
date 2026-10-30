import type { Edge, Vertex } from '@/types'

// Parse "YYYY/MM/DD HH:mm:ss" (time optional) into a timestamp
export function parseDate(dateStr: string): number {
  const [datePart = '', timePart] = dateStr.split(' ')
  const [year = 0, month = 1, day = 1] = datePart.split('/').map(Number)
  const [hours = 0, minutes = 0, seconds = 0] = timePart ? timePart.split(':').map(Number) : []
  return new Date(year, month - 1, day, hours, minutes, seconds).getTime()
}

// Convert an <input type="datetime-local"> value into "YYYY/MM/DD HH:mm:ss"
export function fromDateTimeLocal(value: string): string {
  const [date = '', time = '00:00'] = value.split('T')
  const withSeconds = time.length === 5 ? `${time}:00` : time
  return `${date.replace(/-/g, '/')} ${withSeconds}`
}

export const generateId = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

const toTime = (dateTime?: string): number => (dateTime ? parseDate(dateTime) : 0)

// Vertices and edges of a lane in chronological order
export const getSortedNodes = (filters: { vertices: Vertex[]; edges: Edge[] }) =>
  [...filters.vertices, ...filters.edges].sort((a, b) => toTime(a.dateTime) - toTime(b.dateTime))

export const isEdge = (node: Vertex | Edge): node is Edge => 'source' in node
