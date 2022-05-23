const { ObjectId } = require('mongodb');

const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const { TIBO, log } = require('../../../../common/lib/util/log');
const { AutomationCampaignStatuses } = require('../../../../frontend/utils/enumV2');
const timeHelper = require('../../../../common/lib/util/time-helper');

const typePrefix = 'automationGetCampaignsForSpecificTarget';

module.exports.typeDef = `
  extend type Query {
    ${queries.AutomationGetCampaignsForSpecificTarget.type}: [${typePrefix}AutomationCampaignList]
  }
  type ${typePrefix}AutomationCampaignList {
    garageId: String,
    garageName: String,
    status: String,
    contactType: String,
    runDate: Date,
    customContentId: String,
    garageLogo: String,
    garageBrand: String
  }
`;

module.exports.resolvers = {
  Query: {
    AutomationGetCampaignsForSpecificTarget: async (obj, args, context) => {
      try {
        const { target, affectedGarageIds } = args;
        const { app } = context;
        const { logged, authenticationError, garageIds, godMode } = context.scope;
        let campaigns = [];
        let garages = [];
        let garagesObject = {};

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        const where = {
          target,
          garageId: { $in: garageIds.map((id) => ObjectId(id)) },
        };
        if (affectedGarageIds && affectedGarageIds.length) {
          where.garageId = { $in: affectedGarageIds.map((id) => ObjectId(id)) };
        }

        campaigns = await app.models.AutomationCampaign.getMongoConnector()
          .find(where, {
            projection: {
              garageId: true,
              status: true,
              contactType: true,
              hidden: true,
              runDayNumber: true,
              customContentId: true,
            },
          })
          .toArray();

        garages = await app.models.Garage.getMongoConnector()
          .find(
            { _id: { $in: campaigns.map((campaign) => campaign.garageId) } },
            { projection: { publicDisplayName: true, _id: true, group: true, logoEmail: true, brandNames: true } }
          )
          .toArray();

        garages.forEach((garage) => {
          garagesObject[garage._id.toString()] = {
            label: `${garage.publicDisplayName}`,
            logo: garage.logoEmail && garage.logoEmail[0],
            brand: garage.brandNames && garage.brandNames[0],
          };
        });
        return campaigns.map((campaign) => {
          const processedCampaign = {
            ...campaign,
            garageBrand: garagesObject[campaign.garageId.toString()].brand,
            garageLogo: garagesObject[campaign.garageId.toString()].logo,
            garageName: garagesObject[campaign.garageId.toString()].label,
            runDate: campaign.runDayNumber && timeHelper.dayNumberToDate(campaign.runDayNumber),
          };
          if (processedCampaign.hidden) {
            processedCampaign.status = AutomationCampaignStatuses.CANCELLED;
          }
          return processedCampaign;
        });
      } catch (error1) {
        log.error(TIBO, error1);
        return [];
      }
    },
  },
};
