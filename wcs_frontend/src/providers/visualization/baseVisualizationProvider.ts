import { isValidSelection, type SelectionState } from '../../domain/selection'
import type {
  LegendItem,
  PercentageBar,
  VisualizationData,
  VisualizationDataProvider,
  VisualizationOptions,
} from './VisualizationDataProvider'

export interface ProviderSurveyRow {
  wave: string
  weight: number
  responses: Record<string, string>
  modifiers: Record<string, string>
}

const EMPTY_VISUALIZATION: VisualizationData = {
  title: 'Weidenbaum Center Survey (WCS) Dashboard',
  subtitle: 'Select all fields to view chart percentages.',
  questionText: 'Question wording appears here once a complete selection is available.',
  groupedBy: null,
  bars: [],
  legend: [],
}

const DEFAULT_VISUALIZATION_OPTIONS: VisualizationOptions = {
  includeNAResponses: true,
  useWeightedPercentages: true,
}

const NA_RESPONSE_VALUES = new Set(['N/A', 'Not sure', 'Other', 'Skipped'])
const NA_CATEGORY = 'N/A'
const OVERALL_COLOR = '#0072B2'

export abstract class BaseVisualizationDataProvider implements VisualizationDataProvider {
  async getVisualizationData(
    selection: SelectionState,
    options: VisualizationOptions = DEFAULT_VISUALIZATION_OPTIONS,
  ): Promise<VisualizationData> {
    if (!isValidSelection(selection)) {
      return EMPTY_VISUALIZATION
    }

    const rowsForWave = await this.getRowsForWave(selection.wave)
    const normalizedRows = this.normalizeRowsForNA(
      rowsForWave,
      selection.interestVariable,
      options.includeNAResponses,
    )

    const rowsForCalculation = options.includeNAResponses
      ? normalizedRows
      : normalizedRows.filter((row) => row.responses[selection.interestVariable] !== NA_CATEGORY)

    const categories = this.buildCategories(
      this.getResponseOptions(selection.interestVariable),
      options.includeNAResponses,
    )
    const groupedBy = selection.modifier === 'None' ? null : selection.modifier

    const total = rowsForCalculation.reduce(
      (sum, row) => sum + this.getRowValue(row, options.useWeightedPercentages),
      0,
    )

    const colorLookupRows = groupedBy ? await this.getRowsForColorLookup(groupedBy) : rowsForCalculation
    const bars = this.computeBars(
      rowsForCalculation,
      selection.interestVariable,
      categories,
      groupedBy,
      total,
      options.useWeightedPercentages,
      colorLookupRows,
    )

    const questionText =
      this.getQuestionText(selection.interestVariable) ?? selection.interestVariableLabel

    return {
      title: this.buildTitle(selection),
      subtitle: this.buildSubtitle(total, options),
      questionText,
      groupedBy,
      bars,
      legend: this.buildLegend(bars, groupedBy),
    }
  }

  protected abstract getRowsForWave(wave: string): Promise<ProviderSurveyRow[]>

  protected abstract getResponseOptions(interestVariable: string): string[]

  protected abstract getQuestionText(interestVariable: string): string | undefined

  protected async getRowsForColorLookup(_groupedBy: string): Promise<ProviderSurveyRow[]> {
    return []
  }

  protected getRowValue(row: ProviderSurveyRow, useWeightedPercentages: boolean): number {
    return useWeightedPercentages ? row.weight : 1
  }

  private normalizeRowsForNA(
    rows: ProviderSurveyRow[],
    interestVariable: string,
    includeNAResponses: boolean,
  ): ProviderSurveyRow[] {
    if (!includeNAResponses) {
      return rows
    }

    return rows.map((row) => {
      const responseValue = row.responses[interestVariable]
      if (!responseValue || NA_RESPONSE_VALUES.has(responseValue)) {
        return {
          ...row,
          responses: {
            ...row.responses,
            [interestVariable]: NA_CATEGORY,
          },
        }
      }

      return row
    })
  }

  private buildCategories(baseCategories: string[], includeNAResponses: boolean): string[] {
    const nonNA = baseCategories.filter((category) => !NA_RESPONSE_VALUES.has(category))

    if (!includeNAResponses) {
      return nonNA
    }

    return [...nonNA, NA_CATEGORY]
  }

  private computeBars(
    rows: ProviderSurveyRow[],
    interestVariable: string,
    categories: string[],
    groupedBy: string | null,
    total: number,
    useWeightedPercentages: boolean,
    colorLookupRows: ProviderSurveyRow[],
  ): PercentageBar[] {
    const safeTotal = total || 1

    return categories.map((category) => {
      const categoryRows = rows.filter((row) => row.responses[interestVariable] === category)
      const categoryTotal = categoryRows.reduce(
        (sum, row) => sum + this.getRowValue(row, useWeightedPercentages),
        0,
      )
      const categoryPercentage = (100 * categoryTotal) / safeTotal

      if (!groupedBy) {
        return {
          category,
          percentage: Number(categoryPercentage.toFixed(2)),
          segments: [
            {
              label: category,
              percentage: Number(categoryPercentage.toFixed(2)),
              color: OVERALL_COLOR,
            },
          ],
        }
      }

      const groupedWeights = new Map<string, number>()
      categoryRows.forEach((row) => {
        const groupValue = row.modifiers[groupedBy]
        if (!groupValue) {
          return
        }

        groupedWeights.set(
          groupValue,
          (groupedWeights.get(groupValue) ?? 0) + this.getRowValue(row, useWeightedPercentages),
        )
      })

      const colors = this.getGroupColorMap(groupedBy, colorLookupRows)
      const segments = Array.from(groupedWeights.entries()).map(([label, weight]) => ({
        label,
        percentage: Number(((100 * weight) / safeTotal).toFixed(2)),
        color: colors.get(label) ?? '#999999',
      }))

      return {
        category,
        percentage: Number(categoryPercentage.toFixed(2)),
        segments,
      }
    })
  }

  private getGroupColorMap(groupedBy: string, rows: ProviderSurveyRow[]): Map<string, string> {
    const partyColors7 = new Map<string, string>([
      ['Strong Democrat', '#08306B'],
      ['Not very strong Democrat', '#2171B5'],
      ['Lean Democrat', '#6BAED6'],
      ['Independent', '#BDBDBD'],
      ['Lean Republican', '#FC9272'],
      ['Not very strong Republican', '#FB6A4A'],
      ['Strong Republican', '#CB181D'],
      ['Not sure', '#969696'],
    ])

    const partyColors3 = new Map<string, string>([
      ['Democrat', '#2171B5'],
      ['Republican', '#CB181D'],
      ['Independent', '#BDBDBD'],
      ['Other', '#969696'],
      ['Not sure', '#737373'],
    ])

    const ideoColors5 = new Map<string, string>([
      ['Very liberal', '#08306B'],
      ['Liberal', '#6BAED6'],
      ['Moderate', '#BDBDBD'],
      ['Conservative', '#FC9272'],
      ['Very conservative', '#CB181D'],
      ['Not sure', '#969696'],
      ['Skipped', 'gray20'],
    ])

    const ideoColors3 = new Map<string, string>([
      ['Liberal', '#2171B5'],
      ['Moderate', '#BDBDBD'],
      ['Conservative', '#CB181D'],
      ['Not sure', '#737373'],
      ['Skipped', '#969696'],
    ])

    const okabeIto = [
      '#E69F00',
      '#56B4E9',
      '#009E73',
      '#F0E442',
      '#0072B2',
      '#D55E00',
      '#CC79A7',
      '#999999',
    ]

    if (groupedBy === 'pid7') {
      return partyColors7
    }

    if (groupedBy === 'pid3') {
      return partyColors3
    }

    if (groupedBy === 'ideo5') {
      return ideoColors5
    }

    if (groupedBy === 'ideo3') {
      return ideoColors3
    }

    const values = rows.map((row) => row.modifiers[groupedBy]).filter(Boolean)
    const uniqueValues = Array.from(new Set(values))
    return new Map(uniqueValues.map((value, index) => [value, okabeIto[index % okabeIto.length]]))
  }

  private buildLegend(bars: PercentageBar[], groupedBy: string | null): LegendItem[] {
    if (!groupedBy) {
      return [{ label: 'Overall', color: OVERALL_COLOR }]
    }

    const byLabel = new Map<string, string>()
    bars.forEach((bar) => {
      bar.segments.forEach((segment) => {
        byLabel.set(segment.label, segment.color)
      })
    })

    return Array.from(byLabel.entries()).map(([label, color]) => ({ label, color }))
  }

  private buildTitle(selection: SelectionState): string {
    return `${selection.wave}: ${selection.interestVariableLabel}${selection.modifier === 'None' ? '' : ` by ${selection.modifier}`}`
  }

  private buildSubtitle(total: number, options: VisualizationOptions): string {
    const mode = options.useWeightedPercentages ? 'Weighted' : 'Unweighted'
    const naMode = options.includeNAResponses ? 'N/A included' : 'N/A excluded'
    return `${mode} · ${naMode} · N=${Math.round(total).toLocaleString()}`
  }
}
