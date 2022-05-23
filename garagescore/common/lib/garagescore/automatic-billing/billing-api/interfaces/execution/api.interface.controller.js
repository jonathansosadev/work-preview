/**
 * Interface for the components controller
 * @interface
 */
class IApiController {
  // ==============================
  // =        CONSTRUCTOR         =
  // ==============================

  // Everything is social construction

  // ==============================
  // =      PUBLIC METHODS        =
  // ==============================

  // I don't wanna be famous

  // ==============================
  // =      PRIVATE METHODS       =
  // ==============================

  /**
   * Treat an exception and answer the request accordingly
   * @param e {IApiException} the exception object
   * @param res the express 'res' object
   * @returns {boolean} well returns false by conventionn but not very useful
   * @private
   * @static
   */
  static _treatException(e, res) {
    const data = this._treatData(null, e.reason || 'SERVER_ERROR');
    const responses = {
      OK: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      SERVER_ERROR: 500,
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(responses[e.reason] || responses.SERVER_ERROR);
    data.exception = e.error || 'Unknown Error';
    res.send(JSON.stringify(data));
    return false;
  }

  /**
   * Treat a successful request and answer it accordinigly
   * @param element the data you wanna send in the response
   * @param res the express 'res' object
   * @returns {boolean} well returns true by convention but not very useful
   * @private
   * @static
   */
  static _treatSuccess(element, res) {
    const data = this._treatData(element, 'OK');
    const responses = {
      OK: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      SERVER_ERROR: 500,
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(responses.OK);
    res.send(JSON.stringify(data));
    return true;
  }

  /**
   * Format the data that will be send into the response
   * @param content the real content to be sent
   * @param message the message sent along with the content, usually 'OK' if everything went well
   * @returns {{}} an object with those fields: 'content', 'message', 'success' and 'pages'
   * @private
   * @static
   */
  static _treatData(content, message) {
    const data = {};

    data.content = content;
    data.message = message;
    data.success = message === 'OK';
    data.pages = this._treatPages();
    return data;
  }

  /**
   * Build the page system when the content is too big
   * @returns {{}} an object containing the page system and pages information
   * @private
   * @static
   * @todo
   */
  static _treatPages() {
    // TODO PageSystem
    return {};
  }
}

module.exports = IApiController;
