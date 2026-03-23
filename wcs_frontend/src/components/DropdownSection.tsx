import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useMemo, useState } from 'react';

const EMPTY_LABEL = 'Select an option...';

function SplitDropdown({stepKey, title, options, value, onSelect}: {
        stepKey: number, 
        title: string, 
        options: Record<string, string>,
        value: string, 
    onSelect: (stepKey: number, value: string, label: string) => void}) {
      const selectedLabel = value ? (options[value] ?? value) : '';
      const [inputValue, setInputValue] = useState(selectedLabel || EMPTY_LABEL);
            const [isFocused, setIsFocused] = useState(false);
            const [showDropdown, setShowDropdown] = useState(false);

            const filteredOptions = useMemo(() => {
                const query = inputValue.trim().toLowerCase();
        const entries = Object.entries(options);

        if (!isFocused || !query || inputValue === EMPTY_LABEL || inputValue === selectedLabel) {
          return entries;
                }

        return entries.filter(([optionValue, optionLabel]) => {
          return optionLabel.toLowerCase().includes(query) || optionValue.toLowerCase().includes(query);
        });
      }, [inputValue, isFocused, options, selectedLabel]);

      const isDisplayText = inputValue === EMPTY_LABEL || inputValue === selectedLabel;

            const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
                setIsFocused(true);
        setInputValue(selectedLabel || EMPTY_LABEL);
                event.currentTarget.select();
            };

            const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                const typedValue = event.currentTarget.value;
                setInputValue(typedValue);
                setShowDropdown(true);
            };

            const handleSelectOption = (optionValue: string) => {
              onSelect(stepKey, optionValue, options[optionValue] ?? optionValue);
              setInputValue(options[optionValue] ?? optionValue);
                setIsFocused(false);
                setShowDropdown(false);
            };

            const handleBlur = () => {
                setIsFocused(false);
              setShowDropdown(false);
            };

            const displayValue = isFocused ? inputValue : (selectedLabel || EMPTY_LABEL);

  return (
    <Dropdown
      as={ButtonGroup}
      id={`selection${stepKey}`}
      show={showDropdown}
      onToggle={(nextShow) => setShowDropdown(nextShow)}
      style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
    >
    <div style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>{title}</div>
    <div style={{ display: "flex", alignItems: "left", width: '100%' }}>
        <input
          type="text"
          value={displayValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          style={{
            width: '90%',
            fontStyle: (displayValue === EMPTY_LABEL || displayValue === value) ? 'italic' : 'normal',
            opacity: isFocused && isDisplayText ? 0.7 : 1
          }}
        />

      <Dropdown.Toggle split variant="success" id="dropdown-split-basic" />

      <Dropdown.Menu>
        {filteredOptions.map(([optionValue, optionLabel]) => (
          <Dropdown.Item key={optionValue} onMouseDown={(event) => event.preventDefault()} onClick={() => handleSelectOption(optionValue)}>{optionLabel}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </div>
      
    </Dropdown>
  );
}

export default SplitDropdown;