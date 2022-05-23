const { ExportTypes, PredefinedExportTypes, DataTypes, LocaleTypes } = require('../../../frontend/utils/enumV2');
const UserAuthorizationTypes = require('../../models/user-autorization.js');
const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const GarageSubscriptionTypes = require('../../../common/models/garage.subscription.type');
const fieldsHandler = require('../../../common/lib/garagescore/cockpit-exports/fields/fields-handler');
const { ObjectId } = require('mongodb');

const PREDEFINED_EXPORTS_CONFIGURATIONS = [
  {
    USER_AUTHORIZATIONS: [UserAuthorizationTypes.ACCESS_TO_COCKPIT],
    GARAGE_SUBSCRIPTIONS: [],
    name: {
      fr: 'Qualité atelier',
      en: 'Workshop quality',
      es: 'Calidad del taller',
      ca: 'Qualitat del taller',
      nl: 'Werkplaatskwaliteit',
    },
    exportType: ExportTypes.GARAGES,
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    dataTypes: [DataTypes.MAINTENANCE],
    recipients: [],
    fields() {
      return [...fieldsHandler.getFieldsByPredefinedExportType(PredefinedExportTypes.GARAGES)];
    },
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    dataTypes: [DataTypes.NEW_VEHICLE_SALE],
    recipients: [],
    fields() {
      return [...fieldsHandler.getFieldsByPredefinedExportType(PredefinedExportTypes.GARAGES)];
    },
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    dataTypes: [DataTypes.USED_VEHICLE_SALE],
    recipients: [],
    fields() {
      return [...fieldsHandler.getFieldsByPredefinedExportType(PredefinedExportTypes.GARAGES)];
    },
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    dataTypes: [DataTypes.MAINTENANCE],
    recipients: [],
    frontDeskUsers: [{ frontDeskUserName: 'All', garageId: null, id: 'All', garagePublicDisplayName: null }],
    fields() {
      return [...fieldsHandler.getFieldsByPredefinedExportType(PredefinedExportTypes.FRONT_DESK_USERS_DMS)];
    },
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    dataTypes: [DataTypes.NEW_VEHICLE_SALE],
    recipients: [],
    frontDeskUsers: [{ frontDeskUserName: 'All', garageId: null, id: 'All', garagePublicDisplayName: null }],
    fields() {
      return [...fieldsHandler.getFieldsByPredefinedExportType(PredefinedExportTypes.FRONT_DESK_USERS_DMS)];
    },
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    dataTypes: [DataTypes.USED_VEHICLE_SALE],
    recipients: [],
    frontDeskUsers: [{ frontDeskUserName: 'All', garageId: null, id: 'All', garagePublicDisplayName: null }],
    fields() {
      return [...fieldsHandler.getFieldsByPredefinedExportType(PredefinedExportTypes.FRONT_DESK_USERS_DMS)];
    },
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    dataTypes: ['All'],
    recipients: [],
    fields() {
      return [...fieldsHandler.getFieldsByPredefinedExportType(PredefinedExportTypes.CONTACTS_MODIFIED)];
    },
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    dataTypes: ['All'],
    recipients: [],
    fields() {
      return [...fieldsHandler.getFieldsByPredefinedExportType(PredefinedExportTypes.LEADS)];
    },
  },
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.MAINTENANCE],
    frontDeskUsers: [],
    recipients: [],
    fields(isVehicleInspection) {
      return [
        ...fieldsHandler.getFieldsByPredefinedExportType(
          PredefinedExportTypes.UNSATISFIED,
          DataTypes.MAINTENANCE,
          isVehicleInspection
        ),
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.NEW_VEHICLE_SALE],
    frontDeskUsers: [],
    recipients: [],
    fields(isVehicleInspection) {
      return [
        ...fieldsHandler.getFieldsByPredefinedExportType(
          PredefinedExportTypes.UNSATISFIED,
          DataTypes.MAINTENANCE,
          isVehicleInspection
        ),
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.USED_VEHICLE_SALE],
    frontDeskUsers: [],
    recipients: [],
    fields(isVehicleInspection) {
      return [
        ...fieldsHandler.getFieldsByPredefinedExportType(
          PredefinedExportTypes.UNSATISFIED,
          DataTypes.MAINTENANCE,
          isVehicleInspection
        ),
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
    periodId: GarageHistoryPeriod.LAST_QUARTER_CONFIG,
    garageIds: ['All'],
    startPeriodId: null,
    endPeriodId: null,
    dataTypes: [DataTypes.VEHICLE_INSPECTION],
    frontDeskUsers: [],
    recipients: [],
    fields(isVehicleInspection) {
      return [
        ...fieldsHandler.getFieldsByPredefinedExportType(
          PredefinedExportTypes.UNSATISFIED,
          DataTypes.MAINTENANCE,
          isVehicleInspection
        ),
      ];
    },
  },
];
/**
 * check if the user has subscription and return userSubscription
 * @param {*} garageSubscriptionsToCheck
 * @param {*} GARAGES
 * @param {*} userGarageIds
 * @returns Array
 */
const getUserGarageSubscriptions = (garageSubscriptionsToCheck = [], GARAGES = [], userGarageIds = []) => {
  const subscriptionsToCheck = [...garageSubscriptionsToCheck];
  const userGarageSubscriptions = [];
  for (const userGarageId of userGarageIds) {
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
};

/**
 * get the first non null locale from a user garage
 * @param {*} userGarageIds
 * @param {*} GARAGES
 * @returns string
 */
const getUserLocaleFromGarage = (userGarageIds = [], GARAGES = []) => {
  const formatedUserGarageIds = userGarageIds.map((gId) => gId.toString());
  const garage = GARAGES.find((g) => formatedUserGarageIds.includes(g._id.toString()) && g.locale);
  return garage && garage.locale ? garage.locale : 'fr_FR';
};

const getUserCockpitTypeFromGarages = (userGarageIds = [], GARAGES = [], cockpitType) => {
  const formatedUserGarageIds = userGarageIds.map((gId) => gId.toString());
  const garages = GARAGES.filter((g) => formatedUserGarageIds.includes(g._id.toString()));

  if (cockpitType) {
    return cockpitType;
  }

  if (garages.every((g) => g.type === 'VehicleInspection')) {
    return 'VehicleInspection';
  }

  return null;
};

/**
 * validate that the user has authorization to true for every authorizations defined in field USER_AUTHORIZATIONS in PREDEFINED_EXPORTS_CONFIGURATIONS
 * @param {*} userAuthorization
 * @param {*} exportConfiguration
 * @returns boolean
 */
const validateUserAuthorization = (userAuthorization = {}, exportConfiguration = {}) => {
  return exportConfiguration.USER_AUTHORIZATIONS.every(
    (requiredAuthorization) => userAuthorization[requiredAuthorization] === true
  );
};

/**
 * we need to check that the user has the GARAGE_SUBSCRIPTIONS required for the export config
 * @param {*} userGarageSubscriptions
 * @param {*} GARAGE_SUBSCRIPTIONS
 * @returns boolean
 */
const validateGarageSubscription = (userGarageSubscriptions = [], GARAGE_SUBSCRIPTIONS = []) => {
  return GARAGE_SUBSCRIPTIONS.some((garageSubscription) => userGarageSubscriptions.includes(garageSubscription));
};

/**
 * SETUP EXPORT CONFIGURATIONS
 * @param {*} app
 * @param {*} user
 * @returns Array
 */
const setUserExportConfigurations = async (app, user) => {
  const GARAGES = await app.models.Garage.getMongoConnector()
    .find({}, { projection: { _id: true, subscriptions: true, locale: true, type: true } })
    .toArray();
  /* get every unique GARAGE_SUBSCRIPTIONS present in export configuration */
  const garageSubscriptionsToCheck = [];
  PREDEFINED_EXPORTS_CONFIGURATIONS.forEach(({ GARAGE_SUBSCRIPTIONS = [] }) => {
    GARAGE_SUBSCRIPTIONS.forEach(
      (subscription) =>
        !garageSubscriptionsToCheck.includes(subscription) && garageSubscriptionsToCheck.push(subscription)
    );
  });

  const userGarageSubscriptions = getUserGarageSubscriptions(garageSubscriptionsToCheck, GARAGES, user.garageIds);

  /* get user's garage locale */
  const userLocale = getUserLocaleFromGarage(user.garageIds, GARAGES);
  const userCockpitType = getUserCockpitTypeFromGarages(user.garageIds, GARAGES, user.cockpitType);
  const customExports = [];
  for (const exportConfiguration of PREDEFINED_EXPORTS_CONFIGURATIONS) {
    /* check if user has the authorizations required for current exportConfiguration */
    const hasUserAuthorizations =
      exportConfiguration.USER_AUTHORIZATIONS.length &&
      !validateUserAuthorization(user.authorization, exportConfiguration);
    if (hasUserAuthorizations) {
      continue;
    }

    /* check if user has at least one garage with the required subscription */
    const hasGarageSubscriptions =
      exportConfiguration.GARAGE_SUBSCRIPTIONS.length &&
      !validateGarageSubscription(userGarageSubscriptions, exportConfiguration.GARAGE_SUBSCRIPTIONS);
    if (hasGarageSubscriptions) {
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

    const query = {
      exportType: exportConfiguration.exportType,
      periodId: exportConfiguration.periodId,
      dataTypes: exportConfiguration.dataTypes,
      garageIds: exportConfiguration.garageIds,
      name: translatedName,
      userId: new ObjectId(user.id),
      recipients: [user.email],
      fields,
      ...(exportConfiguration.frontDeskUsers && { frontDeskUsers: exportConfiguration.frontDeskUsers }),
      startPeriodId: exportConfiguration.startPeriodId || null,
      endPeriodId: exportConfiguration.endPeriodId || null,
      automaticallyGenerated: true,
      frequency: 'NONE',
    };
    customExports.push(query);
  }
  return customExports;
};

module.exports = {
  setUserExportConfigurations,
};
