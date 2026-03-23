import { describe, expect, it } from 'vitest'
import type { SelectionState } from '../../domain/selection'
import type { VisualizationDataProvider } from './VisualizationDataProvider'
import { StaticVisualizationDataProvider } from './staticVisualizationProvider'

describe('StaticVisualizationDataProvider', () => {
  const provider = new StaticVisualizationDataProvider()
  const validSelection: SelectionState = {
    interestVariable: 'A1',
    interestVariableLabel: 'Interest Var 1',
    wave: 'Wave 1 (Oct 2023)',
    modifier: 'pid7',
  }

  it('returns payload with required shape for valid selections', async () => {
    const result = await provider.getVisualizationData(validSelection)

    expect(result.title).toContain('Wave 1 (Oct 2023)')
    expect(result.groupedBy).toBe('pid7')
    expect(Array.isArray(result.bars)).toBe(true)
    expect(result.bars.length).toBeGreaterThan(0)
    expect(result.bars[0]).toHaveProperty('category')
    expect(result.bars[0]).toHaveProperty('percentage')
    expect(result.bars[0].segments.length).toBeGreaterThan(0)
    expect(result.legend.length).toBeGreaterThan(0)
  })

  it('returns valid percentage totals for equivalent selections', async () => {
    const first = await provider.getVisualizationData(validSelection)
    const second = await provider.getVisualizationData({ ...validSelection })

    const sumBars = (result: Awaited<ReturnType<typeof provider.getVisualizationData>>) =>
      Number(result.bars.reduce((sum, bar) => sum + bar.percentage, 0).toFixed(2))

    expect(first.bars.length).toBeGreaterThan(0)
    expect(second.bars.length).toBeGreaterThan(0)
    expect(sumBars(first)).toBeGreaterThan(99)
    expect(sumBars(first)).toBeLessThan(101)
    expect(sumBars(second)).toBeGreaterThan(99)
    expect(sumBars(second)).toBeLessThan(101)
  })

  it('returns empty payload for incomplete selection', async () => {
    const incomplete: SelectionState = {
      interestVariable: 'A1',
      interestVariableLabel: 'Interest Var 1',
      wave: '',
      modifier: 'Modifier1',
    }

    const result = await provider.getVisualizationData(incomplete)

    expect(result.bars).toEqual([])
    expect(result.legend).toEqual([])
    expect(result.groupedBy).toBeNull()
  })

  it('returns a legend with valid hex colors for grouped charts', async () => {
    const result = await provider.getVisualizationData(validSelection)

    expect(result.legend.length).toBeGreaterThan(0)
    expect(result.legend.every((item) => /^#[0-9a-fA-F]{6}$/.test(item.color))).toBe(true)
  })

  it('can be consumed via VisualizationDataProvider interface', async () => {
    const typedProvider: VisualizationDataProvider = new StaticVisualizationDataProvider()

    await expect(typedProvider.getVisualizationData(validSelection)).resolves.toBeDefined()
  })

  it('includes missing bar when includeNAResponses is true', async () => {
    const result = await provider.getVisualizationData(validSelection, {
      includeNAResponses: true,
      useWeightedPercentages: true,
    })

    expect(result.bars.some((bar) => bar.category === '4')).toBe(true)
  })

  it('excludes missing bar when includeNAResponses is false', async () => {
    const result = await provider.getVisualizationData(validSelection, {
      includeNAResponses: false,
      useWeightedPercentages: true,
    })

    expect(result.bars.some((bar) => bar.category === '4')).toBe(false)
  })

  it('returns different subtitle between weighted and unweighted modes', async () => {
    const weighted = await provider.getVisualizationData(validSelection, {
      includeNAResponses: true,
      useWeightedPercentages: true,
    })

    const unweighted = await provider.getVisualizationData(validSelection, {
      includeNAResponses: true,
      useWeightedPercentages: false,
    })

    expect(weighted.subtitle).toContain('Weighted')
    expect(unweighted.subtitle).toContain('Unweighted')
    expect(weighted.subtitle).not.toEqual(unweighted.subtitle)
  })
})
