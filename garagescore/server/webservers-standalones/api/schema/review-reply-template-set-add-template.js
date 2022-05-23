const { AuthenticationError } = require('apollo-server-express');
const { reviewReplyTemplateSetAddTemplate } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { createTemplate, userStamp } = require('../../../../common/models/review-reply-template/review-reply-template-methods');
const { checkAndSetGarageAutomaticResponseDelay } = require('../../../../common/models/garage/garage-methods');
const { getGaragesWithErep } = require('../../../../common/models/garage/garage-mongo');
const { ObjectId } = require('mongodb')
const { SAMAN, log } = require('../../../../common/lib/util/log');
const prefix = 'reviewReplyTemplateSetAddTemplate';
const { SourceTypes, RatingCategories } = require('../../../../frontend/utils/enumV2');


module.exports.typeDef = `
  extend type Mutation {
    ${reviewReplyTemplateSetAddTemplate.type}: ${prefix}Result
  }
  type ${prefix}Result {
    message: String,
    status: String,
    template: ${prefix}Template
  }

  type ${prefix}Template {
    title: String
    content: String
    garageIds: [ID]
    sources: [String]
    automated: Boolean
    ratingCategories: [String]
    _id: ID
    createdAt: Date
    createdBy: String
    createdById: ID
    updatedBy: String
    updatedAt: Date
    updatedById: ID
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user: userRequesting, garageIds: userGarages },
        } = context;
        const { title, content, garageIds, sources, ratingCategories, automated } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!title || !title.replace(/\s/g, '').length) {
          throw new Error("The title cannot be blank")
        }
        if (!content || !content.replace(/\s/g, '').length) {
          throw new Error("The content cannot be blank")
        }
        // Check if user is including only garages of its own
        const userGaragesArray = userGarages.map(garage => garage.toString());
        const requestGaragesArray = garageIds.map(garage => garage.toString());
        if (!requestGaragesArray.every(garage => userGaragesArray.includes(garage))) {
          throw new Error("Invalid garageId insertion")
        }

        // if some garageIds are requested we use them otherwise we use the user's available garageIds
        const targetedGarageIds = (!garageIds || !automated) ? userGarages.map(ObjectId) : garageIds.map(ObjectId);
        const result = await getGaragesWithErep(app, targetedGarageIds);
        const objectGarageIds = result.map(({ _id }) => _id);
        if (!objectGarageIds.length) {
          throw new Error("Not a single of the provided garages is subscribed to EReputation")
        }

        // Check for the right categories to be inserted
        if (!ratingCategories.every(category => [RatingCategories.DETRACTOR, RatingCategories.PASSIVE, RatingCategories.PROMOTER].includes(category))) {
          throw new Error("Invalid review category")
        }
        // Check the right sources to be inserted
        if (!sources.every(source => [SourceTypes.FACEBOOK, SourceTypes.GOOGLE, SourceTypes.DATAFILE].includes(source))) {
          throw new Error("Invalid source")
        }

        const createdAt = new Date();

        const payload = {
          title: title.trim(),
          content: content.trim(),
          garageIds: objectGarageIds,
          sources: sources,
          ratingCategories: ratingCategories,
          automated: automated,
          createdBy: userStamp(userRequesting),
          updatedBy: userStamp(userRequesting),
          createdById: userRequesting.id,
          updatedById: userRequesting.id,
          createdAt: createdAt,
          updatedAt: createdAt
        }

        const resultTemplate = await createTemplate(app, payload);
        if (automated) {
          await checkAndSetGarageAutomaticResponseDelay(app, objectGarageIds);
        }
        return {
          message: 'templateAdded',
          status: 'OK',
          template: resultTemplate
        }

      } catch (error) {
        log.error(SAMAN, error);
        return { status: 'FAILED', message: error.message };
      }
    },
  },
};
