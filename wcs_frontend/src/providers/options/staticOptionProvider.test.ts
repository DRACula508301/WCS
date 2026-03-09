import { describe, expect, it } from 'vitest'
import { StaticOptionProvider } from './staticOptionProvider'

describe('StaticOptionProvider', () => {
  const provider = new StaticOptionProvider()

  it('getInterestVariables resolves a non-empty list', async () => {
    const options = await provider.getInterestVariables()

    expect(options.length).toBeGreaterThan(0)
    expect(options).toContain('IV1')
  })

  it('getWaves resolves expected values for a known interest variable', async () => {
    const waves = await provider.getWaves('IV1')

    expect(waves).toEqual(['Wave1', 'Wave2', 'Wave3'])
  })

  it('getModifiers resolves expected values for a known wave', async () => {
    const modifiers = await provider.getModifiers('Wave2')

    expect(modifiers).toEqual(['Modifier2', 'Modifier3', 'Modifier4'])
  })

  it('returns empty arrays for unknown input', async () => {
    await expect(provider.getWaves('Unknown IV')).resolves.toEqual([])
    await expect(provider.getModifiers('Unknown Wave')).resolves.toEqual([])
  })

  it('all methods resolve without throwing for valid inputs', async () => {
    await expect(provider.getInterestVariables()).resolves.toBeDefined()
    await expect(provider.getWaves('IV2')).resolves.toBeDefined()
    await expect(provider.getModifiers('Wave4')).resolves.toBeDefined()
  })
})
