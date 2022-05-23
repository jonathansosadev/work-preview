import React from 'react';
import backIcon from '../../assets/back-icn.svg';
import {StyledBackButton} from './styled';
import {ButtonProps} from '../Button/Button';

function BackButton(props: ButtonProps) {
  return <StyledBackButton icon={<img src={backIcon} alt="Arrow" />} {...props} />;
}

export {BackButton};
