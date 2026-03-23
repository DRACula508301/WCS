export interface SurveyRow {
  wave: string
  weight: number
  responses: Record<string, string>
  modifiers: Record<string, string>
}

// ---- Variable options (mirrors app.R) ----
export const INTEREST_VARIABLES = [
  'A1',
  'A2',
  'A3',
  'newsint',
  'C1_1',
  'C1_2',
  'C1_3',
  'C1_4',
  'C1_5',
  'C1_6',
  'C2_1',
  'C2_2',
  'C2_3',
  'C2_4',
  'C2_5',
  'C2_6',
  'C2_7',
  'C2_8',
  'C2_9',
  'C3_1',
  'C3_2',
  'C3_3',
  'C3_4',
  'C3_5',
  'C3_6',
  'D1_1',
  'D1_2',
  'D1_3',
  'D1_4',
  'E1',
  'E2',
  'E3',
  'E4',
  'F1_7',
  'F1_8',
  'F2_1',
  'F2_2',
  'F2_3',
  'F2_4',
  'F2_5',
  'F2_6',
  'F2_7',
  'F3',
  'F4',
  'F5',
] as const

export const MODERATOR_VARIABLES = [
  'gender4',
  'age4',
  'race',
  'race4',
  'hispanic',
  'educ',
  'educ4',
  'educ2',
  'region',
  'urbancity',
  'ownrent',
  'faminc',
  'employ',
  'marstat',
  'child18',
  'pew_religimp',
  'pew_churatd',
  'pew_bornagain',
  'pew_prayer',
  'religpew',
  'ideo5',
  'ideo3',
  'pid3',
  'pid7',
  'pid3_baseline',
  'pid7_baseline',
] as const

export const WAVE_OPTIONS = [
  'Wave 1 (Oct 2023)',
  'Wave 2 (Feb 2024)',
  'Wave 3 (May 2024)',
  'Wave 4 (Oct 2024)',
  'Wave 5 (Feb 2025)',
  'Wave 6 (May 2025)',
] as const

// ---- Labels/questions used by visualization ----
export const INTEREST_VARIABLE_QUESTIONS: Record<string, string> = Object.fromEntries(
  INTEREST_VARIABLES.map((variable) => [variable, `Question wording for ${variable}`]),
)

const DEFAULT_RESPONSE_OPTIONS = ['Strongly agree', 'Somewhat agree', 'Somewhat disagree', 'Strongly disagree', 'Not sure']

export const INTEREST_RESPONSE_OPTIONS: Record<string, string[]> = Object.fromEntries(
  INTEREST_VARIABLES.map((variable) => [variable, DEFAULT_RESPONSE_OPTIONS]),
)

const MODERATOR_LEVELS: Record<string, string[]> = {
  pid7: [
    'Strong Democrat',
    'Not very strong Democrat',
    'Lean Democrat',
    'Independent',
    'Lean Republican',
    'Not very strong Republican',
    'Strong Republican',
  ],
  pid7_baseline: [
    'Strong Democrat',
    'Not very strong Democrat',
    'Lean Democrat',
    'Independent',
    'Lean Republican',
    'Not very strong Republican',
    'Strong Republican',
  ],
  pid3: ['Democrat', 'Independent', 'Republican'],
  pid3_baseline: ['Democrat', 'Independent', 'Republican'],
  ideo5: ['Very liberal', 'Liberal', 'Moderate', 'Conservative', 'Very conservative'],
  ideo3: ['Liberal', 'Moderate', 'Conservative'],
  age4: ['18-29', '30-44', '45-64', '65+'],
  gender4: ['Female', 'Male', 'Non-binary', 'Prefer not to say'],
}

const DEFAULT_MODERATOR_LEVELS = ['Group 1', 'Group 2', 'Group 3', 'Not sure']

export const MODERATOR_OPTIONS = ['None', ...MODERATOR_VARIABLES]

const hashValue = (value: string): number => {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

// ---- Load data (static synthetic stand-in for local csv/rds/db backends) ----
export const STATIC_SURVEY_ROWS: SurveyRow[] = WAVE_OPTIONS.flatMap((wave, waveIndex) =>
  Array.from({ length: 240 }, (_, respondentIndex) => {
    const seed = waveIndex * 211 + respondentIndex * 37

    const responses: Record<string, string> = {}
    INTEREST_VARIABLES.forEach((interestVariable, interestIndex) => {
      const choices = INTEREST_RESPONSE_OPTIONS[interestVariable]
      responses[interestVariable] = choices[(seed + interestIndex * 13) % choices.length]
    })

    const modifiers: Record<string, string> = {}
    MODERATOR_VARIABLES.forEach((moderator) => {
      const levels = MODERATOR_LEVELS[moderator] ?? DEFAULT_MODERATOR_LEVELS
      const offset = hashValue(moderator)
      modifiers[moderator] = levels[(seed + offset) % levels.length]
    })

    return {
      wave,
      weight: 0.8 + ((seed % 9) * 0.15),
      responses,
      modifiers,
    }
  }),
)
