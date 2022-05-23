const s = require('underscore.string');
const parseUtils = require('./parse-utils');
const dataTypes = require('../../../../models/data/type/data-types');

const getDefaultTypes = () => {
  return {
    /* eslint-disable comma-dangle,quote-props */
    INTER: dataTypes.MAINTENANCE,
    apv: dataTypes.MAINTENANCE,
    APV: dataTypes.MAINTENANCE,
    MECANIQUE: dataTypes.MAINTENANCE,
    'intervention carrosserie': dataTypes.MAINTENANCE,
    'intervention mécanique': dataTypes.MAINTENANCE,
    SAV: dataTypes.MAINTENANCE,
    Entretien: dataTypes.MAINTENANCE,
    Atelier: dataTypes.MAINTENANCE,
    CARROSSERIE: dataTypes.MAINTENANCE,
    Dépannage: dataTypes.MAINTENANCE,
    'SAV SAINT CLOUD': dataTypes.MAINTENANCE,
    'Intervention inconnu': dataTypes.MAINTENANCE,
    'Intervention atelier': dataTypes.MAINTENANCE,
    'TYPE : Intervention Atelier avec RDV': dataTypes.MAINTENANCE,
    'TYPE : Intervention Atelier sans RDV': dataTypes.MAINTENANCE,
    'Après-Vente': dataTypes.MAINTENANCE,
    'Intervention Atelier': dataTypes.MAINTENANCE,
    'Carrosserie avec assurance': dataTypes.MAINTENANCE,
    'Carrosserie sans assurance': dataTypes.MAINTENANCE,
    'Facture - Atelier': dataTypes.MAINTENANCE,
    'SAV MANTES LA JOLIE': dataTypes.MAINTENANCE,
    'SAV RUEIL': dataTypes.MAINTENANCE,
    ATELIER: dataTypes.MAINTENANCE,
    VN: dataTypes.NEW_VEHICLE_SALE,
    'TYPE : Ventes VN et achats VO': dataTypes.NEW_VEHICLE_SALE,
    'Vente véhicule neuf': dataTypes.NEW_VEHICLE_SALE,
    'V.N.': dataTypes.NEW_VEHICLE_SALE,
    'Vente VN': dataTypes.NEW_VEHICLE_SALE,
    vn: dataTypes.NEW_VEHICLE_SALE,
    'Parc VN': dataTypes.NEW_VEHICLE_SALE,
    'VN CHAMBOURCY': dataTypes.NEW_VEHICLE_SALE,
    'SAV CHAMBOURCY': dataTypes.NEW_VEHICLE_SALE,
    'VN MANTES LA JOLIE': dataTypes.NEW_VEHICLE_SALE,
    'VN Facture principale - VN': dataTypes.NEW_VEHICLE_SALE,
    'VN SAINT CLOUD': dataTypes.NEW_VEHICLE_SALE,
    VD: dataTypes.NEW_VEHICLE_SALE,
    'VN RUEIL': dataTypes.NEW_VEHICLE_SALE,
    'VN ORGEVAL': dataTypes.NEW_VEHICLE_SALE,
    '1': dataTypes.NEW_VEHICLE_SALE,
    '4': dataTypes.NEW_VEHICLE_SALE,
    '7': dataTypes.NEW_VEHICLE_SALE,
    N: dataTypes.NEW_VEHICLE_SALE,
    'Vente matériel neuf': dataTypes.NEW_VEHICLE_SALE,
    '10': dataTypes.NEW_VEHICLE_SALE,
    neuf: dataTypes.NEW_VEHICLE_SALE,
    direction: dataTypes.NEW_VEHICLE_SALE,
    '16': dataTypes.NEW_VEHICLE_SALE,
    vo: dataTypes.USED_VEHICLE_SALE,
    VO: dataTypes.USED_VEHICLE_SALE,
    'Parc VO': dataTypes.USED_VEHICLE_SALE,
    'VO Facture principale - VO': dataTypes.USED_VEHICLE_SALE,
    'VO CHAMBOURCY': dataTypes.USED_VEHICLE_SALE,
    'VO MANTES LA JOLIE': dataTypes.USED_VEHICLE_SALE,
    'VO SAINT CLOUD': dataTypes.USED_VEHICLE_SALE,
    'VO RUEIL': dataTypes.USED_VEHICLE_SALE,
    'VO ORGEVAL': dataTypes.USED_VEHICLE_SALE,
    '2': dataTypes.USED_VEHICLE_SALE,
    '5': dataTypes.USED_VEHICLE_SALE,
    '8': dataTypes.USED_VEHICLE_SALE,
    '11': dataTypes.USED_VEHICLE_SALE,
    '14': dataTypes.USED_VEHICLE_SALE,
    occasion: dataTypes.USED_VEHICLE_SALE,
    'TYPE : Ventes et achats VO': dataTypes.USED_VEHICLE_SALE,
    "Vente matériel d'occasion": dataTypes.USED_VEHICLE_SALE,
    U: dataTypes.USED_VEHICLE_SALE,
    'V.O.': dataTypes.USED_VEHICLE_SALE,
    'Vente VO': dataTypes.USED_VEHICLE_SALE,
    'Vente véhicule occasion': dataTypes.USED_VEHICLE_SALE,
    'Achat VO': dataTypes.USED_VEHICLE_SALE,
    /* eslint-enable comma-dangle,quote-props */
  };
};
const TYPES_REGEXP = {
  /* eslint-disable comma-dangle,quote-props */
  'VN .*': dataTypes.NEW_VEHICLE_SALE,
  /* eslint-enable comma-dangle,quote-props */
};

const match = function match(val) {
  for (const regexp in TYPES_REGEXP) {
    // eslint-disable-line
    if (val.match(new RegExp(regexp))) {
      return TYPES_REGEXP[regexp];
    }
  }
  return null;
};

module.exports = function importRowType(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }
  const cellLabel = options.cellLabel;
  let TYPES = {};
  // Custom datatypes
  if (options.dataTypes) {
    TYPES = options.dataTypes;
  } else {
    TYPES = getDefaultTypes();
  }

  dataRecord.importStats.dataPresence.rowType = false;
  dataRecord.importStats.dataValidity.rowType = false;

  const cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.rowType = true;
    if (TYPES[cellValue]) {
      dataRecord.importStats.dataValidity.rowType = true;
      if (dataRecord.type) {
        // gsLogger.warn('Row %d, Column "%s": Overriding dataRecord.type %s -> %s',
        //   rowIndex, cellLabel, cellValue, dataRecord.type, TYPES[cellValue]);
      }
      dataRecord.type = TYPES[cellValue];
    } else {
      const v = match(cellValue);
      if (v) {
        dataRecord.importStats.dataValidity.rowType = true;
        if (dataRecord.type) {
          // gsLogger.warn('Row %d, Column "%s": Overriding dataRecord.type %s -> %s',
          //   rowIndex, cellLabel, cellValue, dataRecord.type, TYPES[cellValue]);
        }
        dataRecord.type = v;
      } else {
        // gsLogger.warn('Row %d, Column "%s": rowType %s not recognized', rowIndex, cellLabel, cellValue);
      }
    }
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
  }
  callback && callback(null, dataRecord);
};
