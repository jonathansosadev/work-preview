// Enum refactoring to help synchronizing front and back + additionnal properties

// Contacts
const ContactTypes = require('./enums/contactTypes.json');
const ContactCampaignStatuses = require('./enums/contactCampaignStatuses.json');
const ContactCampaignEmailStatuses = require('./enums/contactCampaignEmailStatuses.json');
const ContactCampaignPhoneStatuses = require('./enums/contactCampaignPhoneStatuses.json');
// Garages
const GarageTypes = require('./enums/garages/garageTypes.json');
const GaragesTest = require('./enums/garages/garagesTest.json');
const GaragesAlerts = require('./enums/garages/garagesAlerts.json');
const GaragesReportConfigs = require('./enums/garages/garagesReportConfigs.json');
const GarageHistoryTypes = require('./enums/garages/garageHistoryTypes.json');
const GarageSubscriptionTypes = require('./enums/garages/garageSubscriptionTypes.json');
const GarageSubscriptions = require('./enums/garages/garageSubscriptions.json');
const GarageStatuses = require('./enums/garages/garageStatuses.json');
const AutoBrands = require('./enums/brands/autoBrands.json');
const CaravanBrands = require('./enums/brands/caravanBrands.json');
const MotoBrands = require('./enums/brands/motoBrands.json');
const OtherBrands = require('./enums/brands/otherBrands.json');

// Datas
const DataTypes = require('./enums/dataTypes.json');
const LeadSaleTypes = require('./enums/leadSaleType.json');
const SourceTypes = require('./enums/sourceTypes.json');
const TicketActionNames = require('./enums/ticketActionNames.json');
const LeadTicketRequestTypes = require('./enums/leadTicketRequestTypes.json');
const LeadTicketMissedReasons = require('./enums/lead-ticket-missed-reasons.json');
const UnsatisfiedTicketClaimReasons = require('./enums/unsatisfied-ticket-claim-reasons.json');
const UnsatisfiedTicketProvidedSolutions = require('./enums/unsatisfied-ticket-provided-solutions.json');
const ServiceMiddleMans = require('./enums/serviceMiddleMans.json');
const ServiceCategories = require('./enums/serviceCategories.json');
const OptionResponse = require('./enums/optionResponse.json');
const RatingCategories = require('./enums/ratingCategories.json');
const StepResponse = require('./enums/stepResponse.json');

// Automation
const AutomationCampaignStatuses = require('./enums/automationCampaignStatuses.json');
const AutomationCampaignTargets = require('./enums/automationCampaignTargets.json');
const AutomationCampaignsEventsType = require('./enums/automationCampaignsEventsType.json');
// Responses
const ResponsesTypes = require('./enums/responsesTypes.json');
const AutomationCampaignTypes = require('./enums/automationCampaignTypes.json');
// Exports
const ExportTypes = require('./enums/exports/exportTypes.json');
const ExportCategories = require('./enums/exports/exportCategories.json');
const ShortcutExportTypes = require('./enums/exports/shortcutExportTypes.json');
const ExportFrequencies = require('./enums/exports/exportFrequencies.json');
const ExportPeriods = require('./enums/exports/exportPeriods.json');
const PredefinedExportTypes = require('./enums/exports/predefinedExportTypes.json');
// Charts
const ChartConfigPages = require('./enums/charts/chartConfigPages');
const ChartConfigViews = require('./enums/charts/chartConfigViews.json');
const ChartConfigFormats = require('./enums/charts/chartConfigFormats.json');
// Jobs
const JobStatuses = require('./enums/jobStatuses.json');
const JobTypes = require('./enums/jobTypes.json');
// Locale
const LocaleTypes = require('./enums/localeTypes.json');
// Users
const UserRoles = require('./enums/userRoles.json');
const UserLastCockpitOpenAt = require('./enums/userLastCockpitOpenAt.json');
const UserAuthorization = require('./enums/userAuthorization.json');
// Menu
const MenuCodes = require('./enums/menuCodes.json');
// KPI
const KpiTypes = require('./enums/kpiTypes.json');
// Icons
const IconsTypes = require('./enums/iconsTypes');
// API
const ExternalApi = require('./enums/externalApi.json');
// Survey
const SurveyPageTypes = require('./enums/surveyPageTypes');

const { log, FED } = require('../../common/lib/util/log');

const enums = {
  // Contacts
  ContactTypes,
  ContactCampaignStatuses,
  ContactCampaignEmailStatuses,
  ContactCampaignPhoneStatuses,
  // Garages
  GarageTypes,
  GaragesTest,
  AutoBrands,
  CaravanBrands,
  MotoBrands,
  OtherBrands,
  GaragesAlerts,
  GaragesReportConfigs,
  GarageHistoryTypes,
  GarageSubscriptionTypes,
  GarageSubscriptions,
  GarageStatuses,
  // Datas
  DataTypes,
  LeadSaleTypes,
  SourceTypes,
  TicketActionNames,
  LeadTicketRequestTypes,
  LeadTicketMissedReasons,
  UnsatisfiedTicketClaimReasons,
  UnsatisfiedTicketProvidedSolutions,
  ServiceMiddleMans,
  ServiceCategories,
  OptionResponse,
  RatingCategories,
  StepResponse,
  // Automation
  AutomationCampaignStatuses,
  AutomationCampaignTargets,
  AutomationCampaignsEventsType,
  AutomationCampaignTypes,
  // Responses
  ResponsesTypes,
  // Charts
  ChartConfigPages,
  ChartConfigViews,
  ChartConfigFormats,
  // Exports
  ExportTypes,
  ExportCategories,
  ShortcutExportTypes,
  ExportFrequencies,
  ExportPeriods,
  PredefinedExportTypes,
  // Jobs
  JobStatuses,
  JobTypes,
  // Locale
  LocaleTypes,
  // Users
  UserRoles,
  UserLastCockpitOpenAt,
  UserAuthorization,
  // Menu
  MenuCodes,
  // KPI
  KpiTypes,
  // Icons
  IconsTypes,
  // API
  ExternalApi,
  // Survey
  SurveyPageTypes
};

function Enum(obj, staticMethods) {
  const keysByValue = new Map();
  const keys = Object.keys(obj);
  const values = [];
  const EnumLookup = (value) => keysByValue.get(value);

  for (const key of keys) {
    EnumLookup[key] = obj[key].value;
    keysByValue.set(EnumLookup[key], key);
    values.push(obj[key].value);
  }
  EnumLookup.keys = () => keys;
  EnumLookup.toString = () => JSON.stringify(obj);
  EnumLookup.toJSON = () => obj;
  EnumLookup.toObject = () => {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = obj[key].value;
      return acc;
    }, {});
  };
  EnumLookup.type = 'string'; // for Loopback type définition
  EnumLookup.values = () => values;
  EnumLookup.entries = () => {
    return Object.keys(obj).reduce((acc, key) => {
      acc.push([key, obj[key].value]);
      return acc;
    }, []);
  };
  EnumLookup.hasValue = (value) => values.includes(value);
  if (staticMethods) {
    Object.keys(staticMethods).forEach((key) => {
      EnumLookup[key] = staticMethods[key];
    });
  }
  EnumLookup.getProperty = (enumKey, propertyName) => {
    if (!obj[enumKey]) {
      log.error(FED, `Enum ${enumKey} doesn't exist.`);
    }
    return obj[enumKey].properties[propertyName];
  };
  EnumLookup.getPropertyOrValue = (enumKey, propertyName) => {
    if (!obj[enumKey]) {
      log.error(FED, `getPropertyOrValue - Enum ${enumKey} doesn't exist.`);
      return null;
    }
    if (!obj[enumKey].properties[propertyName]) {
      return obj[enumKey].value;
    }
    return obj[enumKey].properties[propertyName];
  };
  EnumLookup.getPropertyFromValue = (enumValue, propertyName) => {
    const enumKey = keysByValue.get(enumValue);

    if (!obj[enumKey]) {
      log.error(FED, `getPropertyFromValue - Enum ${enumValue} doesn't exist.`);
      return null;
    }
    return obj[enumKey].properties[propertyName];
  };
  EnumLookup.valuesWithFilter = (propertyName, propertyValue) => {
    return values.filter((value) => {
      const enumKey = keysByValue.get(value);

      if (!obj[enumKey]) {
        log.error(FED, `valuesWithFilter - Enum ${value} doesn't exist.`);
      }
      return obj[enumKey].properties[propertyName] === propertyValue;
    });
  };
  EnumLookup.translations = (language) => {
    if (!EnumLookup.displayName) return obj;
    const formatted = {};
    keys.forEach((k) => {
      formatted[k] = {
        value: EnumLookup[k],
        name: EnumLookup.displayName(EnumLookup[k], language),
      };
    });
    return formatted;
  };
  EnumLookup.isSupported = EnumLookup.hasValue;

  // Return a function with all your enum properties attached.
  // Calling the function with the value will return the key.
  return Object.freeze(EnumLookup);
}

const allFormattedEnums = {};

for (const key of Object.keys(enums)) {
  allFormattedEnums[key] = new Enum(enums[key]);
}

module.exports = allFormattedEnums;
