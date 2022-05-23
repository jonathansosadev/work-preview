const graphql = require('graphql');

const mutations = require('./mutations');
const queries = require('./queries');

module.exports = new graphql.GraphQLSchema({
  query: new graphql.GraphQLObjectType({
    name: 'Query',
    fields: queries,
  }),
  mutation: new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: mutations,
  }),
});
