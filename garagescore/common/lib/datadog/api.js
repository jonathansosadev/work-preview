'use strict';

var config = require('config');
var debug = require('debug')('garagescore:common:lib:datadog:api'); // eslint-disable-line max-len,no-unused-vars
var dogapi = require('dogapi');

if (config.has('datadog.apiKey')) {
  var dogApiOptions = {
    api_key: config.get('datadog.apiKey'),
    app_key: config.get('datadog.applicationKey'),
  };

  dogapi.initialize(dogApiOptions);
}

module.exports = dogapi;
