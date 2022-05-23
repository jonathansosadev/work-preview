import React from 'react';
import {ReactEntity} from '../../../utils/types';
import checkIcon from '../../../assets/accept_icon_bold.svg';
import {AcceptIconImg, Box, CheckboxWrapper, Label} from './styled';

type CheckboxProps = {
  onChange: () => void;
  checked?: boolean;
  label?: ReactEntity;
  disabled?: boolean;
};

const defaultProps: Partial<CheckboxProps> = {
  checked: false,
  disabled: false,
  label: '',
};

function Checkbox({checked, onChange, label, disabled}: CheckboxProps) {
  const onClickHandler = disabled ? undefined : onChange;

  return (
    <CheckboxWrapper onClick={onClickHandler} disabled={disabled} role="checkbox">
      <Box isSelected={checked}>
        {checked && <AcceptIconImg src={checkIcon} alt="checked" />}
      </Box>
      <Label>{label}</Label>
    </CheckboxWrapper>
  );
}

Checkbox.defaultProps = defaultProps;
export {Checkbox};
