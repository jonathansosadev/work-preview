import React, {Dispatch, SetStateAction} from 'react';
import {useQuery} from 'react-query';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import useFetchSeason from '../../../../hooks/useFetchSeason';
import api from '../../../../api';
import {COUNTRY_CODES} from '../../../../utils/constants';
import {FORM_NAMES as DEPOSIT_FORM_NAMES} from '../../ReservationDeposit/ReservationDeposit';
import {getHasBookingPayments, getHasTaxes} from '../../../../utils/reservations';
import {getCountryCode} from '../../../../utils/housing';
import {LightReservation} from '../../../../utils/types';
import {useTaxes} from '../../ReservationTaxesSection';
import {Exemptions} from '../../../../hooks/useHousingExemptions';
import {
  useAsyncOperation,
  useIsFormTouched,
  useModalControls,
} from '../../../../utils/hooks';
import {
  FORM_NAMES,
  FormTypes,
  payloadCreator,
  PayloadStatus,
  PaymentsTypes,
  PreloadedCoreFields,
  ReservationPaymentsPayloadItem,
  useExtraFields,
} from '../utils';
import {ExtendedHousing} from '../../ReservationInfoSection';
import warningIcon from '../../../../assets/warning-icon.svg';
import ModalButton from '../../ModalButton';
import Modal from '../../Modal';
import PaymentSendEmailAndCopyLink from '../../PaymentSendEmailAndCopyLink';
import Section from '../../Section';
import Loader from '../../../common/Loader';
import {ModalTwoButtonsWrapper} from '../../../../styled/common';
import {PaymentsList} from '../PaymentsList/PaymentsList';

export const MAX_TOTAL_PAYMENT = 99999.99;

export type MarkAsPaid = {
  reservation_payments: ReservationPaymentsPayloadItem[];
};

export type PreloadFieldProps = {
  fieldName: FORM_NAMES.bookingPayment | FORM_NAMES.taxesPayment;
  status: PayloadStatus;
  amount: number | string;
  type: PaymentsTypes;
  external_id?: string;
  id?: string;
};

export type ReservationPaymentsRefType =
  | undefined
  | {
      getReservationPaymentsPayload: () => ReservationPaymentsPayloadItem[];
      onReservationPaymentsSuccess: () => void;
      triggerPaymentsValidation: () => Promise<any>;
    };

type ReservationPaymentsProps = {
  setIsSectionTouched: Dispatch<SetStateAction<boolean>>;
  reservation: LightReservation;
  housing: ExtendedHousing;
  exemptions: Exemptions;
  disabled: boolean;
  refetchReservation: any;
  openTotalAmountModal: () => void;
  openDepositChargeModals: () => void;
};

export function useReservationPayments(reservationId: string | undefined) {
  return useQuery<ReservationPaymentsPayloadItem[]>(
    ['reservationPayments', reservationId!],
    () => api.reservationPayments.fetchReservationPayments(reservationId!),
    {
      enabled: Boolean(reservationId),
    },
  );
}

const EditReservationPayments = React.forwardRef(
  (
    {
      housing,
      disabled,
      reservation,
      setIsSectionTouched,
      exemptions,
      refetchReservation,
      openTotalAmountModal,
      openDepositChargeModals,
    }: ReservationPaymentsProps,
    ref,
  ) => {
    const {t} = useTranslation();
    const {
      closeModal: closeMarkAsPaidModal,
      isOpen: isMarkAsPaidModalOpen,
      openModal: openMarkAsPaidModal,
    } = useModalControls();

    const formMethods = useForm<FormTypes>({
      defaultValues: {
        [FORM_NAMES.currency]: {label: 'Euros (€)', value: '€'},
        [FORM_NAMES.bookingPayment]: '',
      },
      shouldUnregister: true,
    });
    const [preloadedCoreFields, setPreloadedCoreFields] = React.useState<
      PreloadedCoreFields
    >({});
    const [preloadedExtraFields, setPreloadedExtraFields] = React.useState<
      ReservationPaymentsPayloadItem[]
    >([]);
    const {watch, getValues, setValue, handleSubmit, trigger} = formMethods;
    const [extraFieldsTouched, setExtraFieldsTouched] = React.useState(false);
    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      watch,
      displayFields: {
        [FORM_NAMES.bookingPayment]: true,
      },
      defaultValues: {
        [FORM_NAMES.bookingPayment]: '',
      },
    });

    const extraFieldsMethods = useExtraFields({watch});
    const {extraFields, setExtraFields} = extraFieldsMethods;

    const {
      data: reservationPayments,
      status: reservationPaymentsStatus,
      refetch: refetchReservationPayments,
    } = useReservationPayments(reservation?.id);

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

    const {taxesAmount} = useTaxes(housing, reservation, reservationPayments);

    React.useEffect(
      function preloadAmountPaid() {
        if (reservationPayments) {
          setValue(
            FORM_NAMES.amountPaid,
            parseFloat(reservation?.already_paid_amount?.toString()).toFixed(2),
          );
        }
      },
      [reservation, setValue, reservationPayments],
    );

    React.useEffect(
      function preloadReservationPaymentsInfo() {
        if (reservationPayments) {
          const tempExtraFields: ReservationPaymentsPayloadItem[] = [];

          const preloadField = ({
            external_id,
            fieldName,
            status,
            amount,
            type,
            id,
          }: PreloadFieldProps) => {
            const isPending = status === PayloadStatus.PENDING;

            if (isPending) {
              setValue(fieldName, '');
            } else {
              setValue(fieldName, amount);
            }

            setUntouchedValues((prevState) => ({
              ...prevState,
              [fieldName]: amount,
            }));
            setPreloadedCoreFields((prevState: {}) => ({
              ...prevState,
              [fieldName]: {
                external_id,
                status,
                type,
                id,
              },
            }));
          };

          let pmsPaymentAmount = 0;

          reservationPayments.forEach((payment) => {
            const {id, name, type, amount, status, external_id} = payment;

            switch (type) {
              case PaymentsTypes.EXTRA_SERVICE:
                tempExtraFields.push({
                  payment_id: id,
                  external_id,
                  amount,
                  status,
                  name,
                  type,
                  id,
                });
                break;
              case PaymentsTypes.BOOKING:
                preloadField({
                  fieldName: FORM_NAMES.bookingPayment,
                  external_id,
                  status,
                  amount,
                  type,
                  id,
                });
                break;
              case PaymentsTypes.PMS:
                pmsPaymentAmount += +amount;
                preloadField({
                  fieldName: FORM_NAMES.bookingPayment,
                  amount: pmsPaymentAmount,
                  external_id,
                  status,
                  type,
                  id,
                });
                break;
              case PaymentsTypes.TOURIST_TAXES:
                preloadField({
                  fieldName: FORM_NAMES.taxesPayment,
                  external_id,
                  status,
                  amount,
                  type,
                  id,
                });
                break;
            }
          });

          setPreloadedExtraFields(tempExtraFields);
          setExtraFields(tempExtraFields);
        }
      },
      [reservationPayments, setValue, setUntouchedValues, setExtraFields],
    );

    const totalPaymentValue = watch(FORM_NAMES.totalPayment);
    const amountPaid = watch(FORM_NAMES.amountPaid);

    React.useEffect(
      function preloadTaxesAmount() {
        if (taxesAmount !== null) {
          setValue(FORM_NAMES.taxesPayment, +taxesAmount!);
        }
      },
      [setValue, taxesAmount],
    );

    React.useEffect(
      function handleAmountDue() {
        if (!totalPaymentValue) return;

        const amountDue = +totalPaymentValue - +amountPaid;

        if (amountDue >= 0) {
          setValue(FORM_NAMES.amountDue, amountDue.toFixed(2));
        } else {
          setValue(FORM_NAMES.amountDue, 0);
        }
      },
      [totalPaymentValue, amountPaid, setValue],
    );

    function collectReservationPaymentsPayload(): ReservationPaymentsPayloadItem[] {
      const formValues = getValues();
      const reservationPayments = [];

      if (hasBookingPayments || isHousingContractsEnabled) {
        const bookingAmount =
          (formValues[FORM_NAMES.bookingPayment] as string | number) || 0;
        if (preloadedCoreFields[FORM_NAMES.bookingPayment]) {
          const bookingType = preloadedCoreFields[FORM_NAMES.bookingPayment]?.type;
          const bookingStatus = preloadedCoreFields[FORM_NAMES.bookingPayment]?.status;
          const bookingId = preloadedCoreFields[FORM_NAMES.bookingPayment]?.id;
          const bookingPayload: ReservationPaymentsPayloadItem = payloadCreator(
            FORM_NAMES.bookingPayment,
            bookingAmount,
            bookingStatus,
            bookingId,
            bookingType,
          );
          reservationPayments.push(bookingPayload);
        } else {
          const bookingStatus = PayloadStatus.ENABLED;
          const bookingPayload: ReservationPaymentsPayloadItem = payloadCreator(
            FORM_NAMES.bookingPayment,
            bookingAmount,
            bookingStatus,
          );
          reservationPayments.push(bookingPayload);
        }
      }

      const extraValues = extraFields.map((field, i) => {
        const extraFieldPayload: ReservationPaymentsPayloadItem = {
          ...field,
          name: formValues[FORM_NAMES.extraServices][i].name,
          amount: formValues[FORM_NAMES.extraServices][i].amount,
        };

        if (!field.payment_id) {
          delete extraFieldPayload.id;
        }

        return extraFieldPayload;
      });
      reservationPayments.push(...extraValues);

      if (hasTaxes) {
        if (preloadedCoreFields[FORM_NAMES.taxesPayment]) {
          let taxAmount: number | string;

          if (
            preloadedCoreFields[FORM_NAMES.taxesPayment]?.status ===
              PayloadStatus.PENDING &&
            formValues[FORM_NAMES.taxesPayment] === ''
          ) {
            taxAmount = 0;
          } else {
            taxAmount = formValues[FORM_NAMES.taxesPayment] as number | string;
          }

          const taxesStatus = preloadedCoreFields[FORM_NAMES.taxesPayment]?.status;
          const taxesId = preloadedCoreFields[FORM_NAMES.taxesPayment]?.id;
          const taxesPayload = payloadCreator(
            FORM_NAMES.taxesPayment,
            taxAmount,
            taxesStatus,
            taxesId,
          );

          reservationPayments.push(taxesPayload);
        } else {
          const taxesStatus = PayloadStatus.PENDING;
          const taxAmount = 0;
          const taxesPayload = payloadCreator(
            FORM_NAMES.taxesPayment,
            taxAmount,
            taxesStatus,
          );

          reservationPayments.push(taxesPayload);
        }
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
      onReservationPaymentsSuccess() {
        refetchReservationPayments();
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

    React.useEffect(
      function handleExtraFieldsTouched() {
        if (preloadedExtraFields.length !== extraFields.length) {
          setExtraFieldsTouched(preloadedExtraFields.length !== extraFields.length);
        } else {
          setExtraFieldsTouched(false);

          const isSomeExtraFieldTouched = extraFields.some((_, i: number) => {
            const fieldName = watch(
              `${FORM_NAMES.extraServices}.${i}.name` as const,
            ) as string;
            const fieldAmount = watch(
              `${FORM_NAMES.extraServices}.${i}.amount` as const,
            ) as number | string;
            const {name: preloadedName, amount: preloadedAmount} = preloadedExtraFields[
              i
            ];

            const someFieldTouched =
              fieldName !== preloadedName ||
              parseFloat(fieldAmount.toString()).toFixed(2) !== preloadedAmount ||
              preloadedExtraFields.length !== extraFields.length;

            return someFieldTouched;
          });

          setExtraFieldsTouched(isSomeExtraFieldTouched);
        }
      },
      [preloadedExtraFields, extraFields, watch],
    );

    React.useEffect(
      function handleSectionTouched() {
        setIsSectionTouched(isFormTouched || extraFieldsTouched);
      },
      [isFormTouched, setIsSectionTouched, extraFieldsTouched],
    );

    const {asyncOperation: markPaymentsAsPaid} = useAsyncOperation();

    const markAsPaid = async () => {
      if (!reservation) return;

      const payload = {
        reservation_payments: collectReservationPaymentsPayload(),
      };

      await markPaymentsAsPaid(
        () => api.reservationPayments.markAsPaid(reservation.id, payload),
        {
          onSuccess: () => {
            refetchReservationPayments();
            refetchReservation();
          },
        },
      );

      closeMarkAsPaidModal();
    };

    const handleMarkPaid = async () => {
      if (totalPaymentValue > MAX_TOTAL_PAYMENT) {
        openTotalAmountModal();
        return;
      }

      const isValid = await trigger();

      if (isValid) {
        openMarkAsPaidModal();
      }
    };

    return (
      <Section>
        {reservationPaymentsStatus === 'loading' ? (
          <Loader height={40} width={40} />
        ) : (
          <PaymentsList
            formMethods={formMethods}
            onMarkPaid={handleMarkPaid}
            exemptions={exemptions}
            housing={housing}
            openDepositChargeModals={openDepositChargeModals}
            preloadedCoreFields={preloadedCoreFields}
            preloadedExtraFields={preloadedExtraFields}
            reservation={reservation}
            setIsSectionTouched={setIsSectionTouched}
            extraFieldsMethods={extraFieldsMethods}
            disabled={disabled}
            hasBookingPayments={hasBookingPayments}
            isBookingPaymentRequired={needBookingPaymentForFrance}
          />
        )}
        <PaymentSendEmailAndCopyLink
          housing={housing}
          disabled={disabled}
          reservation={reservation}
          hasTaxExemption={exemptions.taxExemption}
        />
        <Modal
          open={isMarkAsPaidModalOpen}
          onClose={closeMarkAsPaidModal}
          title={`${t('mark_as_paid')}?`}
          text={t('mark_as_paid_modal_text')}
          iconSrc={warningIcon}
          iconAlt="warning"
          iconProps={{
            height: 84,
            width: 84,
          }}
        >
          <ModalTwoButtonsWrapper>
            <ModalButton onClick={markAsPaid} label={t('confirm')} />
            <ModalButton secondary onClick={closeMarkAsPaidModal} label={t('cancel')} />
          </ModalTwoButtonsWrapper>
        </Modal>
      </Section>
    );
  },
);

EditReservationPayments.displayName = 'EditReservationPayments';

export {EditReservationPayments};
