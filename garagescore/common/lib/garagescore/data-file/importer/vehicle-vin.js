const parseUtils = require('./parse-utils');
const vinParser = require('../../vehicle/vin-parser');

/** Import VIN but also make and model if possible */

module.exports = function importVehicleVin(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }
  const cellLabel = options.cellLabel;
  if (typeof dataRecord.importStats.dataPresence.vehicle === 'undefined') {
    dataRecord.importStats.dataPresence.vehicle = {};
  }
  const cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (cellValue) {
    dataRecord.importStats.dataPresence.vehicle.vin = true;
    if (typeof dataRecord.vehicle === 'undefined') {
      dataRecord.vehicle = {};
    }
    dataRecord.vehicle.vin = cellValue;
    dataRecord.importStats.dataValidity.vehicle.vin = true;
  } else {
    dataRecord.importStats.dataPresence.vehicle.vin = false;
  }

  // try to extract make and model
  if (dataRecord.vehicle && dataRecord.vehicle.vin && (!dataRecord.vehicle.make || !dataRecord.vehicle.model)) {
    const p = vinParser.parse(dataRecord.vehicle.vin);
    if (p.make && !dataRecord.vehicle.make) {
      dataRecord.importStats.dataValidity.vehicle.make = true;
      dataRecord.importStats.dataPresence.vehicle.make = true;
      dataRecord.vehicle.make = p.make;
    }
    if (p.model && !dataRecord.vehicle.model) {
      dataRecord.importStats.dataValidity.vehicle.model = true;
      dataRecord.importStats.dataPresence.vehicle.model = true;
      dataRecord.vehicle.model = p.model;
    }
  }

  callback && callback(null, dataRecord);
};
