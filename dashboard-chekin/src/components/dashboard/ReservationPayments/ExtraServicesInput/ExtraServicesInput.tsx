import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {FORM_NAMES, ReservationPaymentsPayloadItem, PayloadStatus} from '../utils';
// import Select from '../Select';
import {
  // ShrinkSelect,
  InputWrapper,
  AmountInput,
  Currency,
  ExtraServiceWrapper,
  ExtraServiceInput,
  NameInput,
  RemoveBtn,
  NameError,
  AmountError,
} from '../styled';
import {usePaymentSettings} from '../../../../hooks/usePaymentSettings';

type ExtraServicesInputProps = {
  index: number;
  field: any;
  remove: (index: number) => void;
  preloadedExtraFields?: ReservationPaymentsPayloadItem[];
  disabled?: boolean;
};

function ExtraServicesInput({
  index,
  field,
  remove,
  disabled,
  preloadedExtraFields,
}: ExtraServicesInputProps) {
  const {t} = useTranslation();
  const {
    watch,
    register,

    formState: {errors},
  } = useFormContext();
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  // const choosenCurrency = watch(FORM_NAMES.currency);
  const extraServicesPrice = watch(FORM_NAMES.extraServices)?.[index]?.amount;
  const inputName = `${FORM_NAMES.extraServices}[${index}]`;

  const removeField = () => {
    remove(index);
  };

  const isPaid = preloadedExtraFields?.[index]?.status === PayloadStatus.PAID;
  const nameError = errors.extraServices?.[index]?.name?.message;
  const amountError = errors.extraServices?.[index]?.amount?.message;

  return (
    <ExtraServiceWrapper readOnly={isPaid}>
      <InputWrapper>
        <ExtraServiceInput>
          <NameInput
            {...register(`${inputName}.name` as const, {
              required: `${t('required')}`,
            })}
            placeholder={t('enter_extra_service_name')}
            invalid={nameError}
            defaultValue={field.name}
            readOnly={isPaid}
            disabled={disabled}
          />
          <AmountInput
            type="number"
            step="0.01"
            {...register(`${inputName}.amount` as const, {
              required: `${t('required')}`,
              min: {
                value: 0,
                message: t('min_number_is', {number: 0}),
              },
              max: {
                value: 99999.99,
                message: t('max_number_is', {number: 99999.99}),
              },
              pattern: {
                value: /^\d{1,5}(\.\d{1,2})?$/,
                message: t('no_more_two_decimals'),
              },
            })}
            placeholder={t('enter_price')}
            invalid={amountError}
            defaultValue={field.amount}
            readOnly={isPaid}
            disabled={disabled}
          />
          {extraServicesPrice && (
            <Currency className="currency">{paymentSettingsCurrencyLabel}</Currency>
          )}
        </ExtraServiceInput>
        {nameError && <NameError>{nameError}</NameError>}
        {amountError && <AmountError>{amountError}</AmountError>}
      </InputWrapper>
      {!isPaid && (
        <RemoveBtn disabled={disabled} onClick={removeField}>
          ({t('remove')})
        </RemoveBtn>
      )}
    </ExtraServiceWrapper>
  );
}

export {ExtraServicesInput};
