const { ObjectId } = require('mongodb');

const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const { FED, log } = require('../../../../common/lib/util/log');
const timeHelper = require('../../../../common/lib/util/time-helper');

const typePrefix = 'automationGetCustomContents';

module.exports.typeDef = `
  extend type Query {
    ${queries.AutomationGetCustomContents.type}: [${typePrefix}AutomationCustomContent]
  }
  type ${typePrefix}AutomationCustomContent {
    id: String,
    displayName: String,
    target: String,
    promotionalMessage: String,
    themeColor: String,
    startAt: Date,
    endAt: Date,
    noExpirationDate: Boolean
    createdBy: String
    createdAt: Date
    lastModifiedBy: String
    lastModifiedAt: Date
    activeGarageIds: [String]
    allTimeGarageIds: [String]
    customUrl: String
    customButtonText: String
  }
`;

const getUserInfos = (userId, users) => {
  const user = users.find((user) => user._id.toString() === userId.toString());
  if (!user) {
    return '???';
  }
  return user.firstName && user.lastName ? `${user.firstName[0]}. ${user.lastName}` : user.email;
};

module.exports.resolvers = {
  Query: {
    AutomationGetCustomContents: async (obj, args, context) => {
      try {
        const { app } = context;
        const { logged, authenticationError, garageIds, godMode } = context.scope;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        const searchGarageIds = args.garageIds && args.garageIds.length ? args.garageIds : garageIds;
        const where = godMode
          ? {}
          : {
              allTimeGarageIds: { $in: searchGarageIds.map((id) => ObjectId(id.toString())) },
            };
        if (args.target) {
          where.target = args.target;
        }
        // We get all the custom contents
        const customContents = await app.models.AutomationCampaignsCustomContent.getMongoConnector()
          .find(where, {
            projection: {
              _id: true,
              displayName: true,
              target: true,
              promotionalMessage: true,
              themeColor: true,
              dayNumberStart: true,
              dayNumberEnd: true,
              noExpirationDate: true,
              createdBy: true,
              createdAt: true,
              lastModifiedBy: true,
              lastModifiedAt: true,
              allTimeGarageIds: true,
              activeGarageIds: true,
              customUrl: true,
              customButtonText: true,
            },
          })
          .toArray();
        // we get the userIds associated to every content
        const creatorsIds = customContents
          .filter((customContent) => customContent.createdBy)
          .map((customContent) => ObjectId(customContent.createdBy));
        const updatorsIds = customContents
          .filter((customContent) => customContent.lastModifiedBy)
          .map((customContent) => ObjectId(customContent.lastModifiedBy));

        // we get the user names and emails
        const users = await app.models.User.getMongoConnector()
          .find(
            {
              _id: { $in: [...creatorsIds, ...updatorsIds] },
            },
            {
              //limit: 1000,
              projection: {
                _id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            }
          )
          .toArray();

        // then we format the customContent to send back the list in front
        return customContents.map((customContent) => {
          return {
            id: customContent._id.toString(),
            displayName: customContent.displayName,
            target: customContent.target,
            promotionalMessage: customContent.promotionalMessage,
            themeColor: customContent.themeColor,
            startAt: timeHelper.dayNumberToDate(customContent.dayNumberStart),
            endAt: customContent.noExpirationDate ? null : timeHelper.dayNumberToDate(customContent.dayNumberEnd),
            noExpirationDate: customContent.noExpirationDate,
            createdBy: getUserInfos(customContent.createdBy, users),
            createdAt: customContent.createdAt,
            lastModifiedBy: getUserInfos(customContent.lastModifiedBy, users),
            lastModifiedAt: customContent.lastModifiedAt,
            allTimeGarageIds: customContent.allTimeGarageIds,
            activeGarageIds: customContent.activeGarageIds,
            customUrl: customContent.customUrl,
            customButtonText: customContent.customButtonText,
          };
        });
      } catch (err) {
        log.error(FED, err);
        return [];
      }
    },
  },
};
