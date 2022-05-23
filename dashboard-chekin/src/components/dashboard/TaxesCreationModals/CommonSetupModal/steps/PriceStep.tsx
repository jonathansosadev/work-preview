import React from 'react';
import {useTranslation} from 'react-i18next';
import {InputEventType} from '../../../../../utils/types';
import {FORM_NAMES} from '../../../HousingTaxesSection';
import {ShortInput} from '../../../HousingTaxesSection/styled';
import {
  Title,
  Button,
  NextButtonWrapper,
  PricePerNightSubTitle,
  Text,
  PricePerNightInputWrapper,
  ShortInputWrapper,
  ShortInputCurrency,
} from '../styled';

type PriceStepProps = {
  isBookingPercentagePrice: boolean;
  goNext: () => void;
  handleInputChange: (event: InputEventType) => void;
  inputValues: {[key: string]: string};
  currencyLabel: string;
};

function PriceStep({
  goNext,
  isBookingPercentagePrice,
  handleInputChange,
  inputValues,
  currencyLabel,
}: PriceStepProps) {
  const {t} = useTranslation();

  return (
    <div>
      <Title>{t('price')}</Title>
      <PricePerNightSubTitle>{t('what_is_the_tax_per_night')}</PricePerNightSubTitle>
      <Text>{t('introduce_tax_per_night')}</Text>
      <PricePerNightInputWrapper>
        <ShortInputWrapper>
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
              isBookingPercentagePrice ? t('enter_percentage') : t('enter_price')
            }
            step="0.01"
            inputMode="decimal"
          />
          <ShortInputCurrency>
            {isBookingPercentagePrice ? '%' : currencyLabel}
          </ShortInputCurrency>
        </ShortInputWrapper>
      </PricePerNightInputWrapper>
      <NextButtonWrapper>
        <Button
          disabled={!inputValues[FORM_NAMES.highAmount]}
          label={t('next')}
          onClick={goNext}
        />
      </NextButtonWrapper>
    </div>
  );
}

export {PriceStep};
