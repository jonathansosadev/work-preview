/* Template file to define a new Apollo GraphQL query */
/* Read _README.txt, copy this file, rename the copy, don't forget the extension */
const { AuthenticationError } = require('apollo-server-express');
const GraphQLDate = require('graphql-date');
const { nameOfTheFileInCamelCase } = require('../../../../frontend/api/graphql/definitions/queries.json');

const { ANASS, log } = require('../../../../common/lib/util/log');

const typePrefix = 'nameOfTheFileInCamelCase';
const resolveFunctions = {
  Date: GraphQLDate,
};
module.exports.typeDef = `
  extend type Query {
    ${nameOfTheFileInCamelCase.type}: [${typePrefix}ReturnType]
  }
  type ${typePrefix}ReturnType {
    field1: String
    field2: Boolean
    field3: Int
    field4: Date
    field5: ID
    array1: [String]
    nonNull1: String!
    nonNullArray: [String]!
    nonNullArrOfNonNull: [String!]!
    nestedObject: ${typePrefix}NestedType
  }

  type ${typePrefix}NestedType {
    nestedField1: String
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          hasMore,
          scope: { logged, authenticationError, user, godMode, garageIds },
        } = context;
        const { arg1, arg2 } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        /*
          Code here
        */
        const res = 'the things returned from the operations';
        return res;
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
