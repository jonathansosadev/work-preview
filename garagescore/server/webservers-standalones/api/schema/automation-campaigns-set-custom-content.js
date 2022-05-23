const { ObjectID } = require('mongodb');

const { AutomationCampaignTargets } = require('../../../../frontend/utils/enumV2');
const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { FED, log } = require('../../../../common/lib/util/log');
const TimeHelper = require('../../../../common/lib/util/time-helper');

const typePrefix = 'AutomationCampaignsSetCustomContent';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.AutomationCampaignsSetCustomContent.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    result: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    AutomationCampaignsSetCustomContent: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds, godMode, user },
        } = context;

        const {
          target,
          displayName,
          promotionalMessage,
          themeColor,
          dayNumberStart,
          dayNumberEnd,
          noExpirationDate,
          customContentId,
          customUrl,
          customButtonText,
        } = args;

        let affectedGarageIds = args.affectedGarageIds || [];
        // To avoid doubles
        affectedGarageIds = [...new Set(affectedGarageIds)];
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        if (
          !godMode &&
          affectedGarageIds.some((garageId) => !garageIds.map((garageId) => garageId.toString()).includes(garageId))
        ) {
          throw new Error(
            `AutomationCampaignsSetCustomContent ERROR : You're trying to access a garage that does not belong to you`
          );
        }

        if (!AutomationCampaignTargets.hasValue(args.target)) {
          throw new Error(`AutomationCampaignsSetCustomContent ERROR : Unknown target ${args.target}`);
        }

        const today = TimeHelper.dayNumber(new Date());
        if (today >= dayNumberStart && !customContentId) {
          throw new Error(
            `AutomationCampaignsSetCustomContent ERROR : Custom content can't be created for the past ${dayNumberStart}`
          );
        }
        if (dayNumberEnd && dayNumberEnd < dayNumberStart) {
          throw new Error(
            `AutomationCampaignsSetCustomContent ERROR : Custom content, invalid dates (start: ${dayNumberStart}, end: ${dayNumberEnd}`
          );
        }
        if (!dayNumberEnd && !noExpirationDate) {
          throw new Error(
            `AutomationCampaignsSetCustomContent ERROR : Custom content, noexpirationdate not toggled and no dayNumberEnd`
          );
        }

        const whereCampaigns = {
          garageId: { $in: affectedGarageIds.map((e) => new ObjectID(e)) },
          target,
        };

        // We check if one of the campaigns already have a custom content
        const AutomationCampaignConnector = app.models.AutomationCampaign.getMongoConnector();
        let alreadyCustomContentCampaigns = await AutomationCampaignConnector.find(whereCampaigns, {
          projection: {
            _id: true,
            customContentId: true,
          },
        }).toArray();
        alreadyCustomContentCampaigns = alreadyCustomContentCampaigns.filter(
          (e) => e.customContentId && (customContentId ? e.customContentId.toString() !== customContentId : true)
        );
        if (alreadyCustomContentCampaigns.length) {
          throw new Error(
            `AutomationCampaignsSetCustomContent ERROR : Campaigns ${alreadyCustomContentCampaigns
              .map((e) => e._id.toString())
              .join(', ')} already have a custom content. Aborting.`
          );
        }

        const todayDate = new Date();
        let insertedId = null;
        if (!customContentId) {
          // Creation of custom content
          const creationResponse = await app.models.AutomationCampaignsCustomContent.getMongoConnector().insertOne({
            displayName,
            target,
            promotionalMessage,
            themeColor,
            dayNumberStart,
            dayNumberEnd: noExpirationDate ? 999999999 : dayNumberEnd, // easy search to determine if it's over or not
            noExpirationDate,
            createdBy: user.id,
            createdAt: todayDate,
            lastModifiedBy: user.id,
            lastModifiedAt: todayDate,
            allTimeGarageIds: affectedGarageIds.map((id) => new ObjectID(id)),
            activeGarageIds: affectedGarageIds.map((id) => new ObjectID(id)),
            customUrl,
            customButtonText,
          });
          insertedId = creationResponse.insertedId;
          if (!insertedId) {
            throw new Error(
              `AutomationCampaignsSetCustomContent ERROR : insertedId undefined ${JSON.stringify(insertedId)}`
            );
          }
          log.info(
            FED,
            `AutomationCampaignsSetCustomContent : Created CustomContent ${insertedId} by ${user.email} (${user.id})`
          );
        } else {
          // Modification of custom content
          const checkCustomContent = await app.models.AutomationCampaignsCustomContent.getMongoConnector().findOne({
            _id: new ObjectID(customContentId),
          });
          if (!checkCustomContent) {
            throw new Error(
              `AutomationCampaignsSetCustomContent ERROR : custom content with id ${customContentId} not found.`
            );
          }
          insertedId = checkCustomContent._id.toString();
          await app.models.AutomationCampaignsCustomContent.getMongoConnector().updateOne(
            { _id: new ObjectID(customContentId) },
            {
              $set: {
                displayName,
                target,
                promotionalMessage,
                themeColor,
                dayNumberStart,
                dayNumberEnd: noExpirationDate ? 999999999 : dayNumberEnd, // easy search to determine if it's over or not
                noExpirationDate,
                lastModifiedBy: user.id,
                lastModifiedAt: todayDate,
                activeGarageIds: affectedGarageIds.map((id) => new ObjectID(id)),
                customUrl,
                customButtonText,
              },
            }
          );
          await app.models.AutomationCampaignsCustomContent.getMongoConnector().updateOne(
            {
              _id: new ObjectID(customContentId),
            },
            {
              $addToSet: { allTimeGarageIds: { $each: affectedGarageIds.map((id) => new ObjectID(id)) } },
            }
          );
        }

        // Then we associate it to the campaigns
        if (customContentId) {
          // If it's a modification, we remove it everywhere before adding it again
          await AutomationCampaignConnector.updateMany(
            { customContentId: new ObjectID(customContentId.toString()) },
            {
              $set: {
                customContentId: null,
              },
            }
          );
        }
        await AutomationCampaignConnector.updateMany(whereCampaigns, {
          $set: {
            customContentId: insertedId
              ? new ObjectID(insertedId.toString())
              : new ObjectID(customContentId.toString()),
          },
        });
        log.info(
          FED,
          `AutomationCampaignsSetCustomContent : ${insertedId} associated to campaigns by ${user.email} (${user.id})`
        );
      } catch (error) {
        log.error(FED, error);
        return error;
      }
    },
  },
};
