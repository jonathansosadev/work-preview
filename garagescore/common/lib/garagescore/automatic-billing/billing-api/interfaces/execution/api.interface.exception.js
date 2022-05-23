/**
 * Interface for the component exception
 * @interface
 */
class IApiException {
  // ==============================
  // =        CONSTRUCTOR         =
  // ==============================

  /**
   * Build the IApiException Instance
   * @param type is a description of your component, for instance 'user'
   * @param msg is the error messsage
   * @constructs
   */
  constructor(type, msg) {
    if (typeof type !== 'string' || typeof msg !== 'string') {
      throw new Error("IApiException :: constructor() ::'type' and 'msg' must be string");
    }
    this._type = type;
    this._msg = msg;
    this._reason = '';
  }

  // ==============================
  // =      PUBLIC METHODS        =
  // ==============================

  /**
   * GETTER that returns the type (usually the component name) of the exception
   * @returns {String}
   * @public
   */
  get type() {
    return this._type;
  }

  /**
   * GETTER that returns the error message
   * @returns {String}
   * @public
   */
  get msg() {
    return this._msg;
  }

  /**
   * GETTER that returns the error message
   * @returns {String}
   * @public
   */
  get message() {
    return this._msg;
  }

  /**
   * GETTER that returns the complete error message
   * @returns {String}
   * @public
   */
  get error() {
    return `Exception in ${this.type} :: "${this.msg}"`;
  }

  /**
   * GETTER that returns the reason the exception happenned
   * @returns {String}
   * @public
   */
  get reason() {
    return this._reason;
  }

  /**
   * SET the reason to 'SERVER_ERROR'
   * @returns {IApiException}
   * @public
   */
  serverError() {
    this._reason = 'SERVER_ERROR';
    return this;
  }

  /**
   * SET the reason to 'NOT_FOUND'
   * @returns {IApiException}
   * @public
   */
  notFound() {
    this._reason = 'NOT_FOUND';
    return this;
  }

  /**
   * SET the reason to 'FORBIDDEN'
   * @returns {IApiException}
   * @public
   */
  forbidden() {
    this._reason = 'FORBIDDEN';
    return this;
  }

  /**
   * SET the reason to 'UNAUTHORIZED'
   * @returns {IApiException}
   * @public
   */
  unauthorized() {
    this._reason = 'UNAUTHORIZED';
    return this;
  }

  /**
   * SET the reason to 'BAD_REQUEST'
   * @returns {IApiException}
   * @public
   */
  badRequest() {
    this._reason = 'BAD_REQUEST';
    return this;
  }

  // ==============================
  // =      PRIVATE METHODS       =
  // ==============================

  // I have nothing to hide
}

module.exports = IApiException;
