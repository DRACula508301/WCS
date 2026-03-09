import { describe, expect, it } from 'vitest'
import { EMPTY_SELECTION, isValidSelection } from './selection'

describe('selection domain', () => {
  it('returns false for empty selection', () => {
    expect(isValidSelection(EMPTY_SELECTION)).toBe(false)
  })

  it('returns false when interestVariable is missing', () => {
    expect(
      isValidSelection({
        interestVariable: '',
        wave: 'Wave 1',
        modifier: 'Option A',
      }),
    ).toBe(false)
  })

  it('returns false when wave is missing', () => {
    expect(
      isValidSelection({
        interestVariable: 'Income',
        wave: '',
        modifier: 'Option A',
      }),
    ).toBe(false)
  })

  it('returns false when modifier is missing', () => {
    expect(
      isValidSelection({
        interestVariable: 'Income',
        wave: 'Wave 1',
        modifier: '',
      }),
    ).toBe(false)
  })

  it('returns true when all fields are selected', () => {
    expect(
      isValidSelection({
        interestVariable: 'Income',
        wave: 'Wave 1',
        modifier: 'Option A',
      }),
    ).toBe(true)
  })

  it('initializes EMPTY_SELECTION with empty strings', () => {
    expect(EMPTY_SELECTION).toEqual({
      interestVariable: '',
      wave: '',
      modifier: '',
    })
  })
})
