import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {usePaymentSettings} from '../../../../hooks/usePaymentSettings';
// import Select from '../Select';
import {
  // ShrinkSelect,
  Label,
  ResultInputWrapper,
  ShrinkInput,
  Currency,
} from '../styled';

type PaymentInputProps = {
  label: string;
  inputName: string;
  className?: string;
  disabled?: boolean;
};

function ResultInput({className, label, inputName, disabled}: PaymentInputProps) {
  const {t} = useTranslation();
  const {watch, register} = useFormContext();
  const inputValue = watch(inputName);
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  // const choosenCurrency = watch(FORM_NAMES.currency);

  return (
    <ResultInputWrapper className={className}>
      <Label className="label">{label}</Label>
      <ShrinkInput
        type="text"
        {...register(inputName, {
          required: false,
        })}
        placeholder={t('pending')}
        disabled={disabled}
        readOnly
      />
      {inputValue && <Currency>{paymentSettingsCurrencyLabel}</Currency>}
    </ResultInputWrapper>
  );
}

export {ResultInput};
