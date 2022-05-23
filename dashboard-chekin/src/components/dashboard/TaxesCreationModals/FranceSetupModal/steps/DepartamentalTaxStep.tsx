import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {FORM_NAMES_FRANCE_TAXES} from '../../../HousingTaxesSection';
import {StepProps} from '../types';
import {SelectOption} from '../../../../../utils/types';
import {RadioOptions, transformStringValueToOption} from '../utils';
import Tooltip from '../../../Tooltip';
import {OfficialFranceTaxWebsite} from '../FranceSetupModal';
import {
  NextButton,
  BackButton,
  Subtitle,
  ButtonsWrapper,
  FormWrapper,
  TooltipButton,
  MultiRadioStyled,
  Link,
} from '../styled';

function DepartamentalTaxStep({
  goBackStep,
  goNextStep,
  inputValues,
  handleCustomFieldChange,
}: StepProps) {
  const {t} = useTranslation();
  const disabled = Boolean(!inputValues[FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax]);

  const handleChange = (opt: SelectOption<unknown, number>) => {
    handleCustomFieldChange(
      FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax,
      String(opt.value),
    );
  };

  return (
    <div>
      <Subtitle>
        <Trans i18nKey="additional_departamental_tax_subtitle">
          <div>
            Do you have to apply the <b>additional 10% departamental tax?</b>
          </div>
        </Trans>
        <Tooltip
          trigger={<TooltipButton>({t('what_is_this')})</TooltipButton>}
          content={
            <Trans i18nKey="additional_departamental_subtitle_tooltip">
              An additional tax that must be added to the municipal tariff depending of
              the municipality.
              <br />
              <br /> Not sure if departmental tax applies? Visit the{' '}
              <Link href={OfficialFranceTaxWebsite} target="_blank" rel="noreferrer">
                official Tax de Séjour website
              </Link>{' '}
              and search for your municipality.
            </Trans>
          }
        />
      </Subtitle>

      <FormWrapper>
        <MultiRadioStyled
          options={RadioOptions}
          onChange={handleChange}
          value={transformStringValueToOption(
            inputValues[FORM_NAMES_FRANCE_TAXES.hasDepartmentalTax],
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

export {DepartamentalTaxStep};
