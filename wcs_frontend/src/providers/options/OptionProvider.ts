export interface OptionProvider {
  getInterestVariables(): Promise<Record<string, string>>
  getWaves(interestVariable: string): Promise<string[]>
  getModifiers(wave: string): Promise<string[]>
}
