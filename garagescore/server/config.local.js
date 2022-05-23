'use strict';

var config = require('config');
var debug = require('debug')('garagescore:server:config.local'); // eslint-disable-line max-len,no-unused-vars

module.exports = {
  // Add properties to the config defined in config.json

  cookieSecret: config.get('cookies.secret'),
};
