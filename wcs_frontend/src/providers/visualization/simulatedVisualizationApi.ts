import type { SelectionState } from '../../domain/selection'
import type { AggregatedVisualizationPayload } from './VisualizationDataProvider'
import { INTEREST_VARIABLE_QUESTIONS } from './staticSurveyData'

const OPTION_LABELS = ['1', '2', '3', '4']
const MODIFIER_LABELS = ['1', '2', '3']
const MISSING_OPTION = '4'

const randomPartsThatSumTo100 = (partCount: number): number[] => {
  if (partCount <= 0) {
    return []
  }

  const seeds = Array.from({ length: partCount }, () => Math.random())
  const totalSeed = seeds.reduce((sum, value) => sum + value, 0) || 1
  const percentages = seeds.map((value) => Number(((100 * value) / totalSeed).toFixed(2)))

  const roundedTotal = percentages.reduce((sum, value) => sum + value, 0)
  const correction = Number((100 - roundedTotal).toFixed(2))
  percentages[partCount - 1] = Number((percentages[partCount - 1] + correction).toFixed(2))

  return percentages
}

const splitRowByModifiers = (optionTotal: number, modifierCount: number): number[] => {
  if (modifierCount <= 0) {
    return []
  }

  const shares = randomPartsThatSumTo100(modifierCount)
  const row = shares.map((share) => Number(((optionTotal * share) / 100).toFixed(2)))
  const rowTotal = row.reduce((sum, value) => sum + value, 0)
  const correction = Number((optionTotal - rowTotal).toFixed(2))
  row[modifierCount - 1] = Number((row[modifierCount - 1] + correction).toFixed(2))

  return row
}

export const simulateVisualizationResponse = async (
  selection: SelectionState,
): Promise<AggregatedVisualizationPayload> => {
  const groupedBy = selection.modifier === 'None' ? null : selection.modifier
  const options = [...OPTION_LABELS]

  if (!groupedBy) {
    const weighted = randomPartsThatSumTo100(options.length)
    const unweighted = randomPartsThatSumTo100(options.length)

    return {
      options,
      weighted,
      unweighted,
      groupedBy: null,
      questionText:
        INTEREST_VARIABLE_QUESTIONS[selection.interestVariable] ?? selection.interestVariableLabel,
      title: `${selection.wave}: ${selection.interestVariableLabel}`,
      missingOptionLabels: [MISSING_OPTION],
    }
  }

  const modifierOptions = [...MODIFIER_LABELS]
  const weightedOptionTotals = randomPartsThatSumTo100(options.length)
  const unweightedOptionTotals = randomPartsThatSumTo100(options.length)

  // Matrix shape: [[1-1, 1-2, ...], [2-1, 2-2, ...], ...]
  const weightedMatrix = weightedOptionTotals.map((optionTotal) =>
    splitRowByModifiers(optionTotal, modifierOptions.length),
  )
  const unweightedMatrix = unweightedOptionTotals.map((optionTotal) =>
    splitRowByModifiers(optionTotal, modifierOptions.length),
  )

  return {
    options,
    weighted: weightedMatrix,
    unweighted: unweightedMatrix,
    modifierOptions,
    groupedBy,
    questionText:
      INTEREST_VARIABLE_QUESTIONS[selection.interestVariable] ?? selection.interestVariableLabel,
    title: `${selection.wave}: ${selection.interestVariableLabel} by ${groupedBy}`,
    missingOptionLabels: [MISSING_OPTION],
  }
}
