import { BaseVisualizationDataProvider, type ProviderSurveyRow } from './baseVisualizationProvider'
import {
  INTEREST_RESPONSE_OPTIONS,
  INTEREST_VARIABLE_QUESTIONS,
  STATIC_SURVEY_ROWS,
} from './staticSurveyData'

export class StaticVisualizationDataProvider extends BaseVisualizationDataProvider {
  protected async getRowsForWave(wave: string): Promise<ProviderSurveyRow[]> {
    return STATIC_SURVEY_ROWS.filter((row) => row.wave === wave)
  }

  protected getResponseOptions(interestVariable: string): string[] {
    return INTEREST_RESPONSE_OPTIONS[interestVariable] ?? []
  }

  protected getQuestionText(interestVariable: string): string | undefined {
    return INTEREST_VARIABLE_QUESTIONS[interestVariable]
  }

  protected async getRowsForColorLookup(_groupedBy: string): Promise<ProviderSurveyRow[]> {
    return STATIC_SURVEY_ROWS
  }
}
