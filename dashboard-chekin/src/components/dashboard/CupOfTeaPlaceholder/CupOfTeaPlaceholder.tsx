import React from 'react';
import teaMugIcon from '../../../assets/tea-mug-icon.svg';
import {
  TablePlaceholderContainer,
  TablePlaceholderImage,
  TablePlaceholderSubtitle,
  TablePlaceholderTitle,
} from './styled';
import {useTranslation} from 'react-i18next';

type CupOfTeaPlaceholderProps = {
  subtitle: string;
  className?: string;
};

function CupOfTeaPlaceholder({subtitle, className}: CupOfTeaPlaceholderProps) {
  const {t} = useTranslation();
  return (
    <TablePlaceholderContainer className={className}>
      <TablePlaceholderImage src={teaMugIcon} alt="" />
      <TablePlaceholderTitle>{t('cup_of_tea_question')}</TablePlaceholderTitle>
      <TablePlaceholderSubtitle>{subtitle}</TablePlaceholderSubtitle>
    </TablePlaceholderContainer>
  );
}

export {CupOfTeaPlaceholder};
