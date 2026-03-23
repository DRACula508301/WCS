import type { SelectionState } from '../../domain/selection'
import type {
    VisualizationData,
    VisualizationDataProvider,
    VisualizationOptions,
} from './VisualizationDataProvider'

const EMPTY_VISUALIZATION: VisualizationData = {
    title: 'Weidenbaum Center Survey (WCS) Dashboard',
    subtitle: 'Select all fields to view chart percentages.',
    questionText: 'Question wording appears here once a complete selection is available.',
    groupedBy: null,
    bars: [],
    legend: [],
}

export class LocalVisualizationProvider implements VisualizationDataProvider {
    async getVisualizationData(
        _selection: SelectionState,
        _options?: VisualizationOptions,
    ): Promise<VisualizationData> {
        return EMPTY_VISUALIZATION
    }
}
