import React, {Dispatch, SetStateAction} from 'react';
import {usePaymentSettings} from '../../../../../hooks/usePaymentSettings';
import {usePrevious} from '../../../../../utils/hooks';
import {useTranslation} from 'react-i18next';
import {InputEventType} from '../../../../../utils/types';
import {FORM_NAMES} from '../../../HousingTaxesSection';
import {PriceStep} from './PriceStep';
import {ShortInput} from '../../../HousingTaxesSection/styled';
import {
  Title,
  SubTitle,
  Button,
  ChoicesButtonsWrapper,
  TransparentButton,
  SeasonsGroup,
  SeasonContainer,
  SeasonLabel,
  NextButtonWrapper,
  ShortInputCurrency,
  WideSeasonContainer,
  SeasonContainerShortInputWrapper,
} from '../styled';

type SeasonsStepProps = {
  resetSeasons: () => void;
  isAskedForSeasons: boolean;
  openImportTaxesModal: () => void;
  isAskedForPricePercentage: boolean;
  isCountryWithTaxesCalc: boolean;
  isHighSeasonDatesComplete: boolean;
  hasSeasons: boolean;
  isLowSeasonDatesComplete: boolean;
  isBookingPercentagePrice: boolean;
  highSeasonDateRangePicker: React.ReactNode;
  lowSeasonDateRangePicker: React.ReactNode;
  setIsBookingPercentagePrice: Dispatch<SetStateAction<boolean>>;
  setIsAskedForPricePercentage: Dispatch<SetStateAction<boolean>>;
  resetAgeCalculatorDefaultValuesAndCheckboxes: () => void;
  setHasSeasons: Dispatch<SetStateAction<boolean>>;
  setIsAskedForSeasons: Dispatch<SetStateAction<boolean>>;
  goNext: () => void;
  setInputValues: Dispatch<SetStateAction<{[key: string]: string}>>;
  handleInputChange: (event: InputEventType) => void;
  inputValues: {[key: string]: string};
};

function SeasonsStep({
  isAskedForSeasons,
  openImportTaxesModal,
  isAskedForPricePercentage,
  isCountryWithTaxesCalc,
  highSeasonDateRangePicker,
  lowSeasonDateRangePicker,
  isHighSeasonDatesComplete,
  hasSeasons,
  setIsBookingPercentagePrice,
  setIsAskedForPricePercentage,
  resetAgeCalculatorDefaultValuesAndCheckboxes,
  goNext,
  setInputValues,
  setHasSeasons,
  setIsAskedForSeasons,
  resetSeasons,
  isLowSeasonDatesComplete,
  isBookingPercentagePrice,
  handleInputChange,
  inputValues,
}: SeasonsStepProps) {
  const {t} = useTranslation();
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  const prevHasSeasons = usePrevious(hasSeasons);
  const [hasNoSeasons, setHasNoSeasons] = React.useState(false);

  const handleHasPricePercentage = () => {
    setIsBookingPercentagePrice(true);
    setIsAskedForPricePercentage(true);

    if (isCountryWithTaxesCalc) {
      if (prevHasSeasons) {
        resetAgeCalculatorDefaultValuesAndCheckboxes();
      }

      if (hasNoSeasons) {
        goNext();
      }
    }
  };

  const handleHasNoPricePercentage = () => {
    setIsBookingPercentagePrice(false);
    setIsAskedForPricePercentage(true);

    if (isCountryWithTaxesCalc) {
      if (prevHasSeasons) {
        resetAgeCalculatorDefaultValuesAndCheckboxes();
      }

      if (hasNoSeasons) {
        goNext();
      }
    }
  };

  const handleHasSeasons = () => {
    if (hasNoSeasons) {
      if (isCountryWithTaxesCalc) {
        resetAgeCalculatorDefaultValuesAndCheckboxes();
      } else {
        setInputValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.highAmount]: '',
            [FORM_NAMES.lowAmount]: '',
          };
        });
      }

      setHasNoSeasons(false);
    }

    setHasSeasons(true);
    setIsAskedForSeasons(true);
  };

  const handleNoSeasons = () => {
    if (prevHasSeasons) {
      resetSeasons();
      setInputValues((prevState) => {
        return {
          ...prevState,
          [FORM_NAMES.lowAmount]: '',
          [FORM_NAMES.highAmount]: '',
        };
      });
    }

    setHasNoSeasons(true);
    setIsAskedForSeasons(true);
  };

  return (
    <div>
      {!isAskedForSeasons ? (
        <div>
          <Title>{t('lets_do_quick_setup')}</Title>
          <SubTitle>{t('do_you_have_different_taxes_depending_on_season')}</SubTitle>
          <ChoicesButtonsWrapper>
            <Button label={t('yes')} onClick={handleHasSeasons} />
            <Button label={t('no')} onClick={handleNoSeasons} />
          </ChoicesButtonsWrapper>
          <TransparentButton type="button" onClick={openImportTaxesModal}>
            {t('would_you_like_import_setup_from_another_property')}
          </TransparentButton>
        </div>
      ) : (
        <div>
          {!isAskedForPricePercentage ? (
            <div>
              <Title>
                <Title>{t('lets_do_quick_setup')}</Title>
                <SubTitle>{t('would_you_like_to_set_tax_price_as_percentage')}</SubTitle>
                <ChoicesButtonsWrapper>
                  <Button label={t('percentage')} onClick={handleHasPricePercentage} />
                  <Button label={t('manually')} onClick={handleHasNoPricePercentage} />
                </ChoicesButtonsWrapper>
              </Title>
            </div>
          ) : (
            <>
              {isCountryWithTaxesCalc ? (
                <div>
                  <Title>{t('seasons')}</Title>
                  <SeasonsGroup>
                    <SeasonContainer>
                      <SeasonLabel>{t('high_season')}</SeasonLabel>
                      {highSeasonDateRangePicker}
                    </SeasonContainer>
                    <SeasonContainer>
                      <SeasonLabel>{t('low_season')}</SeasonLabel>
                      {lowSeasonDateRangePicker}
                    </SeasonContainer>
                  </SeasonsGroup>
                  <NextButtonWrapper>
                    <Button
                      disabled={!isHighSeasonDatesComplete || !isLowSeasonDatesComplete}
                      label={t('next')}
                      onClick={goNext}
                    />
                  </NextButtonWrapper>
                </div>
              ) : (
                <div>
                  {!hasSeasons && (
                    <PriceStep
                      goNext={goNext}
                      handleInputChange={handleInputChange}
                      inputValues={inputValues}
                      isBookingPercentagePrice={isBookingPercentagePrice}
                      currencyLabel={paymentSettingsCurrencyLabel}
                    />
                  )}
                  {hasSeasons && (
                    <div>
                      <Title>{t('seasons')}</Title>
                      <SeasonsGroup>
                        <WideSeasonContainer>
                          <SeasonLabel>{t('high_season')}</SeasonLabel>
                          {highSeasonDateRangePicker}
                          <SeasonContainerShortInputWrapper>
                            <ShortInput
                              value={inputValues[FORM_NAMES.highAmount]}
                              onChange={handleInputChange}
                              name={FORM_NAMES.highAmount}
                              type="number"
                              label={
                                isBookingPercentagePrice
                                  ? t('percentage_per_booking')
                                  : t('price_per_night')
                              }
                              placeholder={
                                isBookingPercentagePrice
                                  ? t('enter_percentage')
                                  : t('enter_price')
                              }
                              step="0.01"
                              inputMode="decimal"
                            />
                            <ShortInputCurrency>
                              {isBookingPercentagePrice
                                ? '%'
                                : paymentSettingsCurrencyLabel}
                            </ShortInputCurrency>
                          </SeasonContainerShortInputWrapper>
                        </WideSeasonContainer>
                        <WideSeasonContainer>
                          <SeasonLabel>{t('low_season')}</SeasonLabel>
                          {lowSeasonDateRangePicker}
                          <SeasonContainerShortInputWrapper>
                            <ShortInput
                              type="number"
                              onChange={handleInputChange}
                              label={
                                isBookingPercentagePrice
                                  ? t('percentage_per_booking')
                                  : t('price_per_night')
                              }
                              placeholder={
                                isBookingPercentagePrice
                                  ? t('enter_percentage')
                                  : t('enter_price')
                              }
                              step="0.01"
                              inputMode="decimal"
                              name={FORM_NAMES.lowAmount}
                              value={inputValues[FORM_NAMES.lowAmount]}
                            />
                            <ShortInputCurrency>
                              {isBookingPercentagePrice
                                ? '%'
                                : paymentSettingsCurrencyLabel}
                            </ShortInputCurrency>
                          </SeasonContainerShortInputWrapper>
                        </WideSeasonContainer>
                      </SeasonsGroup>
                      <NextButtonWrapper>
                        <Button
                          disabled={
                            !isHighSeasonDatesComplete ||
                            !isLowSeasonDatesComplete ||
                            !inputValues[FORM_NAMES.highAmount] ||
                            !inputValues[FORM_NAMES.lowAmount]
                          }
                          label={t('next')}
                          onClick={goNext}
                        />
                      </NextButtonWrapper>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export {SeasonsStep};
