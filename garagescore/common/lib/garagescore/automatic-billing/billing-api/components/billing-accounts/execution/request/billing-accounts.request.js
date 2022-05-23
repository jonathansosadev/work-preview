const BillingAccountRequestArguments = require('./billing-accounts.request.arguments');

class BillingAccountRequest {
  constructor(req, res, sendRes = true) {
    this._req = req;
    this._res = res;
    this._sendRes = sendRes;
    this._responses = {
      OK: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      SERVER_ERROR: 500,
    };
    this._billingAccountRequestArguments = new BillingAccountRequestArguments(req.body, req.params);
  }

  fail(e) {
    const data = this._buildData(null, e.reason || 'SERVER_ERROR');

    this._res.setHeader('Content-Type', 'application/json');
    this._res.status(this._responses[e.reason] || this._responses.SERVER_ERROR);
    data.exception = e.error || 'Unknown Error';
    this._send(data);
    return false;
  }

  success(element) {
    const data = this._buildData(element, 'OK');

    this._res.setHeader('Content-Type', 'application/json');
    this._res.status(this._responses.OK);
    this._send(data);
    return true;
  }

  _send(data) {
    if (this._sendRes) {
      this._res.send(JSON.stringify(data));
    }
  }

  checkArgs(argNames) {
    this._billingAccountRequestArguments.checkParams(argNames);
  }

  get argv() {
    return this._billingAccountRequestArguments.params;
  }

  _buildData(content, message) {
    const data = {};

    data.content = content;
    data.message = message;
    data.success = message === 'OK';
    data.pages = this._buildPages();
    return data;
  }

  _buildPages() {
    // For now
    return {};
  }
}

module.exports = BillingAccountRequest;
