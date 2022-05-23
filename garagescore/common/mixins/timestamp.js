/*
 * Timestamp mixin inspired by:
 *   https://docs.strongloop.com/display/public/LB/Defining+mixins
 *   https://github.com/clarkbw/loopback-ds-timestamp-mixin
 * Define and persist “createdAt” and “updatedAt” properties.
 */

var debug = require('debug')('garagescore:common:mixins:timestamp'); // eslint-disable-line max-len,no-unused-vars

function timestampMixin(Model, options) {
  Model.defineProperty('createdAt', {
    type: Date,
  });

  Model.defineProperty('updatedAt', {
    type: Date,
  });
  // disable the timestamps update for the next save
  Model.prototype.disableNextTimestampUpdate = function () {
    this.__noTimestampUpdate = true;
  };
  Model.observe('before save', function (ctx, next) {
    if (ctx.instance && ctx.instance.__noTimestampUpdate) {
      delete ctx.instance.__noTimestampUpdate;
      next();
      return;
    }
    if (ctx.data && ctx.data.__noTimestampUpdate) {
      delete ctx.data.__noTimestampUpdate;
      next();
      return;
    }
    if (ctx.instance && ctx.isNewInstance) {
      ctx.instance.createdAt = new Date();
    } else if (ctx.data) {
      delete ctx.data.createdAt;
    }
    if (ctx.instance) {
      ctx.instance.updatedAt = new Date();
    }
    if (ctx.data) {
      ctx.data.updatedAt = new Date();
    }

    next();
  });
}

module.exports = timestampMixin;
