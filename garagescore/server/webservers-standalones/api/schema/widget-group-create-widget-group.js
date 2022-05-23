const { AuthenticationError, gql } = require('apollo-server-express');
const { ObjectID } = require('mongodb');

const typePrefix = 'WidgetGroupCreateWidgetGroup';

module.exports.typeDef = gql`
  type ${typePrefix}Result {
    newWidgetGroup: Boolean
    widgetGroup: ${typePrefix}WidgetGroup
  }

  type ${typePrefix}WidgetGroup {
    id: ID
    garageIds: [ID!]!
  }

  extend type Mutation {
    ${typePrefix}(garageIds: [ID!]!): ${typePrefix}Result
  }
`;

async function doesGroupAlreadyExist(app, garageIds) {
  const garageObjectIds = garageIds.map(garageId => ObjectID(garageId));
  return await app.models.WidgetGroup
    .getMongoConnector()
    .findOne({ garageIds: garageObjectIds });
}

async function createWidgetGroupFromData(data, app) {
  const currentDate = new Date();
  const datedData = {
    garageIds: data.garageIds.map(garageId => ObjectID(garageId)),
    createdAt: currentDate,
    updatedAt: currentDate,
  };
  const {
    result: { ok },
    insertedId,
  } = await app.models.WidgetGroup
    .getMongoConnector()
    .insertOne(datedData);

  return ok
    ? await app.models.WidgetGroup
        .getMongoConnector()
        .findOne({ _id: insertedId })
    : null;
}

module.exports.resolvers = {
  Mutation: {
    [`${typePrefix}`]: async (obj, { garageIds }, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        const existingGroup = await doesGroupAlreadyExist(app, garageIds);

        if (existingGroup) {
          return {
            newWidgetGroup: false,
            widgetGroup: {
              id: existingGroup._id,
              ...existingGroup,
            }
          };
        }

        const newWidgetGroup = await createWidgetGroupFromData(
          { garageIds },
          app,
        );
        const wasWidgetGroupSuccessfullyCreated = Boolean(newWidgetGroup);

        return {
          newWidgetGroup: wasWidgetGroupSuccessfullyCreated,
          widgetGroup: wasWidgetGroupSuccessfullyCreated
            ? {
              ...newWidgetGroup,
              id: newWidgetGroup._id,
            }
            : null,
        };
      } catch (error) {
        console.error(error);
        return {
          newWidgetGroup: false,
          widgetGroup: null,
        };
      }
    },
  },
};
