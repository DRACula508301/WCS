# WCS Frontend Architecture

This frontend is a React + TypeScript + Vite app that renders:
- a 3-step selection workflow (interest variable → wave → grouping/modifier), and
- a D3 grouped bar chart showing weighted percentages.

## Structural Hierarchy

```
src/
  App.tsx                         # Composition root, state owner, provider wiring
  domain/
    selection.ts                  # Shared selection state model
  components/
    SelectionWizard.tsx           # Controlled multi-step selector
    DropdownSection.tsx           # Reusable searchable split dropdown
    Visualization.tsx             # D3 grouped percentage chart
    constants.ts                  # UI step constants
  providers/
    options/
      OptionProvider.ts           # Abstract options contract
      staticOptionProvider.ts     # Static implementation (uses survey metadata)
    visualization/
      VisualizationDataProvider.ts     # Abstract visualization-data contract
      staticVisualizationProvider.ts   # Static implementation (ingestion + percentage logic)
      staticSurveyData.ts              # Synthetic static survey rows + metadata
```

## Runtime Dependencies

- `react`, `react-dom`: component model and rendering.
- `react-bootstrap`: dropdown UI controls.
- `bootstrap`: base styles.
- `d3`: chart scales used by `Visualization` for grouped bars.

## Data Flow (Top-Level)

1. `App` owns `SelectionState` and creates provider instances.
2. `SelectionWizard` receives current state + `OptionProvider`, loads step options asynchronously, and emits updates upward via `onSelectionChange`.
3. `App` reacts to selection changes and requests chart-ready percentage data from `VisualizationDataProvider`.
4. `Visualization` receives only processed chart data (`VisualizationData`) and renders the grouped bar chart.

No component receives raw survey rows except provider implementations.

## Component Boundaries (I/O Contracts)

### `App`

- File: [src/App.tsx](src/App.tsx)
- Owns state:
  - `selection: SelectionState`
  - `visualizationData: VisualizationData`
  - loading/error flags for visualization fetch
- Inputs: none (composition root)
- Outputs: renders child components with props and orchestrates provider calls

### `SelectionWizard`

- File: [src/components/SelectionWizard.tsx](src/components/SelectionWizard.tsx)
- Props (input):
  - `selection: SelectionState`
  - `onSelectionChange(next: SelectionState): void`
  - `optionProvider: OptionProvider`
- Output:
  - emits normalized selection updates upward
- Local state:
  - option lists + loading flags per step
- Dependency reset behavior:
  - change interest variable ⇒ clears wave + modifier
  - change wave ⇒ clears modifier

### `DropdownSection` (`SplitDropdown`)

- File: [src/components/DropdownSection.tsx](src/components/DropdownSection.tsx)
- Props (input):
  - `stepKey: number`
  - `title: string`
  - `options: string[]`
  - `value: string`
  - `onSelect(stepKey: number, value: string): void`
- Output:
  - user selection callback to parent
- Local state:
  - text input value, focus state, dropdown open/close, filtered options

### `Visualization`

- File: [src/components/Visualization.tsx](src/components/Visualization.tsx)
- Props (input):
  - `data: VisualizationData`
  - `isLoading: boolean`
  - `error: string | null`
- Output:
  - presentational only (no data fetching)
- Rendering model:
  - D3 scales + responsive SVG grouped bars
  - each response category is a group; each modifier value is a side-by-side vertical bar in that group

## Domain Model

### `SelectionState`

- File: [src/domain/selection.ts](src/domain/selection.ts)
- Shape:
  - `interestVariable: string`
  - `wave: string`
  - `modifier: string`
- Helpers:
  - `EMPTY_SELECTION`
  - `isValidSelection(state)`

## Interface Contracts and Implementations

### `OptionProvider` (abstract)

- File: [src/providers/options/OptionProvider.ts](src/providers/options/OptionProvider.ts)
- Contract:
  - `getInterestVariables(): Promise<string[]>`
  - `getWaves(interestVariable: string): Promise<string[]>`
  - `getModifiers(wave: string): Promise<string[]>`

#### `StaticOptionProvider` (implementation)

- File: [src/providers/options/staticOptionProvider.ts](src/providers/options/staticOptionProvider.ts)
- Description:
  - Resolves options from static survey metadata in `staticSurveyData.ts`.
  - Returns app.R-aligned interest variables and wave labels.
  - Returns grouping options (`None` + moderator variables) for valid waves.

### `VisualizationDataProvider` (abstract)

- File: [src/providers/visualization/VisualizationDataProvider.ts](src/providers/visualization/VisualizationDataProvider.ts)
- Contract:
  - `getVisualizationData(selection: SelectionState): Promise<VisualizationData>`
- Output model (`VisualizationData`):
  - `title`, `subtitle`, `questionText`
  - `groupedBy`
  - `bars: PercentageBar[]`
  - `legend: LegendItem[]`

#### `StaticVisualizationDataProvider` (implementation)

- File: [src/providers/visualization/staticVisualizationProvider.ts](src/providers/visualization/staticVisualizationProvider.ts)
- Description:
  - Ingests synthetic static survey rows from `staticSurveyData.ts`.
  - Performs weighted percentage aggregation.
  - Handles grouped and ungrouped chart modes.
  - Applies app.R-inspired color mappings:
    - `pid7`, `pid3`, `ideo5`, `ideo3` explicit palettes
    - Okabe-Ito fallback for other grouping fields
  - Returns chart-ready percentages only (no raw rows at component boundary).

## Static Data Module

- File: [src/providers/visualization/staticSurveyData.ts](src/providers/visualization/staticSurveyData.ts)
- Purpose:
  - Provides app.R-aligned variable and wave metadata.
  - Defines synthetic `SurveyRow[]` for local/static provider execution.
  - Central place to replace when introducing real CSV/Redis/DB backends.

## Swap Points for Future Backends

- Replace `StaticOptionProvider` with another `OptionProvider` implementation (CSV/API/DB).
- Replace `StaticVisualizationDataProvider` with another `VisualizationDataProvider` implementation.
- `SelectionWizard` and `Visualization` remain unchanged as long as interfaces are honored.

## Dev Commands

- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`
