import i18n from '../i18n';
import {ReservationStatusesDetails} from './types';
import {RESERVATION_FEATURES} from './constants';

enum GUESTS_REGISTER_RESERVATION_STATUS {
  guestsRegistered = 'GUESTS_REGISTERED',
  noGuests = 'NO_GUESTS',
  error = 'ERROR',
  none = 'None',
}

enum ONLINE_CHECKIN_RESERVATION_STATUS {
  sent = 'SENT',
  notSent = 'NOT_SENT',
  none = 'None',
}

enum IDENTITY_VERIFICATION_RESERVATION_STATUS {
  verified = 'VERIFIED',
  notVerified = 'NOT_VERIFIED',
  pending = 'PENDING',
  error = 'ERROR',
  none = 'None',
}

enum TAXES_RESERVATION_STATUS {
  paid = 'PAID',
  unpaid = 'UNPAID',
  none = 'None',
}

enum SECURITY_DEPOSIT_RESERVATION_STATUS {
  collected = 'COLLECTED',
  notCollected = 'NOT_COLLECTED',
  released = 'RELEASED',
  none = 'None',
}

enum PAYMENTS_RESERVATION_STATUS {
  paid = 'PAID',
  unpaid = 'UNPAID',
  none = 'None',
}

enum REMOTE_ACCESS_RESERVATION_STATUS {
  sent = 'SENT',
  notSent = 'NOT_SENT',
  none = 'None',
}

enum POLICE_RESERVATION_STATUS {
  sent = 'SENT',
  onHold = 'ON_HOLD',
  error = 'ERROR',
  none = 'None',
}

enum STATS_RESERVATION_STATUS {
  sent = 'SENT',
  onHold = 'ON_HOLD',
  error = 'ERROR',
  none = 'None',
}

enum RESERVATION_FEATURES_STATUSES {
  complete = 'complete',
  incomplete = 'incomplete',
  error = 'error',
}

// -------- Future feature ---------
// const guestsRegistrationStatusesDto = {
//   [GUESTS_REGISTER_RESERVATION_STATUS.guestsRegistered]: {
//     status: RESERVATION_FEATURES_STATUSES.complete,
//     label: i18n.t('guests_registered'),
//   },
//   [GUESTS_REGISTER_RESERVATION_STATUS.noGuests]: {
//     status: RESERVATION_FEATURES_STATUSES.incomplete,
//     label: i18n.t('no_guests'),
//   },
//   [GUESTS_REGISTER_RESERVATION_STATUS.error]: {
//     status: RESERVATION_FEATURES_STATUSES.error,
//     label: i18n.t('missing_guests'),
//   },
//   [GUESTS_REGISTER_RESERVATION_STATUS.none]: null,
// };

const onlineCheckinStatusesDto = {
  [ONLINE_CHECKIN_RESERVATION_STATUS.sent]: {
    status: RESERVATION_FEATURES_STATUSES.complete,
    label: i18n.t('sent'),
  },
  [ONLINE_CHECKIN_RESERVATION_STATUS.notSent]: {
    status: RESERVATION_FEATURES_STATUSES.incomplete,
    label: i18n.t('not_sent'),
  },
  [ONLINE_CHECKIN_RESERVATION_STATUS.none]: null,
};

const identityVerificationStatusesDto = {
  [IDENTITY_VERIFICATION_RESERVATION_STATUS.verified]: {
    status: RESERVATION_FEATURES_STATUSES.complete,
    label: i18n.t('verified'),
  },
  [IDENTITY_VERIFICATION_RESERVATION_STATUS.notVerified]: {
    status: RESERVATION_FEATURES_STATUSES.incomplete,
    label: i18n.t('not_verified'),
  },
  [IDENTITY_VERIFICATION_RESERVATION_STATUS.pending]: {
    status: RESERVATION_FEATURES_STATUSES.incomplete,
    label: i18n.t('pending'),
  },
  [IDENTITY_VERIFICATION_RESERVATION_STATUS.error]: {
    status: RESERVATION_FEATURES_STATUSES.error,
    label: i18n.t('failed'),
  },
  [IDENTITY_VERIFICATION_RESERVATION_STATUS.none]: null,
};

const taxesStatusesDto = {
  [TAXES_RESERVATION_STATUS.paid]: {
    status: RESERVATION_FEATURES_STATUSES.complete,
    label: i18n.t('paid'),
  },
  [TAXES_RESERVATION_STATUS.unpaid]: {
    status: RESERVATION_FEATURES_STATUSES.incomplete,
    label: i18n.t('unpaid'),
  },
  [TAXES_RESERVATION_STATUS.none]: null,
};

const securityDepositStatusesDto = {
  [SECURITY_DEPOSIT_RESERVATION_STATUS.collected]: {
    status: RESERVATION_FEATURES_STATUSES.complete,
    label: i18n.t('collected'),
  },
  [SECURITY_DEPOSIT_RESERVATION_STATUS.released]: {
    status: RESERVATION_FEATURES_STATUSES.complete,
    label: i18n.t('released'),
  },
  [SECURITY_DEPOSIT_RESERVATION_STATUS.notCollected]: {
    status: RESERVATION_FEATURES_STATUSES.incomplete,
    label: i18n.t('not_collected'),
  },
  [SECURITY_DEPOSIT_RESERVATION_STATUS.none]: null,
};

const paymentsStatusesDto = {
  [PAYMENTS_RESERVATION_STATUS.paid]: {
    status: RESERVATION_FEATURES_STATUSES.complete,
    label: i18n.t('paid'),
  },
  [PAYMENTS_RESERVATION_STATUS.unpaid]: {
    status: RESERVATION_FEATURES_STATUSES.incomplete,
    label: i18n.t('unpaid'),
  },
  [PAYMENTS_RESERVATION_STATUS.none]: null,
};

const remoteAccessStatusesDto = {
  [REMOTE_ACCESS_RESERVATION_STATUS.sent]: {
    status: RESERVATION_FEATURES_STATUSES.complete,
    label: i18n.t('sent'),
  },
  [REMOTE_ACCESS_RESERVATION_STATUS.notSent]: {
    status: RESERVATION_FEATURES_STATUSES.incomplete,
    label: i18n.t('not_sent'),
  },
  [REMOTE_ACCESS_RESERVATION_STATUS.none]: null,
};

const policeStatusesDto = {
  [POLICE_RESERVATION_STATUS.sent]: {
    status: RESERVATION_FEATURES_STATUSES.complete,
    label: i18n.t('sent'),
  },
  [POLICE_RESERVATION_STATUS.onHold]: {
    status: RESERVATION_FEATURES_STATUSES.incomplete,
    label: i18n.t('on_hold'),
  },
  [POLICE_RESERVATION_STATUS.error]: {
    status: RESERVATION_FEATURES_STATUSES.error,
    label: i18n.t('error'),
  },
  [POLICE_RESERVATION_STATUS.none]: null,
};

const statsStatusesDto = {
  [STATS_RESERVATION_STATUS.sent]: {
    status: RESERVATION_FEATURES_STATUSES.complete,
    label: i18n.t('sent'),
  },
  [STATS_RESERVATION_STATUS.onHold]: {
    status: RESERVATION_FEATURES_STATUSES.incomplete,
    label: i18n.t('on_hold'),
  },
  [STATS_RESERVATION_STATUS.error]: {
    status: RESERVATION_FEATURES_STATUSES.error,
    label: i18n.t('error'),
  },
  [STATS_RESERVATION_STATUS.none]: null,
};

export type FeatureStatusDescription = {
  [key in RESERVATION_FEATURES]: null | {
    status: RESERVATION_FEATURES_STATUSES;
    label: string;
  };
};

function getStatusesDescriptions(reservationDetails: ReservationStatusesDetails) {
  let descriptions: FeatureStatusDescription = {
    [RESERVATION_FEATURES.onlineCheckIn]:
      onlineCheckinStatusesDto[reservationDetails.online_check_in_status],
    [RESERVATION_FEATURES.police]: policeStatusesDto[reservationDetails.police_status],
    [RESERVATION_FEATURES.stats]: statsStatusesDto[reservationDetails.statistics_status],
    [RESERVATION_FEATURES.tax]: taxesStatusesDto[reservationDetails.tax_status],
    [RESERVATION_FEATURES.payments]:
      paymentsStatusesDto[reservationDetails.payment_status],
    [RESERVATION_FEATURES.identityVerification]:
      identityVerificationStatusesDto[reservationDetails.identity_verification_status],
    [RESERVATION_FEATURES.remoteAccess]:
      remoteAccessStatusesDto[reservationDetails.remote_access_status],
    [RESERVATION_FEATURES.deposit]:
      securityDepositStatusesDto[reservationDetails.deposit_status],
  };

  return descriptions;
}

export {
  getStatusesDescriptions,
  RESERVATION_FEATURES_STATUSES,
  GUESTS_REGISTER_RESERVATION_STATUS,
  ONLINE_CHECKIN_RESERVATION_STATUS,
  IDENTITY_VERIFICATION_RESERVATION_STATUS,
  PAYMENTS_RESERVATION_STATUS,
  POLICE_RESERVATION_STATUS,
  STATS_RESERVATION_STATUS,
  SECURITY_DEPOSIT_RESERVATION_STATUS,
  REMOTE_ACCESS_RESERVATION_STATUS,
  TAXES_RESERVATION_STATUS,
};
