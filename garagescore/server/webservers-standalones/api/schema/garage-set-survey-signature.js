const { AuthenticationError } = require('apollo-server-express');
const { ObjectID } = require('mongodb');
const { garageSetSurveySignature } = require('../../../../frontend/api/graphql/definitions/mutations.json');

const { ANASS, log } = require('../../../../common/lib/util/log');

const prefix = 'garageSetSurveySignature';

module.exports.typeDef = `
  extend type Mutation {
    ${garageSetSurveySignature.type}: ${prefix}Result
  }
  type ${prefix}Result {
    status: Int
    message: String
    modifiedGarages: [${prefix}Garage!]
  }
  type ${prefix}Garage {
    id: String
    surveySignature: ${prefix}SurveySignature!
  }
  type ${prefix}SurveySignature {
    useDefault: Boolean
    defaultSignature: ${prefix}Signature
    Maintenance: ${prefix}Signature
    NewVehicleSale: ${prefix}Signature
    UsedVehicleSale: ${prefix}Signature
  }
  type ${prefix}Signature {
    lastName: String
    firstName: String
    job: String
  }

  input ${prefix}Modifications {
    garageId: String!
    surveySignature: ${prefix}SurveySignatureInput!
  }
  input ${prefix}SurveySignatureInput {
    useDefault: Boolean
    defaultSignature: ${prefix}SignatureInput
    Maintenance: ${prefix}SignatureInput
    NewVehicleSale: ${prefix}SignatureInput
    UsedVehicleSale: ${prefix}SignatureInput
  }
  input ${prefix}SignatureInput {
    lastName: String
    firstName: String
    job: String
  }
`;

const getSignatureUpdate = ({ lastName, firstName, job } = {}, signatureType) => {
  const update = {};
  if (lastName !== null && lastName !== undefined) {
    update[`surveySignature.${signatureType}.lastName`] = lastName;
  }
  if (firstName !== null && firstName !== undefined) {
    update[`surveySignature.${signatureType}.firstName`] = firstName;
  }
  if (job !== null && job !== undefined) {
    update[`surveySignature.${signatureType}.job`] = job;
  }
  return update;
};
const getFieldsUpdates = ({ useDefault, defaultSignature, Maintenance, NewVehicleSale, UsedVehicleSale }) => {
  const update = {
    ...getSignatureUpdate(defaultSignature, 'defaultSignature'),
    ...getSignatureUpdate(Maintenance, 'Maintenance'),
    ...getSignatureUpdate(NewVehicleSale, 'NewVehicleSale'),
    ...getSignatureUpdate(UsedVehicleSale, 'UsedVehicleSale'),
  };
  if (useDefault === true || useDefault === false) {
    update['surveySignature.useDefault'] = useDefault;
  }
  return update;
};
const updateOperationsFromModifications = (modifications) => {
  return modifications
    .map(({ garageId, surveySignature }) => {
      const fieldsUpdates = getFieldsUpdates(surveySignature);
      if (Object.keys(fieldsUpdates).length === 0) {
        // If no modification is to be done then don't do it
        return null;
      }
      return {
        updateOne: {
          filter: { _id: new ObjectID(garageId) },
          update: { $set: fieldsUpdates },
        },
      };
    })
    .filter((operation) => operation);
};

module.exports.resolvers = {
  Mutation: {
    garageSetSurveySignature: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds },
        } = context;
        const { modifications } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        // Making sure we only update garages that exist and we have access to
        const garageStringIds = garageIds.map((gId) => gId.toString());
        const isValidGarageId = (garageId) => ObjectID.isValid(garageId) && garageStringIds.includes(garageId);
        const filteredModifications = modifications.filter(({ garageId }) => isValidGarageId(garageId));

        if (!filteredModifications.length) {
          return { status: 200, message: 'No garage to update', modifiedGarages: [] };
        }

        const updateOperations = updateOperationsFromModifications(filteredModifications);

        await app.models.Garage.getMongoConnector().bulkWrite(updateOperations);

        const modifiedGarageIds = updateOperations.map((operation) => operation.updateOne.filter._id);
        const modifiedGarages = await app.models.Garage.getMongoConnector()
          .find({ _id: { $in: modifiedGarageIds } }, { projection: { id: '$_id', surveySignature: true } })
          .toArray();

        return { status: 200, message: 'OK', modifiedGarages };
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
