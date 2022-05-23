import React from 'react';
import checkIcon from '../../assets/accept-icon.svg';
import {AcceptIconImg, Box, CheckboxWrapper, Label} from './styled';

export type CheckboxProps = {
  onChange: (name?: string) => void;
  label?: string | React.ReactNode | JSX.Element;
  disabled?: boolean;
  checked?: boolean;
  className?: string;
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

function Checkbox({onChange, label, disabled, checked, className, name}: CheckboxProps) {
  const onClickHandler = disabled ? undefined : onChange;

  const handleCheckboxClick = () => {
    if (onClickHandler) {
      onClickHandler(name);
    }
  };

  return (
    <CheckboxWrapper
      onClick={handleCheckboxClick}
      disabled={disabled}
      className={className}
      role="checkbox"
      aria-label={name}
    >
      <Box checked={checked}>
        {checked && (
          <AcceptIconImg
            src={checkIcon}
            alt="Check mark"
            data-testid={`${name}-checkmark`}
          />
        )}
      </Box>
      <Label>{label}</Label>
    </CheckboxWrapper>
  );
}

Checkbox.defaultProps = defaultProps;
export {Checkbox};
