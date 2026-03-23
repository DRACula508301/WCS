import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SelectionWizard from './SelectionWizard'
import type { SelectionState } from '../domain/selection'
import type { OptionProvider } from '../providers/options/OptionProvider'

vi.mock('./DropdownSection', () => ({
  default: ({
    stepKey,
    title,
    options,
    value,
    onSelect,
  }: {
    stepKey: number
    title: string
    options: Record<string, string>
    value: string
    onSelect: (stepKey: number, value: string, label: string) => void
  }) => (
    <div data-testid={`step-${stepKey}`}>
      <h3>{title}</h3>
      <div data-testid={`value-${stepKey}`}>{value}</div>
      {Object.entries(options).map(([optionValue, optionLabel]) => (
        <button key={optionValue} onClick={() => onSelect(stepKey, optionValue, optionLabel)}>
          {optionLabel}
        </button>
      ))}
    </div>
  ),
}))

const createProvider = (): OptionProvider => ({
  getInterestVariables: vi.fn().mockResolvedValue({
    IV1: 'Interest Var 1',
    IV2: 'Interest Var 2',
  }),
  getWaves: vi.fn().mockImplementation(async (interestVariable: string) => {
    if (interestVariable === 'IV1') {
      return ['Wave1', 'Wave2']
    }

    return ['Wave3']
  }),
  getModifiers: vi.fn().mockImplementation(async (wave: string) => {
    if (wave === 'Wave1') {
      return ['Modifier1', 'Modifier2']
    }

    return ['Modifier3']
  }),
})

describe('SelectionWizard', () => {
  it('initial render shows first field only', () => {
    render(
      <SelectionWizard
        selection={{ interestVariable: '', interestVariableLabel: '', wave: '', modifier: '' }}
        onSelectionChange={() => {}}
        optionProvider={createProvider()}
      />,
    )

    expect(screen.getByText('Interest Variable')).toBeInTheDocument()
    expect(screen.queryByText('Wave')).not.toBeInTheDocument()
    expect(screen.queryByText('Grouped by')).not.toBeInTheDocument()
  })

  it('selecting interest variable triggers wave option load', async () => {
    const optionProvider = createProvider()
    let selection: SelectionState = { interestVariable: '', interestVariableLabel: '', wave: '', modifier: '' }

    const { rerender } = render(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Interest Var 1' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Interest Var 1' }))

    expect(selection).toEqual({ interestVariable: 'IV1', interestVariableLabel: 'Interest Var 1', wave: '', modifier: '' })

    rerender(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    await waitFor(() => {
      expect(optionProvider.getWaves).toHaveBeenCalledWith('IV1')
    })

    expect(screen.getByText('Wave')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Wave1' })).toBeInTheDocument()
  })

  it('selecting wave triggers modifier option load', async () => {
    const optionProvider = createProvider()
    let selection: SelectionState = { interestVariable: 'IV1', interestVariableLabel: 'Interest Var 1', wave: '', modifier: '' }

    const { rerender } = render(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    await waitFor(() => {
      expect(optionProvider.getWaves).toHaveBeenCalledWith('IV1')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Wave1' }))

    expect(selection).toEqual({ interestVariable: 'IV1', interestVariableLabel: 'Interest Var 1', wave: 'Wave1', modifier: '' })

    rerender(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    await waitFor(() => {
      expect(optionProvider.getModifiers).toHaveBeenCalledWith('Wave1')
    })

    expect(screen.getByText('Grouped by')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Modifier1' })).toBeInTheDocument()
  })

  it('changing interest variable clears wave and modifier', async () => {
    const optionProvider = createProvider()
    let selection: SelectionState = {
      interestVariable: 'IV1',
      interestVariableLabel: 'Interest Var 1',
      wave: 'Wave1',
      modifier: 'Modifier1',
    }

    const { rerender } = render(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    await waitFor(() => {
      expect(optionProvider.getWaves).toHaveBeenCalledWith('IV1')
      expect(optionProvider.getModifiers).toHaveBeenCalledWith('Wave1')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Interest Var 2' }))

    expect(selection).toEqual({
      interestVariable: 'IV2',
      interestVariableLabel: 'Interest Var 2',
      wave: '',
      modifier: '',
    })

    rerender(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    await waitFor(() => {
      expect(optionProvider.getWaves).toHaveBeenCalledWith('IV2')
    })

    expect(screen.queryByText('Grouped by')).not.toBeInTheDocument()
  })

  it('onSelectionChange emits expected state transitions per step', async () => {
    const emitted: SelectionState[] = []
    const optionProvider = createProvider()
    let selection: SelectionState = { interestVariable: '', interestVariableLabel: '', wave: '', modifier: '' }

    const { rerender } = render(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          emitted.push(next)
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Interest Var 1' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Interest Var 1' }))

    rerender(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          emitted.push(next)
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Wave1' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Wave1' }))

    rerender(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          emitted.push(next)
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Modifier1' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Modifier1' }))

    rerender(
      <SelectionWizard
        selection={selection}
        onSelectionChange={(next) => {
          emitted.push(next)
          selection = next
        }}
        optionProvider={optionProvider}
      />,
    )

    expect(emitted).toEqual([
      { interestVariable: 'IV1', interestVariableLabel: 'Interest Var 1', wave: '', modifier: '' },
      { interestVariable: 'IV1', interestVariableLabel: 'Interest Var 1', wave: 'Wave1', modifier: '' },
      { interestVariable: 'IV1', interestVariableLabel: 'Interest Var 1', wave: 'Wave1', modifier: 'Modifier1' },
    ])
  })
})
