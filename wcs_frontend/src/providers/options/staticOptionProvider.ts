import { INTEREST_VARIABLES, MODIFIER_OPTIONS, WAVES } from '../../components/constants'
import type { OptionProvider } from './OptionProvider'

export class StaticOptionProvider implements OptionProvider {
  async getInterestVariables(): Promise<string[]> {
    return [...INTEREST_VARIABLES]
  }

  async getWaves(interestVariable: string): Promise<string[]> {
    return [...(WAVES[interestVariable as keyof typeof WAVES] ?? [])]
  }

  async getModifiers(wave: string): Promise<string[]> {
    return [...(MODIFIER_OPTIONS[wave as keyof typeof MODIFIER_OPTIONS] ?? [])]
  }
}