import React from 'react';
import {Link, LinkProps} from 'react-router-dom';
import backIcon from '../../../assets/back-button.svg';
import {Button} from './styled';

type BackButtonProps = {
  link?: LinkProps['to'];
  onClick?: () => void;
  disabled?: boolean;
};

function BackButton({link, onClick, disabled}: BackButtonProps) {

  const BackButton = (
    <Button type="button" disabled={disabled} onClick={onClick}>
      <img src={backIcon} alt="Back" />
    </Button>
  );

  return link && !disabled ? <Link to={link}>{BackButton}</Link> : BackButton;
}

export {BackButton};
