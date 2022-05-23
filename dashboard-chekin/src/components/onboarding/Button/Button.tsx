import React from 'react';
import {StyledButton} from './styled';

export type ButtonProps = {
  onClick?: () => void;
  label?: string;
  secondary?: boolean;
  danger?: boolean;
  outlined?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'big' | 'small' | 'tiny' | 'medium';
  type?: 'button' | 'submit' | 'reset';
  light?: boolean;
  role?: string;
  hideArrowIcon?: boolean;
};

const defaultProps: ButtonProps = {
  onClick: () => {},
  label: '',
  secondary: false,
  danger: false,
  outlined: false,
  disabled: false,
  className: undefined,
  size: undefined,
  type: 'button',
  light: false,
  role: '',
};

function Button({
  onClick,
  label,
  className,
  size,
  outlined,
  danger,
  disabled,
  type,
  light,
  hideArrowIcon,
  ...props
}: ButtonProps) {
  return (
    <StyledButton
      type={type}
      className={className}
      outlined={outlined}
      size={size}
      danger={danger}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {label}
    </StyledButton>
  );
}

Button.defaultProps = defaultProps;
export {Button};
