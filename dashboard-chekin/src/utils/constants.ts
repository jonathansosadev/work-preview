import i18n from '../i18n';
import {SelectOption} from './types';

const QUERY_CACHE_KEYS = {
  guestGroup: 'guestGroup',
  highSeason: 'highSeason',
  locations: 'locations',
};

const PATTERNS = {
  dniAndDl: /^[0-9]{8}[a-zA-Z]{1}$/,
  nie: /^[a-zA-Z]{1}[0-9]{7}[a-zA-Z]{1}$/,
  name: /^[\p{L}]+$/u,
  nameWithoutAccents: /^[A-Za-z]*( *[A-Za-z *]+)*( *[а-яА-ЯёЁА *]+)*$/,
  email: /^([\w.%+-]+)@([\w-]+\.)?([\w]{2,}\.)?([\w]{2,}\.)?([\w]{2,})$/i,
  fiscalCode: /^[A-Za-z0-9]+$/,
  housingEdit: /^\/(properties)\/.{32}/,
  housingAdd: /^\/(properties)\/add$/,
  reservationEdit: /^\/(bookings)\/.{32}/,
  docNumber: /^[a-zA-Z0-9\\s]*$/,
  time: /\d{2}:\d{2}/,
  customField: /^[^.\\/]+$/,
};

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
  switzerland: 'CH',
  us: 'US',
};

const LANGUAGES_ISO_3 = {
  spanish: 'spa',
  italian: 'ita',
  english: 'eng',
  french: 'fra',
  russian: 'rus',
  portuguese: 'por',
  german: 'deu',
  hungarian: 'hun',
  czech: 'ces',
};

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

const SITEMINDER_ORIGINS = {
  abodeBooking: 'SMARTFX',
  aqholder: 'AQHOLDER',
  goldenUp: 'GOLDENUP',
  cmsGuestCentrix: 'GUESTCENTRIX',
  front2Go: 'FRONT2GO',
  innkeyPMS: 'INNKEYPMS',
  occupancyPlus: 'OCCUPANCYPLUS',
  preno: 'PRENO',
  shalomPMS: 'SHALOM',
  sirvoy: 'SIRVOY',
  sindataVHP: 'VHP',
  winhotel: 'WINHOTEL',
  winHMS: 'WINHMS',
  zaviaERP: 'ZAVIA',
  xeniaPMS: 'XENIA',
  misterBooking: 'MISTERBOOKING',
  siteMinderChannelManager: 'channelmanager',
  stelle: '5STELLE',
  brillantEZ: 'BRILLANTEZ',
  easyRez: 'EASYREZ',
  ibelsa: 'IBELSA',
  littleHotelier: 'littlehotelier',
  newBook: 'NEWBOOK',
  rdpWin: 'RDPWIN',
  roomRaccoon: 'ROOMRACCOON',
  thaisHotel: 'THAISHOTELS',
  hotelTime: 'HOTELTIME',
  roomRanger: 'ROOMRANGER',
  tkSystem: 'TKSYSTEM',
};

const POLICE_CODES = {
  nationalPolice: 'POL',
};

const DEFAULT_FILTER_OPTION = {
  value: '',
  label: i18n.t('all'),
};

const POLICE_TYPES = {
  [COUNTRY_CODES.spain]: [
    {value: 'NAT', label: i18n.t('police_types.nat')},
    {value: POLICE_CODES.nationalPolice, label: i18n.t('police_types.pol')},
    {value: 'ERT', label: i18n.t('police_types.ert')},
    {value: 'MOS', label: i18n.t('police_types.mos')},
    {value: 'FAKE', label: i18n.t('police_types.fake')},
  ],
  [COUNTRY_CODES.italy]: [
    {value: 'ISP', label: i18n.t('police_types.isp')},
    {value: 'FAKE', label: i18n.t('police_types.fake')},
  ],
  [COUNTRY_CODES.portugal]: [
    {value: 'SEF', label: i18n.t('police_types.sef')},
    {value: 'FAKE', label: i18n.t('police_types.fake')},
  ],
  [COUNTRY_CODES.uae]: [
    {value: 'UHH', label: i18n.t('police_types.uhh')},
    {value: 'FAKE', label: i18n.t('police_types.fake')},
  ],
  [COUNTRY_CODES.czech]: [
    {value: 'FAKE', label: i18n.t('police_types.fake')},
    {value: 'CUP', label: i18n.t('police_types.cup')},
  ],
  [COUNTRY_CODES.colombia]: [{value: 'COL', label: i18n.t('police_types.colombia_sire')}],
  [COUNTRY_CODES.thailand]: [
    {value: 'FAKE', label: i18n.t('police_types.fake')},
    {value: 'THAI', label: i18n.t('police_types.thai')},
  ],
  [COUNTRY_CODES.austria]: [
    {value: 'FER', label: i18n.t('police_types.austrian_feratel')},
  ],
  [COUNTRY_CODES.slovenia]: [
    {value: 'AJP', label: i18n.t('police_types.slovenia_agency')},
  ],
  [COUNTRY_CODES.croatia]: [
    {value: 'HREV', label: i18n.t('police_types.croatia_evisitor')},
  ],
  [COUNTRY_CODES.switzerland]: [
    {value: 'CHE', label: i18n.t('police_types.switzerland_agency')},
    {value: 'FAKE', label: i18n.t('police_types.fake')},
  ],
};

const COUNTRIES_WITH_STAT = [COUNTRY_CODES.germany, COUNTRY_CODES.italy];
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
  COUNTRY_CODES.switzerland,
];
const COUNTRIES_WITH_POLICE_ALLOWED_SEND_AFTER_1_DAY = [
  COUNTRY_CODES.spain,
  COUNTRY_CODES.uae,
  COUNTRY_CODES.czech,
  COUNTRY_CODES.colombia,
];
const COUNTRIES_WITH_POLICE_NOT_ALLOWED_SEND_ONE_GUEST = [
  COUNTRY_CODES.italy,
  COUNTRY_CODES.uae,
];
const COUNTRIES_WITH_CONTRACTS = [COUNTRY_CODES.spain];
const POLICE_TYPES_OF_DOCUMENT = {
  [COUNTRY_CODES.colombia]: [
    {value: 'CO_ID', label: i18n.t('col_colombian_id')},
    {value: 'CO_FID', label: i18n.t('col_residence_permit')},
  ],
};
const VALIDATION_STATUSES = {
  inProgress: 'IN_PROGRESS',
  complete: 'COMPLETE',
  error: 'ERROR',
};
const STAT_TYPES = {
  lazioRadar: 'ITRA',
  campania: 'ITCA',
  toscanaRicestat: 'ITTO',
  toscanaTuristat: 'ITT3',
  valtellinaAbit: 'ITVA',
  venetto: 'ITVE',
  abruzzo: 'ITAB',
  emiliaRomania: 'ITER',
  lombardia: 'ITLO',
  marche: 'ITMA',
  piemonte: 'ITPI',
  sardegna: 'ITSA',
  trento: 'ITTR',
  calabria: 'ITCB',
  liguria: 'ITLI',
};
const DISABLED_STAT_TYPES = {
  siciliaOCR: 'ITSI',
  fruiliVenezia: 'ITFV',
  valtellinaAbit: 'ITVA',
};
const STAT_TYPES_WITHOUT_OCCUPIED_ROOMS = [
  STAT_TYPES.campania,
  STAT_TYPES.toscanaRicestat,
  STAT_TYPES.valtellinaAbit,
  STAT_TYPES.venetto,
];
const STAT_TYPES_WITHOUT_CHECK_OUT = [
  STAT_TYPES.abruzzo,
  STAT_TYPES.emiliaRomania,
  STAT_TYPES.lombardia,
  STAT_TYPES.toscanaTuristat,
  STAT_TYPES.marche,
  STAT_TYPES.piemonte,
  STAT_TYPES.venetto,
  STAT_TYPES.calabria,
  STAT_TYPES.liguria,
  STAT_TYPES.lazioRadar,
  STAT_TYPES.sardegna,
  STAT_TYPES.toscanaRicestat,
  STAT_TYPES.valtellinaAbit,
];
const POLICE_LIKE_STAT_TYPES = [
  STAT_TYPES.abruzzo,
  STAT_TYPES.emiliaRomania,
  STAT_TYPES.lombardia,
  STAT_TYPES.toscanaTuristat,
  STAT_TYPES.marche,
  STAT_TYPES.piemonte,
  STAT_TYPES.venetto,
  STAT_TYPES.calabria,
  STAT_TYPES.liguria,
  STAT_TYPES.lazioRadar,
  STAT_TYPES.sardegna,
  STAT_TYPES.toscanaRicestat,
  STAT_TYPES.valtellinaAbit,
];

const CONTRACT_TYPES = {
  hotel: 'HOTEL',
  apartment: 'APARTMENT',
  housing: 'HOUSING',
};
const CONTRACT_TYPES_OPTIONS = {
  [CONTRACT_TYPES.hotel]: {
    label: i18n.t('contract_types.hotel'),
    value: 'HOTEL',
  },
  [CONTRACT_TYPES.apartment]: {
    label: i18n.t('contract_types.apartment'),
    value: 'APARTMENT',
  },
  [CONTRACT_TYPES.housing]: {
    label: i18n.t('contract_types.housing'),
    value: 'HOUSING',
  },
};
const DIVISION_LVL_1_COUNTRIES = [
  COUNTRY_CODES.uae,
  COUNTRY_CODES.portugal,
  COUNTRY_CODES.romania,
  COUNTRY_CODES.hungary,
];
const EXTERNAL_SOURCES_TYPES = {
  airBnb: 'AIRBNB_CALENDAR',
  booking: 'BOOKING_CALENDAR',
  other: 'GENERIC_CALENDAR',
};

const WS_EVENT_TYPES = {
  reservationCreated: 'RESERVATION_CREATED',
  reservationRemoved: 'RESERVATION_REMOVED',
  housingCreated: 'HOUSING_CREATED',
  housingRemoved: 'HOUSING_REMOVED',
  syncReservationsFinished: 'SYNC_RESERVATIONS_FINISHED',
  syncHousingsFinished: 'SYNC_HOUSINGS_FINISHED',
  syncReservationsStarted: 'SYNC_RESERVATIONS_STARTED',
  syncHousingsStarted: 'SYNC_HOUSINGS_STARTED',
  contractSampleCreationStarted: 'CONTRACT_SAMPLE_CREATION_STARTED',
  contractSampleCreationFinished: 'CONTRACT_SAMPLE_CREATION_FINISHED',
  contractSampleCreationFailed: 'CONTRACT_SAMPLE_CREATION_FAILED',
  contractsArchiveGenerationStarted: 'CONTRACTS_ARCHIVE_GENERATION_STARTED',
  contractsArchiveGenerationFinished: 'CONTRACTS_ARCHIVE_GENERATION_FINISHED',
  contractsArchiveGenerationFailed: 'CONTRACTS_ARCHIVE_GENERATION_FAILED',
  subscriptionUpdated: 'SUBSCRIPTION_UPDATED',
  userUpdated: 'USER_UPDATED',
  importXLSXFinished: 'IMPORT_XLSX_FINISHED',
  guestReportGenerationStarted: 'GUEST_REPORT_EXCEL_GENERATION_STARTED',
  guestReportGenerationFinished: 'GUEST_REPORT_EXCEL_GENERATION_FINISHED',
  guestReportGenerationFailed: 'GUEST_REPORT_EXCEL_GENERATION_FAILED',
  entryFormsArchiveGenerationStarted: 'ENTRY_FORM_ARCHIVE_GENERATION_STARTED',
  entryFormsArchiveGenerationFinished: 'ENTRY_FORM_ARCHIVE_GENERATION_FINISHED',
  entryFormsArchiveGenerationFailed: 'ENTRY_FORM_ARCHIVE_GENERATION_FAILED',
  guestbookGenerationStarted: 'GUEST_BOOK_GENERATION_STARTED',
  guestbookGenerationFinished: 'GUEST_BOOK_GENERATION_FINISHED',
  guestbookGenerationFailed: 'GUEST_BOOK_GENERATION_FAILED',
  reservationReportExcelStarted: 'RESERVATION_REPORT_EXCEL_STARTED',
  reservationReportExcelFinished: 'RESERVATION_REPORT_EXCEL_FINISHED',
  reservationReportExcelFailed: 'RESERVATION_REPORT_EXCEL_FAILED',
  writeOffCompleted: 'WRITE_OFF_COMPLETED',
  writeOffFailed: 'WRITE_OFF_FAILED',
  guestPaymentCompleted: 'GUEST_PAYMENT_COMPLETED',
  guestPaymentFailed: 'GUEST_PAYMENT_FAILED',
  paymentRefundCompleted: 'PAYMENT_REFUND_CONFIRMED',
  paymentRefundRejected: 'PAYMENT_REFUND_REJECTED',
  paymentRefundPartially: 'PAYMENT_REFUND_PARTIALLY',
  paymentsSettingsWaitForFilling: 'PAYMENTS_SETTINGS_WAIT_FOR_FILLING',
  paymentsReportExcelFinished: 'PAYMENTS_REPORT_EXCEL_FINISHED',
  paymentsReportExcelFailed: 'PAYMENTS_REPORT_EXCEL_FAILED',
  paymentsSettingsValid: 'PAYMENTS_SETTINGS_VALID',
  paymentsSettingsDetailsSubmitted: 'PAYMENTS_SETTINGS_DETAILS_SUBMITTED',
  upsellingReportExcelStarted: 'UPSELLING_REPORT_EXCEL_STARTED',
  upsellingReportExcelFinished: 'UPSELLING_REPORT_EXCEL_FINISHED',
  upsellingReportExcelFailed: 'UPSELLING_REPORT_EXCEL_FAILED',
};

const STAT_TYPES_WITH_TAX_EXEMPTIONS = [STAT_TYPES.valtellinaAbit];
const SINGLE_GROUP_TYPE = 'S';
const GROUP_GROUP_TYPE = 'G';
const FAMILY_GROUP_TYPE = 'F';
const TOURIST_GROUP_GROUP_TYPE = 'T';
const SINGLE_GROUP_TYPES_OPTIONS = [
  {
    value: SINGLE_GROUP_TYPE,
    label: i18n.t('single'),
  },
];
const GROUP_GROUP_TYPES_OPTIONS = [
  {
    value: GROUP_GROUP_TYPE,
    label: i18n.t('group'),
  },
  {
    value: FAMILY_GROUP_TYPE,
    label: i18n.t('family'),
  },
];
const ALL_GROUP_TYPES_OPTIONS = [
  ...SINGLE_GROUP_TYPES_OPTIONS,
  ...GROUP_GROUP_TYPES_OPTIONS,
];
const TOURIST_GROUP_GROUP_TYPE_OPTION = {
  value: TOURIST_GROUP_GROUP_TYPE,
  label: i18n.t('tourist_group'),
};
const RESPONSIBLE_ME_OPTION = {
  value: 'ME',
  label: i18n.t('me'),
};
const GENDERS_OPTIONS = [
  {
    value: 'M',
    label: i18n.t('male'),
  },
  {
    value: 'F',
    label: i18n.t('female'),
  },
];
const EU_MEMBERS = [
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
const COUNTRIES_WITH_PURPOSES_OF_STAY = [
  COUNTRY_CODES.romania,
  COUNTRY_CODES.germany,
  COUNTRY_CODES.austria,
];
const MAX_NUMBER_OF_GUESTS = 20;
const CARD_BRANDS = {
  visa: 'V',
};
const GUEST_PLACEHOLDER_ID = 'new';

const COLLABORATOR_GROUPS = {
  manager: 'object admin',
  collaborator: 'reservations assigned only',
};

const ORIGINS_TO_SHOW_BOOKING_PAYMENTS = [
  ORIGINS.dashboard,
  ORIGINS.cloudbeds,
  ORIGINS.smoobu,
  ORIGINS.apaleo,
  ORIGINS.legacy,
  ORIGINS.gomera,
  ORIGINS.guesty,
  ...Object.values(SITEMINDER_ORIGINS),
];

const ORIGINS_LABELS = {
  [ORIGINS.guesty]: 'Guesty',
  [ORIGINS.lodgify]: 'Lodgify',
  [ORIGINS.octorate]: 'Octorate',
  [ORIGINS.rentals_united]: 'Rentals United',
  [ORIGINS.booking]: 'Booking',
  [ORIGINS.bookingsync]: 'BookingSync',
  [ORIGINS.hostaway]: 'Hostaway',
  [ORIGINS.mews]: 'Mews',
  [ORIGINS.ofi]: 'OFI',
  [ORIGINS.dashboard_pms]: 'Dashboard PMS',
  [ORIGINS.dashboard]: 'Dashboard',
  [ORIGINS.default]: 'Default',
};

const ORIGINS_WITH_POSSIBLE_MAPPING = [ORIGINS.mews, ORIGINS.octorate, ORIGINS.cloudbeds];

const ORIGINS_WITH_SUBSCRIPTION = [
  ORIGINS.dashboard,
  ORIGINS.dashboard_pms,
  ORIGINS.octorate,
  ORIGINS.vreasy,
  ORIGINS.lodgify,
  ORIGINS.rentals_united,
  ORIGINS.legacy,
  ORIGINS.booking,
  ORIGINS.planyo,
  ORIGINS.hostaway,
  ORIGINS.bookingsync,
];

const PERIODICITY = {
  yearly: 'YEAR',
  monthly: 'MONTH',
};

const SUBSCRIPTION_TYPES = {
  housing: 'HOU',
  hotel: 'HOT',
};

enum SUBSCRIPTION_INTERVALS {
  month = 'MONTH',
  year = 'YEAR',
}

const SUBSCRIPTION_INTERVALS_OPTIONS = {
  [SUBSCRIPTION_INTERVALS.month]: {
    value: SUBSCRIPTION_INTERVALS.month,
    label: i18n.t('monthly'),
  } as SelectOption,
  [SUBSCRIPTION_INTERVALS.year]: {
    value: SUBSCRIPTION_INTERVALS.year,
    label: i18n.t('yearly'),
  } as SelectOption,
};

const STATUS_CODES = {
  complete: 'COMPLETE',
  new: 'NEW',
  error: 'ERROR',
};

const DEFAULT_OCCUPIED_ROOMS_NUMBER = 1;

const ACCOMMODATION_TYPES = {
  house: 'HOU',
  hotel: 'HOT',
  api: 'API',
};

enum AJPES_MONTHLY_REPORT_STATUSES {
  open_tourists_are_coming = '11',
  open_tourists_were_no_tourists = '12',
  temporarily_closed_other_reasons = '50',
  temporarily_closed_adaption = '51',
  temporarily_closed_seasonal_closure = '54',
  termination_of_rental_of_accommodation_capacities_to_tourists = '61',
  temporarily_accommodation_сapacities_under_preparation = '62',
}

const AJPES_MONTHLY_REPORT_STATUSES_OPTION = Object.entries(
  AJPES_MONTHLY_REPORT_STATUSES,
).map(([label, value]) => {
  return {
    label,
    value,
  };
});

const TOAST_AUTO_CLOSE_MS = 4000;
const MIN_MEMBERS_NUMBER = 1;
enum REPORT_TYPES {
  idev = 'de-idev',
  ajpes = 'sl-ajpes',
}

const HOUSING = 'housing';
const RESERVATION = 'reservation';

enum SUBSCRIPTION_PRODUCT_TYPES {
  chekin = 'CHEKIN',
  selfCheckin = 'SELF_CHECKIN',
  documentStore = 'DOCUMENT_STORE',
  idVerification = 'ID_VERIFICATION',
  remoteAccess = 'REMOTE_ACCESS',
  deposit = 'DEPOSIT',
  tax = 'TAX',
}

enum LOCK_VENDORS {
  omnitec = 'o',
  keynest = 'k',
  keyless = 'l',
  akiles = 'a',
  keycafe = 'c',
  nuki = 'n',
  homeit = 'h',
  manualBox = 'm',
  remotelock = 'r',
  salto = 's',
  ttlock = 'TTLOCK',
  yacan = 'YACAN',
  mondise = 'MONDISE',
  roomatic = 'ROOMATIC',
  elea = 'ELEA',
}

enum LOCK_PROPERTY_PROTECTIONS {
  superhub = 'SUPERHUB'
}
const LOCK_PROPERTY_PROTECTIONS_OPTIONS = {
  [LOCK_PROPERTY_PROTECTIONS.superhub]: {
    label: 'SuperHog',
    value: LOCK_PROPERTY_PROTECTIONS.superhub,
  },
}
const LOCK_VENDOR_OPTIONS = {
  [LOCK_VENDORS.omnitec]: {
    label: 'Omnitec',
    value: LOCK_VENDORS.omnitec,
  },
  [LOCK_VENDORS.keynest]: {
    label: 'KeyNest',
    value: LOCK_VENDORS.keynest,
  },
  /*[LOCK_VENDORS.keyless]: {
    label: 'KeyLess',
    value: LOCK_VENDORS.keyless,
  },*/
  [LOCK_VENDORS.akiles]: {
    label: 'Akiles',
    value: LOCK_VENDORS.akiles,
  },
  [LOCK_VENDORS.keycafe]: {
    label: 'Keycafe',
    value: LOCK_VENDORS.keycafe,
  },
  [LOCK_VENDORS.nuki]: {
    label: 'Nuki',
    value: LOCK_VENDORS.nuki,
  },
  [LOCK_VENDORS.homeit]: {
    label: 'HomeIT',
    value: LOCK_VENDORS.homeit,
  },
  [LOCK_VENDORS.remotelock]: {
    label: 'RemoteLock',
    value: LOCK_VENDORS.remotelock,
  },
  [LOCK_VENDORS.ttlock]: {
    label: 'TTlock',
    value: LOCK_VENDORS.ttlock,
  },
  [LOCK_VENDORS.salto]: {
    label: 'SALTO',
    value: LOCK_VENDORS.salto,
  },
  [LOCK_VENDORS.roomatic]: {
    label: 'Roomatic',
    value: LOCK_VENDORS.roomatic,
  },
  [LOCK_VENDORS.mondise]: {
    label: 'Mondise',
    value: LOCK_VENDORS.mondise,
  },
  [LOCK_VENDORS.elea]: {
    label: 'Elea',
    value: LOCK_VENDORS.elea,
  },
  [LOCK_VENDORS.yacan]: {
    label: 'YACAN',
    value: LOCK_VENDORS.yacan,
  },
};

const LOCK_ACCOUNT_NAMES_OPTIONS = {
  ...LOCK_VENDOR_OPTIONS,
  [LOCK_VENDORS.manualBox]: {
    label: i18n.t('manual_box'),
    value: LOCK_VENDORS.manualBox,
  },
  [LOCK_VENDORS.keynest]: {
    label: 'KeyNest',
    value: LOCK_VENDORS.keynest,
  },
  [LOCK_VENDORS.keyless]: {
    label: 'KeyLess',
    value: LOCK_VENDORS.keyless,
  },
};

enum LOCK_TYPES {
  buildingDoor = 'B',
  apartmentDoor = 'A',
  smartBox = 'S',
  unknownDoor = 'U',
}

const LOCK_TYPES_OPTIONS = {
  [LOCK_TYPES.buildingDoor]: {
    label: i18n.t('building_door'),
    value: LOCK_TYPES.buildingDoor,
  },
  [LOCK_TYPES.apartmentDoor]: {
    label: i18n.t('apartment_door'),
    value: LOCK_TYPES.apartmentDoor,
  },
  [LOCK_TYPES.smartBox]: {
    label: i18n.t('smart_box'),
    value: LOCK_TYPES.smartBox,
  },
  [LOCK_TYPES.unknownDoor]: {
    label: i18n.t('unknown_door'),
    value: LOCK_TYPES.unknownDoor,
  },
};

enum LOCK_ACCESS_TYPES {
  private = 'PRIVATE',
  common = 'COMMON',
}

enum SUBSCRIPTION_TRIAL_TYPES {
  stripe = '0',
  custom = '1',
}

const MARKETPLACE_TYPES = {
  access_provider: i18n.t('access_provider'),
  integration: 'integration',
  property_protection: i18n.t('property_protection')
};

const MARKETPLACE_STATUSES = {
  connected: 'connected',
  unconnected: 'unconnected',
  coming: 'coming',
};

const COUNTRIES_WITH_TAXES_AGE_RULES_CALC = [
  COUNTRY_CODES.slovenia,
  COUNTRY_CODES.croatia,
  COUNTRY_CODES.germany,
  COUNTRY_CODES.belgium,
];

enum CREDITOR_TYPES {
  individual = 'INDIVIDUAL',
  freelance = 'FREELANCE',
  company = 'COMPANY',
}

const LANGUAGE_OPTIONS = [
  {
    value: LANGUAGES_ISO_3.english,
    label: i18n.t('english'),
    iso2: 'EN',
  },
  {
    value: LANGUAGES_ISO_3.spanish,
    label: i18n.t('spanish'),
    iso2: COUNTRY_CODES.spain,
  },
  {
    value: LANGUAGES_ISO_3.italian,
    label: i18n.t('italian'),
    iso2: COUNTRY_CODES.italy,
  },
  {
    value: LANGUAGES_ISO_3.french,
    label: i18n.t('french'),
    iso2: COUNTRY_CODES.france,
  },
  {
    value: LANGUAGES_ISO_3.russian,
    label: i18n.t('russian'),
    iso2: 'RU',
  },
  {
    value: LANGUAGES_ISO_3.portuguese,
    label: i18n.t('portuguese'),
    iso2: COUNTRY_CODES.portugal,
  },
  {
    value: LANGUAGES_ISO_3.german,
    label: i18n.t('german'),
    iso2: COUNTRY_CODES.germany,
  },
  {
    value: LANGUAGES_ISO_3.hungarian,
    label: i18n.t('hungarian'),
    iso2: COUNTRY_CODES.hungary,
  },
  {
    value: LANGUAGES_ISO_3.czech,
    label: i18n.t('czech'),
    iso2: COUNTRY_CODES.czech,
  },
].sort((prevOption, nextOption) => {
  if (prevOption.label < nextOption.label) return -1;

  if (prevOption.label > nextOption.label) return 1;

  return 0;
});

const DEFAULT_LANGUAGE = LANGUAGE_OPTIONS.find(
  (option) => option.value === LANGUAGES_ISO_3.english,
);

const CREDITOR_TYPES_OPTIONS = {
  [CREDITOR_TYPES.individual]: {
    value: CREDITOR_TYPES.individual,
    label: i18n.t('individual'),
  },
  [CREDITOR_TYPES.freelance]: {
    value: CREDITOR_TYPES.freelance,
    label: i18n.t('freelance'),
  },
  [CREDITOR_TYPES.company]: {
    value: CREDITOR_TYPES.company,
    label: i18n.t('company'),
  },
};

enum SECURITY_DEPOSIT_STATUSES {
  inactive = 'INACTIVE',
  optional = 'OPTIONAL',
  mandatory = 'MANDATORY',
}

enum SECURITY_DEPOSIT_PROCESS_STATUSES {
  new = 'NEW',
  canceled = 'CANCELED',
  released = 'RELEASED',
  confirmed = 'CONFIRMED',
  secureWaiting = 'SECURE_WAITING',
  authCodeReceived = 'AUTH_CODE_RECEIVED',
}

enum SECURITY_DEPOSIT_DISPLAY_STATUSES {
  pending = 'pending',
  released = 'released',
  onHold = 'on_hold',
  charged = 'charged',
}

const ZERO_DEPOSIT = '0.00';
const MAX_DEPOSIT_AMOUNT = 1000;
const MIN_DEPOSIT_AMOUNT = 0.03;

enum STAT_ACCOUNTS_TYPES {
  IDEV = 'DEID',
}

enum AGGREGATED_RESERVATION_PAYMENTS_STATUSES {
  paid = 'PAID',
  unpaid = 'UNPAID',
  inactive = 'INACTIVE',
}

enum CURRENCIES {
  eur = 'eur',
  usd = 'usd',
  gbp = 'gbp',
  aed = 'aed',
}

const CURRENCIES_SYMBOL: Record<CURRENCIES, string> = {
  [CURRENCIES.eur]: '€',
  [CURRENCIES.usd]: '$',
  [CURRENCIES.gbp]: '£',
  [CURRENCIES.aed]: 'د.إ',
};

const CURRENCIES_LABELS: Record<CURRENCIES, string> = {
  [CURRENCIES.eur]: `${CURRENCIES_SYMBOL[CURRENCIES.eur]}EUR`,
  [CURRENCIES.usd]: `${CURRENCIES_SYMBOL[CURRENCIES.usd]}USD`,
  [CURRENCIES.gbp]: `${CURRENCIES_SYMBOL[CURRENCIES.gbp]}GBP`,
  [CURRENCIES.aed]: `${CURRENCIES_SYMBOL[CURRENCIES.aed]}AED`,
};
const DEFAULT_CURRENCY = CURRENCIES.usd;

enum PAYMENT_PROVIDERS {
  paycomet = 'PAYCOMET',
  stripe = 'STRIPE',
}

const WS_TEST_URL = 'ws://localhost:1234';

enum UPSELLING_PAYMENTS_STATUS {
  active = 'ACTIVE',
  inactive = 'INACTIVE',
}

const MONTHS = {
  january: {
    label: i18n.t('january'),
    value: '1',
  },
  february: {
    label: i18n.t('february'),
    value: '2',
  },
  march: {
    label: i18n.t('march'),
    value: '3',
  },
  april: {
    label: i18n.t('april'),
    value: '4',
  },
  may: {
    label: i18n.t('may'),
    value: '5',
  },
  june: {
    label: i18n.t('june'),
    value: '6',
  },
  july: {
    label: i18n.t('july'),
    value: '7',
  },
  august: {
    label: i18n.t('august'),
    value: '8',
  },
  september: {
    label: i18n.t('september'),
    value: '9',
  },
  october: {
    label: i18n.t('october'),
    value: '10',
  },
  november: {
    label: i18n.t('november'),
    value: '11',
  },
  december: {
    label: i18n.t('december'),
    value: '12',
  },
};

enum HOUSING_VERIFICATION_TYPE {
  mandatoryDocumentAndSelfie = 'MANDATORY_DOCUMENT_AND_SELFIE',
  mandatoryDocumentOnly = 'MANDATORY_DOCUMENT_ONLY',
  optionalDocumentAndSelfie = 'OPTIONAL_DOCUMENT_AND_SELFIE',
  optionalDocumentOnly = 'OPTIONAL_DOCUMENT_ONLY',
}

enum DAY_NAMES {
  everyday = 'everyday',
  monday = 'MON',
  tuesday = 'TUE',
  wednesday = 'WED',
  thursday = 'THU',
  friday = 'FRI',
  saturday = 'SAT',
  sunday = 'SUN',
}

const DAY_TRANSLATIONS = {
  [DAY_NAMES.everyday]: 'everyday',
  [DAY_NAMES.monday]: 'monday',
  [DAY_NAMES.tuesday]: 'tuesday',
  [DAY_NAMES.wednesday]: 'wednesday',
  [DAY_NAMES.thursday]: 'thursday',
  [DAY_NAMES.friday]: 'friday',
  [DAY_NAMES.saturday]: 'saturday',
  [DAY_NAMES.sunday]: 'sunday',
};

const EUR_PAYMENT_METHOD = {
  card: {
    value: "CARD",
    label: i18n.t('credit_debit_card'),
  },
  sepa: {
    value: "SEPA_DEBIT",
    label: i18n.t('sepa'),
  }
};

enum RESERVATION_FEATURES {
  identityVerification = 'identityVerification',
  payments = 'payments',
  deposit = 'deposit',
  remoteAccess = 'remoteAccess',
  police = 'police',
  stats = 'stats',
  onlineCheckIn = 'onlineCheckIn',
  tax = 'tax',
}

enum PDF_STATUS {
  complete = 'COM',
  inProgress = 'PRO',
  new = 'NEW',
  error = 'ERR'
}

enum CUSTOM_DOCUMENTS_TYPES {
  contract = 'CONTRACT',
}

enum EMAIL_SENDING_SETTINGS_TYPES {
  checkinOnline = 'CH_ONLINE',
}
const HOURS_OPTIONS = [
  {
    value: 1,
    label: "1:00",
  },
  {
    value: 2,
    label: "2:00",
  },
  {
    value: 3,
    label: "3:00",
  },
  {
    value: 4,
    label: "4:00",
  },
  {
    value: 5,
    label: "5:00",
  },
  {
    value: 6,
    label: "6:00",
  },
  {
    value: 7,
    label: "7:00",
  },
  {
    value: 8,
    label: "8:00",
  },
  {
    value: 9,
    label: "9:00",
  },
  {
    value: 10,
    label: "10:00",
  },
  {
    value: 11,
    label: "11:00",
  },
  {
    value: 12,
    label: "12:00",
  },
  {
    value: 13,
    label: "13:00",
  },
  {
    value: 14,
    label: "14:00",
  },
  {
    value: 15,
    label: "15:00",
  },
  {
    value: 16,
    label: "16:00",
  },
  {
    value: 17,
    label: "17:00",
  },
  {
    value: 18,
    label: "18:00",
  },
  {
    value: 19,
    label: "19:00",
  },
  {
    value: 20,
    label: "20:00",
  },
  {
    value: 21,
    label: "21:00",
  },
  {
    value: 22,
    label: "22:00",
  },
  {
    value: 23,
    label: "23:00",
  },
  {
    value: 24,
    label: "24:00",
  }
];

const PAYMENT_METHOD = {
  card: {
    value: "CARD",
    label: i18n.t('credit_debit_card'),
  }
};

export {
  CUSTOM_DOCUMENTS_TYPES,
  QUERY_CACHE_KEYS,
  DAY_NAMES,
  DAY_TRANSLATIONS,
  HOUSING_VERIFICATION_TYPE,
  RESERVATION_FEATURES,
  UPSELLING_PAYMENTS_STATUS,
  DEFAULT_FILTER_OPTION,
  WS_TEST_URL,
  CURRENCIES,
  CURRENCIES_SYMBOL,
  CURRENCIES_LABELS,
  DEFAULT_CURRENCY,
  MIN_DEPOSIT_AMOUNT,
  MAX_DEPOSIT_AMOUNT,
  ZERO_DEPOSIT,
  CREDITOR_TYPES,
  CREDITOR_TYPES_OPTIONS,
  COUNTRIES_WITH_TAXES_AGE_RULES_CALC,
  TOAST_AUTO_CLOSE_MS,
  SUBSCRIPTION_TRIAL_TYPES,
  SUBSCRIPTION_PRODUCT_TYPES,
  ACCOMMODATION_TYPES,
  DEFAULT_OCCUPIED_ROOMS_NUMBER,
  STATUS_CODES,
  COLLABORATOR_GROUPS,
  GUEST_PLACEHOLDER_ID,
  CARD_BRANDS,
  MAX_NUMBER_OF_GUESTS,
  COUNTRIES_WITH_PURPOSES_OF_STAY,
  GENDERS_OPTIONS,
  EU_MEMBERS,
  STAT_TYPES_WITH_TAX_EXEMPTIONS,
  RESPONSIBLE_ME_OPTION,
  ALL_GROUP_TYPES_OPTIONS,
  GROUP_GROUP_TYPES_OPTIONS,
  SINGLE_GROUP_TYPES_OPTIONS,
  SINGLE_GROUP_TYPE,
  GROUP_GROUP_TYPE,
  FAMILY_GROUP_TYPE,
  TOURIST_GROUP_GROUP_TYPE,
  EXTERNAL_SOURCES_TYPES,
  DIVISION_LVL_1_COUNTRIES,
  STAT_TYPES,
  DISABLED_STAT_TYPES,
  COUNTRIES_WITH_STAT,
  COUNTRIES_WITH_POLICE,
  COUNTRIES_WITH_POLICE_ALLOWED_SEND_AFTER_1_DAY,
  VALIDATION_STATUSES,
  POLICE_TYPES,
  COUNTRY_CODES,
  PATTERNS,
  POLICE_TYPES_OF_DOCUMENT,
  CONTRACT_TYPES,
  CONTRACT_TYPES_OPTIONS,
  COUNTRIES_WITH_CONTRACTS,
  WS_EVENT_TYPES,
  ORIGINS,
  SITEMINDER_ORIGINS,
  ORIGINS_WITH_SUBSCRIPTION,
  PERIODICITY,
  SUBSCRIPTION_TYPES,
  SUBSCRIPTION_INTERVALS_OPTIONS,
  POLICE_CODES,
  STAT_TYPES_WITHOUT_OCCUPIED_ROOMS,
  STAT_TYPES_WITHOUT_CHECK_OUT,
  POLICE_LIKE_STAT_TYPES,
  ORIGINS_LABELS,
  ORIGINS_WITH_POSSIBLE_MAPPING,
  LANGUAGES_ISO_3,
  TOURIST_GROUP_GROUP_TYPE_OPTION,
  HOUSING,
  RESERVATION,
  MIN_MEMBERS_NUMBER,
  REPORT_TYPES,
  COUNTRIES_WITH_POLICE_NOT_ALLOWED_SEND_ONE_GUEST,
  AJPES_MONTHLY_REPORT_STATUSES_OPTION,
  MARKETPLACE_TYPES,
  MARKETPLACE_STATUSES,
  LOCK_VENDOR_OPTIONS,
  LOCK_VENDORS,
  LOCK_TYPES_OPTIONS,
  LOCK_TYPES,
  SUBSCRIPTION_INTERVALS,
  LOCK_ACCOUNT_NAMES_OPTIONS,
  LOCK_ACCESS_TYPES,
  DEFAULT_LANGUAGE,
  SECURITY_DEPOSIT_STATUSES,
  LANGUAGE_OPTIONS,
  SECURITY_DEPOSIT_DISPLAY_STATUSES,
  SECURITY_DEPOSIT_PROCESS_STATUSES,
  STAT_ACCOUNTS_TYPES,
  AGGREGATED_RESERVATION_PAYMENTS_STATUSES,
  ORIGINS_TO_SHOW_BOOKING_PAYMENTS,
  PAYMENT_PROVIDERS,
  MONTHS,
  PDF_STATUS,
  LOCK_PROPERTY_PROTECTIONS,
  LOCK_PROPERTY_PROTECTIONS_OPTIONS,
  EMAIL_SENDING_SETTINGS_TYPES,
  HOURS_OPTIONS,
  PAYMENT_METHOD,
  EUR_PAYMENT_METHOD,
};
