import React from 'react';
import {ReactEntity} from '../../../utils/types';
import {StyledButton, Label} from './styled';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: ReactEntity;
  icon?: React.ReactNode | JSX.Element;
  secondary?: boolean;
  danger?: boolean;
  blinking?: boolean;
  outlined?: boolean;
  link?: boolean;
};

const defaultProps: ButtonProps = {
  label: '',
  secondary: false,
  blinking: false,
  danger: false,
  outlined: false,
  link: false,
  type: 'button',
};

function Button({label, icon, ...props}: ButtonProps) {
  return (
    <StyledButton {...props}>
      {icon && icon}
      <Label className="label">{label}</Label>
    </StyledButton>
  );
}

Button.defaultProps = defaultProps;
export {Button};
