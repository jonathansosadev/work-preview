/**
 * Used in greybo/kpi
 */
const graphql = require('graphql');

const KeyValue = new graphql.GraphQLList(
  new graphql.GraphQLObjectType({
    name: 'kv',
    fields: {
      k: { type: graphql.GraphQLString },
      v: { type: graphql.GraphQLString },
    },
  })
);
const Values = new graphql.GraphQLList(graphql.GraphQLString);

module.exports = new graphql.GraphQLObjectType({
  name: 'internalkpi',
  fields: {
    userEmail: { type: graphql.GraphQLString },
    report: {
      type: new graphql.GraphQLList(
        new graphql.GraphQLObjectType({
          name: 'reportItem',
          fields: {
            name: { type: graphql.GraphQLString },
            values: {
              type: Values,
            },
          },
        })
      ),
    },
    myKpis: {
      type: new graphql.GraphQLList(
        new graphql.GraphQLObjectType({
          name: 'kpisItem',
          fields: {
            name: { type: graphql.GraphQLString },
            values: {
              type: KeyValue,
            },
          },
        })
      ),
    },
  },
});
