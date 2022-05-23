const BillingAccountException = require('../billing-accounts.exception');

class BillingAccountPipelineData {
  constructor(argv, models) {
    this._argv = argv;
    this._models = models;
    this._patterns = [];
    this._lastError = '';
  }

  get argv() {
    return this._argv;
  }

  get models() {
    return this._models;
  }

  enrich(container, expectations) {
    let elem = null;

    if (typeof expectations === 'string') {
      return this.enrich(container, [expectations]);
    }
    if (!container && expectations && expectations.length > 0) {
      this._lastError = 'No container';
      return false;
    }
    for (const exp of expectations) {
      elem = this._normalize(exp);
      if (!container[elem.val]) {
        this._lastError = `${elem.val}::Does not exist in container`;
        return false;
      }
      this._argv[elem.val] = container[elem.val] || null;
      if (elem.val === 'billingAccount') {
        this._argv.billingAccountId = this._argv.billingAccountId || container.billingAccount.id;
        this._argv.billingAccountName = this._argv.billingAccountName || container.billingAccount.name;
        this._argv.billingAccountEmail = this._argv.billingAccountEmail || container.billingAccount.email;
        this._argv.billingAccountBillingDate =
          this._argv.billingAccountBillingDate || container.billingAccount.billingDate;
      }
    }
    return true;
  }

  isMatchingExpectations(expectations) {
    let elem = null;

    if (typeof expectations === 'string') {
      return this.isMatchingExpectations([expectations]);
    }
    for (const exp of expectations) {
      elem = this._normalize(exp);
      if (
        (!this._argv[elem.val] && typeof this._argv[elem.val] !== 'number') ||
        (elem.type !== 'misc' &&
          ((elem.type === 'array' && !Array.isArray(this._argv[elem.val])) || typeof this._argv[elem.val] !== 'object'))
      ) {
        this._lastError = `${elem.val}::Does not exist in argv`;
        return false;
      }
    }
    return true;
  }

  get error() {
    return this._lastError;
  }

  extract(expectation) {
    if (expectation === 'null') {
      return null;
    }
    return this._argv[this._normalize(expectation).val] || null;
  }

  addPattern(pattern) {
    if (!pattern || !pattern.short || !pattern.long) {
      throw new BillingAccountException('Non valid PipelineData Pattern').serverError();
    }
    this._patterns.push(pattern);
  }

  _normalize(expectation) {
    const res = { type: 'misc', val: expectation };

    for (const pat of this._patterns) {
      res.val = res.val.replace(pat.short, pat.long);
    }
    if (res.val[0] === '[' && res.val[res.val.length - 1] === ']') {
      res.val = res.val.replace('[', '').replace(']', '');
      res.val += 's';
      res.type = 'array';
    } else if (res.val[0] === '{' && res.val[res.val.length - 1] === '}') {
      res.val = res.val.replace('{', '').replace('}', '');
      res.type = 'object';
    }
    return res;
  }
}

module.exports = BillingAccountPipelineData;
