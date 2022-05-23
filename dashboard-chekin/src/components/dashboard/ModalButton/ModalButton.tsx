import React from 'react';
import {ReactEntity} from '../../../utils/types';
import {StyledButton} from './styled';

export type ModalButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: ReactEntity;
  secondary?: boolean;
  danger?: boolean;
  primary?: boolean;
  link?: boolean;
};

const defaultProps: ModalButtonProps = {
  label: '',
  secondary: false,
  type: 'button',
  danger: false,
  primary: false,
  link: false,
};

function ModalButton({label, ...props}: ModalButtonProps) {
  return <StyledButton {...props}>{label}</StyledButton>;
}

ModalButton.defaultProps = defaultProps;
export {ModalButton};
