import React from 'react';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import {
  Guest,
  GuestGroup,
  GuestPayment,
  PaymentGuestList,
  LightReservation,
  TaxExemption,
} from '../../../utils/types';
import {ExtendedHousing} from '../ReservationInfoSection';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import {getTimezoneDate} from '../../../utils/date';
import {getTimezone} from '../../../utils/housing';
import {toastResponseError} from '../../../utils/common';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import {useErrorToast, useIsMounted, useStatus} from '../../../utils/hooks';
import {PaymentsTypes, useReservationPayments} from '../ReservationPayments';
import checkIcon from '../../../assets/check.svg';
import Section from '../Section';
import Loader from '../../common/Loader';
import PaymentSendEmailAndCopyLink from '../PaymentSendEmailAndCopyLink';
import Button from '../Button';
import {
  Main,
  Status,
  StatusDot,
  Currency,
  PaymentAmount,
  TotalPayment,
  Title,
  Summary,
  SummaryRow,
  SummaryTitle,
  StripeIdBlockStyled,
} from './styled';

const noneExemptionOption = {
  value: 'NONE',
  label: i18n.t('none'),
};
const minCalcAge = 1;

function fetchGuestPayment(params = '') {
  return queryFetcher(api.seasonGuests.ENDPOINTS.all(params));
}

function fetchTaxExemptions() {
  return queryFetcher(api.statTaxExemptions.ENDPOINTS.all());
}

function getGuestAge(guest: Guest, timezone: string) {
  const today = moment();
  const birthDate = getTimezoneDate(moment(guest.birth_date, 'YYYY-MM-DD'), timezone);

  return today.diff(birthDate, 'years');
}

function getPaymentGuestList(guestGroup: GuestGroup, housing: ExtendedHousing) {
  const timeZone = getTimezone(housing);

  return guestGroup.members.map((guest) => {
    return {
      age: getGuestAge(guest, timeZone),
      exemption: noneExemptionOption.value,
    };
  });
}

function getSummary(paymentGuestList?: PaymentGuestList, taxExemptions?: TaxExemption[]) {
  if (!paymentGuestList?.length || !taxExemptions) {
    return null;
  }

  let reducedGuests: {
    [key: string]: {
      count: number;
      ages: number[];
    };
  } = {};

  paymentGuestList.forEach((guest) => {
    if (!reducedGuests[guest.exemption]) {
      reducedGuests[guest.exemption] = {
        ages: [guest.age],
        count: 1,
      };
      return;
    }

    reducedGuests[guest.exemption] = {
      ages: [...reducedGuests[guest.exemption].ages, guest.age],
      count: reducedGuests[guest.exemption].count + 1,
    };
  });

  return (
    <div>
      {Object.keys(reducedGuests).map((exemption, index) => {
        const taxExemption = taxExemptions.find((ex) => ex.id === exemption);
        const exemptionAges = [...Array.from(new Set(reducedGuests[exemption].ages))];

        return (
          <SummaryRow key={index}>
            <b>
              {taxExemption?.name} ({reducedGuests[exemption].count}):
            </b>{' '}
            {exemptionAges?.length > 1 ? i18n.t('ages') : i18n.t('age')}{' '}
            {exemptionAges.sort().map((age, index, initArr) => {
              return (
                <span key={index}>
                  {age} {index + 1 !== initArr?.length && ', '}
                </span>
              );
            })}
          </SummaryRow>
        );
      })}
    </div>
  );
}

type ReservationTaxesSectionProps = {
  onMarkAsPaid: () => void;
  isMarkedAsPaid: boolean;
  hasTaxExemption: boolean;
  reservation: LightReservation;
  housing: ExtendedHousing;
  guestGroup?: GuestGroup;
};

function ReservationTaxesSection({
  reservation,
  isMarkedAsPaid,
  hasTaxExemption,
  onMarkAsPaid,
  guestGroup,
  housing,
}: ReservationTaxesSectionProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const [manuallyCalculatedPrice, setManuallyCalculatedPrice] = React.useState(0);
  const {
    setStatus: setManuallyCalculatingStatus,
    isLoading: isManuallyCalculatingSummary,
  } = useStatus();
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  const {data: reservationPayments} = useReservationPayments(reservation?.id);

  const stripeId = React.useMemo(() => {
    const taxesPayment = reservationPayments?.find(
      (payment) => payment.type === PaymentsTypes.TOURIST_TAXES,
    );
    return taxesPayment ? taxesPayment.external_id : null;
  }, [reservationPayments]);

  const isPaid = Boolean(reservation?.have_taxes_been_paid);

  const {
    data: guestPayments,
    error: guestPaymentsError,
    status: guestPaymentsStatus,
  } = useQuery<GuestPayment[], [string, string]>(
    ['guestPayments', `reservation_id=${reservation?.id}`],
    ({queryKey}) => fetchGuestPayment(queryKey[1]),
    {
      enabled: Boolean(reservation?.id),
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(guestPaymentsError, {
    notFoundMessage: 'Guest payment not found.',
  });
  const {
    data: taxExemptions,
    error: taxExemptionsError,
    status: taxExemptionsStatus,
  } = useQuery<TaxExemption[], string>('taxExemptions', fetchTaxExemptions, {
    refetchOnWindowFocus: false,
  });
  useErrorToast(taxExemptionsError, {
    notFoundMessage:
      'Requested tax exemptions could not be found. Please contact support.',
  });

  const isLoadingPayments = guestPaymentsStatus === 'loading';
  const hasCheckinOnlineGuests = Boolean(guestPayments?.length);
  const isLoading =
    isLoadingPayments ||
    taxExemptionsStatus === 'loading' ||
    isManuallyCalculatingSummary;
  const isNeedToCalculateTaxesManually = Boolean(
    !isLoadingPayments && !hasCheckinOnlineGuests && guestGroup && housing,
  );
  const amount =
    (isNeedToCalculateTaxesManually
      ? manuallyCalculatedPrice
      : guestPayments?.[0]?.amount) || 0;

  const summary = React.useMemo(() => {
    return getSummary(guestPayments?.[0]?.guest_list, taxExemptions);
  }, [guestPayments, taxExemptions]);

  const manuallyCalculatedSummary = React.useMemo(() => {
    if (!isNeedToCalculateTaxesManually) {
      return null;
    }

    const manualGuestPayment = getPaymentGuestList(guestGroup!, housing!);
    return getSummary(manualGuestPayment, taxExemptions);
  }, [guestGroup, housing, isNeedToCalculateTaxesManually, taxExemptions]);

  const getTaxCalculationPayload = React.useCallback(
    (guestGroup: GuestGroup, housing: ExtendedHousing) => {
      const guestList = getPaymentGuestList(guestGroup, housing).filter((guest) => {
        return guest.age >= minCalcAge;
      });

      return {
        reservation_id: reservation?.id,
        guest_list: guestList,
        calculate_only: true,
      };
    },
    [reservation],
  );

  const fetchTaxPrice = React.useCallback(
    async (payload: any) => {
      setManuallyCalculatingStatus('loading');
      const {data, error} = await api.seasonGuests.post(payload);

      if (!isMounted?.current) {
        return;
      }

      setManuallyCalculatingStatus('idle');

      if (error) {
        toastResponseError(error);
        return;
      }

      const amount = data?.amount || 0;
      setManuallyCalculatedPrice(amount);
    },
    [isMounted, setManuallyCalculatingStatus],
  );

  const calculateGuestTaxes = React.useCallback(
    (guestGroup?: GuestGroup, housing?: ExtendedHousing) => {
      if (!guestGroup?.members || !housing) {
        return;
      }

      const payload = getTaxCalculationPayload(guestGroup, housing);
      fetchTaxPrice(payload);
    },
    [fetchTaxPrice, getTaxCalculationPayload],
  );

  React.useEffect(() => {
    if (isNeedToCalculateTaxesManually) {
      calculateGuestTaxes(guestGroup, housing);
    }
  }, [calculateGuestTaxes, guestGroup, housing, isNeedToCalculateTaxesManually]);

  const getStatusLabel = () => {
    if (isPaid) {
      return t('paid');
    }

    return t('pending');
  };

  return (
    <Section title={t('tourist_taxes')}>
      {isLoading ? (
        <Loader height={45} width={45} label={t('loading')} />
      ) : (
        <div>
          <Status>
            <StatusDot success={isPaid} /> {getStatusLabel()}
          </Status>
          <Main>
            <TotalPayment>
              <Title>{t('total_payment')}:</Title>
              <PaymentAmount>
                {amount.toFixed(2)}
                <Currency> {paymentSettingsCurrencyLabel}</Currency>
              </PaymentAmount>
            </TotalPayment>
            {(manuallyCalculatedSummary || summary) && (
              <Summary>
                <SummaryTitle>{t('summary')}:</SummaryTitle>
                <SummaryRow>
                  {isNeedToCalculateTaxesManually ? manuallyCalculatedSummary : summary}
                </SummaryRow>
              </Summary>
            )}
          </Main>
          <StripeIdBlockStyled id={stripeId} />
          {!isPaid && !isMarkedAsPaid && (
            <Button
              onClick={onMarkAsPaid}
              secondary
              label={
                <>
                  <img src={checkIcon} alt="Check mark" height={18} width={18} />
                  {t('mark_as_paid')}
                </>
              }
            />
          )}
        </div>
      )}
      <PaymentSendEmailAndCopyLink
        housing={housing}
        reservation={reservation}
        hasTaxExemption={hasTaxExemption}
      />
    </Section>
  );
}

export {ReservationTaxesSection};
