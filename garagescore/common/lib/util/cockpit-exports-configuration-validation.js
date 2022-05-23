const { ObjectID } = require('mongodb');
const { ExportTypes, DataTypes, LeadSaleTypes } = require('../../../frontend/utils/enumV2');
const GarageHistoryPeriods = require('../../models/garage-history.period');
const gsEmail = require('./email');
const FieldsHandler = require('../garagescore/cockpit-exports/fields/fields-handler');
const ExportHelper = require('../../../frontend/utils/exports/helper');

module.exports = {
  userId: function ({ value = null }) {
    return ObjectID.isValid(value);
  },

  exportType: function ({ value = null }) {
    return value && ExportTypes.hasValue(value);
  },

  periodId: function ({ value }) {
    if (value === 'CustomPeriod') {
      return true;
    }
    return value && GarageHistoryPeriods.isValidPeriod(value);
  },
  startPeriodId: function ({ value, periodId }) {
    if (periodId === 'CustomPeriod') {
      return value && GarageHistoryPeriods.isValidPeriod(value);
    }
    return true;
  },
  endPeriodId: function ({ value, periodId }) {
    if (periodId === 'CustomPeriod') {
      return value && GarageHistoryPeriods.isValidPeriod(value);
    }
    return true;
  },
  dataTypes: function ({ value = [], exportType = null }) {
    if (value === null || !Array.isArray(value)) {
      return false;
    }

    const hasValue = (dataType, exportType) => {
      /* leadSaleType */
      if (ExportHelper.exportTypeIsUsingLeadSaleTypes(exportType)) {
        return LeadSaleTypes.hasValue(dataType);
      }
      /* dataTypes */
      return DataTypes.hasValue(dataType);
    };

    return value.length && value.every((dataType) => dataType === 'All' || hasValue(dataType, exportType));
  },

  garageIds: function ({ value = [], userGarageIds = [] }) {
    const formatedUserGarageIds = userGarageIds.map((gId) => gId.toString());

    return value.length && value.every((gId) => gId === 'All' || formatedUserGarageIds.includes(gId.toString()));
  },

  name: function ({ value = '' }) {
    return value && value.length;
  },

  recipients: function ({ value = [] }) {
    return value.length && value.every((recipient) => gsEmail.regexp.test(recipient));
  },

  fields: function ({ value = [], exportType = null }) {
    if (!value || !value.length || !exportType) {
      return false;
    }
    return value.every((field) =>
      FieldsHandler.fieldIsValid(field, ExportTypes.getProperty(exportType, 'category'), exportType)
    );
  },

  frontDeskUsers: function ({ value = [], exportType = null }) {
    if (![ExportTypes.FRONT_DESK_USERS_DMS, ExportTypes.FRONT_DESK_USERS_CUSTEED].includes(exportType)) {
      return false;
    }
    return (
      value.length &&
      value.every(
        ({ id, frontDeskUserName }) => typeof id === 'string' && typeof frontDeskUserName === 'string' && id.length
      )
    );
  },
};
