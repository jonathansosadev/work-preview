import {StyledOriginalButton, OriginalButtonLabel} from './styled';
import React, {ButtonHTMLAttributes} from 'react';

export type OriginalButtonProps = ButtonHTMLAttributes<any> & {
  label: React.ReactNode | JSX.Element | string;
  onClick?: (e: React.SyntheticEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode | JSX.Element;
  disabled?: boolean;
  className?: string;
  link?: boolean;
  type?: 'submit' | 'button';
};

const defaultProps: OriginalButtonProps = {
  label: '',
  disabled: false,
  onClick: () => {},
  className: undefined,
  type: undefined,
  link: undefined,
  icon: null,
};

function OriginalButton({icon, label, className, ...props}: OriginalButtonProps) {
  return (
    <StyledOriginalButton className={className} {...props}>
      {icon && icon}
      <OriginalButtonLabel className="label">{label}</OriginalButtonLabel>
    </StyledOriginalButton>
  );
}

OriginalButton.defaultProps = defaultProps;
export {OriginalButton};
