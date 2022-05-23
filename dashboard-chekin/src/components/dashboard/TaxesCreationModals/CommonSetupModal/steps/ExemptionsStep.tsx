import React from 'react';
import {useTranslation} from 'react-i18next';
import {SelectOption} from '../../../../../utils/types';
import {
  Title,
  SubTitle,
  Button,
  TitleTooltip,
  MultiSelectWrapper,
  NextButtonWrapper,
  TransparentButton,
} from '../styled';

type ExemptionsStepProps = {
  exceptionsMultiSelect: React.ReactNode;
  exemptions: SelectOption[];
  handleNoExemptions: () => void;
  goNext: () => void;
};

function ExemptionsStep({
  exceptionsMultiSelect,
  exemptions,
  handleNoExemptions,
  goNext,
}: ExemptionsStepProps) {
  const {t} = useTranslation();

  return (
    <div>
      <Title>
        {t('more_exceptions')}{' '}
        <TitleTooltip
          content={t('exception_will_be_shown_to_a_guest')}
          position="bottom"
          trigger={<span>({t('what_is_this')})</span>}
        />
      </Title>
      <SubTitle>{t('do_you_have_more_exceptions')}</SubTitle>
      <MultiSelectWrapper>{exceptionsMultiSelect}</MultiSelectWrapper>
      <NextButtonWrapper>
        <Button disabled={!exemptions?.length} label={t('next')} onClick={goNext} />
      </NextButtonWrapper>
      <TransparentButton type="button" onClick={handleNoExemptions}>
        {t('there_are_no_exceptions')}
      </TransparentButton>
    </div>
  );
}

export {ExemptionsStep};
