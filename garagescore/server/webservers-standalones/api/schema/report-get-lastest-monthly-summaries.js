const { AuthenticationError } = require('apollo-server-express');
const { reportLatestMonthlySummaries } = require('../../../../frontend/api/graphql/definitions/queries.json');

const { BANG, log } = require('../../../../common/lib/util/log');

const typePrefix = 'reportLatestMonthlySummaries';
module.exports.typeDef = `
  extend type Query {
    ${reportLatestMonthlySummaries.type}: ${typePrefix}monthlySummaries
  }
  type ${typePrefix}monthlySummaries {
    results: [${typePrefix}Results]
    error: String
    userId: String
  }
  type ${typePrefix}Results {
    id: String
    createdAt: String
    sendDate: String
  }
  `;

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError },
        } = context;
        const { email } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        // 1. Check if user exists, return userId if exist else return an error
        const user = await app.models.User.findOne({ where: { email } });
        const userId = user ? user.id.toString() : '';
        if (!user) {
          return { results: [], error: 'UserNotFound', userId };
        } else if (user.isGod()) {
          return { results: [], error: 'UserForbidden', userId };
        }
        // 2. If user exists, fetch the reports
        const query = [
          {
            $match: {
              userEmail: email,
              reportConfigId: 'monthlySummary',
            },
          },
          {
            $project: {
              id: '$_id',
              createdAt: '$createdAt',
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 12,
          },
        ];
        const mongo = await app.models.Report.getMongoConnector();
        const reports = await mongo.aggregate(query).toArray();

        return { results: reports || [], error: reports && reports.length ? '' : 'NoResult', userId };
      } catch (error) {
        log.error(BANG, error);
        return error;
      }
    },
  },
};
