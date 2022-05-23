'use strict';

var debug = require('debug')('garagescore:common:mixins:testable'); // eslint-disable-line max-len,no-unused-vars
var env = require('require-env');

/*
 * Testable mixin
 When activated with the env var USE_TEST_COLLECTIONS, model will be stored in collection using
 a suffix _test, useful to not overwrite data in the original collection
 */

function testableMixin(Model, options) {
  try {
    if (env.require('USE_TEST_COLLECTIONS') && env.require('USE_TEST_COLLECTIONS') === 'true') {
      if (Model.settings.mongodb) {
        // embeded collection dont have a table
        debug('Using test collection for model : ' + Model.settings.mongodb.collection);
        Model.settings.mongodb.collection += '_test';
      }
      if (Model.modelName === 'User' || Model.modelName === 'Event') {
        if (!Model.settings.mongodb) {
          Model.settings.mongodb = {};
        }
        Model.settings.mongodb.collection = Model.modelName + '_test';
      }
    }
  } catch (e) {
    /* no env var, can be normal so just continue...*/
  }
}

module.exports = testableMixin;
