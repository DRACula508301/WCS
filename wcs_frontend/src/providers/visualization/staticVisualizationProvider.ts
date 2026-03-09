import { isValidSelection, type SelectionState } from '../../domain/selection'
import type {
  VisualizationData,
  VisualizationDataProvider,
  VisualizationSeries,
} from './VisualizationDataProvider'

const EMPTY_VISUALIZATION: VisualizationData = {
  title: 'Visualization Placeholder',
  selectionLabel: 'Incomplete selection',
  series: [],
}

export class StaticVisualizationDataProvider implements VisualizationDataProvider {
  async getVisualizationData(selection: SelectionState): Promise<VisualizationData> {
    if (!isValidSelection(selection)) {
      return EMPTY_VISUALIZATION
    }

    const seed = this.getSeed(selection)
    const series: VisualizationSeries = {
      id: `${selection.interestVariable}-${selection.wave}-${selection.modifier}`,
      points: Array.from({ length: 8 }, (_, index) => ({
        x: index + 1,
        y: (seed * (index + 3) + index * index * 7) % 100,
      })),
    }

    return {
      title: 'Visualization Placeholder',
      selectionLabel: `${selection.interestVariable} / ${selection.wave} / ${selection.modifier}`,
      series: [series],
    }
  }

  private getSeed(selection: SelectionState): number {
    const label = `${selection.interestVariable}|${selection.wave}|${selection.modifier}`

    return Array.from(label).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  }
}
