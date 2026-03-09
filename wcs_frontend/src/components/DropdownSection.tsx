import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useMemo, useState } from 'react';

const EMPTY_LABEL = 'Select an option...';

function SplitDropdown({stepKey, title, options, value, onSelect}: {
        stepKey: number, 
        title: string, 
        options: string[], 
        value: string, 
        onSelect: (stepKey: number, value: string) => void}) {
            const [inputValue, setInputValue] = useState(value || EMPTY_LABEL);
            const [isFocused, setIsFocused] = useState(false);
            const [showDropdown, setShowDropdown] = useState(false);

            const filteredOptions = useMemo(() => {
                const query = inputValue.trim().toLowerCase();

                if (!isFocused || !query || inputValue === EMPTY_LABEL || inputValue === value) {
                    return options;
                }

                return options.filter((option) => option.toLowerCase().includes(query));
            }, [inputValue, isFocused, options, value]);

            const isDisplayText = inputValue === EMPTY_LABEL || inputValue === value;

            const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
                setIsFocused(true);
                setInputValue(value || EMPTY_LABEL);
                event.currentTarget.select();
            };

            const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                const typedValue = event.currentTarget.value;
                setInputValue(typedValue);
                setShowDropdown(true);
            };

            const handleSelectOption = (option: string) => {
                onSelect(stepKey, option);
                setInputValue(option);
                setIsFocused(false);
                setShowDropdown(false);
            };

            const handleBlur = () => {
                setIsFocused(false);
              setShowDropdown(false);
            };

            const displayValue = isFocused ? inputValue : (value || EMPTY_LABEL);

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
        {filteredOptions.map((option) => (
          <Dropdown.Item key={option} onMouseDown={(event) => event.preventDefault()} onClick={() => handleSelectOption(option)}>{option}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </div>
      
    </Dropdown>
  );
}

export default SplitDropdown;