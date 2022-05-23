const { ForbiddenError, UserInputError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const GarageHistoryPeriods = require('../../../../models/garage-history.period');
const ExportHelper = require('../../../../../frontend/utils/exports/helper');
const gsEmail = require('../../../util/email');
const {
  ExportTypes,
  LeadSaleTypes,
  DataTypes,
  UserRoles,
  UserLastCockpitOpenAt,
  ExportPeriods,
  ExportFrequencies,
} = require('../../../../../frontend/utils/enumV2');
const fieldsHandler = require('../fields/fields-handler');

module.exports = {
  commonValidations({ exportType }) {
    if (!exportType || !ExportTypes.hasValue(exportType)) {
      throw new Error(`Unkown ExportType ${exportType}`);
    }
  },
  validationsByExportType: {
    [ExportTypes.GARAGES]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.FRONT_DESK_USERS_DMS]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.FRONT_DESK_USERS_CUSTEED]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.SATISFACTION]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.CONTACTS]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.CONTACTS_MODIFIED]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.UNSATISFIED]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.LEADS]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.FORWARDED_LEADS]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.EREPUTATION]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.ADMIN_USERS]: (args, contextScope) => _validateAdminUsersExport(args, contextScope),
    [ExportTypes.ADMIN_GARAGES]: (args, contextScope) => _validateAdminGaragesExport(args, contextScope),
    [ExportTypes.AUTOMATION_RGPD]: (args, contextScope) => _validateExport(args, contextScope),
    [ExportTypes.AUTOMATION_CAMPAIGN]: (args, contextScope) => _validateExport(args, contextScope),
  },
  validateCustomExport(args, contextScope) {
    // exportType validation
    this.validationsByExportType[args.exportType](args, contextScope);

    // Specific to CustomExport
    _validateCustomExportUserId(args);
    _validateCustomExportName(args);
    _validateCustomExportFrequency(args);
  },
};

function _validatePeriods({ periodId, startPeriodId, endPeriodId }) {
  if (!periodId && (!startPeriodId || !endPeriodId)) {
    throw new Error(`periodId OR (startPeriodId, endPeriodId) required`);
  }
  if (periodId && !ExportPeriods.hasValue(periodId)) {
    throw new UserInputError(`periodId ${periodId} is not valid`);
  }
  const isValidMonthlyPeriod = (period) => period.match(GarageHistoryPeriods.MONTHLY_REGEX);
  if (!periodId && (!isValidMonthlyPeriod(startPeriodId) || !isValidMonthlyPeriod(endPeriodId))) {
    throw new UserInputError(
      `Either startPeriodId: ${startPeriodId} or endPeriodId: ${endPeriodId} is not a valid monthly KpiPeriod`
    );
  }
}

function _validateDataTypes({ dataTypes, exportType }) {
  if (!dataTypes) {
    throw new Error('dataTypes required');
  }

  // if (dataTypes.length === 0 && exportType !== ExportTypes.EREPUTATION) {
  //   throw new UserInputError(`dataTypes`);
  // }

  if (dataTypes.length && dataTypes.find((e) => e !== 'All' && !DataTypes.hasValue(e))) {
    throw new UserInputError(`dataTypes ${dataTypes} is not valid`);
  }
}

function _validateDataTypesOrLeadSaleType({ dataTypes }) {
  if (!dataTypes) {
    throw new Error('dataTypes required');
  }

  // if (dataTypes.length === 0) {
  //   throw new UserInputError(`dataTypes empty`);
  // }

  if (dataTypes.length && dataTypes.find((e) => e !== 'All' && !LeadSaleTypes.hasValue(e))) {
    throw new UserInputError(`dataTypes ${dataTypes} is not valid`);
  }
}

function _validateFields({ fields, exportType }) {
  if (fields.some((f) => !fieldsHandler.fieldIsValid(f, ExportTypes.getProperty(exportType, 'category'), exportType))) {
    throw new UserInputError(`fields ${fields} is not valid`);
  }
}

function _validateUserAccessToGarage({ currentGarageIds, garageIds, user }) {
  // Check if the user has access to the requested garageIds
  const currentGarageIdsString = currentGarageIds.map((e) => e.toString());
  for (const garageId of garageIds) {
    if (garageId !== 'All' && !currentGarageIdsString.includes(garageId)) {
      throw new ForbiddenError(`User ${user.email} does not have access to garageId ${garageId}`);
    }
  }
}

function _validateExport(
  { exportType, fields, periodId, startPeriodId, endPeriodId, dataTypes, garageIds, recipients },
  { currentGarageIds, user }
) {
  _validateRecipients({ recipients });
  _validateUserAccessToGarage({ currentGarageIds, garageIds, user });
  _validatePeriods({ periodId, startPeriodId, endPeriodId });
  if (ExportHelper.exportTypeIsUsingLeadSaleTypes(exportType)) {
    _validateDataTypesOrLeadSaleType({ dataTypes });
  } else {
    _validateDataTypes({ dataTypes, exportType });
  }
  _validateFields({ fields, exportType });
}

function _validateAdminUsersExport(
  { exportType, fields, adminFilterRole, adminFilterLastCockpitOpenAt, garageIds },
  { currentGarageIds, user }
) {
  if (user.role === UserRoles.USER) {
    throw new ForbiddenError(`role ${user.role} can't perform this kind of export`);
  }
  if (adminFilterRole && !UserRoles.hasValue(adminFilterRole)) {
    throw new UserInputError(`role ${adminFilterRole} is not valid`);
  }
  if (adminFilterLastCockpitOpenAt && !UserLastCockpitOpenAt.hasValue(adminFilterLastCockpitOpenAt)) {
    throw new UserInputError(`lastCockpitOpenAt ${adminFilterLastCockpitOpenAt} is not valid`);
  }
  _validateUserAccessToGarage({ currentGarageIds, garageIds, user });
  _validateFields({ fields, exportType });
}

function _validateAdminGaragesExport({ exportType, fields, garageIds }, { currentGarageIds, user }) {
  if (user.role === UserRoles.USER) {
    throw new ForbiddenError(`role ${user.role} can't perform this kind of export`);
  }
  _validateUserAccessToGarage({ currentGarageIds, garageIds, user });
  _validateFields({ fields, exportType });
}

function _validateRecipients({ recipients = [] }) {
  if (!recipients.length) {
    throw new UserInputError(`field recipients is not valid`);
  }

  recipients.forEach((recipient) => {
    if (!gsEmail.regexp.test(recipient)) {
      throw new UserInputError(`field recipients is not valid, received ${recipient}`);
    }
  });
}

function _validateCustomExportName({ name = '' }) {
  if (!name || !name.length) {
    throw new UserInputError(`[CustomExport] field name is not valid`);
  }
}

function _validateCustomExportUserId({ userId = '' }) {
  if (!ObjectId.isValid(userId)) {
    throw new UserInputError(`[CustomExport] field userId is not valid`);
  }
}

function _validateCustomExportFrequency({ frequency = '', startPeriodId = null, endPeriodId = null }) {
  if (!ExportFrequencies.hasValue(frequency)) {
    throw new UserInputError(`[CustomExport] field frequency is not valid`);
  }

  // if we have a startPeriodId and endPeriodId the export cannot have a frequency other than "NONE"
  if ((startPeriodId || endPeriodId) && frequency !== ExportFrequencies.NONE) {
    throw new UserInputError(
      `[CustomExport] cannot have a CustomPeriod with a frequency other than NONE, got ${frequency}`
    );
  }
}
