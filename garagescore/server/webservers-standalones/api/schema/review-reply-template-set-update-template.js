const { AuthenticationError } = require('apollo-server-express');
const { reviewReplyTemplateSetUpdateTemplate } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { userStamp } = require('../../../../common/models/review-reply-template/review-reply-template-methods');
const { getGaragesWithErep } = require('../../../../common/models/garage/garage-mongo');
const { checkAndSetGarageAutomaticResponseDelay } = require('../../../../common/models/garage/garage-methods');
const { ObjectId } = require('mongodb')
const { SAMAN, log } = require('../../../../common/lib/util/log');
const prefix = 'reviewReplyTemplateSetUpdateTemplate';
const { SourceTypes, RatingCategories } = require('../../../../frontend/utils/enumV2')

module.exports.typeDef = `
  extend type Mutation {
    ${reviewReplyTemplateSetUpdateTemplate.type}: ${prefix}Result
  }
  type ${prefix}Result {
    message: String,
    status: String,
    template: ${prefix}ReviewReplyTemplate
  }
  type ${prefix}ReviewReplyTemplate {
    _id: ID
    sources: [String]
    ratingCategories: [String]
    title: String
    content: String
    garageIds: [ID]!
    automated: Boolean
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
          scope: { logged, authenticationError, garageIds: userGarages, user: userRequesting },
        } = context;
        const { templateId, title, content, garageIds, ratingCategories, sources, automated } = args;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        // gets the template
        const mongo = app.models.ReviewReplyTemplate.getMongoConnector();
        const template = await mongo.findOne({ _id: ObjectId(templateId) });

        if (!template) {
          throw new Error("Template not found")
        }
        //checks if it belongs to an user's garage
        const garageStringArray = userGarages.map(garage => garage.toString());
        const templateStringArray = template.garageIds.map(garage => garage.toString())
        if (!garageStringArray.some(garage => templateStringArray.includes(garage))) {
          throw new Error("This template doesn't belong to you")
        }
        let objectGarageIds = []
        // if there's a change in the garageIds list, check if those belong to the user
        if (garageIds) {
          if (garageIds.length && !garageIds.every(garage => garageStringArray.includes(garage))) {
            throw new Error("The garage(s) you are trying to set doesn't belong to you")
          }
          if (garageIds.length) {
            // filter incoming garages that are subscribed to EReputation
            const result = await getGaragesWithErep(app, garageIds.map(garage => ObjectId(garage)));
            objectGarageIds = result.map((garage) => garage._id);
          } else if (!automated) {
            // We have to fill with the ereputation garages despite recieving a blank list (manual template)
            const result = await getGaragesWithErep(app, userGarages.map(garage => ObjectId(garage)));
            objectGarageIds = result.map((garage) => garage._id);
          } else {
            throw new Error("No valid garageIds where included")
          }
          if (!objectGarageIds.length) {
            throw new Error("No garages with EReputation subscription where provided")
          }
        }
        // update the target template
        let payload = {}
        if (title != undefined) {
          const testString = title.replace(/\s/g, '');
          if (!testString.length) {
            throw new Error("The title cannot be blank")
          }
          payload['title'] = title.substring(0, 50).trim();
        }
        if (content != undefined) {
          const testString = content.replace(/\s/g, '');
          if (!testString.length) {
            throw new Error("The content cannot be blank")
          }
          payload['content'] = content.substring(0, 2500).trim();
        }
        if (garageIds) {
          payload['garageIds'] = objectGarageIds;
        }
        //check the right categories to be set
        if (ratingCategories) {
          if (!ratingCategories.every(category => [RatingCategories.DETRACTOR, RatingCategories.PASSIVE, RatingCategories.PROMOTER].includes(category))) {
            throw new Error("Invalid review category")
          }
          payload['ratingCategories'] = ratingCategories;
        }
        if (sources) {
          if (!sources.every(source => [SourceTypes.GOOGLE, SourceTypes.FACEBOOK, SourceTypes.DATAFILE].includes(source))) {
            throw new Error("Invalid sources")
          }
          payload['sources'] = sources;
        }
        if (automated != undefined)
          payload['automated'] = automated;

        payload['updatedBy'] = userStamp(userRequesting);
        payload['updatedById'] = ObjectId(userRequesting.id);
        payload['updatedAt'] = new Date();
        const result = await mongo.findOneAndUpdate({ _id: ObjectId(templateId) }, { $set: payload }, { returnOriginal: false });

        if (result.ok !== 1) {
          throw new Error("Internal DB error")
        }
        if (automated) {
          await checkAndSetGarageAutomaticResponseDelay(app, objectGarageIds);
        }
        return {
          message: 'Template updated',
          status: 'OK',
          template: result.value
        }
      } catch (error) {
        log.error(SAMAN, error);
        return { status: 'FAILED', message: error.message };
      }
    },
  },
};
