import React from 'react';
import ReactSwitch, {ReactSwitchProps} from 'react-switch';
import {Wrapper, Label} from './styled';
import {ReactEntity} from '../../../utils/types';

export type SwitchProps = {
  onChange: (checked: boolean, event: React.MouseEvent<HTMLDivElement>) => void;
  checked: boolean;
  id?: string;
  label?: ReactEntity;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
};

const defaultProps: SwitchProps = {
  onChange: () => {},
  checked: false,
  label: '',
  disabled: false,
  readonly: false,
  id: '',
  className: undefined,
};

const SWITCH_CONFIG: Partial<ReactSwitchProps> = {
  offColor: '#DEDEEB',
  onColor: '#2148FF',
  width: 34,
  height: 8,
  uncheckedIcon: false,
  checkedIcon: false,
  activeBoxShadow: '0 0 0 0 #fff',
  handleDiameter: 20,
};

function Switch({onChange, label, checked, disabled, readonly, className}: SwitchProps) {
  const onChangeHandler = disabled || readonly ? () => {} : onChange;

  return (
    <Wrapper
      disabled={disabled}
      onClick={(event) => onChangeHandler(!checked, event)}
      className={className}
    >
      <ReactSwitch
        onChange={() => {}}
        checked={checked}
        disabled={disabled}
        {...SWITCH_CONFIG}
      />
      <Label className="label">{label}</Label>
    </Wrapper>
  );
}

Switch.defaultProps = defaultProps;
export {Switch};
