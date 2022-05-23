import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {FORM_NAMES_FRANCE_TAXES} from '../../../HousingTaxesSection';
import {SelectOption} from '../../../../../utils/types';
import {StepProps} from '../types';
import {RadioOptions, transformStringValueToOption} from '../utils';
import Tooltip from '../../../Tooltip';
import {
  NextButton,
  BackButton,
  Subtitle,
  ButtonsWrapper,
  FormWrapper,
  TooltipButton,
  MultiRadioStyled,
} from '../styled';

function RegionTaxStep({
  goBackStep,
  goNextStep,
  inputValues,
  handleCustomFieldChange,
}: StepProps) {
  const {t} = useTranslation();
  const disabled = Boolean(!inputValues[FORM_NAMES_FRANCE_TAXES.hasRegionTax]);

  const handleChange = (opt: SelectOption<unknown, number>) => {
    handleCustomFieldChange(FORM_NAMES_FRANCE_TAXES.hasRegionTax, String(opt.value));
  };

  return (
    <div>
      <Subtitle>
        <Trans i18nKey="region_tax_subtitle">
          <div>
            Do you have to apply the <b>15% Île-de-France region tax?</b>
          </div>
        </Trans>
        <Tooltip
          trigger={<TooltipButton>({t('what_is_this')})</TooltipButton>}
          content={
            <Trans i18nKey="region_tax_subtitle_tooltip">
              For municipalities part of the Île-de-France region, there’s an additional
              15% regional tax that must be added to the municipal tariff.
              <br />
              <br /> For municipalities in other regions, this additional % is not
              required.
            </Trans>
          }
        />
      </Subtitle>

      <FormWrapper>
        <MultiRadioStyled
          options={RadioOptions}
          onChange={handleChange}
          value={transformStringValueToOption(
            inputValues[FORM_NAMES_FRANCE_TAXES.hasRegionTax],
          )}
        />
      </FormWrapper>
      <ButtonsWrapper>
        <NextButton disabled={disabled} label={t('next')} onClick={goNextStep} />
        <BackButton link label={t('back')} onClick={goBackStep} />
      </ButtonsWrapper>
    </div>
  );
}

export {RegionTaxStep};
