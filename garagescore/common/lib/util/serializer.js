const { ObjectID } = require('mongodb');
const { safeJSONParse, safeJSONStringify } = require('./json');

const objectIdToken = '%%OBJECTID%%';
const dateToken = '%%DATE%%-';
const regExpToken = '%%REGEXP%%-';
const dateRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

module.exports = {
  _serializer(key, value) {
    if (this[key] instanceof Date) {
      return `${dateToken}${value}`;
    }
    if (this[key] instanceof ObjectID) {
      return `${objectIdToken}${value}`;
    }
    if (this[key] instanceof RegExp) {
      const regexObj = { flags: this[key].flags || '', source: this[key].source || '' };
      return `${regExpToken}${safeJSONStringify(regexObj)}`;
    }
    return value;
  },
  _deserializer(key, value) {
    if (typeof value === 'string' && value.includes(dateToken)) {
      return new Date(value.replace(dateToken, ''));
    }
    if (typeof value === 'string' && value.includes(objectIdToken)) {
      return new ObjectID(value.replace(objectIdToken, ''));
    }
    if (typeof value === 'string' && value.includes(regExpToken)) {
      const { source = '', flags = '' } = safeJSONParse(value.replace(regExpToken, ''));
      return new RegExp(source, flags);
    }
    return value;
  },
  serialize(item) {
    return JSON.stringify(item, this._serializer);
  },
  deserialize(item) {
    return JSON.parse(item, this._deserializer);
  },
};
