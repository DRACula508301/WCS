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

export type AggregatedPercentageVector = number[]
export type AggregatedPercentageMatrix = number[][]

export interface AggregatedVisualizationPayload {
  options: string[]
  unweighted: AggregatedPercentageVector | AggregatedPercentageMatrix
  weighted: AggregatedPercentageVector | AggregatedPercentageMatrix
  modifierOptions?: string[]
  questionText?: string
  groupedBy?: string | null
  title?: string
  missingOptionLabels?: string[]
}

export interface VisualizationDataProvider {
  getVisualizationData(
    selection: SelectionState,
    options?: VisualizationOptions,
  ): Promise<VisualizationData>
}
