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

  it('returns deterministic results for equivalent selections', async () => {
    const first = await provider.getVisualizationData(validSelection)
    const second = await provider.getVisualizationData({ ...validSelection })

    expect(first).toEqual(second)
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

  it('uses app.R palette colors for pid7 grouping', async () => {
    const result = await provider.getVisualizationData(validSelection)

    const partyColors = new Set(['#08306B', '#2171B5', '#6BAED6', '#BDBDBD', '#FC9272', '#FB6A4A', '#CB181D', '#969696'])
    const hasPartyColor = result.legend.some((item) => partyColors.has(item.color))

    expect(hasPartyColor).toBe(true)
  })

  it('can be consumed via VisualizationDataProvider interface', async () => {
    const typedProvider: VisualizationDataProvider = new StaticVisualizationDataProvider()

    await expect(typedProvider.getVisualizationData(validSelection)).resolves.toBeDefined()
  })

  it('includes N/A bar when includeNAResponses is true', async () => {
    const result = await provider.getVisualizationData(validSelection, {
      includeNAResponses: true,
      useWeightedPercentages: true,
    })

    expect(result.bars.some((bar) => bar.category === 'N/A')).toBe(true)
  })

  it('excludes N/A bar when includeNAResponses is false', async () => {
    const result = await provider.getVisualizationData(validSelection, {
      includeNAResponses: false,
      useWeightedPercentages: true,
    })

    expect(result.bars.some((bar) => bar.category === 'N/A')).toBe(false)
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
