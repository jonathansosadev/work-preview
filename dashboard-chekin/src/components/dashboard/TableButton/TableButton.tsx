import React, {ButtonHTMLAttributes} from 'react';
import {StyledButton} from './styled';

export type TableButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  danger?: boolean;
};

function TableButton({label, danger, ...props}: TableButtonProps) {
  return (
    <StyledButton danger={danger} {...props}>
      {label}
    </StyledButton>
  );
}

export {TableButton};
