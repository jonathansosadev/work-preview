import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import i18n from 'i18next';
import {SelectOption} from '../../../../../utils/types';
import {FORM_NAMES_FRANCE_TAXES} from '../../../HousingTaxesSection';
import {StepProps} from '../types';
import {transformStringValueToOption} from '../utils';
import {
  ButtonsWrapper,
  ClassificationStepWrapper,
  MultiRadioStyled,
  MultiRadioWrapper,
  NextButton,
  Subtitle,
  TooltipStyled,
} from '../styled';

const radioOptions = [
  {label: i18n.t('yes'), value: 1},
  {label: i18n.t('no'), value: 0},
];

function ClassificationStep({
  goNextStep,
  inputValues,
  handleCustomFieldChange,
}: StepProps) {
  const {t} = useTranslation();
  const disabled = Boolean(!inputValues[FORM_NAMES_FRANCE_TAXES.isClassified]);

  const handleChange = (opt: SelectOption<unknown, number>) => {
    handleCustomFieldChange(FORM_NAMES_FRANCE_TAXES.isClassified, String(opt.value));
  };

  return (
    <ClassificationStepWrapper>
      <Subtitle>
        {t('is_property_classified')}{' '}
        <TooltipStyled
          content={
            <Trans i18nKey="classification_step_tooltip">
              If your property has an official classification assigned select "Yes" ( for
              example 5 star hotel, 4 star villa, camping terrain, etc.).
              <br />
              <br />
              If your property doesn't have a classification or if it's waiting on the
              classification assignment, select "No"
            </Trans>
          }
        />
      </Subtitle>

      <MultiRadioWrapper>
        <MultiRadioStyled
          options={radioOptions}
          onChange={handleChange}
          value={transformStringValueToOption(
            inputValues[FORM_NAMES_FRANCE_TAXES.isClassified],
          )}
          name={FORM_NAMES_FRANCE_TAXES.isClassified}
        />
      </MultiRadioWrapper>

      <ButtonsWrapper>
        <NextButton disabled={disabled} label={t('next')} onClick={goNextStep} />
      </ButtonsWrapper>
    </ClassificationStepWrapper>
  );
}

export {ClassificationStep};
