import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {FORM_NAMES_FRANCE_TAXES} from '../../../HousingTaxesSection';
import {CURRENCIES_SYMBOL} from '../../../../../utils/constants';
import {StepProps} from '../types';
import Input from 'components/dashboard/Input';
import {NextButton, BackButton, Subtitle, ButtonsWrapper, FormWrapper} from '../styled';

function MunicipalTariffTaxStep({
  goBackStep,
  goNextStep,
  inputValues,
  handleInputChange,
}: StepProps) {
  const {t} = useTranslation();
  const disabled = Boolean(!inputValues[FORM_NAMES_FRANCE_TAXES.municipalTariff]);

  return (
    <div>
      <Subtitle>
        <Trans i18nKey="enter_municipal_tariff">
          <div>
            Enter <b>municipal tariff</b>
          </div>
        </Trans>
      </Subtitle>

      <FormWrapper>
        <Input
          name={FORM_NAMES_FRANCE_TAXES.municipalTariff}
          value={String(inputValues[FORM_NAMES_FRANCE_TAXES.municipalTariff])}
          onChange={handleInputChange}
          label={t('tariff')}
          type="number"
          step="0.01"
          inputMode="decimal"
          autoFocus={true}
          sign={CURRENCIES_SYMBOL.eur}
        />
      </FormWrapper>
      <ButtonsWrapper>
        <NextButton disabled={disabled} label={t('next')} onClick={goNextStep} />
        <BackButton link label={t('back')} onClick={goBackStep} />
      </ButtonsWrapper>
    </div>
  );
}

export {MunicipalTariffTaxStep};
