import type { SelectionState } from '../../domain/selection'

export interface PercentageSegment {
  label: string
  percentage: number
  color: string
}

export interface PercentageBar {
  category: string
  percentage: number
  segments: PercentageSegment[]
}

export interface LegendItem {
  label: string
  color: string
}

export interface VisualizationOptions {
  includeNAResponses: boolean
  useWeightedPercentages: boolean
}

export interface VisualizationData {
  title: string
  subtitle: string
  questionText: string
  groupedBy: string | null
  bars: PercentageBar[]
  legend: LegendItem[]
}

export interface VisualizationDataProvider {
  getVisualizationData(
    selection: SelectionState,
    options?: VisualizationOptions,
  ): Promise<VisualizationData>
}
