const app = require('../../server/server');
const {
  ExportTypes,
  DataTypes,
  LocaleTypes,
  ServiceMiddleMans,
  ServiceCategories,
} = require('../../frontend/utils/enumV2');
const GarageHistoryPeriod = require('../../common/models/garage-history.period');
const gsEmail = require('../../common/lib/util/email');
const Validate = require('../../common/lib/util/cockpit-exports-configuration-validation');
const { ObjectId } = require('mongodb');
const UserAuthorizationTypes = require('../../common/models/user-autorization');
const GarageSubscriptionTypes = require('../../common/models/garage.subscription.type');
const fieldsHandler = require('../../common/lib/garagescore/cockpit-exports/fields/fields-handler');

const reset = process.argv.includes('--reset');
const UPDATE_EXISTING_FRONT_DESK_USERS = process.argv.includes('--updateFrontDeskUsers');
//TODO : remove
const alreadyPrinted = [];
const MISSING = (fieldName) => {
  if (!alreadyPrinted.includes(fieldName)) {
    console.log('\x1b[31m', `[MISSING] : ${fieldName}`, '\x1b[0m');
    alreadyPrinted.push(fieldName);
  }
  return 'BD_COM__GARAGE';
};

const PREDEFINED_EXPORTS_CONFIGURATIONS = [
  /*  {
    /!* the script will check that the user has all the authorizations listed *!/
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT],
    /!* the script will check that the user has at least 1 garage with the all listed subscriptions *!/
    GARAGE_SUBSCRIPTIONS: [],
    name: {
      fr: 'Qualité atelier',
      en: 'Workshop quality',
      es: 'Calidad del taller',
      ca: 'Qualitat del taller',
      nl: 'Werkplaatskwaliteit',
    },
    exportType: ExportTypes.GARAGES,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    dataTypes: [DataTypes.MAINTENANCE],
    garageIds: ['All'],
    /!* userId will be inserted *!/
    userId: '',
    /!* user email will be inserted *!/
    recipients: [],
    fields: [
      'BG_COM__GARAGE',
      'BG_CON__SURVEYED_COUNT',
      'BG_SAT__REVIEWS_COUNT',
      'BG_SAT__REVIEWS_COUNT',
      'BG_SAT__ANSWERING_PCT',
      'BG_SAT__NPS',
      'BG_SAT__SCORE',
      'BG_SAT__PROMOTORS_COUNT',
      'BG_SAT__PROMOTORS_PCT',
      'BG_SAT__DETRACTORS_COUNT',
      'BG_SAT__DETRACTORS_PCT',
      'BG_CON__IMPORTED_COUNT',
      'BG_CON__VALID_EMAILS_COUNT',
      'BG_CON__VALID_EMAILS_PCT',
      'BG_UNS__SAVED_COUNT',
      'BG_UNS__SAVED_PCT',
    ],
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_SATISFACTION],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.MAINTENANCE],
    name: {
      fr: 'Qualité ventes Vn',
      en: 'Sales quality Nv',
      es: 'Calidad de ventas Vn',
      ca: 'Qualitat de vendes Vn',
      nl: 'Verkoopkwaliteit Vn',
    },
    exportType: ExportTypes.GARAGES,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    dataTypes: [DataTypes.NEW_VEHICLE_SALE],
    garageIds: ['All'],
    userId: '',
    recipients: [],
    fields: [
      'BG_COM__GARAGE',
      'BG_CON__SURVEYED_COUNT',
      'BG_SAT__REVIEWS_COUNT',
      'BG_SAT__REVIEWS_COUNT',
      'BG_SAT__ANSWERING_PCT',
      'BG_SAT__NPS',
      'BG_SAT__SCORE',
      'BG_SAT__PROMOTORS_COUNT',
      'BG_SAT__PROMOTORS_PCT',
      'BG_SAT__DETRACTORS_COUNT',
      'BG_SAT__DETRACTORS_PCT',
      'BG_CON__IMPORTED_COUNT',
      'BG_CON__VALID_EMAILS_COUNT',
      'BG_CON__VALID_EMAILS_PCT',
      'BG_UNS__SAVED_COUNT',
      'BG_UNS__SAVED_PCT',
    ],
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_SATISFACTION],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.MAINTENANCE],
    name: {
      fr: 'Qualité ventes Vo',
      en: 'Sales quality Uv',
      es: 'Calidad de ventas Vo',
      ca: 'Qualitat de vendes Vo',
      nl: 'Verkoopkwaliteit Vo',
    },
    exportType: ExportTypes.GARAGES,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    dataTypes: [DataTypes.USED_VEHICLE_SALE],
    garageIds: ['All'],
    userId: '',
    recipients: [],
    fields: [
      'BG_COM__GARAGE',
      'BG_CON__SURVEYED_COUNT',
      'BG_SAT__REVIEWS_COUNT',
      'BG_SAT__REVIEWS_COUNT',
      'BG_SAT__ANSWERING_PCT',
      'BG_SAT__NPS',
      'BG_SAT__SCORE',
      'BG_SAT__PROMOTORS_COUNT',
      'BG_SAT__PROMOTORS_PCT',
      'BG_SAT__DETRACTORS_COUNT',
      'BG_SAT__DETRACTORS_PCT',
      'BG_CON__IMPORTED_COUNT',
      'BG_CON__VALID_EMAILS_COUNT',
      'BG_CON__VALID_EMAILS_PCT',
      'BG_UNS__SAVED_COUNT',
      'BG_UNS__SAVED_PCT',
    ],
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_SATISFACTION],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.MAINTENANCE],
    name: {
      fr: 'Qualité atelier',
      en: 'Workshop quality',
      es: 'Calidad del taller',
      ca: 'Qualitat del taller',
      nl: 'Werkplaatskwaliteit',
    },
    exportType: ExportTypes.FRONT_DESK_USERS_DMS,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    dataTypes: [DataTypes.MAINTENANCE],
    garageIds: ['All'],
    userId: '',
    recipients: [],
    frontDeskUsers: [{ frontDeskUserName: 'All', garageId: null }],
    fields: [
      'BF_COM__GARAGE',
      'BF_COM__FRONT_DESK_USER',
      'BF_CON__SURVEYED_COUNT',
      'BF_SAT__REVIEWS_COUNT',
      'BF_SAT__ANSWERING_PCT',
      'BF_SAT__NPS',
      'BF_SAT__SCORE',
      'BF_SAT__PROMOTORS_COUNT',
      'BF_SAT__PROMOTORS_PCT',
      'BF_SAT__DETRACTORS_COUNT',
      'BF_SAT__DETRACTORS_PCT',
      'BF_CON__IMPORTED_COUNT',
      'BF_CON__VALID_EMAILS_COUNT',
      'BF_CON__VALID_EMAILS_PCT',
      // /!*      'BF_UNS__SAVED_COUNT',
      // 'BF_UNS__SAVED_PCT',*!/
    ],
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_SATISFACTION],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.MAINTENANCE],
    name: {
      fr: 'Qualité ventes Vn',
      en: 'Sales quality NV',
      es: 'Calidad de ventas Vn',
      ca: 'Qualitat de vendes Vn',
      nl: 'Verkoopkwaliteit Vn',
    },
    exportType: ExportTypes.FRONT_DESK_USERS_DMS,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    dataTypes: [DataTypes.NEW_VEHICLE_SALE],
    garageIds: ['All'],
    userId: '',
    recipients: [],
    frontDeskUsers: [{ frontDeskUserName: 'All', garageId: null }],
    fields: [
      'BF_COM__GARAGE',
      'BF_COM__FRONT_DESK_USER',
      'BF_CON__SURVEYED_COUNT',
      'BF_SAT__REVIEWS_COUNT',
      'BF_SAT__ANSWERING_PCT',
      'BF_SAT__NPS',
      'BF_SAT__SCORE',
      'BF_SAT__PROMOTORS_COUNT',
      'BF_SAT__PROMOTORS_PCT',
      'BF_SAT__DETRACTORS_COUNT',
      'BF_SAT__DETRACTORS_PCT',
      'BF_CON__IMPORTED_COUNT',
      'BF_CON__VALID_EMAILS_COUNT',
      'BF_CON__VALID_EMAILS_PCT',
      // /!*      'BF_UNS__SAVED_COUNT',
      // 'BF_UNS__SAVED_PCT',*!/
    ],
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_SATISFACTION],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.MAINTENANCE],
    name: {
      fr: 'Qualité ventes Vo',
      en: 'Sales quality UV',
      es: 'Calidad de ventas Vo',
      ca: 'Qualitat de vendes Vo',
      nl: 'Verkoopkwaliteit Vo',
    },
    exportType: ExportTypes.FRONT_DESK_USERS_DMS,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    dataTypes: [DataTypes.USED_VEHICLE_SALE],
    garageIds: ['All'],
    userId: '',
    recipients: [],
    frontDeskUsers: [{ frontDeskUserName: 'All', garageId: null }],
    fields: [
      'BF_COM__GARAGE',
      'BF_COM__FRONT_DESK_USER',
      'BF_CON__SURVEYED_COUNT',
      'BF_SAT__REVIEWS_COUNT',
      'BF_SAT__ANSWERING_PCT',
      'BF_SAT__NPS',
      'BF_SAT__SCORE',
      'BF_SAT__PROMOTORS_COUNT',
      'BF_SAT__PROMOTORS_PCT',
      'BF_SAT__DETRACTORS_COUNT',
      'BF_SAT__DETRACTORS_PCT',
      'BF_CON__IMPORTED_COUNT',
      'BF_CON__VALID_EMAILS_COUNT',
      'BF_CON__VALID_EMAILS_PCT',
      // /!*      'BF_UNS__SAVED_COUNT',
      // 'BF_UNS__SAVED_PCT',*!/
    ],
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_CONTACTS],
    GARAGE_SUBSCRIPTIONS: [
      GarageSubscriptionTypes.MAINTENANCE,
      GarageSubscriptionTypes.NEW_VEHICLE_SALE,
      GarageSubscriptionTypes.USED_VEHICLE_SALE,
      GarageSubscriptionTypes.VEHICLE_INSPECTION,
    ],
    name: {
      fr: 'Coordonnées modifiées',
      en: 'Modified contacts details',
      es: 'Coordenadas modificadas',
      ca: 'Coordenades modificades',
      nl: 'Gewijzigde coördinaten',
    },
    exportType: ExportTypes.CONTACTS_MODIFIED,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    dataTypes: ['All'],
    garageIds: ['All'],
    userId: '',
    recipients: [],
    fields: [
      'BD_COM__GARAGE',
      'BD_SAT__SURVEY_DATE',
      'BD_CON__GENDER',
      'BD_CON__MODIFIED_GENDER',
      'BD_CON__FIRST_NAME',
      'BD_CON__MODIFIED_FIRST_NAME',
      'BD_CON__LAST_NAME',
      'BD_CON__MODIFIED_LAST_NAME',
      'BD_CON__FULLNAME',
      'BD_CON__CITY',
      'BD_CON__ADDRESS',
      'BD_CON__MODIFIED_ADDRESS',
      'BD_CON__POSTAL_CODE',
      'BD_CON__MODIFIED_POSTAL_CODE',
      'BD_CON__EMAIL',
      'BD_CON__MODIFIED_EMAIL',
      'BD_CON__LAST_KNOWN_EMAIL_STATUS',
      'BD_CON__PHONE',
      'BD_CON__MODIFIED_PHONE',
      'BD_CON__LAST_KNOWN_PHONE_STATUS',
      'BD_COM__DATA_TYPE',
      'BD_CON__CAMPAIGN_STATUS',
      'BD_COM__VEHICLE_BRAND',
      'BD_COM__VEHICLE_MODEL',
      'BD_COM__PLATE',
      'BD_COM__VIN',
      'BD_COM__FRONT_DESK_USER',
      'BD_COM__INTERNAL_REFERENCE',
      'BD_SAT__ANSWER',
      'BD_CON__TICKET_STATUS',
      'BD_UNS__STATUS',
      'BD_UNS__IS_RESOLVED',
      'BD_UNS__MANAGER',
      'BD_LEA__STATUS',
      'BD_LEA__MANAGER',
    ],
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_LEADS],
    GARAGE_SUBSCRIPTIONS: [
      GarageSubscriptionTypes.MAINTENANCE,
      GarageSubscriptionTypes.NEW_VEHICLE_SALE,
      GarageSubscriptionTypes.USED_VEHICLE_SALE,
    ],
    name: {
      fr: 'Suivi des leads',
      en: 'Leads followup',
      es: 'Seguimiento de clientes potenciales',
      ca: 'Seguiment de clients potencials',
      nl: 'Leadtracking',
    },
    exportType: ExportTypes.LEADS,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    dataTypes: ['All'],
    garageIds: ['All'],
    userId: '',
    recipients: [],
    fields: [
      'BD_COM__GARAGE',
      'BD_CON__FIRST_NAME',
      'BD_CON__LAST_NAME',
      'BD_CON__FULLNAME',
      'BD_CON__CITY',
      'BD_CON__POSTAL_CODE',
      'BD_COM__VEHICLE_BRAND',
      'BD_COM__VEHICLE_MODEL',
      'BD_COM__PLATE',
      'BD_CON__PHONE',
      'BD_CON__EMAIL',
      'BD_COM__BILLING_DATE',
      'BD_COM__INTERNAL_REFERENCE',
      'BD_COM__FRONT_DESK_USER',
      'BD_LEA__IDENTIFICATION_DATE',
      'BD_SAT__NPS_WORDING',
      'BD_SAT__SCORE',
      'BD_SAT__REVIEW',
      'BD_SAT__ANSWER',
      'BD_SAT__ANSWER_DATE',
      'BD_LEA__MANAGER',
      'BD_LEA__LEAD_TYPE',
      'BD_COM__DATA_TYPE',
      'BD_LEA__SOURCE',
      'BD_LEA__TIMING',
      'BD_LEA__WHISHED_BRAND',
      'BD_LEA__WHISHED_MODEL',
      'BD_LEA__WHISHED_BODY_TYPE',
      'BD_LEA__WHISHED_ENERGY',
      'BD_LEA__BUDGET',
      'BD_LEA__WISHED_FINANCING',
      'BD_LEA__WISHED_TRADE_IN',
      'BD_LEA__MANAGER',
      'BD_LEA__STATUS',
      'BD_LEA__CLOSING_COMMENT',
      'BD_LEA__CLOSING_DATE',
      'BD_LEA__CONVERSION_DATE',
      'BD_LEA__FOLLOWUP_DATE',
      'BD_LEA__FOLLOWUP_STATUS',
      'BD_LEA__FOLLOWUP_RECONTACTED',
      'BD_LEA__FOLLOWUP_SATISFIED',
      'BD_LEA__FOLLOWUP_APPOINTMENT',
    ],
  },*/ /*
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_UNSATISFIED],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.MAINTENANCE],
    name: {
      fr: "Motifs d'Insatisfaction Atelier",
      en: 'Reasons for dissatisfaction Workshop',
      es: 'Razones de insatisfacción Taller',
      ca: 'Motius d’insatisfacció Taller',
      nl: 'Redenen voor ontevredenheid Werkplaats',
    },
    exportType: ExportTypes.UNSATISFIED,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.MAINTENANCE],
    garageIds: ['All'],
    frontDeskUsers: [],
    userId: '',
    recipients: [],
    fields(isVehicleInspection) {
      return [
        'BD_COM__GARAGE',
        'BD_CON__FIRST_NAME',
        'BD_CON__LAST_NAME',
        'BD_CON__FULLNAME',
        'BD_CON__CITY',
        'BD_CON__POSTAL_CODE',
        'BD_COM__VEHICLE_BRAND',
        'BD_COM__VEHICLE_MODEL',
        'BD_COM__PLATE',
        'BD_CON__PHONE',
        'BD_CON__EMAIL',
        'BD_COM__DATA_TYPE',
        'BD_COM__BILLING_DATE',
        'BD_COM__INTERNAL_REFERENCE',
        'BD_UNS__MANAGER',
        'BD_SAT__REVIEW_DATE',
        'BD_SAT__REVIEW',
        'BD_SAT__NPS_WORDING',
        'BD_SAT__SCORE',
        'BD_SAT__REVIEW',
        'BD_SAT__ANSWER',
        'BD_SAT__ANSWER_DATE',
        ...fieldsHandler.getUnsatisfiedParentCriteriasFields([DataTypes.MAINTENANCE], false),
        'BD_UNS__STATUS',
        'BD_UNS__MANAGER',
        'BD_UNS__ELAPSED_TIME',
        'BD_UNS__CLOSING_COMMENT',
        'BD_UNS__CLOSING_DATE',
        'BD_UNS__IS_RESOLVED',
        'BD_UNS__RECONTACTED',
        'BD_UNS__CHANGED_MIND',
      ];
    },
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_UNSATISFIED],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.NEW_VEHICLE_SALE],
    name: {
      fr: "Motifs d'Insatisfaction VN",
      en: 'Reasons for dissatisfaction NV',
      es: 'Razones de insatisfacción VN',
      ca: 'Motius d’insatisfacció VN',
      nl: 'Redenen voor ontevredenheid VN',
    },
    exportType: ExportTypes.UNSATISFIED,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.NEW_VEHICLE_SALE],
    garageIds: ['All'],
    frontDeskUsers: [],
    userId: '',
    recipients: [],
    fields(isVehicleInspection) {
      return [
        'BD_COM__GARAGE',
        'BD_CON__FIRST_NAME',
        'BD_CON__LAST_NAME',
        'BD_CON__FULLNAME',
        'BD_CON__CITY',
        'BD_CON__POSTAL_CODE',
        'BD_COM__VEHICLE_BRAND',
        'BD_COM__VEHICLE_MODEL',
        'BD_COM__PLATE',
        'BD_CON__PHONE',
        'BD_CON__EMAIL',
        'BD_COM__DATA_TYPE',
        'BD_COM__BILLING_DATE',
        'BD_COM__INTERNAL_REFERENCE',
        'BD_UNS__MANAGER',
        'BD_SAT__REVIEW_DATE',
        'BD_SAT__REVIEW',
        'BD_SAT__NPS_WORDING',
        'BD_SAT__SCORE',
        'BD_SAT__REVIEW',
        'BD_SAT__ANSWER',
        'BD_SAT__ANSWER_DATE',
        ...fieldsHandler.getUnsatisfiedParentCriteriasFields([DataTypes.NEW_VEHICLE_SALE], false),
        'BD_UNS__STATUS',
        'BD_UNS__MANAGER',
        'BD_UNS__ELAPSED_TIME',
        'BD_UNS__CLOSING_COMMENT',
        'BD_UNS__CLOSING_DATE',
        'BD_UNS__IS_RESOLVED',
        'BD_UNS__RECONTACTED',
        'BD_UNS__CHANGED_MIND',
      ];
    },
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_UNSATISFIED],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.USED_VEHICLE_SALE],
    name: {
      fr: "Motifs d'Insatisfaction VO",
      en: 'Reasons for dissatisfaction UV',
      es: 'Razones de insatisfacción VO',
      ca: 'Motius d’insatisfacció VO',
      nl: 'Redenen voor ontevredenheid TV',
    },
    exportType: ExportTypes.UNSATISFIED,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.USED_VEHICLE_SALE],
    garageIds: ['All'],
    frontDeskUsers: [],
    userId: '',
    recipients: [],
    fields(isVehicleInspection) {
      return [
        'BD_COM__GARAGE',
        'BD_CON__FIRST_NAME',
        'BD_CON__LAST_NAME',
        'BD_CON__FULLNAME',
        'BD_CON__CITY',
        'BD_CON__POSTAL_CODE',
        'BD_COM__VEHICLE_BRAND',
        'BD_COM__VEHICLE_MODEL',
        'BD_COM__PLATE',
        'BD_CON__PHONE',
        'BD_CON__EMAIL',
        'BD_COM__DATA_TYPE',
        'BD_COM__BILLING_DATE',
        'BD_COM__INTERNAL_REFERENCE',
        'BD_UNS__MANAGER',
        'BD_SAT__REVIEW_DATE',
        'BD_SAT__REVIEW',
        'BD_SAT__NPS_WORDING',
        'BD_SAT__SCORE',
        'BD_SAT__REVIEW',
        'BD_SAT__ANSWER',
        'BD_SAT__ANSWER_DATE',
        ...fieldsHandler.getUnsatisfiedParentCriteriasFields([DataTypes.USED_VEHICLE_SALE], false),
        'BD_UNS__STATUS',
        'BD_UNS__MANAGER',
        'BD_UNS__ELAPSED_TIME',
        'BD_UNS__CLOSING_COMMENT',
        'BD_UNS__CLOSING_DATE',
        'BD_UNS__IS_RESOLVED',
        'BD_UNS__RECONTACTED',
        'BD_UNS__CHANGED_MIND',
      ];
    },
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_UNSATISFIED],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.VEHICLE_INSPECTION],
    name: {
      fr: "Motifs d'Insatisfaction CT",
      en: 'Reasons for dissatisfaction CT',
      es: 'Razones de insatisfacción CT',
      ca: 'Motius d’insatisfacció CT',
      nl: 'Redenen voor ontevredenheid CT',
    },
    exportType: ExportTypes.UNSATISFIED,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.VEHICLE_INSPECTION],
    garageIds: ['All'],
    frontDeskUsers: [],
    userId: '',
    recipients: [],
    fields(isVehicleInspection) {
      return [
        'BD_COM__GARAGE',
        'BD_CON__FIRST_NAME',
        'BD_CON__LAST_NAME',
        'BD_CON__FULLNAME',
        'BD_CON__CITY',
        'BD_CON__POSTAL_CODE',
        'BD_COM__VEHICLE_BRAND',
        'BD_COM__VEHICLE_MODEL',
        'BD_COM__PLATE',
        'BD_CON__PHONE',
        'BD_CON__EMAIL',
        'BD_COM__DATA_TYPE',
        'BD_COM__BILLING_DATE',
        'BD_COM__INTERNAL_REFERENCE',
        'BD_UNS__MANAGER',
        'BD_SAT__REVIEW_DATE',
        'BD_SAT__REVIEW',
        'BD_SAT__NPS_WORDING',
        'BD_SAT__SCORE',
        'BD_SAT__REVIEW',
        'BD_SAT__ANSWER',
        'BD_SAT__ANSWER_DATE',
        ...fieldsHandler.getUnsatisfiedParentCriteriasFields([DataTypes.VEHICLE_INSPECTION], true),
        'BD_UNS__STATUS',
        'BD_UNS__MANAGER',
        'BD_UNS__ELAPSED_TIME',
        'BD_UNS__CLOSING_COMMENT',
        'BD_UNS__CLOSING_DATE',
        'BD_UNS__IS_RESOLVED',
        'BD_UNS__RECONTACTED',
        'BD_UNS__CHANGED_MIND',
      ];
    },
  },*/
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_SATISFACTION],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.NEW_VEHICLE_SALE, GarageSubscriptionTypes.USED_VEHICLE_SALE],
    name: {
      fr: 'Critères de choix des acheteurs VN et VO',
      en: 'Choice criteria for NV and UV buyers',
      es: 'Criterios de elección de los clientes VN y VO',
      ca: "Criteris d'elecció dels clients VN i VO",
      nl: 'Selectiecriteria voor VN en VO kopers',
    },
    exportType: ExportTypes.GARAGES,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.NEW_VEHICLE_SALE, DataTypes.USED_VEHICLE_SALE],
    garageIds: ['All'],
    frontDeskUsers: [],
    userId: '',
    recipients: [],
    fields() {
      return [
        'BG_COM__GARAGE',
        ...ServiceMiddleMans.keys().map((serviceMiddleMan) =>
          ServiceMiddleMans.getProperty(serviceMiddleMan, 'exportColumnKey')
        ),
      ];
    },
  },
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT, UserAuthorizationTypes.ACCESS_TO_SATISFACTION],
    GARAGE_SUBSCRIPTIONS: [GarageSubscriptionTypes.MAINTENANCE],
    name: {
      fr: 'Répartition par types de prestation',
      en: 'Breakdown per type of service',
      es: 'Distribución por tipo de prestación',
      ca: 'Distribució per tipus de prestació',
      nl: 'Uitsplitsing naar soort prestatie',
    },
    exportType: ExportTypes.GARAGES,
    periodId: GarageHistoryPeriod.LAST_QUARTER,
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.MAINTENANCE],
    garageIds: ['All'],
    frontDeskUsers: [],
    userId: '',
    recipients: [],
    fields() {
      return [
        'BG_COM__GARAGE',
        'BG_SAT__SCORE',
        ...ServiceCategories.keys().map((serviceCategory) =>
          ServiceCategories.getProperty(serviceCategory, 'exportColumnKey')
        ),
      ];
    },
  },
];

function exitWithError(msg = 'Error occured') {
  console.log('\x1b[31m', `${msg}`, '\x1b[0m');
  process.exit(1);
}

function validateCustomExportsConfigurations() {
  const fieldsToValidate = ['exportType', 'periodId', 'dataTypes', 'garageIds'];
  /* validate every fields for each export configuration */
  PREDEFINED_EXPORTS_CONFIGURATIONS.forEach((configuration) => {
    /* check that every field is present and pass validation */
    fieldsToValidate.forEach((fieldName) => {
      if (!Validate[fieldName]({ value: configuration[fieldName], exportType: configuration.exportType })) {
        exitWithError(
          `RTFM : Invalid export configuration : "${JSON.stringify(configuration.name)}" for field "${fieldName}"`
        );
      }
    });

    /* check that name is valid and all traductions are present */
    if (!configuration.name || typeof configuration.name !== 'object') {
      exitWithError(
        `Invalid export configuration : missing or invalid name for configuration ${JSON.stringify(configuration.name)}`
      );
    }

    /* check that locales for all the languages are present */
    /* all unique languages  : ['fr', 'en', 'es', 'ca', 'nl'] */
    const requiredLanguages = [
      ...new Set(LocaleTypes.keys().map((locale) => LocaleTypes.getProperty(locale, 'language'))),
    ];
    const languagesInExportConfig = Object.keys(configuration.name);
    requiredLanguages.forEach((language) => {
      if (!languagesInExportConfig.includes(language)) {
        exitWithError(
          `Missing traduction for language : "${language}" in export configuration : ${JSON.stringify(
            configuration.name
          )}`
        );
      }
    });

    /* check that USER_AUTHORIZATIONS exists and is valid */
    if (
      !configuration.USER_AUTHORIZATIONS ||
      !configuration.USER_AUTHORIZATIONS.every((authorization) => UserAuthorizationTypes.hasValue(authorization))
    ) {
      exitWithError(`Invalid export configuration : "${configuration.name}" missing or invalid USER_AUTHORIZATIONS`);
    }

    /* check that GARAGE_SUBSCRIPTIONS exists and is valid*/
    if (
      !configuration.GARAGE_SUBSCRIPTIONS ||
      !configuration.GARAGE_SUBSCRIPTIONS.every((authorization) => GarageSubscriptionTypes.hasValue(authorization))
    ) {
      exitWithError(`Invalid export configuration : "${configuration.name}" missing or invalid GARAGE_SUBSCRIPTIONS`);
    }
  });
}

function getUserGarageSubscriptions(garageSubscriptionsToCheck = [], GARAGES = [], userGarageIds = []) {
  const subscriptionsToCheck = [...garageSubscriptionsToCheck];
  const userGarageSubscriptions = [];
  for (const userGarageId of userGarageIds) {
    /* every subscriptions has been found */
    if (!subscriptionsToCheck.length) {
      break;
    }
    const currentGarageData = GARAGES.find((g) => g._id.toString() === userGarageId.toString());
    if (!currentGarageData || !currentGarageData.subscriptions) {
      continue;
    }
    subscriptionsToCheck.forEach((garageSubscription) => {
      if (
        currentGarageData.subscriptions[garageSubscription] &&
        currentGarageData.subscriptions[garageSubscription].enabled
      ) {
        /* subscription enabled, add it to userGarageSubscriptions*/
        userGarageSubscriptions.push(garageSubscription);
        /* remove subscription from the check list*/
        subscriptionsToCheck.splice(subscriptionsToCheck.indexOf(garageSubscription), 1);
      }
    });
  }
  return userGarageSubscriptions;
}

/* get the first non null locale from a user garage */
function getUserLocaleFromGarage(userGarageIds = [], GARAGES = []) {
  const formatedUserGarageIds = userGarageIds.map((gId) => gId.toString());
  const garage = GARAGES.find((g) => formatedUserGarageIds.includes(g._id.toString()) && g.locale);
  return garage && garage.locale ? garage.locale : 'fr_FR';
}

function getUserCockpitTypeFromGarages(userGarageIds = [], GARAGES = [], cockpitType) {
  const formatedUserGarageIds = userGarageIds.map((gId) => gId.toString());
  const garages = GARAGES.filter((g) => formatedUserGarageIds.includes(g._id.toString()));

  if (cockpitType) {
    return cockpitType;
  }

  if (garages.every((g) => g.type === 'VehicleInspection')) {
    return 'VehicleInspection';
  }

  return null;
}

/*validate that the user has authorization to true for every authorizations defined in field USER_AUTHORIZATIONS in PREDEFINED_EXPORTS_CONFIGURATIONS */
function validateUserAuthorization(userAuthorization = {}, exportConfiguration = {}) {
  return exportConfiguration.USER_AUTHORIZATIONS.every(
    (requiredAuthorization) => userAuthorization[requiredAuthorization] === true
  );
}

/* we need to check that the user has the GARAGE_SUBSCRIPTIONS required for the export config */
function validateGarageSubscription(userGarageSubscriptions = [], GARAGE_SUBSCRIPTIONS = []) {
  return GARAGE_SUBSCRIPTIONS.some((garageSubscription) => userGarageSubscriptions.includes(garageSubscription));
}

app.on('booted', async () => {
  try {
    console.time('create-export-configuration');

    /* Validate PREDEFINED_EXPORTS_CONFIGURATIONS configurations */
    validateCustomExportsConfigurations();

    /* fetch all GARAGES */
    const GARAGES = await app.models.Garage.getMongoConnector()
      .find({}, { projection: { _id: true, subscriptions: true, locale: true, type: true } })
      .toArray();

    /* fetch all users */
    const USERS = await app.models.User.getMongoConnector()
      .find({}, { projection: { _id: true, authorization: true, email: true, garageIds: true, cockpitType: true } })
      .toArray();

    /* get every unique GARAGE_SUBSCRIPTIONS present in export configuration */
    const garageSubscriptionsToCheck = [];
    PREDEFINED_EXPORTS_CONFIGURATIONS.forEach(({ GARAGE_SUBSCRIPTIONS = [] }) => {
      GARAGE_SUBSCRIPTIONS.forEach(
        (subscription) =>
          !garageSubscriptionsToCheck.includes(subscription) && garageSubscriptionsToCheck.push(subscription)
      );
    });

    console.log('\x1b[33m', `${USERS.length} Users to process... Please wait...`, '\x1b[0m');

    const buffer = [];

    for (const { _id, email, authorization = {}, garageIds = [], cockpitType = null } of USERS) {
      /* skip USERS with invalid email*/
      if (!gsEmail.regexp.test(email)) {
        continue;
      }

      /* get all user's garages subscription that are enabled at least once */
      let userGarageSubscriptions = [];
      if (garageSubscriptionsToCheck.length) {
        userGarageSubscriptions = getUserGarageSubscriptions(garageSubscriptionsToCheck, GARAGES, garageIds);
      }

      /* get user's garage locale */
      const userLocale = getUserLocaleFromGarage(garageIds, GARAGES);
      const userCockpitType = getUserCockpitTypeFromGarages(garageIds, GARAGES, cockpitType);

      for (const exportConfiguration of PREDEFINED_EXPORTS_CONFIGURATIONS) {
        /* check if user has the authorizations required for current exportConfiguration */
        if (
          exportConfiguration.USER_AUTHORIZATIONS.length &&
          !validateUserAuthorization(authorization, exportConfiguration)
        ) {
          continue;
        }

        /* check if user has at least one garage with the required subscription */
        if (
          exportConfiguration.GARAGE_SUBSCRIPTIONS.length &&
          !validateGarageSubscription(userGarageSubscriptions, exportConfiguration.GARAGE_SUBSCRIPTIONS)
        ) {
          continue;
        }

        /* translate the export name based on the user's language */
        const userLanguage = LocaleTypes.getPropertyFromValue(userLocale, 'language') || 'fr';
        const translatedName = exportConfiguration.name[userLanguage];
        let fields = exportConfiguration.fields;

        if (typeof fields === 'function') {
          fields = [
            ...fields(
              userCockpitType === 'VehicleInspection' ||
                userGarageSubscriptions.includes(GarageSubscriptionTypes.VEHICLE_INSPECTION)
            ),
          ];
        } else {
          fields = [...fields];
        }

        //delete exportConfiguration.fields;

        const finalCustomExport = {
          exportType: exportConfiguration.exportType,
          periodId: exportConfiguration.periodId,
          dataTypes: exportConfiguration.dataTypes,
          garageIds: exportConfiguration.garageIds,
          name: translatedName,
          userId: new ObjectId(_id),
          recipients: [email],
          fields,
          ...(exportConfiguration.frontDeskUsers && { frontDeskUsers: exportConfiguration.frontDeskUsers }),
          startPeriodId: exportConfiguration.startPeriodId,
          endPeriodId: exportConfiguration.endPeriodId,
          automaticallyGenerated: true,
        };
        /*        delete finalCustomExport.USER_AUTHORIZATIONS;
        delete finalCustomExport.GARAGE_SUBSCRIPTIONS;*/

        /* because inserting directly in db avoids all the validations, we make sure that every fields is present */
        /* otherwise if a user try to update this config, he will get an error */
        const areAllRequiredFieldsPresent = Object.keys(Validate).every(
          (field) => field === 'id' || field === 'frontDeskUsers' || Object.keys(finalCustomExport).includes(field)
        );
        if (!areAllRequiredFieldsPresent) {
          exitWithError(
            `Missing required field "userId" or "recipients" in PREDEFINED_EXPORTS_CONFIGURATIONS : ${JSON.stringify(
              finalCustomExport.name
            )}`
          );
        }

        if (!translatedName || !Validate.name({ value: translatedName })) {
          exitWithError(
            `Invalid field "name" with value "${translatedName}" with locale "${userLocale}" for PREDEFINED_EXPORTS_CONFIGURATIONS ${JSON.stringify(
              finalCustomExport.name
            )}`
          );
        }

        /* we now validate userId and recipients that have been skipped in the first validation */
        if (!Validate.userId({ value: finalCustomExport.userId }) || typeof finalCustomExport.userId === 'string') {
          exitWithError(
            `Invalid field "userId" with value ${
              finalCustomExport.userId
            } for PREDEFINED_EXPORTS_CONFIGURATIONS ${JSON.stringify(finalCustomExport.name)}`
          );
        }
        if (!Validate.recipients({ value: finalCustomExport.recipients })) {
          exitWithError(
            `Invalid field "recipients" with value ${JSON.stringify(
              finalCustomExport.recipients
            )} for PREDEFINED_EXPORTS_CONFIGURATIONS ${finalCustomExport.name}`
          );
        }

        buffer.push(finalCustomExport);
      }
    }

    if (reset) {
      console.log('\x1b[33m', 'Reset mode is ON cleaning all existing documents first... Please wait...', '\x1b[0m');
      const deleteManyRes = await app.models.CockpitExportConfiguration.getMongoConnector().deleteMany({
        automaticallyGenerated: true,
      });
      console.log('\x1b[33m', `Removed ${deleteManyRes.deletedCount} documents`, '\x1b[0m');
    }

    if (UPDATE_EXISTING_FRONT_DESK_USERS) {
      console.log('\x1b[33m', 'Update mode is ON updating all existing documents ... Please wait...', '\x1b[0m');
      const updateRes = await app.models.CockpitExportConfiguration.getMongoConnector().updateMany(
        {
          exportType: ExportTypes.FRONT_DESK_USERS_DMS,
          automaticallyGenerated: false,
        },
        { $set: { frontDeskUsers: [{ frontDeskUserName: 'All', garageId: null }] } }
      );
      console.log('\x1b[33m', `Updated ${updateRes.modifiedCount} documents`, '\x1b[0m');
    }

    console.log('\x1b[33m', `${buffer.length} Documents to insert... Please wait...`, '\x1b[0m');
    const res = await app.models.CockpitExportConfiguration.getMongoConnector().insertMany(buffer);

    console.log('\x1b[32m', `${res.insertedCount} Documents have been inserted`, '\x1b[0m');
    console.log('\x1b[32m', `Done, Bye`, '\x1b[0m');
    console.timeEnd('create-export-configuration');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
