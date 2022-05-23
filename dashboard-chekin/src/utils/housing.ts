import api, {queryFetcher} from '../api';
import {
  DIVISION_LVL_1_COUNTRIES,
  HOUSING_VERIFICATION_TYPE,
  SECURITY_DEPOSIT_STATUSES,
  UPSELLING_PAYMENTS_STATUS,
  STAT_TYPES,
} from './constants';
import {Housing, SelectOption, ShortHousing} from './types';
import {FORM_NAMES as POLICE_FORM_NAMES} from '../components/dashboard/HousingPoliceConnectionSection';
import {FORM_NAMES as STAT_FORM_NAMES} from '../components/dashboard/HousingStatConnectionSection';
import {FORM_NAMES as ICALS_FORM_NAMES} from '../components/dashboard/HousingICalsSection';
import {RESERVATION_PAYMENT_STATUSES} from '../components/dashboard/ReservationPayments';
import {HOUSING_FORM_NAMES} from 'utils/formNames';
import {HousingOption} from '../components/dashboard/ReservationInfoSection/ReservationInfoSection';
import {LOCK_REMINDER_OPTIONS} from './emailReminders';

type ExternalHousing = {
  subhouse_code: string;
  subhouse_name: string;
};

function fetchShortHousings() {
  return queryFetcher(
    api.housings.ENDPOINTS.all(`ordering=name&fields=id,name&is_deactivated=false`),
  );
}

function getExternalHousingsAsOptions(data: ExternalHousing[]) {
  return data.map((h) => {
    return {
      value: h.subhouse_code,
      label: h.subhouse_name,
    };
  });
}

function getOneHousingAsOption(housing: ShortHousing) {
  return {
    label: housing.name,
    value: housing.id,
    country: getCountryCode(housing),
    data: housing,
  };
}

function getShortHousingsAsOptions(shortHousings?: ShortHousing[]): HousingOption[] {
  if (!shortHousings || !Array.isArray(shortHousings)) {
    return [];
  }

  return shortHousings.map(getOneHousingAsOption);
}

function getCountryCode(housing: any): string {
  return housing?.location?.country?.code || '';
}

function getName(housing: any) {
  return housing?.name || '';
}

function getStatType(housing?: any): string {
  return housing?.stat_account?.type || '';
}

function getCountryAsOption(housing: any) {
  return {
    value: housing?.location?.country?.code,
    label: housing?.location?.country?.name,
  };
}
type LockOption = {
  [key: string]: string;
};
function getSmartLockEmailOptions(housing: any) {
  const allLockReminderOptions = Object.values(
    LOCK_REMINDER_OPTIONS,
  ).flatMap((option: LockOption) => Object.values(option));

  const result = Object.fromEntries(
    allLockReminderOptions.map((option: string) => [option, housing[option] || false]),
  );
  return result;
}

function getProvinceCode(housing: any) {
  const countryCode = getCountryCode(housing);

  if (DIVISION_LVL_1_COUNTRIES.includes(countryCode)) {
    return housing?.location?.details?.division_level_1?.code;
  }
  return housing?.location?.details?.division_level_2?.code;
}

function getSources(sources: SelectOption[]) {
  if (!sources) {
    return [];
  }

  return sources.map((source) => {
    return source.value;
  });
}

function buildPolicePayload(data: any) {
  const policeAccount = {
    ...data,
    [POLICE_FORM_NAMES.external_housing]: undefined,
    external_id:
      (data[POLICE_FORM_NAMES.external_housing] as SelectOption)?.value ||
      data[POLICE_FORM_NAMES.external_id],
    external_name: (data[POLICE_FORM_NAMES.external_housing] as SelectOption)?.label,
    [POLICE_FORM_NAMES.type]: (data[POLICE_FORM_NAMES.type] as SelectOption)?.value,
    [POLICE_FORM_NAMES.type_of_document]: (data[
      POLICE_FORM_NAMES.type_of_document
    ] as SelectOption)?.value,
    [POLICE_FORM_NAMES.username]: undefined,
    [POLICE_FORM_NAMES.password]: undefined,
    username: data[POLICE_FORM_NAMES.username],
    password: data[POLICE_FORM_NAMES.password],
  };

  return {
    is_auto_police_registration_enabled: true,
    is_police_registration_enabled: true,
    police_account: policeAccount,
  };
}

function buildStatPayload(data: any) {
  const statAccount = {
    [STAT_FORM_NAMES.type]: (data[STAT_FORM_NAMES.type] as SelectOption)?.value,
    [STAT_FORM_NAMES.location]: (data[STAT_FORM_NAMES.location] as SelectOption)?.value,
    [STAT_FORM_NAMES.username]: undefined,
    [STAT_FORM_NAMES.password]: undefined,
    username: data[STAT_FORM_NAMES.username],
    password: data[STAT_FORM_NAMES.password],
    [STAT_FORM_NAMES.available_rooms]: data?.[STAT_FORM_NAMES.available_rooms],
    [STAT_FORM_NAMES.external_housing]: Object.values(STAT_TYPES).includes(
      data[STAT_FORM_NAMES.type]?.value,
    )
      ? data?.[STAT_FORM_NAMES.external_housing_manual]
      : data?.[STAT_FORM_NAMES.external_housing],
  };

  return {
    stat_account: statAccount,
    is_stat_registration_enabled: true,
    [STAT_FORM_NAMES.room_quantity]: data[STAT_FORM_NAMES.room_quantity],
    [STAT_FORM_NAMES.beds_quantity]: data[STAT_FORM_NAMES.beds_quantity],
  };
}

function buildExternalSourcesPayload(data: any) {
  const sources: {[key: string]: string} = {
    [ICALS_FORM_NAMES.booking]: data[ICALS_FORM_NAMES.booking],
    [ICALS_FORM_NAMES.airbnb]: data[ICALS_FORM_NAMES.airbnb],
    [ICALS_FORM_NAMES.other]: data[ICALS_FORM_NAMES.other],
  };
  const payload = Object.keys(sources)
    .filter((key) => sources[key])
    .map((key) => {
      return {
        url: sources[key],
        type: key,
      };
    });

  return {
    external_sources: payload,
  };
}

function buildHousingPayload(data: any, country: string) {
  const divisionLvl = DIVISION_LVL_1_COUNTRIES.includes(country)
    ? {division_level_1: data[HOUSING_FORM_NAMES.province]?.value}
    : {division_level_2: data[HOUSING_FORM_NAMES.province]?.value};

  const hasLocation =
    data[HOUSING_FORM_NAMES.city] ||
    data[HOUSING_FORM_NAMES.address] ||
    data[HOUSING_FORM_NAMES.country]?.value ||
    data[HOUSING_FORM_NAMES.province]?.value;
  const location = hasLocation
    ? {
        ...divisionLvl,
        [HOUSING_FORM_NAMES.city]: data[HOUSING_FORM_NAMES.city],
        [HOUSING_FORM_NAMES.country]: data[HOUSING_FORM_NAMES.country]?.value,
        [HOUSING_FORM_NAMES.address]: data[HOUSING_FORM_NAMES.address] ?? undefined,
      }
    : undefined;

  const bookingSources = getSources(data[HOUSING_FORM_NAMES.booking_exempt_sources]);
  const taxSources = getSources(data[HOUSING_FORM_NAMES.tax_exempt_sources]);
  const depositSources = getSources(data[HOUSING_FORM_NAMES.deposit_exempt_sources]);
  const smartLockEmailOptions = getSmartLockEmailOptions(data);

  return {
    ...data,
    ...smartLockEmailOptions,
    location,
    type: 'UNK',
    [ICALS_FORM_NAMES.booking]: undefined,
    [ICALS_FORM_NAMES.airbnb]: undefined,
    [ICALS_FORM_NAMES.other]: undefined,
    [HOUSING_FORM_NAMES.city]: undefined,
    [HOUSING_FORM_NAMES.country]: undefined,
    [HOUSING_FORM_NAMES.address]: undefined,
    [HOUSING_FORM_NAMES.province]: undefined,
    [HOUSING_FORM_NAMES.depositAmount]: undefined,
    [HOUSING_FORM_NAMES.available_rooms]: data[HOUSING_FORM_NAMES.available_rooms],
    [HOUSING_FORM_NAMES.external_housing]: data[HOUSING_FORM_NAMES.external_housing],
    [HOUSING_FORM_NAMES.manager_name]: data[HOUSING_FORM_NAMES.manager_name] || undefined,
    [HOUSING_FORM_NAMES.email_language]: data[HOUSING_FORM_NAMES.email_language]?.value,
    [HOUSING_FORM_NAMES.booking_exempt_sources]: bookingSources,
    [HOUSING_FORM_NAMES.tax_exempt_sources]: taxSources,
    [HOUSING_FORM_NAMES.deposit_exempt_sources]: depositSources,
    extra_service_exempt_sources: bookingSources,
  };
}

function getTimezone(housing?: {time_zone: string}) {
  return housing?.time_zone || 'UTC';
}

function getManagerOrigin(housing?: Housing) {
  return housing?.manager_origin || '';
}

function checkIsPaymentsActive(housing: Housing) {
  return (
    housing?.security_deposit_status !== SECURITY_DEPOSIT_STATUSES.inactive ||
    housing?.reservation_payments_status !== RESERVATION_PAYMENT_STATUSES.inactive ||
    housing?.upselling_payments_status !== UPSELLING_PAYMENTS_STATUS.inactive ||
    Boolean(housing?.seasons.length)
  );
}

function checkVerificationType(types: HOUSING_VERIFICATION_TYPE[], housing?: Housing) {
  if (!housing?.is_self_online_check_in_enabled) return false;
  return types.some((type) => housing?.verification_type === type);
}

function getIsIdentityVerificationEnabled(housing?: Housing) {
  if (!housing) {
    return false;
  }
  return housing?.is_self_online_check_in_enabled || false;
}

function getChecksVerificationType(housing?: Housing) {
  const isOnlyOfficialDocument = checkVerificationType(
    [
      HOUSING_VERIFICATION_TYPE.mandatoryDocumentOnly,
      HOUSING_VERIFICATION_TYPE.optionalDocumentOnly,
    ],
    housing,
  );

  const isDocumentAndSelfie = checkVerificationType(
    [
      HOUSING_VERIFICATION_TYPE.mandatoryDocumentAndSelfie,
      HOUSING_VERIFICATION_TYPE.optionalDocumentAndSelfie,
    ],
    housing,
  );

  const isDocumentAndSelfieOptional = checkVerificationType(
    [HOUSING_VERIFICATION_TYPE.optionalDocumentAndSelfie],
    housing,
  );

  const isOnlyOfficialDocumentMandatory = checkVerificationType(
    [HOUSING_VERIFICATION_TYPE.mandatoryDocumentOnly],
    housing,
  );

  const isOnlyOfficialDocumentOptional = checkVerificationType(
    [HOUSING_VERIFICATION_TYPE.optionalDocumentOnly],
    housing,
  );

  return {
    isOnlyOfficialDocument,
    isOnlyOfficialDocumentMandatory,
    isOnlyOfficialDocumentOptional,
    isDocumentAndSelfie,
    isDocumentAndSelfieOptional,
  };
}

export {
  getManagerOrigin,
  getIsIdentityVerificationEnabled,
  checkVerificationType,
  getChecksVerificationType,
  getTimezone,
  checkIsPaymentsActive,
  buildExternalSourcesPayload,
  buildPolicePayload,
  buildStatPayload,
  getExternalHousingsAsOptions,
  getProvinceCode,
  getCountryCode,
  buildHousingPayload,
  getName,
  getStatType,
  getCountryAsOption,
  getOneHousingAsOption,
  getShortHousingsAsOptions,
  fetchShortHousings,
};
