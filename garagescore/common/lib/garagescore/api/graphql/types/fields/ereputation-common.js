const graphql = require('graphql');

const ReviewThread = new graphql.GraphQLObjectType({
  name: 'ReviewThread',
  fields: () => ({
    text: { type: graphql.GraphQLString },
    status: { type: graphql.GraphQLString },
    approvedAt: { type: graphql.GraphQLString },
    rejectedReason: { type: graphql.GraphQLString },
    author: { type: graphql.GraphQLString },
    id: { type: graphql.GraphQLString },
    authorId: { type: graphql.GraphQLString },
    attachment: { type: graphql.GraphQLString },
    isFromOwner: { type: graphql.GraphQLBoolean },
    replies: { type: new graphql.GraphQLList(ReviewThread) },
  }),
});

const GaragesToMatch = new graphql.GraphQLObjectType({
  name: 'GaragesToMatch',
  fields: () => ({
    name: { type: graphql.GraphQLString },
    externalId: { type: graphql.GraphQLString },
  }),
});

module.exports = {
  thread: {
    type: new graphql.GraphQLList(ReviewThread),
    resolve(data) {
      return data.get('review.reply.thread') || [];
    },
  },
  updatedThread: {
    type: new graphql.GraphQLList(ReviewThread),
  },
  recommend: {
    type: graphql.GraphQLBoolean,
    resolve(data) {
      return data.get('review.rating.recommend') || false;
    },
  },
  surveyOriginalScore: {
    type: graphql.GraphQLFloat,
    resolve(data) {
      return data.get('review.rating.original') || -1;
    },
  },
  surveyOriginalScale: {
    type: graphql.GraphQLFloat,
    resolve(data) {
      return data.get('review.rating.originalScale') || -1;
    },
  },
  garagesToMatch: {
    type: new graphql.GraphQLList(GaragesToMatch),
  },
  success: {
    type: graphql.GraphQLBoolean,
  },
  baseGarageId: {
    type: graphql.GraphQLString,
  },
  countRecommend: { type: graphql.GraphQLInt },
  recommendPercent: { type: graphql.GraphQLFloat },
  countReviewsWithScore: { type: graphql.GraphQLInt },
  countReviewsWithRecommendation: { type: graphql.GraphQLInt },
  message: { type: graphql.GraphQLString },
  pending: { type: graphql.GraphQLBoolean },
  hasSubscription: { type: graphql.GraphQLBoolean },
};
