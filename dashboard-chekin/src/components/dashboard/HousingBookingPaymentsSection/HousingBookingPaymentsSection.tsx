import React, {Dispatch, SetStateAction} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {RESERVATION_PAYMENT_STATUSES} from '../ReservationPayments';
import {HOUSING_FORM_NAMES} from 'utils/formNames';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import {Housing} from '../../../utils/types';
import Section, {Subtitle} from '../Section';
import Switch, {useSwitchSectionActive} from '../Switch';
import ExemptSourcesSubsection from '../ExemptSourcesSubsection';
import Selectors from '../Selectors';
import PaymentsTooltip from '../PaymentsTooltip';
import {LargeTooltipSectionWrapper} from '../../../styled/common';
import {FEES_OPTIONS_PAYLOAD} from '../FeesOptions';
import {Content, PaymentsFeesOptions} from './styled';

enum BOOKING_PAYMENTS_OPTIONS {
  payment_mandatory = 'reservation_payments_status',
  payment_optional = 'reservation_payments_status',
}

const paymentsOptions = {
  payment_mandatory: RESERVATION_PAYMENT_STATUSES.mandatory,
  payment_optional: RESERVATION_PAYMENT_STATUSES.optional,
};

export enum BOOKING_FORM_FEES_NAMES {
  discount_fees_from_my_balance = 'commission_responsibility_for_booking',
  charge_fees_to_guest = 'commission_responsibility_for_booking',
}

export const BOOKING_PAYMENTS_DEFAULT_SELECTOR = {
  [BOOKING_PAYMENTS_OPTIONS.payment_mandatory]: RESERVATION_PAYMENT_STATUSES.mandatory,
};

const FEES_DEFAULT_SELECTOR = {
  [BOOKING_FORM_FEES_NAMES.discount_fees_from_my_balance]: FEES_OPTIONS_PAYLOAD.MANAGER,
};

type HousingBookingPaymentsSectionProps = {
  setIsSectionTouched: Dispatch<SetStateAction<boolean>>;
  housing?: Housing;
  disabled?: boolean;
  handlePaymentSectionToggle: (isSectionActive: boolean) => boolean;
  setBookingPaymentsSectionActive: Dispatch<SetStateAction<boolean>>;
};

const HousingBookingPaymentsSection = ({
  housing,
  setIsSectionTouched,
  disabled,
  handlePaymentSectionToggle,
  setBookingPaymentsSectionActive,
}: HousingBookingPaymentsSectionProps) => {
  const {t} = useTranslation();
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  const {setValue} = useFormContext();
  const [isSelectorsTouched, setIsSelectorsTouched] = React.useState(false);

  const isInactive =
    !housing ||
    housing?.reservation_payments_status === RESERVATION_PAYMENT_STATUSES.inactive;

  const preloadedSectionActive = Boolean(housing && !isInactive);

  const {
    isSectionActive,
    toggleIsSectionActive,
    isSectionActiveTouched,
  } = useSwitchSectionActive(preloadedSectionActive, {
    canToggle: handlePaymentSectionToggle,
  });

  React.useEffect(
    function syncLocalStateWithParentState() {
      setBookingPaymentsSectionActive(isSectionActive);
    },
    [isSectionActive, setBookingPaymentsSectionActive],
  );

  React.useEffect(
    function preloadDefaultStatus() {
      if (isSectionActive && isInactive) {
        setValue(
          BOOKING_PAYMENTS_OPTIONS.payment_mandatory,
          RESERVATION_PAYMENT_STATUSES.mandatory,
        );
        setValue(
          BOOKING_FORM_FEES_NAMES.discount_fees_from_my_balance,
          FEES_OPTIONS_PAYLOAD.MANAGER,
        );
      }
    },
    [isSectionActive, isInactive, setValue],
  );

  React.useEffect(() => {
    setIsSectionTouched(isSelectorsTouched || isSectionActiveTouched);
  }, [setIsSectionTouched, isSectionActiveTouched, isSelectorsTouched]);

  const handleBookingSourcesChange = () => {
    setIsSectionTouched(true);
  };

  return (
    <LargeTooltipSectionWrapper>
      <Section
        title={<>{t('booking_payments')}</>}
        subtitle={t('booking_payments_subtitle')}
        subtitleTooltip={
          <PaymentsTooltip
            currencyLabel={paymentSettingsCurrencyLabel}
            title={t('payments_tooltip_title')}
          />
        }
      >
        <Switch
          label={t('activate_booking_payments')}
          checked={isSectionActive}
          onChange={toggleIsSectionActive}
        />
        {isSectionActive && (
          <Content>
            <ExemptSourcesSubsection
              housing={housing}
              formName={HOUSING_FORM_NAMES.booking_exempt_sources}
              onChange={handleBookingSourcesChange}
              disabled={disabled}
            />
            <Subtitle>{t('select_if_you_want_to_make_the_payment')}</Subtitle>
            <Selectors
              selectorsFormNames={BOOKING_PAYMENTS_OPTIONS}
              preloadedSelectorsData={housing?.reservation_payments_status}
              disabled={disabled}
              setIsSelectorsTouched={setIsSelectorsTouched}
              radioValues={paymentsOptions}
              defaultFormValues={BOOKING_PAYMENTS_DEFAULT_SELECTOR}
            />
            <PaymentsFeesOptions
              formNames={BOOKING_FORM_FEES_NAMES}
              setIsSelectorsTouched={setIsSelectorsTouched}
              preloadedSelectorsData={
                housing?.[BOOKING_FORM_FEES_NAMES.charge_fees_to_guest]
              }
              defaultFormValues={FEES_DEFAULT_SELECTOR}
            />
          </Content>
        )}
      </Section>
    </LargeTooltipSectionWrapper>
  );
};

export {HousingBookingPaymentsSection, PaymentsTooltip};
