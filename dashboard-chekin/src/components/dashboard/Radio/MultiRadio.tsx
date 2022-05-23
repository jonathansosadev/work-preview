import React from 'react';
import {FieldError} from 'react-hook-form';
import {SelectOption} from '../../../utils/types';
import {RadioInput, RadioLabel, RadioOption, RadioWrapper} from './styled';

type RadioOptionType = SelectOption<unknown, any>;

export type MultiRadioProps = {
  onChange: (opt: RadioOptionType) => void;
  options: RadioOptionType[];
  value?: RadioOptionType;
  defaultValue?: string | number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  error?: FieldError;
  name?: string;
};

function MultiRadio({
  value,
  onChange,
  options,
  disabled,
  multiple,
  className,
  defaultValue,
}: MultiRadioProps) {
  React.useEffect(
    function setDefaultValue() {
      const option = options.find((opt) => opt.value === defaultValue);

      if (defaultValue && option && !value) {
        onChange(option);
      }
    },
    [defaultValue, onChange, options, value],
  );

  const RadioOptions = React.useMemo(() => {
    return options.map((opt) => {
      const isChecked = opt.value === value?.value;

      const handleChange = () => {
        if (!disabled) onChange(opt);
      };

      return (
        <RadioOption className="radio_option" key={opt.value}>
          <RadioInput
            multiple={multiple}
            type="radio"
            id={opt.value}
            name="drone"
            value={opt.value}
            onChange={handleChange}
            checked={isChecked}
          />
          <RadioLabel htmlFor={opt.value} className="radio_input">
            {opt.label}
          </RadioLabel>
        </RadioOption>
      );
    });
  }, [options, value?.value, multiple, disabled, onChange]);

  return <RadioWrapper className={className}>{RadioOptions}</RadioWrapper>;
}

export {MultiRadio};
