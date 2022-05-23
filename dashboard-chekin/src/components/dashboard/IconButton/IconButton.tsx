import React from 'react';
import {IconButtonStyled} from './styled';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
};

function IconButton({disabled, onClick, icon}: IconButtonProps) {
  return (
    <IconButtonStyled
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      type="button"
    >
      <img src={icon} alt="" />
    </IconButtonStyled>
  );
}

export {IconButton};
