import { describe, expect, it } from 'vitest'
import type { SelectionState } from '../../domain/selection'
import type { VisualizationDataProvider } from './VisualizationDataProvider'
import { StaticVisualizationDataProvider } from './staticVisualizationProvider'

describe('StaticVisualizationDataProvider', () => {
  const provider = new StaticVisualizationDataProvider()
  const validSelection: SelectionState = {
    interestVariable: 'IV1',
    wave: 'Wave1',
    modifier: 'Modifier1',
  }

  it('returns payload with required shape for valid selections', async () => {
    const result = await provider.getVisualizationData(validSelection)

    expect(result.title).toBe('Visualization Placeholder')
    expect(result.selectionLabel).toBe('IV1 / Wave1 / Modifier1')
    expect(Array.isArray(result.series)).toBe(true)
    expect(result.series.length).toBeGreaterThan(0)
    expect(result.series[0].id).toBe('IV1-Wave1-Modifier1')
    expect(result.series[0].points.length).toBeGreaterThan(0)
    expect(result.series[0].points[0]).toHaveProperty('x')
    expect(result.series[0].points[0]).toHaveProperty('y')
  })

  it('returns deterministic results for equivalent selections', async () => {
    const first = await provider.getVisualizationData(validSelection)
    const second = await provider.getVisualizationData({ ...validSelection })

    expect(first).toEqual(second)
  })

  it('returns empty payload for incomplete selection', async () => {
    const incomplete: SelectionState = {
      interestVariable: 'IV1',
      wave: '',
      modifier: 'Modifier1',
    }

    const result = await provider.getVisualizationData(incomplete)

    expect(result.title).toBe('Visualization Placeholder')
    expect(result.selectionLabel).toBe('Incomplete selection')
    expect(result.series).toEqual([])
  })

  it('can be consumed via VisualizationDataProvider interface', async () => {
    const typedProvider: VisualizationDataProvider = new StaticVisualizationDataProvider()

    await expect(typedProvider.getVisualizationData(validSelection)).resolves.toBeDefined()
  })
})
