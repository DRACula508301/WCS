import type { SelectionState } from '../../domain/selection'
import { BaseVisualizationDataProvider } from './baseVisualizationProvider'
import type {
    AggregatedVisualizationPayload,
} from './VisualizationDataProvider'
import { simulateVisualizationResponse } from './simulatedVisualizationApi'
 
export class LocalVisualizationProvider extends BaseVisualizationDataProvider {
    protected async fetchAggregatedPayload(
        selection: SelectionState,
    ): Promise<AggregatedVisualizationPayload> {
        return simulateVisualizationResponse(selection)
    }
}
