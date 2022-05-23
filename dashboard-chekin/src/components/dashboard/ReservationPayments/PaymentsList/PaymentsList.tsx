import React, {Dispatch, SetStateAction} from 'react';
import {FormProvider, UseFormReturn} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import useFetchGuestGroup from '../../../../hooks/useFetchGuestGroup';
import {Exemptions} from '../../../../hooks/useHousingExemptions';
import {COUNTRY_CODES, SECURITY_DEPOSIT_STATUSES} from '../../../../utils/constants';
import {useUser} from '../../../../context/user';
import {ExtendedHousing} from '../../ReservationInfoSection';
import {BOOKING_FORM_FEES_NAMES} from '../../HousingBookingPaymentsSection';
import {
  FORM_NAMES,
  FormTypes,
  ReservationPaymentsPayloadItem,
  useExtraFields,
  useTotalPayment,
  usePreparePayments,
  RESERVATION_PAYMENT_STATUSES,
} from '../utils';
import {getHasSecurityDeposit, getHasTaxes} from '../../../../utils/reservations';
import {LightReservation} from '../../../../utils/types';
import {PreloadedCoreFields} from '../utils';
import plusIcon from '../../../../assets/blue-plus.svg';
import ReservationDeposit from '../../ReservationDeposit';
import {ExtraServicesInput} from '../ExtraServicesInput/ExtraServicesInput';
import {ResultInput} from '../ResultInput/ResultInput';
import {PaymentInput} from '../PaymentInput/PaymentInput';
import {Subsection} from '../Subsection/Subsection';
import {MarkPaidBtn} from '../styled';
import {
  AddServiceBtn,
  AmountDueWrapper,
  ResultContainer,
  LightResultInput,
  SubsectionsWrapper,
} from '../styled';

type PaymentsListProps = {
  housing: ExtendedHousing;
  disabled: boolean;
  exemptions: Exemptions;
  formMethods: UseFormReturn<FormTypes>;
  extraFieldsMethods: ReturnType<typeof useExtraFields>;
  hasBookingPayments: boolean;
  isBookingPaymentRequired: boolean;
  setIsSectionTouched?: Dispatch<SetStateAction<boolean>>;
  reservation?: LightReservation;
  preloadedCoreFields?: PreloadedCoreFields;
  preloadedExtraFields?: ReservationPaymentsPayloadItem[];
  openDepositChargeModals?: () => void;
  onMarkPaid?: () => Promise<void>;
};

const PaymentsList = ({
  housing,
  disabled,
  exemptions,
  formMethods,
  hasBookingPayments,
  isBookingPaymentRequired,
  onMarkPaid,
  reservation,
  setIsSectionTouched,
  openDepositChargeModals,
  preloadedCoreFields,
  preloadedExtraFields,
  extraFieldsMethods,
}: PaymentsListProps) => {
  const {t} = useTranslation();
  const user = useUser();
  const {watch, setValue} = formMethods;
  const {
    extraPaymentsAmount,
    extraFields,
    removeExtraField,
    addExtraField,
  } = extraFieldsMethods;
  const isEditMode = Boolean(reservation);
  const amountDue = watch(FORM_NAMES.amountDue);
  const bookingPaymentValue = watch(FORM_NAMES.bookingPayment);
  const taxesPaymentValue = watch(FORM_NAMES.taxesPayment);

  const isGuestPayingTaxesFees = Boolean(
    housing?.commission_responsibility_for_tourist_tax === 'GUEST',
  );
  const isGuestPayingPaymentsFees = Boolean(
    housing?.[BOOKING_FORM_FEES_NAMES.charge_fees_to_guest] === 'GUEST',
  );
  const hasTaxes = getHasTaxes({housing, exemptions});
  const hasSecurityDeposit = getHasSecurityDeposit({housing, exemptions});
  const bookingPayment = bookingPaymentValue ? Number(bookingPaymentValue) : null;
  const taxesPayment = taxesPaymentValue ? Number(taxesPaymentValue) : null;
  const {payments} = usePreparePayments({
    bookingPayment,
    extraPaymentsAmount,
    taxesPayment,
    isGuestPayingPaymentsFees,
    isGuestPayingTaxesFees,
  });

  const guestGroupId = reservation?.guest_group_id;
  const {data: guestGroup} = useFetchGuestGroup({
    guestGroupId,
    enabled: Boolean(guestGroupId),
  });
  const isLeaderRegistered = Boolean(guestGroup?.leader_id);

  useTotalPayment({
    setValue,
    payments,
    feesAmount: user?.payment_commission_for_guest,
    isAnyFees: isGuestPayingPaymentsFees || isGuestPayingTaxesFees,
  });

  const isHousingContractsEnabled = housing?.is_contract_enabled;
  const isOnlyContracts =
    isHousingContractsEnabled && !hasBookingPayments && !hasSecurityDeposit;
  const isBookingPaymentsOptional =
    housing?.reservation_payments_status === RESERVATION_PAYMENT_STATUSES.optional ||
    isOnlyContracts;

  const isDepositOptional =
    housing?.security_deposit_status === SECURITY_DEPOSIT_STATUSES.optional ||
    isOnlyContracts;

  const isDepositReadonly = isHousingContractsEnabled && isLeaderRegistered;
  const isItalianHousing = housing?.location.country.code === COUNTRY_CODES.italy;
  const isItalianHousingWithOnlyContracts = isItalianHousing && isOnlyContracts;
  const isItalianHousingWithoutDeposit = isItalianHousing && !hasSecurityDeposit;

  const isVisiblePaymentsSubsection = Boolean(
    hasBookingPayments || hasTaxes || extraFields.length || isHousingContractsEnabled,
  );

  return (
    <FormProvider {...formMethods}>
      <SubsectionsWrapper>
        {(hasSecurityDeposit || isItalianHousingWithOnlyContracts) && (
          <Subsection
            label={t('security_deposit')}
            tooltip={
              isItalianHousingWithoutDeposit && (
                <div>
                  {t('deposit_title_tooltip')}{' '}
                  <a
                    rel="noreferrer"
                    target="_blank"
                    href={t('deposit_title_tooltip_link')}
                  >
                    {t('learn_more')}
                  </a>
                </div>
              )
            }
          >
            <ReservationDeposit
              openDepositChargeModals={openDepositChargeModals}
              reservation={reservation}
              setIsSectionTouched={setIsSectionTouched}
              housing={housing}
              optional={isDepositOptional}
              readonly={isDepositReadonly}
              disabled={disabled}
              inputValue={
                isItalianHousingWithOnlyContracts && !isEditMode ? '0.00' : undefined
              }
            />
          </Subsection>
        )}

        <Subsection
          isVisible={isVisiblePaymentsSubsection}
          label={t('payments')}
          tooltip={
            <div>
              {t('payment_title_tooltip')}{' '}
              <a rel="noreferrer" target="_blank" href={t('payment_title_tooltip_link')}>
                {t('learn_more')}
              </a>
            </div>
          }
        >
          {(hasBookingPayments || isHousingContractsEnabled) && (
            <PaymentInput
              required={isBookingPaymentRequired}
              label={
                <>
                  <span>{t('booking_price')}</span>
                  {isBookingPaymentsOptional && (
                    <span> ({t('optional_first_upper')})</span>
                  )}
                </>
              }
              inputName={FORM_NAMES.bookingPayment}
              placeholder={t('enter_price')}
              preloadedCoreFields={preloadedCoreFields}
              disabled={disabled}
            />
          )}
          {hasTaxes && (
            <PaymentInput
              label={t('tourist_taxes')}
              inputName={FORM_NAMES.taxesPayment}
              placeholder={t('pending')}
              tooltipContent={
                taxesPayment ? undefined : t('payment_taxes_tooltip_content')
              }
              preloadedCoreFields={preloadedCoreFields}
              disabled={disabled}
              readOnly
            />
          )}
          {!isOnlyContracts &&
            extraFields.map((field: any, index: number) => {
              return (
                <ExtraServicesInput
                  key={field.id}
                  index={index}
                  field={field}
                  remove={removeExtraField}
                  preloadedExtraFields={preloadedExtraFields}
                  disabled={disabled}
                />
              );
            })}
          {!isOnlyContracts && (
            <AddServiceBtn
              secondary
              onClick={addExtraField}
              label={t('add_extra_service')}
              icon={<img src={plusIcon} alt="Plus icon" />}
              disabled={disabled}
            />
          )}
          {!isOnlyContracts && (
            <ResultContainer>
              {(isGuestPayingPaymentsFees || isGuestPayingTaxesFees) && (
                <>
                  <LightResultInput
                    label={t('subtotal')}
                    inputName={FORM_NAMES.subtotal}
                    disabled={disabled}
                  />
                  <LightResultInput
                    label={t('transaction_fee')}
                    inputName={FORM_NAMES.transactionFee}
                    disabled={disabled}
                  />
                </>
              )}
              <ResultInput
                label={t('total')}
                inputName={FORM_NAMES.totalPayment}
                disabled={disabled}
              />
              <ResultInput
                label={t('amount_paid')}
                inputName={FORM_NAMES.amountPaid}
                disabled={disabled}
              />
              <AmountDueWrapper redValue={Boolean(parseInt(`${amountDue}`))}>
                <ResultInput
                  label={t('amount_due')}
                  inputName={FORM_NAMES.amountDue}
                  disabled={disabled}
                />
                {isEditMode && (
                  <MarkPaidBtn
                    disabled={disabled || Number(amountDue) === 0}
                    onClick={onMarkPaid}
                  >
                    ({t('mark_as_paid')})
                  </MarkPaidBtn>
                )}
              </AmountDueWrapper>
            </ResultContainer>
          )}
        </Subsection>
      </SubsectionsWrapper>
    </FormProvider>
  );
};

PaymentsList.displayName = 'PaymentsList';

export {PaymentsList};
