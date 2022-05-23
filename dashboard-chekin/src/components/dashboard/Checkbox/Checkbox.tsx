import React from 'react';
import checkIcon from '../../../assets/check-icon.svg';
import {ReactEntity} from '../../../utils/types';
import {ErrorMessage} from '../../../styled/common';
import {AcceptIconImg, Box, CheckboxWrapper, Label} from './styled';

export type CheckboxProps = {
  onChange: (checked?: boolean) => void;
  label?: ReactEntity;
  disabled?: boolean;
  checked?: boolean;
  className?: string;
  error?: string;
  name?: string;
};

const defaultProps: CheckboxProps = {
  onChange: () => {},
  label: '',
  disabled: false,
  checked: false,
  className: undefined,
  name: '',
};

const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(
  ({onChange, label, disabled, checked, className, name, error}, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked);

    const handleChange = () => {
      if (disabled) return;
      setIsChecked(!isChecked);
      onChange(!isChecked);
    };

    return (
      <>
        <CheckboxWrapper
          onClick={handleChange}
          disabled={disabled}
          className={className}
          role="checkbox"
          aria-label={name}
          ref={ref}
        >
          <Box className="box" checked={checked}>
            {checked && (
              <AcceptIconImg
                className="icon"
                src={checkIcon}
                alt={label ? '' : 'Check'}
                data-testid={`${name}-checkmark`}
              />
            )}
          </Box>
          <Label className="label">{label}</Label>
        </CheckboxWrapper>
        {error && (
          <ErrorMessage
            textAlign="left"
            className="error-message"
            data-testid={`${name}-error`}
          >
            {error}
          </ErrorMessage>
        )}
      </>
    );
  },
);

Checkbox.defaultProps = defaultProps;
export {Checkbox};
