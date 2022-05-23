import React from 'react';
import {ReactEntity} from '../../../utils/types';
import checkIcon from '../../../assets/accept-icon.svg';
import {AcceptIconImg, Checkbox, CheckboxWrapper, Label} from './styled';

type LargeCheckboxProps = {
  onChange: () => void;
  checked?: boolean;
  label?: ReactEntity;
  disabled?: boolean;
};

const defaultProps: Partial<LargeCheckboxProps> = {
  checked: false,
  disabled: false,
  label: '',
};

function LargeCheckbox({checked, onChange, label, disabled}: LargeCheckboxProps) {
  const onClickHandler = disabled ? undefined : onChange;

  return (
    <CheckboxWrapper onClick={onClickHandler} disabled={disabled} role="checkbox">
      <Checkbox checked={checked}>
        {checked && <AcceptIconImg src={checkIcon} alt="checked" />}
      </Checkbox>
      <Label>{label}</Label>
    </CheckboxWrapper>
  );
}

LargeCheckbox.defaultProps = defaultProps;
export {LargeCheckbox};
