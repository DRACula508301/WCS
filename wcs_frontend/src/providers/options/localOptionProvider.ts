import type { OptionProvider } from './OptionProvider'
import { CSV_BASE_URL, CSV_WAVE_DIRECTORIES } from './providerConfigs'
import Papa from 'papaparse'

type CsvRow = Record<string, string>

const normalizeHeader = (header: string): string => header.toLowerCase().replace(/[^a-z0-9]/g, '')

const readCell = (row: CsvRow, candidateHeaders: string[]): string => {
  const normalizedCandidates = new Set(candidateHeaders.map(normalizeHeader))
  const matchedKey = Object.keys(row).find((key) => normalizedCandidates.has(normalizeHeader(key)))
  return matchedKey ? String(row[matchedKey] ?? '').trim() : ''
}

const resolveFetchUrl = (path: string): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const origin = window.location?.origin
  if (!origin || origin === 'null') {
    return null
  }

  try {
    return new URL(path, origin).toString()
  } catch {
    return null
  }
}

const isLikelyHtmlDocument = (content: string): boolean => {
  const trimmed = content.trimStart().toLowerCase()
  return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')
}

export class LocalOptionProvider implements OptionProvider {
  private var2label: Record<string, string> = {}
  private var2wave: Record<string, string[]> = {}
  private wave2modifiers: Record<string, string[]> = {}
  private readonly initPromise: Promise<void>

  constructor() {
    this.initPromise = this.initialize()
  }

  private async initialize(): Promise<void> {
    await Promise.all(
      CSV_WAVE_DIRECTORIES.map(async (waveDir) => {
        await Promise.all([this.loadVariableLabelsForWave(waveDir), this.loadModifiersForWave(waveDir)])
      }),
    )
  }

  private async fetchFirstAvailableRows(candidatePaths: string[]): Promise<CsvRow[]> {
    if (import.meta.env.MODE === 'test') {
      return []
    }

    for (const path of candidatePaths) {
      try {
        const resolvedPath = resolveFetchUrl(path)
        if (!resolvedPath) {
          return []
        }

        const response = await fetch(resolvedPath)
        if (!response.ok) {
          console.warn(`Failed to fetch ${path}: ${response.status} ${response.statusText}`)
          continue
        }

        const csvText = await response.text()
        if (isLikelyHtmlDocument(csvText)) {
          console.warn(`Fetched HTML instead of CSV at ${path}. Ensure files exist under /public/csv_output.`)
          continue
        }

        const parsed = Papa.parse<CsvRow>(csvText, {
          delimiter: ',',
          header: true,
          skipEmptyLines: true,
        })

        if (parsed.errors.length > 0) {
          console.warn(`CSV parse warnings for ${path}: ${parsed.errors[0].message}`)
        }

        return parsed.data
      } catch (error) {
        console.warn(`Error loading CSV at ${path}:`, error)
        // Try the next candidate.
      }
    }

    return []
  }

  private async loadVariableLabelsForWave(waveDir: string): Promise<void> {
    const rows = await this.fetchFirstAvailableRows([
      `${CSV_BASE_URL}/${waveDir}/variable_labels.csv`,
      `${CSV_BASE_URL}/${waveDir}/${waveDir}_variable_labels.csv`,
    ])

    for (const row of rows) {
      const variable = readCell(row, ['Variable Name'])
      const label = readCell(row, ['Variable Label'])
      if (!variable) {
        continue
      }

      this.var2label[variable] = label || variable
      if (!this.var2wave[variable]) {
        this.var2wave[variable] = []
      }

      if (!this.var2wave[variable].includes(waveDir)) {
        this.var2wave[variable].push(waveDir)
      }
    }
  }

  private async loadModifiersForWave(waveDir: string): Promise<void> {
    const rows = await this.fetchFirstAvailableRows([`${CSV_BASE_URL}/${waveDir}/modifiers.csv`])
    const modifierSet = new Set<string>()

    for (const row of rows) {
      const modifier = readCell(row, ['modifier'])
      if (modifier) {
        modifierSet.add(modifier)
      }
    }

    this.wave2modifiers[waveDir] = Array.from(modifierSet)
  }

  async getInterestVariables(): Promise<Record<string, string>> {
    await this.initPromise
    return this.var2label
  }

  async getWaves(interestVariable: string): Promise<string[]> {
    await this.initPromise
    return this.var2wave[interestVariable] || []
  }

  async getModifiers(wave: string): Promise<string[]> {
    await this.initPromise
    return this.wave2modifiers[wave] || []
  }
}