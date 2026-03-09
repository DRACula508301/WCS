import type { SelectionState } from '../../domain/selection'

export interface VisualizationPoint {
  x: number
  y: number
}

export interface VisualizationSeries {
  id: string
  points: VisualizationPoint[]
}

export interface VisualizationData {
  title: string
  selectionLabel: string
  series: VisualizationSeries[]
}

export interface VisualizationDataProvider {
  getVisualizationData(selection: SelectionState): Promise<VisualizationData>
}
