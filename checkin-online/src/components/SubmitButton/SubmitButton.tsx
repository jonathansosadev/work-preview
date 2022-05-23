import React from 'react';
import {ButtonProps} from '../Button/Button';
import {Wrapper, DesktopButton, MobileButton} from './styled';

function SubmitButton(props: ButtonProps) {
  return (
    <Wrapper className={props.className}>
      <MobileButton short {...props} />
      <DesktopButton {...props} />
    </Wrapper>
  );
}

export {SubmitButton};
