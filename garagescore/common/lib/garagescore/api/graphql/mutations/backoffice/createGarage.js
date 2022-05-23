const graphql = require('graphql');
const slugify = require('@sindresorhus/slugify');

const garageStatus = require('../../../../../../models/garage.status.js');
const { brandLogoFileOnly } = require('../../../../garage/logo');
const { getDefaultScenarioId } = require('../../../../../util/app-config.js');
const { setUserAssignNewGarage } = require('../../../../../../models/user/user-mongo');
const gql_GarageType = require('../../types/garage');
const GarageFields = require('./_common.js');
const GarageTypes = require('../../../../../../models/garage.type');

const {
  getPlaceDetails,
  mergePlaceDetailsWithGarage,
} = require('../../../../../../../common/lib/util/google-place-api.js');

/**
 * assign a user according to their postal code, return true if the postale code match the bizdev area
 * @param {*} area department to assign user
 * @param {*} postalCode postale code from Google Place
 * @param {*} locale country code like fr_BE
 */
const _matchBizdevPostalCode = (area, postalCode, locale) => {
  area.sort((a, b) => parseInt(b.code) - parseInt(a.code));

  if (locale === 'fr_BE' || locale === 'nl_BE') {
    // for Belgium, need to check if postalCode is beetween 2 values
    for (const country of area) {
      if (parseInt(postalCode) >= country.min && parseInt(postalCode) <= country.max) {
        return true;
      }
    }
  } else {
    for (const country of area) {
      const departmentCode = postalCode.slice(0, country.code.length);
      if (country.code === departmentCode) {
        return true;
      }
    }
  }
};

const tva = {
  FR: 20,
  CH: 0,
  BE: 0,
  ES: 21,
  NL: 0,
  US: 6,
  NC: 0,
  MC: 20,
};

module.exports = {
  type: gql_GarageType,
  args: {
    input: {
      type: new graphql.GraphQLInputObjectType({
        name: 'InputCreateGarage',
        fields: GarageFields,
      }),
    },
  },
  async resolve(root, args, req) {
    if (args.input.brandNames.length <= 0) {
      throw new Error('Veuillez sélectionner au moins une marque.');
    } else if (!args.input.billingAccountId) {
      throw new Error('You need to send a billingAccountId to create a garage !');
    } else if (!args.input.name) {
      throw new Error("Veuillez remplir le nom de l'établissement");
    } else if (!args.input.performerId) {
      throw new Error('Veuillez assigner un performance manager');
    }

    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const bizdevs = await req.app.models.User.find({
      where: {
        isBizDev: true,
      },
      fields: {
        id: true,
        area: true,
      },
    });

    function getDefaultRatingType(garageType) {
      return garageType === GarageTypes.VEHICLE_INSPECTION ? 'stars' : 'rating';
    }

    const newGarage = {
      slug: null,
      bizDevId: req.user.getId().toString(),
      type: args.input.type,
      status: garageStatus.TO_CREATE,
      publicDisplayName: args.input.name,
      securedDisplayName: args.input.name,
      externalId: args.input.externalId || '',
      group: args.input.group,
      businessId: args.input.businessId,
      brandNames: args.input.brandNames && args.input.brandNames.length ? args.input.brandNames : ['Autre'],
      googlePlaceId: args.input.googlePlaceId,
      zohoDealUrl: args.input.zohoDealUrl,
      disableZohoUrl: args.input.disableZohoUrl,
      locale: args.input.locale,
      additionalLocales: args.input.additionalLocales || [],
      timezone: args.input.timezone,
      ratingType: args.input.ratingType || getDefaultRatingType(args.input.type),
      isReverseRating: args.input.isReverseRating || false,
      certificateWording: args.input.certificateWording || 'appointment',
      surveySignature: {
        useDefault: true,
        defaultSignature: {
          lastName: args.input.surveySignature.defaultSignature.lastName,
          firstName: args.input.surveySignature.defaultSignature.firstName,
          job: args.input.surveySignature.defaultSignature.job,
        },
      },
      thresholds: {
        alertSensitiveThreshold: {
          maintenance: args.input.apv,
          sale_new: args.input.vn,
          sale_used: args.input.vo,
        },
      },
      subscriptions: {},
      links: [{ name: 'appointment', url: args.input.link }],
      exogenousReviewsConfigurations: {
        Google: {
          token: '',
          error: '',
          lastRefresh: null,
          externalId: '',
          lastError: null,
          lastFetch: null,
          connectedBy: '',
        },
        Facebook: {
          token: '',
          error: '',
          lastRefresh: null,
          externalId: '',
          lastError: null,
          lastFetch: null,
          connectedBy: '',
        },
        PagesJaunes: {
          token: '',
          error: '',
          lastRefresh: null,
          externalId: '',
          lastError: null,
          lastFetch: null,
          connectedBy: '',
        },
      },
      campaignScenarioId: getDefaultScenarioId(args.input.type),
      parent: {
        garageId: args.input.parentGarageId || '',
        shareLeadTicket: {
          enabled: args.input.shareLeadTicket || false,
          NewVehicleSale: args.input.shareLeadTicketNewVehicleSale || false,
          UsedVehicleSale: args.input.shareLeadTicketUsedVehicleSale || false,
        },
      },
      performerId: args.input.performerId,
      monthPriceHistory: [
        {
          month: month === 0 ? 11 : month - 1,
          year: month === 0 ? year - 1 : year,
          active: false,
          price: {
            Maintenance: { code: 7061, price: 0 },
            NewVehicleSale: { code: 7061, price: 0 },
            UsedVehicleSale: { code: 7061, price: 0 },
            Lead: { code: 7061, price: 0 },
            EReputation: { code: 7066, price: 0 },
            VehicleInspection: { code: 7061, price: 0 },
            Analytics: { code: 7061, price: 0 },
            CrossLeads: { code: 7069, price: 0 },
            Automation: { code: 7068, price: 0 },
            Users: { code: 7065, price: 0, nbUsers: 0 },
            xLeadSource: { code: 7069, price: 0 },
          },
        },
      ],
      allowReviewCreationFromContactTicket: args.input.allowReviewCreationFromContactTicket,
      enableCrossLeadsSelfAssignCallAlert: args.input.enableCrossLeadsSelfAssignCallAlert,
    };

    // get all google place details
    mergePlaceDetailsWithGarage(newGarage, await getPlaceDetails(newGarage));

    const postalCode = newGarage.googlePlace && newGarage.googlePlace.postalCode;
    for (let i = 0; i < bizdevs.length; i++) {
      // Assign Bizdev
      let find = false;
      if (bizdevs[i].area) {
        if (['fr_BE', 'nl_BE'].includes(args.input.locale)) {
          // Belgique
          find = _matchBizdevPostalCode(bizdevs[i].area['belgium'], postalCode, args.input.locale);
        } else if (['fr_FR', 'fr_NC'].includes(args.input.locale)) {
          // France
          find = _matchBizdevPostalCode(bizdevs[i].area['france'], postalCode, args.input.locale);
        } else if (['ca_ES', 'es_ES'].includes(args.input.locale)) {
          // Espagne
          find = _matchBizdevPostalCode(bizdevs[i].area['spain'], postalCode, args.input.locale);
        }
        if (find) {
          newGarage.bizDevId = bizdevs[i].id;
          break;
        }
      }
    }

    newGarage.logoEmail = newGarage.brandNames.map((b) => brandLogoFileOnly(b, 60));
    newGarage.logoDirectoryPage = newGarage.brandNames.map((b) => brandLogoFileOnly(b, 90));
    if (args.input.locale) {
      newGarage.tva = tva[args.input.locale.substr(-2)]; // substring for get 2 last letter like FR in fr_FR
    } else {
      newGarage.tva = tva.FR; // set FR tva if no locale
    }

    const billingAccount = await req.app.models.BillingAccount.findById(args.input.billingAccountId, {
      include: ['garages'],
    });
    if (!billingAccount) {
      throw new Error('billingAccountId requried.');
    }

    newGarage.slug = `${slugify(args.input.brandNames[0].toLowerCase())}-${slugify(
      (newGarage.googlePlace.city && newGarage.googlePlace.city.toLowerCase()) || 'unknowncity'
    )}`;
    const duplicateSlugs = await req.app.models.Garage.find({ where: { slug: newGarage.slug } });
    const garage = await billingAccount.garages.create(newGarage);

    // Now we need to add this to GS users
    await setUserAssignNewGarage(req.app, garage.getId());

    if (duplicateSlugs.length) {
      // Slug is already taken, we'll add the garageId to it
      return garage.updateAttributes({ slug: `${newGarage.slug}-${garage.id}` });
    }

    return garage;
  },
};
