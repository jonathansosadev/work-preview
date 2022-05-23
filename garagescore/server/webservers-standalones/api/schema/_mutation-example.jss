/* Template file to define a new Apollo GraphQL query */
/* Read _README.txt, copy this file, rename the copy, don't forget the extension */
const { AuthenticationError } = require('apollo-server-express');
const { nameOfTheFileInCamelCase } = require('../../../../frontend/api/graphql/definitions/mutations.json');

const { ANASS, log } = require('../../../../common/lib/util/log');

const prefix = 'nameOfTheFileInCamelCase';

module.exports.typeDef = `
  extend type Mutation {
    ${nameOfTheFileInCamelCase.type}: ${prefix}ReturnType
  }
  type ${prefix}ReturnType {
    field1: String
    field2: Boolean
    field3: Int
    field4: Date
    field5: ID
    array1: [String]
    nonNull1: String!
    nonNullArray: [String]!
    nonNullArrOfNonNull: [String!]!
    nestedObject: ${prefix}NestedType
  }

  type ${prefix}NestedType {
    nestedField1: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => { // root called first
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
