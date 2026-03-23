import { describe, expect, it } from 'vitest'
import { StaticOptionProvider } from './staticOptionProvider'

describe('StaticOptionProvider', () => {
  const provider = new StaticOptionProvider()

  it('getInterestVariables resolves a non-empty list', async () => {
    const options = await provider.getInterestVariables()

    expect(Object.keys(options).length).toBeGreaterThan(0)
    expect(options).toHaveProperty('A1')
    expect(options).toHaveProperty('newsint')
  })

  it('getWaves resolves expected values for a known interest variable', async () => {
    const waves = await provider.getWaves('A1')

    expect(waves).toEqual([
      'Wave 1 (Oct 2023)',
      'Wave 2 (Feb 2024)',
      'Wave 3 (May 2024)',
      'Wave 4 (Oct 2024)',
      'Wave 5 (Feb 2025)',
      'Wave 6 (May 2025)',
    ])
  })

  it('getModifiers resolves expected values for a known wave', async () => {
    const modifiers = await provider.getModifiers('Wave 2 (Feb 2024)')

    expect(modifiers).toContain('None')
    expect(modifiers).toContain('pid7')
    expect(modifiers).toContain('age4')
  })

  it('returns empty arrays for unknown input', async () => {
    await expect(provider.getWaves('Unknown IV')).resolves.toEqual([])
    await expect(provider.getModifiers('Unknown Wave')).resolves.toEqual([])
  })

  it('all methods resolve without throwing for valid inputs', async () => {
    await expect(provider.getInterestVariables()).resolves.toBeDefined()
    await expect(provider.getWaves('A2')).resolves.toBeDefined()
    await expect(provider.getModifiers('Wave 4 (Oct 2024)')).resolves.toBeDefined()
  })
})
