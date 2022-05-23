/**
 * Add error Code for errors to be interpreted in the front
 * @param message
 * @param code
 * @param type
 * @constructor
 */

function GsError(message, code, type) {
  this.name = 'GsError';
  this.code = code;
  this.type = type;
  this.message = message;
}
GsError.prototype = Object.create(Error.prototype);
GsError.prototype.constructor = GsError;

module.exports = GsError;
