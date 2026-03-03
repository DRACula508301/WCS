import { useState } from 'react';
import SplitDropdown from './DropdownSection';
import { STEPS, INTEREST_VARIABLES } from './constants';

// 1. Define a clear Type for each step
interface StepState {
  selection: string;
  active: boolean;
  options: string[];
}

// 2. Define the overall Wizard State structure
type WizardState = Record<number, StepState>;

const titles = {
  [STEPS.INTEREST_VARIABLE]: 'Interest Variable',
  [STEPS.WAVE]: 'Wave',
  [STEPS.MODIFIERS]: 'Grouped by'
};

export default function SelectionWizard() {
  
  // 3. Initialize everything in one object
  const [wizard, setWizard] = useState<WizardState>({
    [STEPS.INTEREST_VARIABLE]: { selection: '', active: true, options: INTEREST_VARIABLES },
    [STEPS.WAVE]: { selection: '', active: false, options: [] },
    [STEPS.MODIFIERS]: { selection: '', active: false, options: [] },
  });

  const handleSelection = (stepKey: number, value: string) => {
    setWizard((prev) => {
      const next = { ...prev };

      // Update the current selection
      next[stepKey] = { ...prev[stepKey], selection: value };

      // 4. Handle Logic Cascades (The "Dependency" part)
      if (stepKey === STEPS.INTEREST_VARIABLE) {
        // If Interest changes, unlock Wave and reset it
        next[STEPS.WAVE] = { selection: '', active: !!value, options: ['Wave 1', 'Wave 2'] }; // Example options
        next[STEPS.MODIFIERS] = { selection: '', active: false, options: [] };
      } 
      
      if (stepKey === STEPS.WAVE) {
        // If Wave changes, unlock Modifiers
        next[STEPS.MODIFIERS] = { selection: '', active: !!value, options: ['Option A', 'Option B'] };
      }

      return next;
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '2vw', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div
        className="selection-wizard"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px' }}
      >
        {/* Step 1 */}
        <SplitDropdown
          stepKey={STEPS.INTEREST_VARIABLE}
          title={titles[STEPS.INTEREST_VARIABLE]}
          options={wizard[STEPS.INTEREST_VARIABLE].options}
          value={wizard[STEPS.INTEREST_VARIABLE].selection}
          onSelect={handleSelection}
        />

        {/* Step 2 - Only show if active */}
        {wizard[STEPS.WAVE].active && (
          <SplitDropdown
            stepKey={STEPS.WAVE}
            title={titles[STEPS.WAVE]}
            options={wizard[STEPS.WAVE].options}
            value={wizard[STEPS.WAVE].selection}
            onSelect={handleSelection}
          />
        )}

        {/* Step 3 */}
        {wizard[STEPS.MODIFIERS].active && (
          <SplitDropdown
            stepKey={STEPS.MODIFIERS}
            title={titles[STEPS.MODIFIERS]}
            options={wizard[STEPS.MODIFIERS].options}
            value={wizard[STEPS.MODIFIERS].selection}
            onSelect={handleSelection}
          />
        )}
      </div>
    </div>
  );
}