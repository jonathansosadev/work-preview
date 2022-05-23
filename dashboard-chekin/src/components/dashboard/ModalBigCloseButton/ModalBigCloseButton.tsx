import React from 'react';
import xIcon from '../../../assets/x_blue.svg';
import {CloseButton} from './styled';

type ModalBigCloseButtonProps = {
  onClick: () => void;
  className?: string;
};

function ModalBigCloseButton({className, onClick}: ModalBigCloseButtonProps) {
  return (
    <CloseButton className={className} onClick={onClick}>
      <img src={xIcon} alt="Cross" />
    </CloseButton>
  );
}

export {ModalBigCloseButton};
