import React from 'react';
import {ReactEntity} from '../../../utils/types';
import {StyledButton, Label} from './styled';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: ReactEntity;
  icon?: React.ReactNode | JSX.Element;
  rightIcon?: React.ReactNode | JSX.Element;
  secondary?: boolean;
  contentAlign?: 'left' | 'center' | 'right' | 'initial';
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
  contentAlign: 'initial',
  link: false,
  type: 'button',
};

function Button({label, icon, rightIcon, ...props}: ButtonProps) {
  return (
    <StyledButton {...props}>
      {icon && icon}
      <Label className="label">{label}</Label>
      {rightIcon && rightIcon}
    </StyledButton>
  );
}

Button.defaultProps = defaultProps;
export {Button};
