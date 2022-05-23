'use strict';

var debug = require('debug')('garagescore:common:mixins:event-emitter'); // eslint-disable-line max-len,no-unused-vars

/*
 * Status mixin
 */

function statusMixin(Model, options) {
  Model.defineProperty('status', {
    type: 'String',
    default: 'New',
  });

  /* Change status (static) */
  Model.updateStatus = function (id, status, callback) {
    Model.findById(id, function (getByIdErr, modelInstance) {
      if (getByIdErr) {
        console.error(Model.modelName + '.remoteEmitEvent findById Error: ' + getByIdErr);
        callback(getByIdErr);
        return;
      }
      modelInstance.status = status;
      modelInstance.save(callback);
    });
  };

  Model.remoteMethod('updateStatus', {
    http: {
      path: '/:id/update-status',
      verb: 'post',
    },
    description: 'Update the instance status',
    accepts: [
      {
        arg: 'id',
        type: 'string',
        required: true,
      },
      {
        arg: 'status',
        type: 'string',
        required: true,
      },
    ],
    returns: [
      {
        root: true,
        type: 'object',
      },
    ],
  });
}

module.exports = statusMixin;
