/*
 * Workaround Script against:
 * https://github.com/strongloop/loopback/issues/274
 * “ID values incorrectly stored as plain strings in relation tables for mongodb”
 */

var debug = require('debug')('garagescore:server:boot:fix-mongo-models'); // eslint-disable-line max-len,no-unused-vars
var ObjectID = require('mongodb').ObjectID;
var debugPerfs = require('debug')('perfs:server:boot:fix-mongo-models');

debugPerfs('Starting boot fix-mongo-models');

module.exports = function (app) {
  var models = app.models();
  //
  var fixRelations = function (Model, ctx) {
    var relations = Model.settings.relations;
    for (var k in relations) {
      // eslint-disable-line guard-for-in
      var fk = relations[k].foreignKey !== '' ? relations[k].foreignKey : k + 'Id';
      if (relations[k].type === 'belongsTo') {
        if (ctx.args.data[k] && typeof ctx.args.data[k] === 'object' && ctx.args.data[k].id) {
          // ↑ should add a mongodb objectId regex in the condition
          ctx.args.data[fk] = new ObjectID(ctx.args.data[k].id); // eslint-disable-line no-param-reassign
          delete ctx.args.data[k]; // eslint-disable-line no-param-reassign
        } else if (
          ctx.args.data[fk] &&
          typeof ctx.args.data[fk] === 'string' &&
          String(ctx.args.data[fk].length) === 24
        ) {
          // ↑ should add a mongodb objectId regex in the condition instead
          ctx.args.data[fk] = new ObjectID(ctx.args.data[fk]); // eslint-disable-line no-param-reassign
        }
      }
    }
  };
  //
  var fixProps = function (Model, ctx) {
    var getAction = function (type) {
      switch (type) {
        case 'date':
          return 'date';
        default:
          if (Model.app.models[type]) {
            return 'model';
          }
          return null;
      }
    };
    var processData = function (data, props) {
      for (var k in props) {
        // eslint-disable-line guard-for-in
        var type = props[k].type;
        if (type && typeof type === 'string') {
          var action = getAction(props[k].type);
          if (action === 'date' && data[k] && typeof data[k] === 'string') {
            // ↑ should add some type of date regex here
            data[k] = new Date(data[k]); // eslint-disable-line no-param-reassign
          } else if (action === 'model' && data[k]) {
            processData(data[k], Model.app.models[type].definition.rawProperties);
          }
        }
      }
    };
    processData(ctx.args.data, Model.definition.rawProperties);
  };
  //
  models.forEach(function (Model) {
    Model.afterRemote('find', function (ctx, m, next) {
      console.log('find after remote');
      next();
    });
    ['create', 'upsert', 'updateAll', 'updateAttributes', 'destroyById', 'destroyAll'].forEach(function (methodName) {
      debug('Adding remote-hooks.beforeRemote(' + methodName + ') to Model: ' + Model.definition.name);

      Model.beforeRemote(methodName, function (ctx, m, next) {
        fixRelations(Model, ctx);
        fixProps(Model, ctx);
        next();
      });
    });
  });

  /** Make Event Collection testable */
  app.models.Event.mixin('Testable', {});
};
