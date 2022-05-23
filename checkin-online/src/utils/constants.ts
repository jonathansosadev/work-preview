import i18n from '../i18n';
import {isMobile} from 'react-device-detect';

const COUNTRY_CODES = {
  spain: 'ES',
  italy: 'IT',
  germany: 'DE',
  portugal: 'PT',
  uae: 'AE',
  netherlands: 'NL',
  austria: 'AT',
  uk: 'GB',
  france: 'FR',
  belgium: 'BE',
  hungary: 'HU',
  czech: 'CZ',
  colombia: 'CO',
  thailand: 'TH',
  romania: 'RO',
  greece: 'GR',
  slovenia: 'SI',
  croatia: 'HR',
  usa: 'US',
};
export const EU_MEMBERS = [
  'BE',
  'EL',
  'LT',
  'PT',
  'BG',
  'ES',
  'LU',
  'RO',
  'CZ',
  'FR',
  'HU',
  'SI',
  'DK',
  'HR',
  'MT',
  'SK',
  'DE',
  'IT',
  'NL',
  'FI',
  'EE',
  'CY',
  'AT',
  'SE',
  'IE',
  'LV',
  'PL',
];

const GENDERS_OPTIONS = () => [
  {
    value: 'M',
    label: i18n.t('male'),
  },
  {
    value: 'F',
    label: i18n.t('female'),
  },
];
const PATTERNS = {
  dniAndDl: /^[0-9]{8}[a-zA-Z]{1}$/,
  nie: /^[a-zA-Z]{1}[0-9]{7}[a-zA-Z]{1}$/,
  name: /^[A-Za-zÀ-ÖØ-öø-ÿ]*( *[A-Za-zÀ-ÖØ-öø-ÿ *]+)*( *[а-яА-ЯёЁА́-Я́а́-я́*]+)*$/,
  nameForItaly: /^[A-Za-z\s]*$/,
  nameWithoutAccents: /^[A-Za-z]*( *[A-Za-z *]+)*( *[а-яА-ЯёЁА *]+)*$/,
  fiscalCode: /^[A-Za-z0-9]+$/,
  email: /^\s*([\w.%+-]+)@([\w-]+\.)?([\w]{2,}\.)?([\w]{2,})\s*$/i,
  docNumber: /^[a-zA-Z0-9]*$/,
  allSpaces: /\s/g,
};
const COUNTRIES_WITH_PURPOSES_OF_STAY = [
  COUNTRY_CODES.romania,
  COUNTRY_CODES.germany,
  COUNTRY_CODES.austria,
];
const CARD_BRANDS = {
  visa: 'V',
};
const TIMEOUT_BEFORE_REDIRECT_MS = 1500;
const COUNTRY_CODES_WITHOUT_SIGNATURE = [COUNTRY_CODES.italy, COUNTRY_CODES.thailand];

const COUNTRIES_WITH_POLICE = [
  COUNTRY_CODES.spain,
  COUNTRY_CODES.italy,
  COUNTRY_CODES.portugal,
  COUNTRY_CODES.uae,
  COUNTRY_CODES.hungary,
  COUNTRY_CODES.czech,
  COUNTRY_CODES.colombia,
  COUNTRY_CODES.slovenia,
  COUNTRY_CODES.thailand,
  COUNTRY_CODES.austria,
  COUNTRY_CODES.croatia,
];

const OCR_CHECKING_STATUSES = {
  error: 'ERR',
  complete: 'COM',
  processing: 'PRO',
};

const STAT_TYPES = {
  valtellinaAbit: 'ITVA',
};
const STAT_TYPES_WITH_TAX_EXEMPTIONS = [STAT_TYPES.valtellinaAbit];

const ORIGINS = {
  unknown: 'UNKNOWN',
  checkinOnline: 'CH_ONLINE',
  default: 'DEFAULT',
  dashboard: 'DASHBOARD',
  dashboard_pms: 'DASHBOARD_PMS',
  vreasy: 'VREASY',
  octorate: 'OCTORATE',
  lodgify: 'LODGIFY',
  rentals_united: 'RENTALS_UNITED',
  legacy: 'LEGACY',
  booking: 'BOOKING',
  bookingsync: 'BOOKINGSYNC',
  hostaway: 'HOSTAWAY',
  planyo: 'PLANYO',
  mews: 'MEWS',
  guesty: 'GUESTY',
  ofi: 'OFI',
  cloudbeds: 'CLOUDBEDS',
  smoobu: 'SMOOBU',
  apaleo: 'APALEO',
  gomera: 'GOMERA',
  api: 'API',
  dashboard_m: 'DASHBOARD_M',
  ei: 'EI',
  airbnb_calendar: 'AIRBNB_CALENDAR',
  booking_calendar: 'BOOKING_CALENDAR',
  avantio_calendar: 'AVANTIO_CALENDAR',
  generic_calendar: 'GENERIC_CALENDAR',
  cb: 'CB',
  channex: 'CHANNEX',
  resharmonics: 'RESHARMONICS',
  beds24: 'BEDS24',
  sonder: 'SONDER',
  ciaobooking: 'CIAOBOOKING',
  ruralgest: 'RURALGEST',
  easyhotelia: 'EASYHOTELIA',
  casamitger: 'CASAMITGER',
  fnsrooms: 'FNSROOMS',
  komodore: 'KOMODORE',
  lobby_pms: 'LOBBY_PMS',
  mijas_villas: 'MIJAS_VILLAS',
  villas_365: 'VILLAS_365',
  kamooni: 'KAMOONI',
  roomcloud: 'ROOMCLOUD',
  amenitiz: 'AMENITIZ',
  avaibook: 'AVAIBOOK',
  sextaplanta: 'SEXTAPLANTA',
  whoyourguest: 'WHOYOURGUEST',
  wifreezone: 'WIFREEZONE',
  turismoverycheap: 'TURISMOVERYCHEAP',
  vacasa: 'VACASA',
  staymyway: 'STAYMYWAY',
  rentlio: 'RENTLIO',
  ezeetechnosys: 'EZEETECHNOSYS',
  fantasticstay: 'FANTASTICSTAY',
  eviivo: 'EVIIVO',
  masteryield: 'MASTERYIELD',
  bookingautomation: 'BOOKINGAUTOMATION',
  higuests: 'HIGUESTS',
  hoteliga: 'HOTELIGA',
  cosi_group: 'COSI_GROUP',
  myvr: 'MYVR',
  ownerrez: 'OWNERREZ',
  datahotel: 'DATAHOTEL',
  hostify: 'HOSTIFY',
};
const GROUP_TYPES = {
  single: 'S',
  group: 'G',
  family: 'F',
  tourist: 'T',
};

const SINGLE_GROUP_TYPES_OPTIONS = [
  {
    value: GROUP_TYPES.single,
    label: i18n.t('single'),
  },
];
const GROUP_GROUP_TYPES_OPTIONS = [
  {
    value: GROUP_TYPES.group,
    label: i18n.t('group'),
  },
  {
    value: GROUP_TYPES.family,
    label: i18n.t('family'),
  },
];
const ALL_GROUP_TYPES_OPTIONS = [
  ...SINGLE_GROUP_TYPES_OPTIONS,
  ...GROUP_GROUP_TYPES_OPTIONS,
];
const TOURIST_GROUP_GROUP_TYPE_OPTION = {
  value: GROUP_TYPES.tourist,
  label: i18n.t('tourist_group'),
};

const WS_EVENT_TYPES = {
  guestPaymentAccountConfirmed: 'GUEST_PAYMENT_ACCOUNT_CONFIRMED',
  guestPaymentAccountRejected: 'GUEST_PAYMENT_ACCOUNT_REJECTED',
  guestPaymentAccountApiError: 'REMOVE_GUEST_PAYMENT_ACCOUNT_API_ERROR',
  guestPaymentCompleted: 'GUEST_PAYMENT_COMPLETED',
  guestPaymentFailed: 'GUEST_PAYMENT_FAILED',
  securityDepositConfirmed: 'SECURITY_DEPOSIT_CONFIRMED',
  securityDepositCancelled: 'SECURITY_DEPOSIT_CANCELED',
  guestPaymentSecureWaiting: 'GUEST_PAYMENT_SECURE_WAITING',
  securityDepositSecureWaiting: 'SECURITY_DEPOSIT_SECURE_WAITING',
  securityDepositAuthCodeReceived: 'SECURITY_DEPOSIT_AUTH_CODE_RECEIVED',
  guestPaymentAuthCodeReceived: 'GUEST_PAYMENT_AUTH_CODE_RECEIVED',
};

const NONE_EXEMPTION_OPTION = {
  value: 'NONE',
  label: i18n.t('none'),
};

enum SECURITY_DEPOSIT_STATUSES {
  inactive = 'INACTIVE',
  optional = 'OPTIONAL',
  mandatory = 'MANDATORY',
}

const CHANGE_LANGUAGE_TRIGGER_ID = 'language';

enum CURRENCIES {
  eur = 'eur',
  usd = 'usd',
  gbp = 'gbp',
  aed = 'aed',
}

const CURRENCIES_SIGNS: Record<CURRENCIES, string> = {
  [CURRENCIES.eur]: '€',
  [CURRENCIES.usd]: '$',
  [CURRENCIES.gbp]: '£',
  [CURRENCIES.aed]: 'د.إ',
};

const CURRENCIES_LABELS: Record<CURRENCIES, string> = {
  [CURRENCIES.eur]: `${CURRENCIES_SIGNS[CURRENCIES.eur]}EUR`,
  [CURRENCIES.usd]: `${CURRENCIES_SIGNS[CURRENCIES.usd]}USD`,
  [CURRENCIES.gbp]: `${CURRENCIES_SIGNS[CURRENCIES.gbp]}GBP`,
  [CURRENCIES.aed]: `${CURRENCIES_SIGNS[CURRENCIES.aed]}AED`,
};

enum PAYMENT_PROVIDERS {
  paycomet = 'PAYCOMET',
  stripe = 'STRIPE',
}

const DIVISION_LVL_1_COUNTRIES = [
  COUNTRY_CODES.uae,
  COUNTRY_CODES.portugal,
  COUNTRY_CODES.romania,
  COUNTRY_CODES.hungary,
];

const LINK_COPIED_MESSAGE_TIMEOUT_MS = 1000;
const WHATSAPP_SHARE_LINK = isMobile
  ? 'whatsapp://send/'
  : 'https://api.whatsapp.com/send';
const SMS_SHARE_LINK = 'sms://';
const EMAIL_SHARE_LINK = 'mailto:%20';

const EXEMPTIONS_IDS = {
  under14: 'UNDER14',
  under18: 'UNDER18',
  tec: 'TEC',
  ea: 'EA',
  mr: 'MR',
};

export {
  DIVISION_LVL_1_COUNTRIES,
  CURRENCIES_SIGNS,
  CURRENCIES_LABELS,
  CURRENCIES,
  PAYMENT_PROVIDERS,
  NONE_EXEMPTION_OPTION,
  WS_EVENT_TYPES,
  ORIGINS,
  COUNTRY_CODES_WITHOUT_SIGNATURE,
  COUNTRY_CODES,
  GENDERS_OPTIONS,
  PATTERNS,
  COUNTRIES_WITH_PURPOSES_OF_STAY,
  CARD_BRANDS,
  TIMEOUT_BEFORE_REDIRECT_MS,
  OCR_CHECKING_STATUSES,
  STAT_TYPES,
  STAT_TYPES_WITH_TAX_EXEMPTIONS,
  GROUP_TYPES,
  SECURITY_DEPOSIT_STATUSES,
  CHANGE_LANGUAGE_TRIGGER_ID,
  SINGLE_GROUP_TYPES_OPTIONS,
  GROUP_GROUP_TYPES_OPTIONS,
  ALL_GROUP_TYPES_OPTIONS,
  TOURIST_GROUP_GROUP_TYPE_OPTION,
  LINK_COPIED_MESSAGE_TIMEOUT_MS,
  WHATSAPP_SHARE_LINK,
  SMS_SHARE_LINK,
  EMAIL_SHARE_LINK,
  COUNTRIES_WITH_POLICE,
  EXEMPTIONS_IDS,
};
