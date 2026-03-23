import type { OptionProvider } from './OptionProvider'
import { INTEREST_VARIABLES, MODERATOR_OPTIONS, WAVE_OPTIONS } from '../visualization/staticSurveyData'

export class StaticOptionProvider implements OptionProvider {
  async getInterestVariables(): Promise<Record<string, string>> {
    const result: Record<string, string> = {}
    INTEREST_VARIABLES.forEach(variable => {
      result[variable] = variable // Replace with actual labels if available
    })
    return result
  }

  async getWaves(interestVariable: string): Promise<string[]> {
    if (!INTEREST_VARIABLES.includes(interestVariable as (typeof INTEREST_VARIABLES)[number])) {
      return []
    }

    return [...WAVE_OPTIONS]
  }

  async getModifiers(wave: string): Promise<string[]> {
    if (!WAVE_OPTIONS.includes(wave as (typeof WAVE_OPTIONS)[number])) {
      return []
    }

    return [...MODERATOR_OPTIONS]
  }
}