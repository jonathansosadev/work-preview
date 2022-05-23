import React from 'react';
import {useTranslation} from 'react-i18next';
import {StepProps} from '../types';
import successIcon from '../../../../../assets/success-icon.svg';
import {
  ButtonsWrapper,
  NextButton,
  SuccessIcon,
  SuccessStepWrapper,
  SuccessSubtitle,
  SuccessTitle,
} from '../styled';

function FinishStep({onFinish}: StepProps) {
  const {t} = useTranslation();

  return (
    <SuccessStepWrapper>
      <SuccessIcon src={successIcon} alt="" width={46} height={46} />
      <SuccessTitle>{t('done')}!</SuccessTitle>
      <SuccessSubtitle>
        {t('your_taxes_have_been_configured_successfully')}
      </SuccessSubtitle>
      <ButtonsWrapper>
        <NextButton label={t('ok')} onClick={onFinish} />
      </ButtonsWrapper>
    </SuccessStepWrapper>
  );
}

export {FinishStep};
