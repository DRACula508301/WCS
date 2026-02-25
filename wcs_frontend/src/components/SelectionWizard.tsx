import { useState } from 'react'
import SelectorStep from './SelectorStep'

const Steps = {
  INTEREST_VARIABLE: 0,
  WAVE: 1,
  MODIFIERS: 2
} as const

let titles = [
  'Interest Variable',
  'Wave',
  'Grouped by'
]


export default function SelectionWizard() {
  const [history, setHistory] = useState([(Steps.INTEREST_VARIABLE, '')])
  let content = history.map((stepKey, value) => {
    <SelectorStep
      key={stepKey}
      title={titles[stepKey]}
      active={stepKey === history.length}
    >
      <SelectorOption
        options={stepData.options}
        onSelect={(value) => handleSelection(stepKey, value)}
      />
    </SelectorStep>
  })

  return (
    <>
      {content}
    </>
  )
}