/** Render html surveys */

const debug = require('debug')('garagescore:survey:survey-renderer');
const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');
const GarageTypes = require('../../../models/garage.type.js');
const DataTypes = require('../../../models/data/type/data-types');
const SurveyTypes = require('../../../models/data/type/survey-types.js');

const LeadTypes = require('../../../models/data/type/lead-types');
const LeadFinancing = require('../../../models/data/type/lead-financing.js');
const LeadTimings = require('../../../models/data/type/lead-timings');
const LeadSaleTypes = require('../../../models/data/type/lead-sale-types');

const leadFinancingCredit = require('../../../models/data/type/lead-financing-credit.js');
const leadFinancingCashVo = require('../../../models/data/type/lead-financing-cash-vo.js');
const leadFinancingCashVn = require('../../../models/data/type/lead-financing-cash-vn.js');
const leadSaleCategories = require('../../../models/data/type/lead-sale-categories');
const leadDesiredServices = require('../../../models/data/type/lead-desired-services');

const vehicleEnergyTypes = require('../../../models/data/type/vehicle-energytypes');
const reviewDetailedCriterias = require('../../../models/data/type/review-detailed-criterias');
const reviewDetailedSubcriterias = require('../../../models/data/type/review-detailed-subcriterias');
const { getBodyTypesByGarageType } = require('../../../models/data/type/vehicle-bodytypes.js');
const { CylinderTypesForSurvey } = require('../../../models/data/type/cylinder-types.js');
const i18NRenderParameter = require('../../../templates/i18n/i18n-render-parameter');
const { camelToKebab } = require('../../util/app-config.js');
const gsClient = require('../client.js');
const { decrypt } = require('../../../../common/lib/garagescore/survey/survey-id-encryption');
const { AutoBrands, MotoBrands, CaravanBrands, SurveyPageTypes } = require('../../../../frontend/utils/enumV2');

let nunjucksEnv;
const _initNunjucks = function () {
  nunjucksEnv = nunjucks.configure(path.normalize(path.join(__dirname, '../../..', 'templates/')), {
    autoescape: true,
    watch: false,
  });
  nunjucksEnv.addGlobal('lib', {
    client: gsClient,
  });
  nunjucksEnv.addGlobal('gaSurveyKey', process.env.GA_MEASUREMENT_SURVEY_ID);
};

const _getSurveyUrl = (data, garageType, surveyType) => {
  /** GET THE CURRENT SURVEY URL **/
  let fileType = data.type;
  if (!fileType || !garageType) throw new Error("Couldn't find garageType");
  if (!data.getSurveyInProgress()) throw new Error('No survey in progress');
  if (surveyType !== SurveyTypes.SURVEY) {
    // Mean that we are looking for a followup
    fileType = surveyType.replace('survey', '');
    fileType = fileType[0].toLowerCase() + fileType.slice(1); // surveyFollowupUnsatisfied -> followupUnsatisfied
  }
  const templatePath = `survey/${camelToKebab(garageType)}/${camelToKebab(fileType)}.nunjucks`;
  if (!fs.existsSync(`${__dirname}/../../../templates/${templatePath}`)) {
    // If the file doesn't exists, fall back to the Dealership folder
    debug(`Couln't find nunjucks survey: '${templatePath}', falling back to DEALERSHIP ${fileType} nunjucks.`);
    return `survey/${camelToKebab(GarageTypes.DEALERSHIP)}/${camelToKebab(fileType)}.nunjucks`; // FALLBACK URL (COULD BE WANTED)
  }
  return templatePath;
};
// shared render parameters
const _renderParameters = function (protectedId, data, garage) {
  const decrypted = decrypt(protectedId);
  const getManager = () => {
    const checkManager = (manager) => manager && manager.lastName;
    switch (data.type) {
      case DataTypes.MAINTENANCE:
        return checkManager(garage.surveySignature.Maintenance)
          ? garage.surveySignature.Maintenance
          : garage.surveySignature.defaultSignature;
      case DataTypes.NEW_VEHICLE_SALE:
        return checkManager(garage.surveySignature.NewVehicleSale)
          ? garage.surveySignature.NewVehicleSale
          : garage.surveySignature.defaultSignature;
      case DataTypes.USED_VEHICLE_SALE:
        return checkManager(garage.surveySignature.UsedVehicleSale)
          ? garage.surveySignature.UsedVehicleSale
          : garage.surveySignature.defaultSignature;
      default:
        return garage.surveySignature.defaultSignature;
    }
  };

  var languages = [
    { key: 'fr_FR', value: 'Français' },
    { key: 'en_US', value: 'English' },
    { key: 'es_ES', value: 'Castellano' },
    { key: 'nl_BE', value: 'Nederlands' },
    { key: 'it_BE', value: 'Italiano' },
    { key: 'de_DE', value: 'Deutsch' },
    { key: 'ca_ES', value: 'Catalá' },
    { key: 'pt_PT', value: 'Português' },
    { key: 'de_DE', value: 'German' },
    { key: 'nl_NL', value: 'Netherlands' },
    { key: 'it_IT', value: 'Italian' },
    { key: 'sv_SE', value: 'Svenska' },
    { key: 'en_BE', value: 'Belgium' },
  ];

  return {
    id: protectedId,
    surveyType: decrypted.surveyType,
    dataType: data.type,
    customer: JSON.stringify(data.get('customer')),
    vehicle: JSON.stringify({
      make: data.get('vehicle.make.value'),
      model: data.get('vehicle.model.value'),
    }),
    brands: JSON.stringify(
      garage.type === GarageTypes.CARAVANNING
        ? CaravanBrands.values()
        : garage.type === GarageTypes.MOTORBIKE_DEALERSHIP
        ? MotoBrands.values()
        : AutoBrands.values()
    ),
    garage: {
      type: garage.type,
      name: garage.publicDisplayName,
      googlePlaceId: garage.googlePlaceId || '',
      googleCampaignActivated: garage.googleCampaignActivated || false,
      manager: getManager(),
      address: garage.streetAddress,
      city: garage.city,
      postalCode: garage.postalCode,
      locale: garage.locale,
      ratingType: garage.ratingType || 'rating',
      isReverseRating: garage.isReverseRating || false,
    },

    leadTypes: LeadTypes,
    leadFinancing: LeadFinancing,
    leadTimings: LeadTimings,
    leadSaleTypes: LeadSaleTypes,
    leadDesiredServices,
    leadFinancingCredit,
    leadFinancingCashVo,
    leadFinancingCashVn,
    leadSaleCategories,
    leadSaleType: data.get('leadTicket.saleType'),
    vehicleBodyTypes: JSON.stringify(getBodyTypesByGarageType(garage.type)),
    CylinderTypes: JSON.stringify(CylinderTypesForSurvey),
    vehicleEnergyTypes,
    reviewDetailedCriterias,
    reviewDetailedSubcriterias,
    rating: data.rating,
    i18n: i18NRenderParameter,
    languages,
    surveyPageTypes: SurveyPageTypes,
  };
};
// render the survey html
const render = function render(protectedId, surveyType, data, garage) {
  _initNunjucks();
  const renderParameters = _renderParameters(protectedId, data, garage);
  if (!data.getSurveyInProgress()) throw new Error('No survey in progress atm.');
  const foreignResponses = data.get(`${surveyType}.foreignResponses`) || [];
  if (foreignResponses && foreignResponses.length) {
    renderParameters.surveyData = JSON.stringify(
      foreignResponses.reduce((acc, f) => Object.assign(acc, f.payload), {})
    );
  }
  return nunjucksEnv.render(_getSurveyUrl(data, garage.type, surveyType), renderParameters);
};
// render the mobile landing page (only rating)
// we could fusion this code with the other render but we try to keep it simple and have this page without surveyjs
const renderMobileLandingPage = function renderMobileLandingPage(protectedId, data, garage) {
  _initNunjucks();
  const renderParameters = _renderParameters(protectedId, data, garage);
  renderParameters.surveyUrls = data.get('survey.urls');
  renderParameters.surveyUrls.score = [
    ...[...Array(7).keys()].map((i) => `${renderParameters.surveyUrls.unsatisfiedLanding}?score=${i}&source=sms`), // From 0 to 6: unsatisfied landing
    ...[...Array(4).keys()].map((i) => `${renderParameters.surveyUrls.base}?score=${i + 7}&source=sms`), // From 6 to 10 directly to survey
  ];
  const foreignResponses = data.get('survey.foreignResponses') || [];
  if (foreignResponses.length) {
    renderParameters.surveyData = JSON.stringify(
      foreignResponses.reduce((acc, f) => Object.assign(acc, f.payload), {})
    );
  }
  return nunjucksEnv.render('survey/mobile_landing.nunjucks', renderParameters);
};
// render the unsatisfied landing page (only rating)
const renderUnsatisfiedLandingPage = function renderUnsatisfiedLandingPage(protectedId, data, garage) {
  _initNunjucks();
  const renderParameters = _renderParameters(protectedId, data, garage);
  renderParameters.surveyUrls = data.get('survey.urls');
  renderParameters.surveyUrls.score = [...Array(11).keys()].map(
    (i) => `${renderParameters.surveyUrls.base}?score=${i}`
  ); /** Generic **/
  return nunjucksEnv.render('survey/unsatisfied_landing.nunjucks', renderParameters);
};

module.exports = {
  render,
  renderMobileLandingPage,
  renderUnsatisfiedLandingPage,
};
