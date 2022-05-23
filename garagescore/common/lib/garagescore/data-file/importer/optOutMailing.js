const parseUtils = require('./parse-utils');
// Get optOutMailing consent or not
module.exports = function importOptOutMailing(dataRecord, rowIndex, rowCells, options, callback) {
  // Check if a label is defined like ['rgpd', 'GPDR']
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
    const emailConsent = trueValue.includes(cellValue.toString()); // return boolean for mailing rgpd
    dataRecord.importStats.dataPresence.customer.optOutMailing = true;
    dataRecord.importStats.dataValidity.customer.optOutMailing = true;
    dataRecord.customer.optOutMailing = emailConsent;
  } else {
    dataRecord.importStats.dataPresence.customer.optOutMailing = false;
    dataRecord.importStats.dataValidity.customer.optOutMailing = false;
    dataRecord.customer.optOutMailing = null;
  }

  callback && callback(null, dataRecord);
};
