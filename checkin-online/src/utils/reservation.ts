import {COUNTRIES_WITH_POLICE, DIVISION_LVL_1_COUNTRIES} from './constants';
import {Guest, GuestGroup} from './types';

function getHousingName(reservation: any = {}): string {
  const name = reservation?.housing?.name;

  if (!name) {
    return '';
  }
  return name;
}

function getHousingPicture(reservation: any = {}): string {
  const src = reservation?.housing?.picture?.src;

  if (!src) {
    return '';
  }
  return src;
}

function getReservationDate(date?: any) {
  if (!date) {
    return null;
  }
  const pureDate = date.slice(0, -1);
  return new Date(pureDate);
}

function getCheckInDate(reservation: any = {}) {
  const date = reservation?.check_in_date;
  return getReservationDate(date);
}

function getHasPoliceActivated(reservation: any = {}) {
  return (
    reservation?.housing?.police_account &&
    reservation?.housing?.is_police_registration_enabled
  );
}

function getGuestPoliceStatusInCode(guest?: Guest) {
  return guest?.statuses?.police?.in?.code || '';
}

function getHasAnyPoliceCompleteGuest(reservation: any = {}) {
  const members = getMembers(reservation);

  return members.some((member: Guest) => {
    const memberStatus = getGuestPoliceStatusInCode(member);
    return memberStatus === 'COMPLETE';
  });
}

function getCheckOutDate(reservation: any = {}) {
  const date = reservation?.check_out_date;
  return getReservationDate(date);
}

function getHousingCountryCode(reservation: any = {}): string {
  const code = reservation?.housing?.location?.country?.code;

  if (!code) {
    return '';
  }
  return code;
}

function getProvinceCode(reservation: any = {}) {
  const countryCode = getHousingCountryCode(reservation);

  if (DIVISION_LVL_1_COUNTRIES.includes(countryCode)) {
    return reservation?.housing?.location?.details?.division_level_1?.code;
  }
  return reservation?.housing?.location?.details?.division_level_2?.code;
}

function hasPoliceInCountry(reservation: any = {}) {
  return COUNTRIES_WITH_POLICE.includes(getHousingCountryCode(reservation));
}

function getHousingManagerOrigin(reservation: any = {}): string {
  return reservation?.housing?.manager_origin || '';
}

function getNumberOfGuests(reservation: any = {}, defaultValue: number = 0): number {
  const numberOfGuests = reservation?.guest_group?.number_of_guests;

  if (!numberOfGuests) {
    return defaultValue;
  }
  return numberOfGuests;
}

function getMembers(reservation: any = {}) {
  const members = reservation?.guest_group?.members;

  if (!members) {
    return [];
  }
  return members;
}

function getGuestLeader(guestGroup?: GuestGroup): Guest | null {
  if (!guestGroup) {
    return null;
  }

  const guestLeaderId = guestGroup?.leader_id;
  const members = guestGroup?.members;

  if (!members?.length || !guestLeaderId) {
    return null;
  }

  return members.find(m => m.id === guestLeaderId) || null;
}

function getHasGuestMembers(reservation: any = {}) {
  if (!reservation) {
    return false;
  }

  const members = getMembers(reservation);
  return Boolean(members.length);
}

function getHasGuestLeader(reservation: any = {}) {
  const hasLeader = reservation?.guest_group?.leader_id;
  return Boolean(hasLeader);
}

function getIsContractEnabled(reservation: any = {}) {
  const isEnabled = reservation?.housing?.is_contract_enabled;
  return Boolean(isEnabled);
}

function getIsStatEnabled(reservation: any = {}) {
  const isEnabled = reservation?.housing?.is_stat_registration_enabled;
  return Boolean(isEnabled);
}

function getStatType(reservation: any = {}) {
  const type = reservation?.housing?.stat_account?.type;

  if (!type) {
    return '';
  }
  return type;
}

function getStatTypeIfStatActive(reservation: any = {}) {
  if (!getIsStatEnabled(reservation)) {
    return '';
  }
  return getStatType(reservation);
}

function getIsCaptureStatFieldsEnabled(reservation: any = {}) {
  return Boolean(reservation?.housing?.is_capture_stat_fields_enabled);
}

function getGuestLeaderId(reservation: any = {}) {
  if (!reservation) {
    return '';
  }
  return reservation?.guest_group?.leader_id;
}

function getGuestGroupType(reservation: any = {}) {
  if (!reservation) {
    return '';
  }
  return reservation?.guest_group?.type;
}

function getSeasonsIds(reservation: any = {}) {
  if (!reservation) {
    return [];
  }
  return reservation?.housing?.seasons || [];
}

type CheckHasSelfieIdentity = {
  isLeaderGuest: boolean;
  isVerifyDocumentAndSelfie: boolean;
  isBiomatchForAllGuests: boolean;
};
function checkHasSelfieIdentity({
  isLeaderGuest,
  isVerifyDocumentAndSelfie,
  isBiomatchForAllGuests,
}: CheckHasSelfieIdentity) {
  if (isLeaderGuest) {
    return Boolean(isVerifyDocumentAndSelfie);
  }
  return Boolean(isBiomatchForAllGuests && isVerifyDocumentAndSelfie);
}

type CheckHasScanDocument = {
  isLeaderGuest: boolean;
  isVerifyOnlyDocument: boolean;
  isBiomatchForAllGuests: boolean;
};
function checkHasScanDocument({
  isLeaderGuest,
  isVerifyOnlyDocument,
  isBiomatchForAllGuests,
}: CheckHasScanDocument) {
  if (isLeaderGuest) {
    return Boolean(isVerifyOnlyDocument);
  }
  return Boolean(isBiomatchForAllGuests && isVerifyOnlyDocument);
}

export {
  getHousingManagerOrigin,
  checkHasSelfieIdentity,
  checkHasScanDocument,
  getGuestLeaderId,
  getIsCaptureStatFieldsEnabled,
  getHousingName,
  getHousingPicture,
  getCheckInDate,
  getCheckOutDate,
  getHousingCountryCode,
  getProvinceCode,
  getNumberOfGuests,
  getMembers,
  getGuestLeader,
  getHasGuestMembers,
  getHasGuestLeader,
  getIsContractEnabled,
  getStatTypeIfStatActive,
  getStatType,
  getIsStatEnabled,
  getGuestGroupType,
  getHasAnyPoliceCompleteGuest,
  getSeasonsIds,
  getHasPoliceActivated,
  hasPoliceInCountry,
};
