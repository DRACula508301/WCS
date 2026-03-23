import { useEffect, useMemo, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import SelectionWizard from './components/SelectionWizard.tsx'
import { EMPTY_SELECTION, type SelectionState } from './domain/selection'
import { LocalOptionProvider } from './providers/options/localOptionProvider'
import Visualization from './components/Visualization'
import type { VisualizationData } from './providers/visualization/VisualizationDataProvider'
import { LocalVisualizationProvider } from './providers/visualization/localVisualizationProvider'

function App() {
  const [selection, setSelection] = useState<SelectionState>(EMPTY_SELECTION)
  const optionProvider = useMemo(() => new LocalOptionProvider(), [])
  const visualizationProvider = useMemo(() => new LocalVisualizationProvider(), [])

  const [visualizationData, setVisualizationData] = useState<VisualizationData>({
    title: 'Weidenbaum Center Survey (WCS) Dashboard',
    subtitle: 'Select all fields to view chart percentages.',
    questionText: 'Question wording appears here once a complete selection is available.',
    groupedBy: null,
    bars: [],
    legend: [],
  })
  const [isVizLoading, setIsVizLoading] = useState(false)
  const [vizError, setVizError] = useState<string | null>(null)
  const [includeNAResponses, setIncludeNAResponses] = useState(true)
  const [useWeightedPercentages, setUseWeightedPercentages] = useState(true)

  useEffect(() => {
    let isActive = true

    const fetchVisualization = async () => {
      setIsVizLoading(true)
      setVizError(null)

      try {
        const data = await visualizationProvider.getVisualizationData(selection, {
          includeNAResponses,
          useWeightedPercentages,
        })
        if (isActive) {
          setVisualizationData(data)
        }
      } catch (error) {
        if (isActive) {
          setVizError(error instanceof Error ? error.message : 'Failed to load visualization data.')
        }
      } finally {
        if (isActive) {
          setIsVizLoading(false)
        }
      }
    }

    void fetchVisualization()

    return () => {
      isActive = false
    }
  }, [selection, visualizationProvider, includeNAResponses, useWeightedPercentages])

  return (
    <div className="App" style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ width: '340px', minWidth: '340px', display: 'flex', alignItems: 'center', padding: '20px' }}>
        <SelectionWizard
          selection={selection}
          onSelectionChange={setSelection}
          optionProvider={optionProvider}
        />
      </div>

      <div style={{ flex: 1, padding: '20px 20px 20px 0' }}>
        <Visualization
          data={visualizationData}
          isLoading={isVizLoading}
          error={vizError}
          includeNAResponses={includeNAResponses}
          useWeightedPercentages={useWeightedPercentages}
          onToggleIncludeNAResponses={() => setIncludeNAResponses((previous) => !previous)}
          onToggleUseWeightedPercentages={() => setUseWeightedPercentages((previous) => !previous)}
        />
      </div>
    </div>
  )
}

export default App
