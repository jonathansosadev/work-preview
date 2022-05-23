import React from 'react';
import checkIcon from '../../../../assets/check-icon.svg';
import {ReactEntity} from '../../../../utils/types';
import {AcceptIconImg, Box, CheckboxWrapper, Label} from '../styled';

export type CustomCheckboxProps = {
  onChange: (name?: string) => void;
  label?: ReactEntity;
  disabled?: boolean;
  checked?: boolean;
  className?: string;
  name?: string;
};

const defaultProps: CustomCheckboxProps = {
  onChange: () => {},
  label: '',
  disabled: false,
  checked: false,
  className: undefined,
  name: '',
};

function CustomCheckbox({
  onChange,
  label,
  disabled,
  checked,
  className,
  name,
}: CustomCheckboxProps) {
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
  );
}

CustomCheckbox.defaultProps = defaultProps;
export {CustomCheckbox};
