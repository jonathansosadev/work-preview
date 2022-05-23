import React, {Dispatch, SetStateAction} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {PaymentInput} from '../ReservationPayments/PaymentInput/PaymentInput';
import {useIsFormTouched} from '../../../utils/hooks';
import {LightReservation} from '../../../utils/types';
import {ExtendedHousing} from '../ReservationInfoSection';
import {StatusTileResolveButton} from '../ReservationStatusSection/styled';
import {FlexContainer} from './styled';
import {PreloadedCoreFields} from '../ReservationPayments/utils';

export const FORM_NAMES = {
  deposit_amount: 'security_deposit_amount',
};

type ReservationDepositProps = {
  housing: ExtendedHousing | undefined;
  openDepositChargeModals?: () => void;
  disabled?: boolean;
  readonly?: boolean;
  optional?: boolean;
  inputValue?: string | number;
  reservation?: LightReservation;
  setIsSectionTouched?: Dispatch<SetStateAction<boolean>>;
  preloadedCoreFields?: PreloadedCoreFields;
};

function ReservationDeposit({
  reservation,
  housing,
  optional,
  disabled,
  readonly,
  setIsSectionTouched,
  inputValue,
  openDepositChargeModals,
}: ReservationDepositProps) {
  const {t} = useTranslation();
  const {setValue, watch} = useFormContext();
  const {isFormTouched, setUntouchedValues} = useIsFormTouched({
    displayFields: {
      [FORM_NAMES.deposit_amount]: true,
    },
    watch,
    defaultValues: {
      [FORM_NAMES.deposit_amount]: '',
    },
  });

  const housingDepositValue = housing?.security_deposit_amount;
  const isReservationDepositConfirmed =
    reservation?.security_deposit?.status === 'CONFIRMED';

  const getDepositStripeId = () => {
    if (!reservation?.security_deposit) return;
    const amount = Number(reservation?.security_deposit?.amount);
    if (amount === 0) return reservation?.security_deposit?.customer_id;
    return reservation?.security_deposit?.payment_external_id;
  };

  const getDepositLinkStripeId = () => {
    const amount = Number(reservation?.security_deposit?.amount);
    if (amount === 0) return `https://dashboard.stripe.com/customers/`;
  };

  React.useEffect(() => {
    if (!reservation) return;

    setIsSectionTouched!(isFormTouched);
  }, [isFormTouched, reservation, setIsSectionTouched]);

  React.useEffect(() => {
    const reservationDepositAmount = reservation?.security_deposit_amount;
    const isReservationBelongsToHousing = reservation?.housing_id === housing?.id;
    const defaultValue = inputValue ?? housingDepositValue;

    if (isReservationBelongsToHousing) {
      setValue(FORM_NAMES.deposit_amount, reservationDepositAmount);
      setUntouchedValues((prevState) => ({
        ...prevState,
        [FORM_NAMES.deposit_amount]: reservationDepositAmount,
      }));
      return;
    }

    setValue(FORM_NAMES.deposit_amount, defaultValue);
  }, [
    housing?.id,
    housingDepositValue,
    inputValue,
    reservation?.housing_id,
    reservation?.security_deposit_amount,
    setUntouchedValues,
    setValue,
  ]);

  return (
    <FlexContainer>
      <PaymentInput
        disabled={disabled}
        required={false}
        readOnly={readonly}
        label={
          <>
            <span>{t('deposit_amount')}</span>
            {optional && <span> ({t('optional_first_upper')})</span>}
          </>
        }
        paymentStripeId={getDepositStripeId()}
        paymentStripeLink={getDepositLinkStripeId()}
        inputName={FORM_NAMES.deposit_amount}
        placeholder={t('enter_price')}
      />
      {isReservationDepositConfirmed && openDepositChargeModals && (
        <StatusTileResolveButton
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            openDepositChargeModals();
          }}
        >
          {t('charge_deposit')}
        </StatusTileResolveButton>
      )}
    </FlexContainer>
  );
}

export {ReservationDeposit};
