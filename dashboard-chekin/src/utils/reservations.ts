import moment from 'moment';
import {Housing, LightReservation, Reservation} from './types';
import {Exemptions} from '../hooks/useHousingExemptions';
import {
  MAX_NUMBER_OF_GUESTS,
  RESPONSIBLE_ME_OPTION,
  SECURITY_DEPOSIT_PROCESS_STATUSES,
  SECURITY_DEPOSIT_STATUSES,
  ZERO_DEPOSIT,
} from './constants';
import {
  ExtendedHousing,
  FORM_NAMES,
  FormTypes,
} from '../components/dashboard/ReservationInfoSection';
import {DEFAULT_LANGUAGE_FIELD_NAME} from '../components/dashboard/ReservationOnlineCheckInSection/ReservationOnlineCheckInSection';
import {RESERVATION_PAYMENT_STATUSES} from '../components/dashboard/ReservationPayments';

type GetHasData = {
  reservation?: Reservation;
  exemptions?: Exemptions;
  housing?: Housing | ExtendedHousing;
};

function buildReservationPayload(data: FormTypes) {
  const defaultPhoneNumber = data?.default_phone_number || undefined;
  const responsible =
    data[FORM_NAMES.responsible]?.value !== RESPONSIBLE_ME_OPTION.value
      ? data[FORM_NAMES.responsible]?.value
      : undefined;
  const numberOfGuests =
    data[FORM_NAMES.number_of_guests] && data[FORM_NAMES.children]
      ? Number(data[FORM_NAMES.number_of_guests]) - Number(data[FORM_NAMES.children])
      : data[FORM_NAMES.number_of_guests];
  const checkInDate = data[FORM_NAMES.check_in_date]
    ? moment(data[FORM_NAMES.check_in_date]!).format('YYYY-MM-DD')
    : undefined;
  const checkOutDate = data[FORM_NAMES.check_out_date]
    ? moment(data[FORM_NAMES.check_out_date]!).format('YYYY-MM-DD')
    : undefined;
  const numberOfNights = checkOutDate
    ? undefined
    : data[FORM_NAMES.number_of_nights] || 1;

  return {
    [FORM_NAMES.default_phone_number]: defaultPhoneNumber,
    [FORM_NAMES.lead_guest_email]: data[FORM_NAMES.lead_guest_email],
    [DEFAULT_LANGUAGE_FIELD_NAME]: data[FORM_NAMES.language]?.value,
    [FORM_NAMES.responsible]: responsible,
    [FORM_NAMES.check_in_date]: checkInDate,
    [FORM_NAMES.check_out_date]: checkOutDate,
    [FORM_NAMES.occupied_rooms]: data[FORM_NAMES.occupied_rooms],
    [FORM_NAMES.price]: data[FORM_NAMES.price] || null,
    [FORM_NAMES.deposit]: data[FORM_NAMES.deposit] || null,
    [FORM_NAMES.guest_leader_name]: data[FORM_NAMES.guest_leader_name] || '',
    [FORM_NAMES.housing]: data[FORM_NAMES.housing]?.value,
    [FORM_NAMES.number_of_nights]: numberOfNights,
    [FORM_NAMES.external_room_id]:
      data[FORM_NAMES.external_room_id_option]?.value ||
      data[FORM_NAMES.external_room_id],
    guest_group: {
      members: [],
      [FORM_NAMES.number_of_guests]: numberOfGuests,
      [FORM_NAMES.type]: data[FORM_NAMES.type]?.value,
    },
    room_id: data[FORM_NAMES.space]?.value || null,
    [FORM_NAMES.source_name]: data[FORM_NAMES.source_name]?.value,
    [FORM_NAMES.booking_reference]: data[FORM_NAMES.booking_reference],
  };
}

function getGroupMembers(reservation?: Reservation) {
  return reservation?.guest_group?.members || [];
}

function getGroupLeaderId(reservation?: Reservation) {
  return reservation?.guest_group?.leader_id || '';
}

function getNumberOfGuests(reservation?: Reservation, initNumber: any = 0): number {
  if (!reservation) {
    return initNumber;
  }
  return reservation?.guest_group?.number_of_guests || initNumber;
}

function getNightsOfStay(reservation?: Reservation, initNumber: any = 0): number {
  if (!reservation) {
    return initNumber;
  }
  return reservation?.nights_of_stay || initNumber;
}

function getIsCaptureStatFieldsEnabled(housing?: Housing) {
  return Boolean(housing?.is_capture_stat_fields_enabled);
}

function getIsIdentityVerificationEnabled(reservation?: Reservation) {
  return Boolean(reservation?.housing?.is_self_online_check_in_enabled);
}

function getIsRemoteAccessEnabled(reservation?: Reservation) {
  return Boolean(reservation?.housing?.is_smart_lock_enabled);
}

function getHasTaxes({reservation, housing, exemptions}: GetHasData) {
  const data = reservation ? reservation.housing : housing;
  if (!data) {
    return false;
  }

  return Boolean(data.seasons?.length) && !exemptions?.taxExemption;
}

function getHasBookingPayments({reservation, housing, exemptions}: GetHasData) {
  const data = reservation ? reservation.housing : housing;

  if (!data) {
    return false;
  }

  return (
    data.reservation_payments_status !== RESERVATION_PAYMENT_STATUSES.inactive &&
    !exemptions?.bookingPaymentExemption
  );
}

function getHasSecurityDeposit({reservation, housing, exemptions}: GetHasData) {
  const data = reservation ? reservation.housing : housing;
  const securityDepositAmount = reservation
    ? reservation?.security_deposit_amount
    : data?.security_deposit_amount;

  if (!data) {
    return false;
  }

  return (
    data.security_deposit_status !== SECURITY_DEPOSIT_STATUSES.inactive &&
    securityDepositAmount !== ZERO_DEPOSIT &&
    !exemptions?.depositExemption
  );
}

function getHasSecurityDepositInProcess(reservation?: LightReservation) {
  return Boolean(
      reservation?.security_deposit &&
      reservation?.security_deposit?.status !==
      SECURITY_DEPOSIT_PROCESS_STATUSES.canceled &&
      reservation?.security_deposit?.status !== SECURITY_DEPOSIT_PROCESS_STATUSES.new,
  );
}

function getHasRefundPossibility(reservation?: Reservation) {
  return (
    (getHasTaxes({reservation}) && reservation?.have_taxes_been_paid) ||
    (getHasSecurityDeposit({reservation}) &&
      reservation?.security_deposit?.status === 'CONFIRMED')
  );
}

function getIsContractEnabled(reservation: any = {}) {
  const isEnabled = reservation?.housing?.is_contract_enabled;
  return Boolean(isEnabled);
}

function getIsSuperHog(housing?: Housing) {
  const isSuperHog = housing?.has_host_protection_insurance && housing?.host_protection_insurance_provider === 'Superhog'
  return Boolean(isSuperHog);
}

function getIsStatEnabled(housing?: Housing) {
  const isEnabled = housing?.is_stat_registration_enabled;
  return Boolean(isEnabled);
}

function getIsPoliceEnabled(housing?: Housing) {
  return Boolean(housing?.is_auto_police_registration_enabled);
}

function getStatType(housing?: Housing): string {
  const type = housing?.stat_account?.type;

  if (!type) {
    return '';
  }
  return type;
}

function getStatTypeIfStatActive(housing?: Housing) {
  if (!getIsStatEnabled(housing)) {
    return '';
  }
  return getStatType(housing);
}

function getCalculatedNumberOfGuests(guests: number, children = 0) {
  let actualNumber = guests;

  if (guests > MAX_NUMBER_OF_GUESTS) {
    actualNumber = MAX_NUMBER_OF_GUESTS;
  }

  if (children) {
    actualNumber -= Number(children);
  }

  if (actualNumber < 0) {
    actualNumber = 0;
  }

  return actualNumber;
}

const getDepositStripeId = (reservation?: LightReservation) => {
  if (!reservation?.security_deposit) return;
  const amount = Number(reservation?.security_deposit?.amount);
  if (amount === 0) return reservation?.security_deposit?.customer_id;
  return reservation?.security_deposit?.payment_external_id;
};

const getDepositLinkStripeId = (reservation?: LightReservation) => {
  const amount = Number(reservation?.security_deposit?.amount);
  if (amount === 0) return `https://dashboard.stripe.com/customers/`;
  return 'https://dashboard.stripe.com/payments/';
};

export {
  getCalculatedNumberOfGuests,
  getStatType,
  getIsPoliceEnabled,
  getStatTypeIfStatActive,
  getIsContractEnabled,
  getIsStatEnabled,
  getNumberOfGuests,
  getNightsOfStay,
  getIsIdentityVerificationEnabled,
  getIsRemoteAccessEnabled,
  buildReservationPayload,
  getIsCaptureStatFieldsEnabled,
  getGroupMembers,
  getGroupLeaderId,
  getHasTaxes,
  getHasSecurityDeposit,
  getHasRefundPossibility,
  getIsSuperHog,
  getHasSecurityDepositInProcess,
  getHasBookingPayments,
  getDepositStripeId,
  getDepositLinkStripeId,
};
