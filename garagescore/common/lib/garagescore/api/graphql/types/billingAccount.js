const graphql = require('graphql');
const GraphQLDate = require('graphql-date');

module.exports = new graphql.GraphQLObjectType({
  name: 'billingAccount',
  fields: {
    id: { type: graphql.GraphQLID },
    name: { type: graphql.GraphQLString },
    email: { type: graphql.GraphQLString },
    billingDate: { type: graphql.GraphQLInt },
    dateNextBilling: { type: GraphQLDate },
    goCardLessSetup: { type: graphql.GraphQLBoolean },
    billingType: { type: graphql.GraphQLString },
    total: { type: graphql.GraphQLInt },
    active: { type: graphql.GraphQLInt },

    accountingId: { type: graphql.GraphQLString },
    companyName: { type: graphql.GraphQLString },
    address: { type: graphql.GraphQLString },
    postalCode: { type: graphql.GraphQLString },
    city: { type: graphql.GraphQLString },
    vfClientId: { type: graphql.GraphQLInt },
    technicalContact: { type: graphql.GraphQLString },
    accountingContact: { type: graphql.GraphQLString },
    RGPDContact: { type: graphql.GraphQLString },
    externalId: { type: graphql.GraphQLString },
    mandateId: { type: graphql.GraphQLString },
    customerId: { type: graphql.GraphQLString },
    garageIds: { type: new graphql.GraphQLList(graphql.GraphQLString) },
    createdAt: { type: GraphQLDate },
    updatedAt: { type: GraphQLDate },
    invoices: {
      type: new graphql.GraphQLList(
        new graphql.GraphQLObjectType({
          name: 'invoices',
          fields: {
            createdAt: { type: graphql.GraphQLString },
            sentAt: { type: graphql.GraphQLString },
            id: { type: graphql.GraphQLInt },
          },
        })
      ),
    },
    sentLastAt: { type: graphql.GraphQLString },
  },
});
