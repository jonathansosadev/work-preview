import React from 'react';
import moment from 'moment';
import useFetchGuestGroup from '../../../hooks/useFetchGuestGroup';
import {Guest, GuestGroup, LightReservation} from '../../../utils/types';
import i18n from '../../../i18n';
import api from '../../../api';
import {getTimezoneDate} from '../../../utils/date';
import {getTimezone} from '../../../utils/housing';
import {toastResponseError} from '../../../utils/common';
import {useIsMounted} from '../../../utils/hooks';
import {ExtendedHousing} from '../ReservationInfoSection';
import {
  PaymentsTypes,
  PayloadStatus,
  ReservationPaymentsPayloadItem,
} from '../ReservationPayments/utils';

const NONE_EXEMPTION_OPTION = {
  value: 'NONE',
  label: i18n.t('none'),
};
const MIN_CALC_AGE = 1;

function getGuestAge(guest: Guest, timezone: string) {
  const today = moment();
  const birthDate = getTimezoneDate(moment(guest.birth_date, 'YYYY-MM-DD'), timezone);

  return today.diff(birthDate, 'years');
}

function getPaymentGuestList(guestGroup: GuestGroup, housing?: {time_zone: string}) {
  const timeZone = getTimezone(housing);

  return guestGroup.members.map((guest) => {
    return {
      age: getGuestAge(guest, timeZone),
      exemption: NONE_EXEMPTION_OPTION.value,
    };
  });
}

export function useTaxes(
  housing: ExtendedHousing,
  reservation: LightReservation,
  reservationPayments: ReservationPaymentsPayloadItem[] | undefined,
) {
  const isMounted = useIsMounted();
  const [manuallyCalculatedPrice, setManuallyCalculatedPrice] = React.useState<
    null | string
  >(null);

  const taxes = reservationPayments?.find(
    (field) => field.type === PaymentsTypes.TOURIST_TAXES,
  );
  const shouldUseManualTaxes = taxes?.status === PayloadStatus.PENDING;

  const taxesIsNotPaid = reservation && !Boolean(reservation.have_taxes_been_paid);

  const guestGroupId = reservation?.guest_group_id;
  const {data: guestGroup} = useFetchGuestGroup({
    guestGroupId,
    enabled: Boolean(guestGroupId && taxesIsNotPaid && shouldUseManualTaxes),
    refetchOnWindowFocus: false,
  });

  const getTaxCalculationPayload = React.useCallback(
    (guestGroup: GuestGroup, housing: ExtendedHousing) => {
      const guestList = getPaymentGuestList(guestGroup, housing).filter((guest) => {
        return guest.age >= MIN_CALC_AGE;
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
      const {data, error} = await api.seasonGuests.post(payload);

      if (!isMounted?.current) {
        return;
      }

      if (error) {
        toastResponseError(error);
        return;
      }

      if (data) {
        setManuallyCalculatedPrice(data.amount);
      }
    },
    [isMounted],
  );

  React.useEffect(() => {
    if (guestGroup?.members.length && housing) {
      const payload = getTaxCalculationPayload(guestGroup, housing);
      fetchTaxPrice(payload);
    }
  }, [guestGroup, housing, fetchTaxPrice, getTaxCalculationPayload]);

  return {
    taxesAmount: manuallyCalculatedPrice,
  };
}
