'use strict';

var _ = require('lodash');
var debug = require('debug')('garagescore:common:lib:csv:util'); // eslint-disable-line max-len,no-unused-vars

function toSafeCsvValue(value) {
  return ['"', _.replace(value, /"/g, '""'), '"'].join('');
}

module.exports = {
  toSafeCsvValue: toSafeCsvValue,
};
