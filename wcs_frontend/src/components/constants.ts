export const INTEREST_VARIABLES = [
    "IV1",
    "IV2",
    "IV3"
]

export const WAVES = {
  "IV1": ["Wave1", "Wave2", "Wave3"],
  "IV2": ["Wave2", "Wave3", "Wave5"],
  "IV3": ["Wave1", "Wave2", "Wave4"]
}

export const MODIFIER_OPTIONS = {
    "Wave1": ["Modifier1", "Modifier2", "Modifier3"],
    "Wave2": ["Modifier2", "Modifier3", "Modifier4"],
    "Wave3": ["Modifier1", "Modifier3", "Modifier4"],
    "Wave4": ["Modifier1", "Modifier2", "Modifier4"],
    "Wave5": ["Modifier1", "Modifier2", "Modifier3"]
}

export const STEPS = {
  INTEREST_VARIABLE: 0,
  WAVE: 1,
  MODIFIERS: 2
} as const