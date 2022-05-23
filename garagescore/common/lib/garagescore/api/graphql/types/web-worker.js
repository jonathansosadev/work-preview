/**
 * WebWorker response fields
 */
const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'WebWorker',
  fields: {
    status: {
      // starting by default
      type: graphql.GraphQLString,
    },
    websocket: {
      type: graphql.GraphQLString,
    },
  },
});
