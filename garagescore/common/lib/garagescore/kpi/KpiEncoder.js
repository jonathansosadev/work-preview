const MongoObjectID = require('mongodb').ObjectID;

const kpiDictionary = require('./KpiDictionary');

class KpiEncoder {
  /* ******************************* */
  /*              PUBLIC             */
  /* ******************************* */

  /**
   * This function encode a plain object with the corresponding key, for instance a { countLeads: { gte: 7 } } becomes
   * { 1001: { gte: 7 } }, we don't encode protected keys (see above) or already numeric keys (hence the regex in the code)
   * and we also encode sub-object with recursivity but not the objectId which are special object
   * @param obj the object you need to encode
   * @param eraseZero if true we will delete every field equal to zero
   */
  static encodeObject(obj = {}, eraseZero) {
    for (const [key, value] of Object.entries(obj || {})) {
      const reservedKey = this._reservedKeys.includes(key);
      if (key.indexOf(this._reservedLoopbackPrefix) !== 0) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !MongoObjectID.isValid(obj[key])) {
          this.encodeObject(obj[key], eraseZero);
        }
        if (!reservedKey && !/^\d+$/.test(key) && typeof kpiDictionary[key] !== 'undefined') {
          obj[kpiDictionary[key]] = obj[key]; // eslint-disable-line no-param-reassign
          delete obj[key]; // eslint-disable-line no-param-reassign
          if (!obj[kpiDictionary[key]] && eraseZero && !this._dontEraseZero.includes(key)) {
            delete obj[kpiDictionary[key]]; // eslint-disable-line no-param-reassign
            if (obj.unsetAttribute && typeof obj.unsetAttribute === 'function') {
              obj.unsetAttribute(kpiDictionary[key]);
            }
          }
        }
        // translate things like { $sum: '$countLeads'}
        if (reservedKey && value && value[0] === '$') {
          const valueTranslated = kpiDictionary[value.substr(1)];
          if (typeof valueTranslated !== 'undefined') {
            obj[key] = `$${valueTranslated}`; // eslint-disable-line no-param-reassign
          }
        }
      }
    }
  }

  /**
   * This function does exactly the same as the encoding one but in reverse...
   * @param obj the object you wanna decode
   */
  static decodeObj(obj = {}) {
    if (Array.isArray(obj)) {
      for (const elem of obj) {
        this.decodeObj(elem);
      }
    } else {
      for (const validKey of Object.keys(kpiDictionary)) {
        obj[validKey] = obj[kpiDictionary[validKey]] || 0; // eslint-disable-line no-param-reassign
        delete obj[kpiDictionary[validKey]]; // eslint-disable-line no-param-reassign
        if (obj.unsetAttribute && typeof obj.unsetAttribute === 'function') {
          obj.unsetAttribute(kpiDictionary[validKey]);
        }
      }
    }
  }

  /**
   * Encoding the order parameter is a bit different since it is just a string and not an object
   * @param token the original order parameter, eg: "countLeads DESC"
   * @returns {*} either an encoded string, eg "1001 DESC" or null
   */
  static encodeOrder(token = null) {
    if (token) {
      const tmp = token.split(' ');
      const key = tmp[0];
      const sort = tmp[1];
      return `${kpiDictionary[key]} ${sort}`;
    }
    return null;
  }

  static get dontEraseZero() {
    return this._dontEraseZero;
  }

  /* ******************************* */
  /*             PRIVATE             */
  /* ******************************* */

  static get _reservedKeys() {
    // TODO: reorganize to recognize loopback keys, mongo find keys & mongo aggregate keys @ 1st sight
    const keys = [];

    keys.push(...['_id', 'id', 'errors', 'createdAt', 'updatedAt', 'exists']);
    keys.push(...['and', 'or', 'gt', 'gte', 'lt', 'lte', 'between', 'inq', 'nin', '$in', '$ne']);
    keys.push(...['near', 'neq', 'like', 'nlike', 'ilike', 'nilike', 'regexp']);
    keys.push(...['$currentDate', '$inc', '$max', '$min', '$mul', '$rename', '$setOnInsert', '$sum', '$avg']);
    keys.push(...['$set', '$unset', '$addToSet', '$pop', '$pullAll', '$pull', '$pushAll', '$push', '$bit']);

    keys.push(...['$first', '$gt', '$lt', 'if', 'then', 'else', '$cond', '$multiply', '$divide']);
    return keys;
  }

  static get _reservedLoopbackPrefix() {
    return '__';
  }

  static get _dontEraseZero() {
    return ['garageId', 'userId', 'kpiType', 'garageType', 'period', 'sourceType', 'automationCampaignId'];
  }
}

module.exports = exports = KpiEncoder;

Object.defineProperty(exports, '__esModule', { value: true });
