import React, {ButtonHTMLAttributes} from 'react';
import rubbishIcon from 'assets/rubbish-bin.svg';
import {StyledButton} from './styled';

function TableDeleteButton(
  props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
) {
  return (
    <StyledButton {...props}>
      <img src={rubbishIcon} alt="Delete row" height={15} />
    </StyledButton>
  );
}

export {TableDeleteButton};
