export type SelectionField = 'interestVariable' | 'wave' | 'modifier'

export interface SelectionState {
  interestVariable: string
  wave: string
  modifier: string
}

export const EMPTY_SELECTION: SelectionState = {
  interestVariable: '',
  wave: '',
  modifier: '',
}

export const isValidSelection = (state: SelectionState): boolean => {
  return !!(state.interestVariable && state.wave && state.modifier)
}
