const {
  AuthenticationError,
  UserInputError,
  gql,
} = require('apollo-server-express');
const { ObjectId } = require('mongodb');

const typePrefix = 'WidgetGroupSetWidgetGroup';

module.exports.typeDef = gql`
  type ${typePrefix}Result {
    isWidgetGroupUpdated: Boolean
  }

  extend type Mutation {
    ${typePrefix}(
      widgetGroupId: ID!,
      garageIds: [ID!]!
    ): ${typePrefix}Result
  }
`;


async function updateWidgetGroupFromData(widgetGroup, updateData, app) {
  const widgetGroupId = ObjectId(widgetGroup._id || widgetGroup.id);
  const datedUpdateData = {
    garageIds: updateData.garageIds.map(garageId => ObjectId(garageId)),
    updatedAt: new Date(),
  };
  const groupModel = app.models.WidgetGroup.getMongoConnector();
  await groupModel.updateOne(
    { _id: widgetGroupId },
    { $set: datedUpdateData },
  );
  return await groupModel.findOne({ _id: widgetGroupId });
}

module.exports.resolvers = {
  Mutation: {
    [`${typePrefix}`]: async (obj, payload, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError },
        } = context;
        const {
          widgetGroupId,
          garageIds,
        } = payload;

        const isAnonymous = !logged;
        if (isAnonymous) {
          throw new AuthenticationError(authenticationError);
        }

        const data = {
          ...(garageIds ? { garageIds } : {}),
        };

        if (!ObjectId.isValid(widgetGroupId)) {
          throw new UserInputError(`ObjectId ${widgetGroupId} is not valid.`);
        }

        const widgetGroup = await app.models.WidgetGroup
          .getMongoConnector()
          .findOne(
            { _id: new ObjectId(widgetGroupId) },
            { _id: true },
          );
        if (!widgetGroup) {
          throw new UserInputError(`WidgetGroup with id ${widgetGroupId} not found.`);
        }

        const updatedWidgetGroup = await updateWidgetGroupFromData(
          widgetGroup,
          data,
          app,
        );
        return { isWidgetGroupUpdated: Boolean(updatedWidgetGroup) }
      } catch (error) {
        return error;
      }
    },
  },
};
