const moment = require('moment');
const { DataTypes, LeadSaleTypes } = require('../../../../../frontend/utils/enumV2');
const { FLO, log } = require('../../../util/log');
const { isUnitTest } = require('../../../util/process-env');

const dataTypeToKpiSuffix = (dataType) => {
  switch (dataType) {
    case DataTypes.MAINTENANCE:
      return 'Apv';
    case DataTypes.NEW_VEHICLE_SALE:
      return 'Vn';
    case DataTypes.USED_VEHICLE_SALE:
      return 'Vo';
    case LeadSaleTypes.UNKNOWN:
      return 'Unknown';
    default:
      return '';
  }
};

/**
 * Check if the column's value is consistent and report it in an internal event if not.
 * @param {string} key
 * @param {number} value
 * @returns {boolean} isInvalid
 */
function _isColumnInvalid(key, value) {
  if (typeof value === 'string' && value === '') {
    return false;
  }

  const monitorByTypes = {
    PCT: (value) => value < 0 || value > 100,
    COUNT: (value) => value < 0,
    NPS: (value) => value < -100 || value > 100,
    SCORE: (value) => value < 0 || value > 10,
  };
  const type = Object.keys(monitorByTypes).find((type) => key.includes(type));
  if (type && (typeof value !== 'number' || isNaN(value) || monitorByTypes[type](value))) {
    return true;
  }
  return false;
}

function _getKpiValue({ document, key: rawKey, dataTypes, avg = false, pct = false, round = true }) {
  const key = (rawKey, pct = false, type = null) => `${rawKey}${pct ? 'Percent' : ''}${type || ''}`;
  let result = 0;
  let type = '';

  if (!rawKey) {
    return 0;
  }

  if (!dataTypes || !dataTypes.length || dataTypes.includes('All')) {
    const val = 10 * (document[key(rawKey, pct, null)] || 0);

    return round ? Math.round(val) / 10 : val / 10;
  }

  for (const dataType of dataTypes) {
    type = dataTypeToKpiSuffix(dataType);
    result += document[key(rawKey, pct, type)] || 0;
  }

  if (avg) {
    result /= dataTypes.length;
  }

  return Math.round(10 * result) / 10;
}

module.exports = {
  countdown(value, closeDate) {
    let diff = null;
    if (!closeDate) {
      const startDate = moment(new Date(value));
      diff = moment.duration(moment().diff(startDate));
    } else {
      const startDate = moment(new Date(value));
      diff = moment.duration(moment(closeDate).diff(startDate));
    }

    // Day
    const days = Math.floor(diff.asDays());
    return `${days}j`;
  },

  dataTypeToKpiSuffix,

  extractKpiFromKey({
    document,
    key: rawKey,
    dataTypes,
    avg = false,
    pct = false,
    round = true,
    onError,
    columnName = '',
  }) {
    const value = _getKpiValue({ document, key: rawKey, dataTypes, avg, pct, round });

    /* tigger the monitoring only if a columnName and the onError function are passed */
    if (!isUnitTest() && typeof onError !== 'undefined' && columnName) {
      try {
        if (_isColumnInvalid(columnName, value)) {
          onError(columnName);
        }
      } catch (error) {
        log.error(FLO, error.message);
      }
    }

    return value;
  },
};
