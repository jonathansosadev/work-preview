import React, {ButtonHTMLAttributes} from 'react';
import {useTranslation} from 'react-i18next';
import clockIcon from 'assets/clock.svg';
import completedIcon from 'assets/completed-icon.svg';
import {StyledButton} from './styled';

type TableStatusButtonProps = {
  active: boolean;
  customText?: string;
  interactive?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

function TableStatusButton({
  active,
  customText,
  interactive = true,
  ...buttonProps
}: TableStatusButtonProps) {
  const {t} = useTranslation();

  return (
    <StyledButton $active={active} $interactive={interactive} {...buttonProps}>
      <img src={active ? completedIcon : clockIcon} alt="" />
      {customText || (active ? t('complete') : t('uncompleted'))}
    </StyledButton>
  );
}

export {TableStatusButton};
