const parseUtils = require('./parse-utils');
// Get with optOutSMS consent or not
module.exports = function importOptOutSMS(dataRecord, rowIndex, rowCells, options, callback) {
  // Check if a label is defined like ['sms', 'SMS']
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabels option is undefined');
    return;
  }
  // this table contains different value collected by the parser to convert to "true"
  const trueValue = [
    'true',
    '1',
    'ok',
    'o',
    'O',
    'oui',
    'OUI',
    'ouais',
    'yes',
    'Yes',
    'YES',
    'accepté',
    'accepter',
    'accept',
    'agree',
    'approve',
    'admit',
    'valid',
    'validé',
    'available',
    'effective',
    'effectual',
    'agréer',
    'agrée',
  ];
  const cellLabel = options.cellLabel;
  const cellValue = parseUtils.getCellValue(rowCells, cellLabel);
  if (cellValue) {
    // if rgpd value is not empty
    const smsConsent = trueValue.includes(cellValue.toString()); // return boolean for SMS rgpd
    dataRecord.importStats.dataPresence.customer.optOutSMS = true;
    dataRecord.importStats.dataValidity.customer.optOutSMS = true;
    dataRecord.customer.optOutSMS = smsConsent;
  } else {
    dataRecord.importStats.dataPresence.customer.optOutSMS = false;
    dataRecord.importStats.dataValidity.customer.optOutSMS = false;
    dataRecord.customer.optOutSMS = null;
  }

  callback && callback(null, dataRecord);
};
