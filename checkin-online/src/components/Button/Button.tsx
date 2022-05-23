import React, {ButtonHTMLAttributes} from 'react';
import {StyledButton, IconContainer} from './styled';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: React.ReactNode | string;
  icon?: React.ReactNode;
  short?: boolean;
  secondary?: boolean;
};

const defaultProps: ButtonProps = {
  label: '',
  short: false,
  type: undefined,
  icon: null,
  secondary: false,
};

function Button({icon, label, short, disabled, className, type, ...props}: ButtonProps) {
  return (
    <StyledButton
      short={short}
      disabled={disabled}
      className={className}
      type={type}
      {...props}
    >
      {icon && <IconContainer>{icon}</IconContainer>}
      {label}
    </StyledButton>
  );
}

Button.defaultProps = defaultProps;
export {Button};
