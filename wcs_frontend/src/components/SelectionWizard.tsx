import { useEffect, useState } from 'react';
import SplitDropdown from './DropdownSection';
import { STEPS } from './constants';
import type { SelectionState } from '../domain/selection';
import type { OptionProvider } from '../providers/options/OptionProvider';

interface SelectionWizardProps {
  selection: SelectionState;
  onSelectionChange: (next: SelectionState) => void;
  optionProvider: OptionProvider;
}

const titles = {
  [STEPS.INTEREST_VARIABLE]: 'Interest Variable',
  [STEPS.WAVE]: 'Wave',
  [STEPS.MODIFIERS]: 'Grouped by'
};

const toIdentityOptions = (values: string[]): Record<string, string> => {
  return Object.fromEntries(values.map((value) => [value, value]));
};

export default function SelectionWizard({
  selection,
  onSelectionChange,
  optionProvider,
}: SelectionWizardProps) {
  const [interestOptions, setInterestOptions] = useState<Record<string, string>>({});
  const [waveOptions, setWaveOptions] = useState<string[]>([]);
  const [modifierOptions, setModifierOptions] = useState<string[]>([]);

  const [isLoadingInterest, setIsLoadingInterest] = useState(false);
  const [isLoadingWaves, setIsLoadingWaves] = useState(false);
  const [isLoadingModifiers, setIsLoadingModifiers] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadInterestOptions = async () => {
      setIsLoadingInterest(true);
      try {
        const options = await optionProvider.getInterestVariables();
        if (isActive) {
          setInterestOptions(options);
        }
      } finally {
        if (isActive) {
          setIsLoadingInterest(false);
        }
      }
    };

    void loadInterestOptions();

    return () => {
      isActive = false;
    };
  }, [optionProvider]);

  useEffect(() => {
    let isActive = true;

    const loadWaveOptions = async () => {
      if (!selection.interestVariable) {
        setWaveOptions([]);
        return;
      }

      setIsLoadingWaves(true);
      try {
        const options = await optionProvider.getWaves(selection.interestVariable);
        if (isActive) {
          setWaveOptions(options);
        }
      } finally {
        if (isActive) {
          setIsLoadingWaves(false);
        }
      }
    };

    void loadWaveOptions();

    return () => {
      isActive = false;
    };
  }, [optionProvider, selection.interestVariable]);

  useEffect(() => {
    let isActive = true;

    const loadModifierOptions = async () => {
      if (!selection.wave) {
        setModifierOptions([]);
        return;
      }

      setIsLoadingModifiers(true);
      try {
        const options = await optionProvider.getModifiers(selection.wave);
        if (isActive) {
          setModifierOptions(options);
        }
      } finally {
        if (isActive) {
          setIsLoadingModifiers(false);
        }
      }
    };

    void loadModifierOptions();

    return () => {
      isActive = false;
    };
  }, [optionProvider, selection.wave]);

  const handleSelection = (stepKey: number, value: string, label: string) => {
    if (stepKey === STEPS.INTEREST_VARIABLE) {
      onSelectionChange({
        interestVariable: value,
        interestVariableLabel: label,
        wave: '',
        modifier: '',
      });
      return;
    }

    if (stepKey === STEPS.WAVE) {
      onSelectionChange({
        interestVariable: selection.interestVariable,
        interestVariableLabel: selection.interestVariableLabel,
        wave: value,
        modifier: '',
      });
      return;
    }

    onSelectionChange({
      interestVariable: selection.interestVariable,
      interestVariableLabel: selection.interestVariableLabel,
      wave: selection.wave,
      modifier: value,
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
          options={isLoadingInterest ? {} : interestOptions}
          value={selection.interestVariable}
          onSelect={handleSelection}
        />

        {/* Step 2 - Only show if active */}
        {!!selection.interestVariable && (
          <SplitDropdown
            stepKey={STEPS.WAVE}
            title={titles[STEPS.WAVE]}
            options={isLoadingWaves ? {} : toIdentityOptions(waveOptions)}
            value={selection.wave}
            onSelect={handleSelection}
          />
        )}

        {/* Step 3 */}
        {!!selection.wave && (
          <SplitDropdown
            stepKey={STEPS.MODIFIERS}
            title={titles[STEPS.MODIFIERS]}
            options={isLoadingModifiers ? {} : toIdentityOptions(modifierOptions)}
            value={selection.modifier}
            onSelect={handleSelection}
          />
        )}
      </div>
    </div>
  );
}