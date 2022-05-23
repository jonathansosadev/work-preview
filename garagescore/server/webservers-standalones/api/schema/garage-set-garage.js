const { promisify } = require('util');
const { brandLogoFileOnly } = require('../../../../common/lib/garagescore/garage/logo');
const AlertTypes = require('../../../../common/models/alert.types.js');
const ContactService = require('../../../../common/lib/garagescore/contact/service.js');
const ContactType = require('../../../../common/models/contact.type.js');
const publicApi = require('../../../../common/lib/garagescore/api/public-api');
const { getPlaceDetails, mergePlaceDetailsWithGarage } = require('../../../../common/lib/util/google-place-api.js');
const { ObjectId } = require('mongodb');

const { AuthenticationError, UserInputError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { SIMON, log } = require('../../../../common/lib/util/log');
const { getDefaultRatingType, updateFromObject } = require('../../../../common/models/garage/garage-methods.js');

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

const typePrefix = 'GarageSetGarage';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.GarageSetGarage.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    garageUpdated: Boolean
  }

  input ${typePrefix}GarageModifications {
    type: String
    name: String
    externalId: String
    group: String
    businessId: String
    brandNames: [String]
    performerId: String
    googlePlaceId: String
    zohoDealUrl: String
    disableZohoUrl: Boolean
    locale: String
    additionalLocales: [String]
    timezone: String
    ratingType: String
    isReverseRating: Boolean
    certificateWording: String
    thresholds: ${typePrefix}Thresholds
    surveySignature: ${typePrefix}SurveySignature
    link: String
    apv: Int
    vn: Int
    vo: Int
    parentGarageId: String
    shareLeadTicket: Boolean
    shareLeadTicketNewVehicleSale: Boolean
    shareLeadTicketUsedVehicleSale: Boolean
    allowReviewCreationFromContactTicket: Boolean
    enableCrossLeadsSelfAssignCallAlert: Boolean
    leadsVisibleToEveryone: Boolean
  }

  input ${typePrefix}Thresholds {
    alertSensitiveThreshold: ${typePrefix}AlertSensitiveThresholds
  }
  input ${typePrefix}AlertSensitiveThresholds {
    maintenance: Int
    sale_new: Int
    sale_used: Int
  }

  input ${typePrefix}SurveySignature {
    defaultSignature: ${typePrefix}defaultSignature
  }
  input ${typePrefix}defaultSignature {
    lastName: String
    firstName: String
    job: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    GarageSetGarage: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        const data = {
          type: args.garagesModifications.type,
          publicDisplayName: args.garagesModifications.name,
          securedDisplayName: args.garagesModifications.name,
          externalId: args.garagesModifications.externalId || '',
          group: args.garagesModifications.group,
          businessId: args.garagesModifications.businessId,
          brandNames:
            args.garagesModifications.brandNames && args.garagesModifications.brandNames.length
              ? args.garagesModifications.brandNames
              : ['Autre'],
          googlePlaceId: args.garagesModifications.googlePlaceId,
          zohoDealUrl: args.garagesModifications.zohoDealUrl,
          disableZohoUrl: args.garagesModifications.disableZohoUrl,
          locale: args.garagesModifications.locale,
          additionalLocales: args.garagesModifications.additionalLocales,
          timezone: args.garagesModifications.timezone,
          ratingType: args.garagesModifications.ratingType || getDefaultRatingType(args.garagesModifications.type),
          isReverseRating: args.garagesModifications.isReverseRating || false,
          certificateWording: args.garagesModifications.certificateWording || 'appointment',
          thresholds: {
            alertSensitiveThreshold: {
              maintenance: args.garagesModifications.apv,
              sale_new: args.garagesModifications.vn,
              sale_used: args.garagesModifications.vo,
            },
          },
          'surveySignature.defaultSignature': {
            lastName: args.garagesModifications.surveySignature.defaultSignature.lastName,
            firstName: args.garagesModifications.surveySignature.defaultSignature.firstName,
            job: args.garagesModifications.surveySignature.defaultSignature.job,
          },
          links: [{ name: 'appointment', url: args.garagesModifications.link }], // Default
          parent: {
            garageId: args.garagesModifications.parentGarageId || '',
            shareLeadTicket: {
              enabled: args.garagesModifications.shareLeadTicket || false,
              NewVehicleSale: args.garagesModifications.shareLeadTicketNewVehicleSale || false,
              UsedVehicleSale: args.garagesModifications.shareLeadTicketUsedVehicleSale || false,
            },
          },
          allowReviewCreationFromContactTicket: args.garagesModifications.allowReviewCreationFromContactTicket,
          enableCrossLeadsSelfAssignCallAlert: args.garagesModifications.enableCrossLeadsSelfAssignCallAlert,
          leadsVisibleToEveryone: args.garagesModifications.leadsVisibleToEveryone,
        };

        if (!ObjectId.isValid(args.id)) {
          throw new UserInputError(`ObjectId ${args.id} is not valid.`);
        }
        const garage = await app.models.Garage.getMongoConnector().findOne(
          { _id: new ObjectId(args.id) },
          { _id: true }
        );
        if (!garage) {
          throw new UserInputError(`Garage with id ${args.id} not found.`);
        }

        // ----------------------------------
        // Get google place details
        if (data.googlePlaceId !== garage.googlePlaceId && data.googlePlaceId) {
          mergePlaceDetailsWithGarage(garage, await getPlaceDetails(data), data);
        }
        //-----------------------------------

        data.logoEmail = data.brandNames.map((b) => brandLogoFileOnly(b, 60));
        data.logoDirectoryPage = data.brandNames.map((b) => brandLogoFileOnly(b, 90));
        data.tva =
          tva[
            args.garagesModifications.locale.substring(
              args.garagesModifications.locale.length - 2,
              args.garagesModifications.locale.length
            )
          ]; // substring for get 2 last letter like FR in fr_FR

        if (
          data.parent &&
          data.parent.garageId &&
          data.parent.shareLeadTicket &&
          data.parent.shareLeadTicket.enabled &&
          (!garage.parent || !garage.parent.shareLeadTicket || !garage.parent.shareLeadTicket.enabled)
        ) {
          try {
            const fields = { id: true, email: true, fullName: true };
            const subscribers = await app.models.Garage.getUsersForGarageWithoutCusteedUsers(
              data.parent.garageId,
              fields
            );
            for (const user of subscribers) {
              await promisify(ContactService.prepareForSend)({
                to: user.email,
                recipient: user.fullName,
                from: 'no-reply@custeed.com',
                sender: 'GarageScore',
                type: ContactType.ALERT_EMAIL,
                payload: {
                  alertType: AlertTypes.NEW_R2,
                  garageId: data.parent.garageId,
                  addresseeId: user.getId().toString(),
                  agentId: garage.getId().toString(),
                },
              });
            }
          } catch (err) {
            console.error(err);
          }
        }

        const updatedGarage = await updateFromObject(garage, data, app, publicApi);
        updatedGarage.id = updatedGarage._id;
        return (updatedGarage && { garageUpdated: true }) || { garageUpdated: false };
      } catch (error) {
        log.error(SIMON, error);
        return error;
      }
    },
  },
};
