import React from 'react';
import {useTranslation} from 'react-i18next';
import {InputEventType} from '../../../../../utils/types';
import {FORM_NAMES} from '../../../HousingTaxesSection';
import {ShortInput} from '../../../HousingTaxesSection/styled';
import {
  Title,
  SubTitle,
  Button,
  TitleTooltip,
  NextButtonWrapper,
  AgeCalculatorWrapper,
  AgeExceptionsInputWrapper,
  AgeExceptionsInputLabel,
  AgeExceptionsButtonWrapper,
  ChoicesButtonsWrapper,
} from '../styled';

type AgesStepProps = {
  isCountryWithTaxesCalc: boolean;
  hasSeasons: boolean;
  ageCalculator: React.ReactNode;
  ageCalculatorWithoutSeasons: React.ReactNode;
  isAgeCalculatorNextButtonDisabled: boolean;
  saveDefaultFormValuesAndGoNext: () => void;
  hasAgeExceptions: boolean;
  handleInputChange: (event: InputEventType) => void;
  inputValues: {[key: string]: string};
  goNext: () => void;
  handleHasAgeExceptions: () => void;
  handleHasNoAgeExceptions: () => void;
};

function AgesStep({
  isCountryWithTaxesCalc,
  hasSeasons,
  ageCalculator,
  ageCalculatorWithoutSeasons,
  isAgeCalculatorNextButtonDisabled,
  saveDefaultFormValuesAndGoNext,
  hasAgeExceptions,
  handleInputChange,
  inputValues,
  goNext,
  handleHasAgeExceptions,
  handleHasNoAgeExceptions,
}: AgesStepProps) {
  const {t} = useTranslation();

  return (
    <div>
      {isCountryWithTaxesCalc ? (
        <div>
          <Title>{t('age_rules')}</Title>
          <AgeCalculatorWrapper>
            {hasSeasons ? ageCalculator : ageCalculatorWithoutSeasons}
          </AgeCalculatorWrapper>
          <NextButtonWrapper>
            <Button
              disabled={isAgeCalculatorNextButtonDisabled}
              label={t('next')}
              onClick={saveDefaultFormValuesAndGoNext}
            />
          </NextButtonWrapper>
        </div>
      ) : (
        <div>
          <Title>
            {t('age_exceptions')}{' '}
            <TitleTooltip
              content={t('guest_will_less_than_age_will_be_exempted')}
              position="bottom"
              trigger={<span>({t('what_is_this')})</span>}
            />
          </Title>
          <SubTitle>{t('are_some_guests_exempted_to_pay_taxes_dep_on_age')}</SubTitle>
          {hasAgeExceptions ? (
            <div>
              <AgeExceptionsInputWrapper>
                <AgeExceptionsInputLabel>{t('less_than')}</AgeExceptionsInputLabel>
                <ShortInput
                  label={t('age')}
                  placeholder={t('enter_age')}
                  type="number"
                  inputMode="numeric"
                  onChange={handleInputChange}
                  name={FORM_NAMES.lessThanAge}
                  value={inputValues[FORM_NAMES.lessThanAge]}
                />
              </AgeExceptionsInputWrapper>
              <AgeExceptionsButtonWrapper>
                <Button label={t('next')} onClick={goNext} />
              </AgeExceptionsButtonWrapper>
            </div>
          ) : (
            <ChoicesButtonsWrapper>
              <Button label={t('yes')} onClick={handleHasAgeExceptions} />
              <Button label={t('no')} onClick={handleHasNoAgeExceptions} />
            </ChoicesButtonsWrapper>
          )}
        </div>
      )}
    </div>
  );
}

export {AgesStep};
