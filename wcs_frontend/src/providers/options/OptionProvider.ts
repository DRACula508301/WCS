export interface OptionProvider {
  getInterestVariables(): Promise<string[]>
  getWaves(interestVariable: string): Promise<string[]>
  getModifiers(wave: string): Promise<string[]>
}
