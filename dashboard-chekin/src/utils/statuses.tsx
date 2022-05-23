import i18n from '../i18n';
import {Exemptions} from '../hooks/useHousingExemptions';
import {
  getGroupMembersNumber,
  getGroupNumberOfGuests,
  getGuestLeader,
} from './guestGroup';
import {
  getHasBookingPayments,
  getHasSecurityDeposit,
  getHasRefundPossibility,
  getHasTaxes,
  getStatTypeIfStatActive,
  getIsSuperHog,
  getIsIdentityVerificationEnabled,
} from './reservations';
import {getChecksVerificationType, getCountryCode} from './housing';
import {GuestGroup, Reservation} from './types';
import {
  AGGREGATED_RESERVATION_PAYMENTS_STATUSES,
  COUNTRY_CODES,
  STAT_TYPES_WITHOUT_CHECK_OUT,
  STATUS_CODES,
} from './constants';

enum BIOMATCH_AND_SCAN_DOC_STATUSES {
  pending = 'PENDING',
  completed = 'COMPLETED',
  failed = 'FAILED',
}

enum STATUS_TYPES {
  checkIn = 'CHECK_IN',
  policeCheckIn = 'POLICE_CHECK_IN',
  policeCheckOut = 'POLICE_CHECK_OUT',
  statsCheckIn = 'STATS_CHECK_IN',
  statsCheckOut = 'STATS_CHECK_OUT',
  selfCheckIn = 'SELF_CHECK_IN',
  taxes = 'TAXES',
  securityDeposit = 'SECURITY_DEPOSIT',
  refund = 'REFUND',
  superHog = 'SUPERHOG',
  bookingPayments = 'BOOKING_PAYMENTS',
}

function getDisplayStatuses(reservation?: Reservation, exemptions?: Exemptions) {
  const countryCode = getCountryCode(reservation?.housing);
  const isSelfCheckInEnabled = getIsIdentityVerificationEnabled(reservation);
  const statType = getStatTypeIfStatActive(reservation?.housing);
  const hasTaxes = getHasTaxes({reservation, exemptions});
  const hasSecurityDeposit = getHasSecurityDeposit({reservation, exemptions});
  const hasBookingPayments = getHasBookingPayments({reservation, exemptions});
  const hasRefundPossibility = getHasRefundPossibility(reservation);
  const hasSuperHog = getIsSuperHog(reservation?.housing);

  let statuses: string[] = [STATUS_TYPES.checkIn];

  if (!reservation) {
    return statuses;
  }

  if (isSelfCheckInEnabled) {
    statuses = [...statuses, STATUS_TYPES.selfCheckIn];
  }

  if (hasSuperHog) {
    statuses = [...statuses, STATUS_TYPES.superHog];
  }

  if (hasTaxes) {
    statuses = [...statuses, STATUS_TYPES.taxes];
  }

  if (hasSecurityDeposit) {
    statuses = [...statuses, STATUS_TYPES.securityDeposit];
  }

  if (hasRefundPossibility) {
    statuses = [...statuses, STATUS_TYPES.refund];
  }

  if (hasBookingPayments) {
    statuses = [...statuses, STATUS_TYPES.bookingPayments];
  }

  if (hasRefundPossibility) {
    statuses = [...statuses, STATUS_TYPES.refund];
  }

  switch (countryCode) {
    case COUNTRY_CODES.portugal:
    case COUNTRY_CODES.czech:
    case COUNTRY_CODES.switzerland:
    case COUNTRY_CODES.spain: {
      return [...statuses, STATUS_TYPES.policeCheckIn];
    }
    case COUNTRY_CODES.italy: {
      if (STAT_TYPES_WITHOUT_CHECK_OUT.includes(statType)) {
        return [...statuses, STATUS_TYPES.policeCheckIn, STATUS_TYPES.statsCheckIn];
      } else {
        return [
          ...statuses,
          STATUS_TYPES.policeCheckIn,
          STATUS_TYPES.statsCheckIn,
          STATUS_TYPES.statsCheckOut,
        ];
      }
    }
    case COUNTRY_CODES.germany: {
      return [...statuses, STATUS_TYPES.statsCheckIn, STATUS_TYPES.statsCheckOut];
    }
    case COUNTRY_CODES.thailand: {
      return [...statuses, STATUS_TYPES.policeCheckIn];
    }
    case COUNTRY_CODES.colombia:
    case COUNTRY_CODES.austria:
    case COUNTRY_CODES.uae: {
      return [...statuses, STATUS_TYPES.policeCheckIn, STATUS_TYPES.policeCheckOut];
    }
    default: {
      return statuses;
    }
  }
}

function getCheckInStatusDescription(reservation: Reservation) {
  const registeredGuestsNumber = getGroupMembersNumber(reservation?.guest_group);
  const guestsNumber = getGroupNumberOfGuests(reservation?.guest_group);

  return `${registeredGuestsNumber}/${guestsNumber} ${i18n.t('guests_checked_in')}`;
}

type StatusTypes = {
  guestGroup?: GuestGroup;
  status: 'police' | 'statistics' | 'data';
  type?: 'in' | 'out';
  code?: string;
};

function getNumberOfStatusTypeGuests({guestGroup, status, type, code}: StatusTypes) {
  if (!code) {
    throw new Error('Missing status code at getNumberOfStatusTypeGuests call.');
  }

  const members = guestGroup?.members;
  if (!members?.length) {
    return 0;
  }

  if (status === 'data') {
    return members.filter((guest) => {
      return guest?.statuses?.[status]?.code === code;
    }).length;
  }

  return members.filter((guest) => {
    return guest?.statuses?.[status]?.[type!]?.code === code;
  }).length;
}

type DescriptionTypes = Pick<StatusTypes, 'status' | 'type'> & {
  reservation: Reservation;
};

function getStatusDescription({status, type, reservation}: DescriptionTypes) {
  const hasStatusAccount =
    status === 'police'
      ? reservation?.housing?.police_account
      : reservation?.housing?.stat_account;
  const countryCode = getCountryCode(reservation?.housing);

  const registeredGuestsNumber = getGroupMembersNumber(reservation?.guest_group);
  const guestsNumber = getGroupNumberOfGuests(reservation?.guest_group);

  const numberOfNewGuests = getNumberOfStatusTypeGuests({
    status,
    type,
    guestGroup: reservation?.guest_group,
    code: STATUS_CODES.new,
  });

  const numberOfFailedGuests = getNumberOfStatusTypeGuests({
    status,
    type,
    guestGroup: reservation?.guest_group,
    code: STATUS_CODES.error,
  });

  const numberOfCompletedGuests = getNumberOfStatusTypeGuests({
    status,
    type,
    guestGroup: reservation?.guest_group,
    code: STATUS_CODES.complete,
  });

  const missingNumberOfGuests =
    guestsNumber - (numberOfCompletedGuests + numberOfFailedGuests);

  if (!hasStatusAccount) {
    return i18n.t('credentials_missing');
  }

  if (
    !registeredGuestsNumber ||
    numberOfNewGuests ||
    countryCode === COUNTRY_CODES.germany
  ) {
    const newGuestsString = `${numberOfNewGuests} ${i18n.t(
      'guests_waiting_to_be_registered',
    )}`;
    if (numberOfCompletedGuests) {
      return `${numberOfCompletedGuests} ${i18n
        .t('complete')
        .toLowerCase()}, ${newGuestsString}`;
    }
    return newGuestsString;
  }

  if (numberOfCompletedGuests === guestsNumber) {
    return i18n.t('completed');
  }

  let detailedStatus = [];

  if (numberOfCompletedGuests) {
    detailedStatus.push(`${numberOfCompletedGuests} ${i18n.t('completed')}`);
  }

  if (numberOfFailedGuests) {
    detailedStatus.push(`${numberOfFailedGuests} ${i18n.t('error')}`);
  }

  if (missingNumberOfGuests) {
    detailedStatus.push(`${missingNumberOfGuests} ${i18n.t('missing')}`);
  }

  return detailedStatus;
}

function getBiomatchAndScanDocStatus({
  guestGroup,
  isBiomatchForAllEnabled,
  isOnlyOfficialDocument,
  isAllGuestsPassed,
  isDocumentAndSelfie,
}: {
  guestGroup?: GuestGroup;
  isAllGuestsPassed: boolean;
  isBiomatchForAllEnabled: boolean;
  isOnlyOfficialDocument: boolean;
  isDocumentAndSelfie: boolean;
}) {
  if (!guestGroup?.members?.length) {
    return BIOMATCH_AND_SCAN_DOC_STATUSES.pending;
  }

  if (isBiomatchForAllEnabled) {
    if (guestGroup?.members?.length < guestGroup?.number_of_guests) {
      return BIOMATCH_AND_SCAN_DOC_STATUSES.pending;
    }

    const isNotBiomatchPhotos =
      isDocumentAndSelfie &&
      guestGroup?.members?.some((guest) => !guest.biomatch_doc || !guest.biomatch_selfie);
    const isNotDocumentPhotos =
      isOnlyOfficialDocument &&
      guestGroup?.members?.some((guest) => !guest.document?.front_side_scan);
    if (isNotBiomatchPhotos || isNotDocumentPhotos) {
      return BIOMATCH_AND_SCAN_DOC_STATUSES.pending;
    }

    const isBiomatchPassed = isDocumentAndSelfie && isAllGuestsPassed;
    const isDocumentPassed =
      isOnlyOfficialDocument &&
      guestGroup?.members?.every((guest) => guest.document_passed);
    if (isBiomatchPassed || isDocumentPassed) {
      return BIOMATCH_AND_SCAN_DOC_STATUSES.completed;
    }
  } else {
    const guestLeader = getGuestLeader(guestGroup);
    const isNotBiomatchPhotosLeader =
      isDocumentAndSelfie &&
      (!guestLeader?.biomatch_selfie || !guestLeader?.biomatch_doc);
    const isNotDocumentPhotosLeader =
      isOnlyOfficialDocument && !guestLeader?.document?.front_side_scan;
    if (isNotBiomatchPhotosLeader || isNotDocumentPhotosLeader) {
      return BIOMATCH_AND_SCAN_DOC_STATUSES.pending;
    }

    const isBiomatchPassedLeader = isDocumentAndSelfie && guestLeader?.biomatch_passed;
    const isDocumentPassedLeader = isOnlyOfficialDocument && guestLeader?.document_passed;
    if (isBiomatchPassedLeader || isDocumentPassedLeader) {
      return BIOMATCH_AND_SCAN_DOC_STATUSES.completed;
    }
  }

  return BIOMATCH_AND_SCAN_DOC_STATUSES.failed;
}

function getSelfCheckInStatusDescription(reservation: Reservation) {
  const {isDocumentAndSelfie, isOnlyOfficialDocument} = getChecksVerificationType(
    reservation.housing,
  );
  const guestGroup = reservation.guest_group;
  const biomatchAndScanDocStatus = getBiomatchAndScanDocStatus({
    isBiomatchForAllEnabled: reservation?.housing?.is_biometric_match_for_all_enabled,
    isAllGuestsPassed: reservation.all_guests_passed_biomatch,
    guestGroup,
    isOnlyOfficialDocument,
    isDocumentAndSelfie,
  });

  if (biomatchAndScanDocStatus === BIOMATCH_AND_SCAN_DOC_STATUSES.pending) {
    return i18n.t('pending');
  }

  if (biomatchAndScanDocStatus === BIOMATCH_AND_SCAN_DOC_STATUSES.completed) {
    return i18n.t('complete');
  }

  return i18n.t('failed');
}

function getTaxesStatusDescription(reservation: Reservation) {
  const isPaid = reservation?.have_taxes_been_paid;

  if (isPaid) {
    return i18n.t('paid');
  }

  return i18n.t('pending');
}

function getSecurityDepositStatusDescription(reservation: Reservation) {
  if (reservation.security_deposit?.display_status) {
    return i18n.t(reservation.security_deposit?.display_status);
  }

  return i18n.t('pending');
}

function getRefundStatusDescription(reservation: Reservation) {
  const onHold = !reservation.payment_refund;
  const isReleased = reservation.payment_refund?.status === 'CONFIRMED';
  const isReleasedPartially = reservation.payment_refund?.status === 'PARTIALLY';

  if (onHold) {
    return i18n.t('on_hold');
  }

  if (isReleased) {
    return i18n.t('released');
  }

  if (isReleasedPartially) {
    return i18n.t('released_partially');
  }

  return i18n.t('pending');
}

function getBookingPaymentsStatusDescription(reservation: Reservation) {
  const isPaid =
    reservation?.aggregated_payments_status ===
    AGGREGATED_RESERVATION_PAYMENTS_STATUSES.paid;

  if (isPaid) {
    return i18n.t('paid');
  }

  return i18n.t('pending');
}

type Descriptions = {
  [key: string]: string | JSX.Element | null | string[];
};

function getStatusesDescriptions(reservation?: Reservation, exemptions?: Exemptions) {
  let descriptions: Descriptions = {
    [STATUS_TYPES.checkIn]: null,
    [STATUS_TYPES.policeCheckIn]: null,
    [STATUS_TYPES.policeCheckOut]: null,
    [STATUS_TYPES.statsCheckIn]: null,
    [STATUS_TYPES.statsCheckOut]: null,
    [STATUS_TYPES.selfCheckIn]: null,
    [STATUS_TYPES.taxes]: null,
    [STATUS_TYPES.bookingPayments]: null,
    [STATUS_TYPES.superHog]: null,
  };

  if (!reservation) {
    return descriptions;
  }

  const displayStatuses = getDisplayStatuses(reservation, exemptions);

  if (displayStatuses.includes(STATUS_TYPES.checkIn)) {
    descriptions[STATUS_TYPES.checkIn] = getCheckInStatusDescription(reservation);
  }

  if (displayStatuses.includes(STATUS_TYPES.superHog)) {
    descriptions[STATUS_TYPES.superHog] = "Superhog";
  }

  if (displayStatuses.includes(STATUS_TYPES.policeCheckIn)) {
    descriptions[STATUS_TYPES.policeCheckIn] = getStatusDescription({
      reservation,
      status: 'police',
      type: 'in',
    });
  }

  if (displayStatuses.includes(STATUS_TYPES.policeCheckOut)) {
    descriptions[STATUS_TYPES.policeCheckOut] = getStatusDescription({
      reservation,
      status: 'police',
      type: 'out',
    });
  }

  if (displayStatuses.includes(STATUS_TYPES.statsCheckIn)) {
    descriptions[STATUS_TYPES.statsCheckIn] = getStatusDescription({
      reservation,
      status: 'statistics',
      type: 'in',
    });
  }

  if (displayStatuses.includes(STATUS_TYPES.statsCheckOut)) {
    descriptions[STATUS_TYPES.statsCheckOut] = getStatusDescription({
      reservation,
      status: 'statistics',
      type: 'out',
    });
  }

  if (displayStatuses.includes(STATUS_TYPES.selfCheckIn)) {
    descriptions[STATUS_TYPES.selfCheckIn] = getSelfCheckInStatusDescription(reservation);
  }

  if (displayStatuses.includes(STATUS_TYPES.taxes)) {
    descriptions[STATUS_TYPES.taxes] = getTaxesStatusDescription(reservation);
  }

  if (displayStatuses.includes(STATUS_TYPES.securityDeposit)) {
    descriptions[STATUS_TYPES.securityDeposit] = getSecurityDepositStatusDescription(
      reservation,
    );
  }

  if (displayStatuses.includes(STATUS_TYPES.refund)) {
    descriptions[STATUS_TYPES.refund] = getRefundStatusDescription(reservation);
  }

  if (displayStatuses.includes(STATUS_TYPES.bookingPayments)) {
    descriptions[STATUS_TYPES.bookingPayments] = getBookingPaymentsStatusDescription(
      reservation,
    );
  }

  if (displayStatuses.includes(STATUS_TYPES.refund)) {
    descriptions[STATUS_TYPES.refund] = getRefundStatusDescription(reservation);
  }

  return descriptions;
}

export {
  getStatusesDescriptions,
  STATUS_TYPES,
  BIOMATCH_AND_SCAN_DOC_STATUSES,
  getDisplayStatuses,
  getBiomatchAndScanDocStatus,
};
