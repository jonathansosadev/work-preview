/* dataSetLeadTicket data-set-lead-ticket updates 1 field with value */
const { AuthenticationError } = require('apollo-server-express');
const { dataSetLeadTicket } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const gsMutex = require('../../../../common/lib/garagescore/mutex/mutex.js');
const { TicketActionNames } = require('../../../../frontend/utils/enumV2');
const commonTicket = require('../../../../common/models/data/_common-ticket');
const customerContactChannelPhonesFax = require('../../../../common/lib/garagescore/data-file/importer/customer-contactchannel-phones-fax.js');
const StringUtil = require('../../../../common/lib/util/string.js');

const { SIMON, log } = require('../../../../common/lib/util/log');

const prefix = 'dataSetLeadTicket';

const arraysHavingExactlyTheSameValues = (arrArthur, arrBobby) => {
  if (!arrArthur || !arrBobby || arrArthur.length !== arrBobby.length) {
    return false;
  }
  let identical = true;
  arrArthur.forEach((e) => {
    if (!arrBobby.includes(e)) {
      identical = false;
    }
  });
  return identical;
};

module.exports.typeDef = `
  extend type Mutation {
    ${dataSetLeadTicket.type}: ${prefix}ReturnType
  }
  type ${prefix}ReturnType {
    message: String
    status: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      let data = null;
      let lockedByMe = false;
      const {
        app,
        scope: { logged, authenticationError, user },
      } = context;
      const { dataId, field, value, arrayValue } = args;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }

      try {
        // Try to get the lock for this data before fetching it from the database
        await gsMutex.lockByDataId(dataId);
        lockedByMe = true;
        log.info(SIMON, `${dataId.toString()} locked: Starting data modification`);
        data = await app.models.Data.findById(dataId);

        const type = field.includes('leadTicket') ? 'lead' : 'unsatisfied';
        const previousValue = data.get(field);
        let newValue = typeof value !== 'undefined' ? value : arrayValue;

        // Making sure budget is ok
        if (value && field.includes('budget')) {
          const cleanedBudget = value.replace(/[€ ]/g, '');
          if (!isNaN(cleanedBudget)) {
            newValue = Math.max(0, Math.min(parseInt(cleanedBudget, 10), 999999999));
          }
        }

        // Checking if data has changes
        if (
          (value && value === previousValue) ||
          (arrayValue && previousValue && arraysHavingExactlyTheSameValues(arrayValue, previousValue))
        ) {
          gsMutex.unlockByDataId(dataId);
          console.log(`Data ${dataId.toString()} just unlocked cause no changes`);
          if (!gsMutex.isLockedByDataId(dataId)) {
            gsMutex.deleteMutexByDataId(dataId);
          }
          return Promise.reject({ message: 'Value has not changed', status: 'KO' });
        }

        if (field.includes('mobilePhone')) {
          const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataNC: {}, dataFixes: {} } };
          const garage = await app.models.Garage.findById(data.get('garageId'), { fields: 'locale' });
          customerContactChannelPhonesFax(
            dataRecord,
            0,
            { mobilePhone: newValue },
            { cellLabels: { mobilePhone: 'mobilePhone' }, country: garage && garage.locale }
          );
          if (
            dataRecord.importStats.dataValidity.customer &&
            dataRecord.importStats.dataValidity.customer.contactChannel &&
            dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone &&
            !StringUtil.deepEquality(previousValue, dataRecord.customer.contactChannel.mobilePhone.number)
          ) {
            newValue = dataRecord.customer.contactChannel.mobilePhone.number;
          } else {
            return Promise.reject({ message: 'Invalid value for phoneNumber', status: 'KO' });
          }
        }
        // Setting new value
        data.set(field, newValue);

        // Adding new action into ticket
        await commonTicket.addAction(type, data, {
          name: TicketActionNames.DATA_MODIFICATION,
          assignerUserId: user.getId(),
          field: field,
          createdAt: new Date().toISOString(),
          ...(typeof value !== 'undefined'
            ? { newValue, previousValue }
            : { newArrayValue: newValue, previousArrayValue: previousValue }),
        });

        // Saving into database
        await data.save();

        gsMutex.unlockByDataId(dataId);
        log.info(SIMON, `Success: Data ${dataId.toString()} unlocked`);
        if (!gsMutex.isLockedByDataId(dataId)) {
          gsMutex.deleteMutexByDataId(dataId);
        }

        return { message: 'Data modified successfully', status: 'OK' };
      } catch (e) {
        if (gsMutex.mutexExistsByDataId(dataId) && gsMutex.isLockedByDataId(dataId) && lockedByMe) {
          gsMutex.unlockByDataId(dataId);
          log.info(SIMON, `Error caught: Data ${dataId.toString()} unlocked (${e.message})`);
          if (!gsMutex.isLockedByDataId(dataId)) {
            gsMutex.deleteMutexByDataId(dataId);
          }
        }
        return { message: e.message || e.toString(), status: 'KO' };
      }
    },
  },
};
