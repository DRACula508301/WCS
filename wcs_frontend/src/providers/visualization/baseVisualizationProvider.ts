import { isValidSelection, type SelectionState } from '../../domain/selection'
import type {
  AggregatedVisualizationPayload,
  LegendItem,
  PercentageBar,
  VisualizationData,
  VisualizationDataProvider,
  VisualizationOptions,
} from './VisualizationDataProvider'

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

const DEFAULT_MISSING_LABELS = ['null/missing', 'n/a', 'not sure', 'skipped', 'missing', 'other']
const OVERALL_COLOR = '#0072B2'
const MISSING_COLOR = '#969696'

export abstract class BaseVisualizationDataProvider implements VisualizationDataProvider {
  async getVisualizationData(
    selection: SelectionState,
    options: VisualizationOptions = DEFAULT_VISUALIZATION_OPTIONS,
  ): Promise<VisualizationData> {
    if (!isValidSelection(selection)) {
      return EMPTY_VISUALIZATION
    }

    const payload = await this.fetchAggregatedPayload(selection)
    const groupedBy = selection.modifier === 'None' ? null : selection.modifier
    const matrix = this.toMatrix(
      options.useWeightedPercentages ? payload.weighted : payload.unweighted,
      payload.options.length,
    )
    const normalized = options.includeNAResponses
      ? { options: payload.options, matrix }
      : this.excludeAndRenormalizeMissing(payload, matrix)

    const segmentLabels = groupedBy ? payload.modifierOptions ?? [] : ['Overall']
    const colorMap = this.getGroupColorMap(groupedBy, segmentLabels)
    const bars = this.buildBars(normalized.options, normalized.matrix, groupedBy, segmentLabels, colorMap)

    const questionText =
      payload.questionText ?? selection.interestVariableLabel

    return {
      title: payload.title ?? this.buildTitle(selection),
      subtitle: this.buildSubtitle(options),
      questionText,
      groupedBy,
      bars,
      legend: this.buildLegend(bars, groupedBy),
    }
  }

  protected abstract fetchAggregatedPayload(
    selection: SelectionState,
  ): Promise<AggregatedVisualizationPayload>

  private toMatrix(
    source: AggregatedVisualizationPayload['weighted'] | AggregatedVisualizationPayload['unweighted'],
    optionCount: number,
  ): number[][] {
    if (source.length === 0) {
      return []
    }

    const first = source[0]
    if (Array.isArray(first)) {
      return source as number[][]
    }

    const vector = source as number[]
    return vector.slice(0, optionCount).map((value) => [value])
  }

  private excludeAndRenormalizeMissing(
    payload: AggregatedVisualizationPayload,
    matrix: number[][],
  ): { options: string[]; matrix: number[][] } {
    const missingLabels = new Set(
      (payload.missingOptionLabels ?? DEFAULT_MISSING_LABELS).map((value) => value.trim().toLowerCase()),
    )

    const includedRows = payload.options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => !missingLabels.has(option.trim().toLowerCase()))

    const denominator = includedRows.reduce((sum, { index }) => {
      const row = matrix[index] ?? []
      return sum + row.reduce((inner, value) => inner + value, 0)
    }, 0)

    const safeDenominator = denominator > 0 ? denominator : 1
    const includedIndex = new Set(includedRows.map((item) => item.index))

    return {
      options: includedRows.map((item) => item.option),
      matrix: matrix
        .map((row, index) => ({ row, index }))
        .filter(({ index }) => includedIndex.has(index))
        .map(({ row }) => row.map((value) => Number(((100 * value) / safeDenominator).toFixed(2)))),
    }
  }

  private isMissingCategory(category: string): boolean {
    const normalized = category.trim().toLowerCase()
    return DEFAULT_MISSING_LABELS.includes(normalized)
  }

  private buildBars(
    options: string[],
    matrix: number[][],
    groupedBy: string | null,
    segmentLabels: string[],
    colorMap: Map<string, string>,
  ): PercentageBar[] {
    return options.map((category, optionIndex) => {
      const row = matrix[optionIndex] ?? []

      if (!groupedBy) {
        const singleValue = row[0] ?? 0
        return {
          category,
          percentage: Number(singleValue.toFixed(2)),
          segments: [
            {
              label: category,
              percentage: Number(singleValue.toFixed(2)),
              color: this.isMissingCategory(category) ? MISSING_COLOR : OVERALL_COLOR,
            },
          ],
        }
      }

      const segments = segmentLabels.map((label, segmentIndex) => ({
        label,
        percentage: Number((row[segmentIndex] ?? 0).toFixed(2)),
        color: colorMap.get(label) ?? '#999999',
      }))

      return {
        category,
        percentage: Number(segments.reduce((sum, segment) => sum + segment.percentage, 0).toFixed(2)),
        segments,
      }
    })
  }

  private getGroupColorMap(groupedBy: string | null, labels: string[]): Map<string, string> {
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

    if (!groupedBy) {
      return new Map<string, string>([['Overall', OVERALL_COLOR]])
    }

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

    return new Map(labels.map((value, index) => [value, okabeIto[index % okabeIto.length]]))
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

  private buildSubtitle(options: VisualizationOptions): string {
    const mode = options.useWeightedPercentages ? 'Weighted' : 'Unweighted'
    const naMode = options.includeNAResponses ? 'N/A included' : 'N/A excluded'
    return `${mode} · ${naMode}`
  }
}
