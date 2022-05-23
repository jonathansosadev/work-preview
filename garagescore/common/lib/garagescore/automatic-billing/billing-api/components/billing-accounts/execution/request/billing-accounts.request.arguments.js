const moment = require('moment');
const BillingAccountException = require('../billing-accounts.exception');

class BillingAccountRequestArguments {
  constructor(...argumentContainers) {
    this._params = {};
    this._paramsCheckingConditionCatalog = {
      billingAccountId: null,
      garageId: null,
      sub: null,
      billingAccountName: /(?=^[a-z0-9]+([-_ ]{1,1}[a-z0-9]+)*$)(?=^.{3,50}$)/i,
      billingAccountEmail: null, // TODO split by space and make multiple checks of gsEmail.regexp,
      billingAccountAccountingId: null,
      billingAccountCompanyName: null,
      billingAccountPostalCode: null,
      billingAccountCity: null,
      billingAccountCountry: null,
      billingAccountBillingType: null,
      billingAccountBillingTypePrice: null,
      billingAccountAddress: /(?=^[a-z0-9,;éèàêûîôâäëüïö]+([-_ ]{1,1}[a-z0-9,;éèàêûîôâäëüïö]+)*$)(?=^.{3,50}$)/i,
      billingAccountNote: (e) => typeof e === 'string',
      billingAccountGoCardLessSetup: (e) => typeof e === 'boolean',
      billingAccountMandateId: (e) => typeof e === 'string',
      billingAccountCustomerId: (e) => typeof e === 'string',
      billingAccountTechnicalContact: (e) => typeof e === 'string',
      billingAccountAccountingContact: (e) => typeof e === 'string',
      billingAccountRGPDContact: /(?=^[a-z0-9,;éèàêûîôâäëüïö]+([-_ ]{1,1}[a-z0-9,;éèàêûîôâäëüïö]+)*$)(?=^.{3,50}$)/i,
      billingAccountBillingDate: (d) => d >= 1 && d <= 31,
      dateStart: (d) => moment(d, moment.ISO_8601, true).isValid(),
      dateEnd: (d) => moment(d, moment.ISO_8601, true).isValid(),
      active: (e) => typeof e === 'boolean',
      setup: (e) => typeof e === 'object',
      subApv: (e) => typeof e === 'object',
      subSale: (e) => typeof e === 'object',
      subLeads: (e) => typeof e === 'object',
      subEReputation: (e) => typeof e === 'object',
      subVehicleInspection: (e) => typeof e === 'object',
      subAnalytics: (e) => typeof e === 'object',
      subUsers: (e) => typeof e === 'object',
      subContacts: (e) => typeof e === 'object',
      sub100Contacts: (e) => typeof e === 'object',
      annex: (e) => typeof e === 'object',
    };

    this._mergeParams(argumentContainers);
  }

  checkParams(argNames) {
    let split = [];

    for (let argName of argNames) {
      if (argName[0] === '$') {
        argName = argName.slice(1);
        argName += '.Strict';
      }
      split = argName.split('.');
      split[0] = `${split[0][0].toLowerCase()}${split[0].slice(1)}`;
      if (typeof this._paramsCheckingConditionCatalog[split[0]] === 'undefined') {
        throw new BillingAccountException('Unknown argument').serverError();
      }
      if (split[1] && split[1] === 'Strict') {
        this.__genericStrictCheckingFunction(split[0]);
      }
      this.__genericCheckingFunction(split[0]);
    }
  }

  get params() {
    return this._params;
  }

  _addParams(argContainer) {
    if (argContainer) {
      for (const paramName of Object.getOwnPropertyNames(argContainer)) {
        if (typeof this._paramsCheckingConditionCatalog[paramName] !== 'undefined') {
          this._params[paramName] = argContainer[paramName];
        }
      }
    }
  }

  _mergeParams(argumentContainers) {
    for (const argContainer of argumentContainers) {
      this._addParams(argContainer);
    }
  }

  __genericStrictCheckingFunction(p) {
    if (!this._params[p] && typeof this._params[p] !== 'number') {
      throw new BillingAccountException(`Param ${p} is missing`).badRequest();
    }
  }

  __genericCheckingFunction(p) {
    const val = this._params[p];
    const valIsDefined = typeof val !== 'undefined';
    const checkAction = this._paramsCheckingConditionCatalog[p];

    if (this._params[p] && valIsDefined && checkAction) {
      if (checkAction instanceof RegExp && !val.match(checkAction)) {
        throw new BillingAccountException(`Param ${p} is not valid`).badRequest();
      } else if (typeof checkAction === 'function' && !checkAction(val)) {
        throw new BillingAccountException(`Param ${p} is not valid`).badRequest();
      }
    }
  }
}

module.exports = BillingAccountRequestArguments;
