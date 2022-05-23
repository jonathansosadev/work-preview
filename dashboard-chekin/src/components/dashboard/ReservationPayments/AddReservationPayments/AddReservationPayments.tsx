import React from 'react';
import {useForm} from 'react-hook-form';
import useFetchSeason from '../../../../hooks/useFetchSeason';
import {Exemptions} from '../../../../hooks/useHousingExemptions';
import {FORM_NAMES as DEPOSIT_FORM_NAMES} from '../../ReservationDeposit/ReservationDeposit';
import {useUser} from '../../../../context/user';
import {getCountryCode} from '../../../../utils/housing';
import {COUNTRY_CODES} from '../../../../utils/constants';
import {ExtendedHousing} from '../../ReservationInfoSection';
import {BOOKING_FORM_FEES_NAMES} from '../../HousingBookingPaymentsSection';
import {getHasBookingPayments, getHasTaxes} from '../../../../utils/reservations';
import {
  payloadCreator,
  FORM_NAMES,
  FormTypes,
  PayloadStatus,
  ReservationPaymentsPayloadItem,
  useExtraFields,
  useTotalPayment,
  usePreparePayments,
} from '../utils';
import Section from '../../Section';
import {PaymentsList} from '../PaymentsList/PaymentsList';

export type AddReservationPaymentsRefType =
  | undefined
  | {
      getReservationPaymentsPayload: () => ReservationPaymentsPayloadItem[];
      getReservationDepositPayload: () => {security_deposit_amount: string | number};
      triggerPaymentsValidation: () => Promise<any>;
      totalAmount: number;
    };

type AddReservationPaymentsProps = {
  housing: ExtendedHousing;
  exemptions: Exemptions;
  disabled: boolean;
};

const AddReservationPayments = React.forwardRef(
  ({housing, exemptions, disabled}: AddReservationPaymentsProps, ref) => {
    const user = useUser();
    const formMethods = useForm<FormTypes>({
      defaultValues: {
        [FORM_NAMES.currency]: {label: 'Euros (€)', value: '€'},
        [FORM_NAMES.amountPaid]: '0.00',
      },
      shouldUnregister: true,
    });
    const {watch, getValues, setValue, handleSubmit} = formMethods;
    const extraFieldsMethods = useExtraFields({watch});
    const {extraFields, extraPaymentsAmount} = extraFieldsMethods;

    const isHousingContractsEnabled = housing?.is_contract_enabled;
    const hasTaxes = getHasTaxes({housing, exemptions});
    const isFranceHousing = getCountryCode(housing) === COUNTRY_CODES.france;
    const highSeasonId = housing?.seasons?.[0];
    const {highSeasonSuccess, highSeason} = useFetchSeason(
      highSeasonId,
      Boolean(isFranceHousing && hasTaxes),
    );
    const needBookingPaymentForFrance = Boolean(
      isFranceHousing && hasTaxes && highSeasonSuccess && !highSeason?.is_classified,
    );
    const hasBookingPayments =
      getHasBookingPayments({housing, exemptions}) || needBookingPaymentForFrance;

    const isGuestPayingPaymentsFees = Boolean(
      housing?.[BOOKING_FORM_FEES_NAMES.charge_fees_to_guest] === 'GUEST',
    );
    const isGuestPayingTaxesFees = Boolean(
      housing?.commission_responsibility_for_tourist_tax === 'GUEST',
    );

    const taxesPaymentValue = watch(FORM_NAMES.taxesPayment);
    const bookingPaymentValue = watch(FORM_NAMES.bookingPayment);
    const taxesPayment = taxesPaymentValue ? Number(taxesPaymentValue) : null;
    const bookingPayment = bookingPaymentValue ? Number(bookingPaymentValue) : null;

    const totalPaymentValue = watch(FORM_NAMES.totalPayment);

    const {payments} = usePreparePayments({
      bookingPayment,
      extraPaymentsAmount,
      taxesPayment,
      isGuestPayingPaymentsFees,
      isGuestPayingTaxesFees,
    });

    useTotalPayment({
      setValue,
      payments,
      feesAmount: user?.payment_commission_for_guest,
      isAnyFees: isGuestPayingPaymentsFees || isGuestPayingTaxesFees,
    });

    React.useEffect(
      function handleAmountDue() {
        if (!totalPaymentValue) return;
        setValue(FORM_NAMES.amountDue, totalPaymentValue);
      },
      [totalPaymentValue, setValue],
    );

    function collectReservationPaymentsPayload() {
      const formValues = getValues();
      const reservationPayments = [];

      const extraValues = extraFields.map((field, i) => {
        const extraFieldPayload = {
          ...field,
          name: formValues[FORM_NAMES.extraServices][i].name,
          amount: formValues[FORM_NAMES.extraServices][i].amount,
        };
        delete extraFieldPayload.id;
        return extraFieldPayload;
      });
      reservationPayments.push(...extraValues);

      if (hasBookingPayments || isHousingContractsEnabled) {
        const bookingStatus = PayloadStatus.ENABLED;
        const bookingAmount =
          (formValues[FORM_NAMES.bookingPayment] as string | number) || 0;
        const bookingPayload = payloadCreator(
          FORM_NAMES.bookingPayment,
          bookingAmount,
          bookingStatus,
        );

        reservationPayments.push(bookingPayload);
      }

      if (hasTaxes) {
        const taxesAmount = 0;
        const taxesStatus = PayloadStatus.PENDING;
        const taxesPayload = payloadCreator(
          FORM_NAMES.taxesPayment,
          taxesAmount,
          taxesStatus,
        );

        reservationPayments.push(taxesPayload);
      }

      return reservationPayments;
    }

    React.useImperativeHandle(ref, () => ({
      getReservationPaymentsPayload() {
        const reservationPayments = collectReservationPaymentsPayload();
        return reservationPayments.length ? reservationPayments : undefined;
      },
      getReservationDepositPayload() {
        const formValues = getValues() as Record<string, unknown>;
        return {
          [DEPOSIT_FORM_NAMES.deposit_amount]:
            (formValues[FORM_NAMES.depositAmount] as string | number) || 0,
        };
      },
      async triggerPaymentsValidation() {
        let validationResult = false;

        await handleSubmit(() => {
          validationResult = true;
        })();
        return validationResult;
      },
      totalAmount: totalPaymentValue,
    }));

    return (
      <Section>
        <PaymentsList
          housing={housing}
          exemptions={exemptions}
          formMethods={formMethods}
          extraFieldsMethods={extraFieldsMethods}
          hasBookingPayments={hasBookingPayments}
          isBookingPaymentRequired={needBookingPaymentForFrance}
          disabled={disabled}
        />
      </Section>
    );
  },
);

AddReservationPayments.displayName = 'AddReservationPayments';

export {AddReservationPayments};
