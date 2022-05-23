import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {ErrorMessage} from '../../../../styled/common';
import {usePaymentSettings} from '../../../../hooks/usePaymentSettings';
import {PayloadStatus, PreloadedCoreFields} from '../utils';
// import Select from '../Select';
import {InputEventType} from '../../../../utils/types';
import StripeIdBlock from '../StripeIdBlock';
import {
  // ShrinkSelect,
  WideInput,
  ShrinkInput,
  InputContainer,
  InputTooltip,
  Currency,
  Label,
} from '../styled';

type PaymentInputProps = {
  label: string | React.ReactNode;
  inputName: string;
  placeholder: string;
  preloadedCoreFields?: PreloadedCoreFields;
  paymentStripeId?: string;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  tooltipContent?: string;
  paymentStripeLink?: string;
};

function PaymentInput({
  className,
  label,
  inputName,
  required = true,
  readOnly,
  disabled,
  tooltipContent,
  placeholder,
  preloadedCoreFields,
  paymentStripeId,
  paymentStripeLink,
}: PaymentInputProps) {
  const {t} = useTranslation();
  const {
    watch,
    register,
    formState: {errors},
  } = useFormContext();
  const inputValue = watch(inputName);
  const hasValue = inputValue !== null && inputValue !== undefined && inputValue !== '';
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  // const chosenCurrency = watch(FORM_NAMES.currency);

  const handleCaretPosition = (e: InputEventType) => {
    if (readOnly) return;

    e.target.type = 'text';
    const inputLength = e.target.value.length;
    e.target.setSelectionRange(inputLength, inputLength);
    e.target.type = 'number';
  };

  const isPaid = preloadedCoreFields?.[inputName]?.status === PayloadStatus.PAID;
  const stripeId = preloadedCoreFields?.[inputName]?.external_id || paymentStripeId;
  const isReadOnly = readOnly || isPaid;
  const isRequired = !isReadOnly && required;
  const error = errors[inputName]?.message;

  return (
    <InputContainer className={className} readOnly={isReadOnly}>
      <div>
        <WideInput invalid={error} className="wide-input">
          <Label className="label">{label}</Label>
          <StripeIdBlock id={stripeId} link={paymentStripeLink} />
          <ShrinkInput
            type="number"
            step="0.01"
            {...register(inputName, {
              required: isRequired && `${t('required')}`,
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
            placeholder={placeholder}
            onFocus={handleCaretPosition}
            readOnly={isReadOnly}
            disabled={disabled}
            invalid={error}
          />
          {hasValue && (
            <Currency className="currency">{paymentSettingsCurrencyLabel}</Currency>
          )}
        </WideInput>
        {error && (
          <ErrorMessage className="error-message" data-testid={`${inputName}-error`}>
            {error}
          </ErrorMessage>
        )}
      </div>
      {tooltipContent && <InputTooltip content={t('payment_taxes_tooltip_content')} />}
    </InputContainer>
  );
}

export {PaymentInput};
