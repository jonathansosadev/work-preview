const moment = require('moment-timezone');

const IApiController = require('../../../interfaces/execution/api.interface.controller');
const BillingAccountRequest = require('./request/billing-accounts.request');
const BillingAccountPipeline = require('./pipelines/billing-accounts.pipeline');
const BillingAccountPipelineAction = require('./pipelines/billing-accounts.pipeline.action');
const BillingAccountPipelineCatalog = require('./pipelines/billing-accounts.pipeline.catalog');
const BillingHandler = require('../../../../automatic-billing-handler');

/**
 * BillingAccount Class
 * Contains all the CRUD and logical structure
 * @extends IApiController
 */
class BillingAccountsController extends IApiController {
  // ===========================================
  // =                                         =
  // =             Helping Methods             =
  // =                                         =
  // ===========================================

  /**
   * This method is called by everyone.
   * It executes the actions etc
   * @param app The express 'app'
   * @param req The express 'req'
   * @param res The express 'res'
   * @param checksToPerform Array of fields to check
   * @param actionsToPerform Array of actions to perform (function in catalog)
   * @param expectedOutput What do you expect?
   * @param sendRes Should we send a response?
   * @private
   */
  static _execute(app, req, res, checksToPerform, actionsToPerform, expectedOutput, sendRes = true) {
    const baRequest = new BillingAccountRequest(req, res, sendRes);
    const baPipeline = new BillingAccountPipeline(app, expectedOutput);

    baRequest.checkArgs(checksToPerform);
    for (const action of actionsToPerform) {
      baPipeline.pushBack(new BillingAccountPipelineAction(...action));
    }
    baPipeline
      .run(baRequest.argv)
      .then((data) => baRequest.success(data))
      .catch((err) => baRequest.fail(err));
  }

  // ===========================================
  // =                                         =
  // =   Overall BillingAccount CRUD Methods   =
  // =                                         =
  // ===========================================

  /**
   * GET All BillingAccounts
   * /darkbo/billing/billingaccounts
   */
  static getAllBillingAccounts(app, checksToPerform, req, res) {
    const checks = [...checksToPerform];
    const actions = [];

    actions.push(BillingAccountPipelineCatalog.getAllBillingAccounts);
    this._execute(app, req, res, checks, actions, '[BA]');
  }

  /**
   * GET One BillingAccount
   * /darkbo/billing/billingaccounts/:billingAccountId
   */
  static getBillingAccounts(app, checksToPerform, req, res) {
    const checks = [...checksToPerform];
    const actions = [];

    actions.push(BillingAccountPipelineCatalog.getOneBillingAccount);
    this._execute(app, req, res, checks, actions);
  }

  /**
   * POST One BillingAccount
   * /darkbo/billing/billingaccounts
   */
  static createBillingAccounts(app, checksToPerform, req, res) {
    const checks = [
      ...checksToPerform,
      '$BillingAccountName',
      '$BillingAccountEmail',
      '$BillingAccountBillingDate',
      '$BillingAccountAccountingId',
      '$BillingAccountCompanyName',
      '$BillingAccountPostalCode',
      '$BillingAccountCity',
      '$BillingAccountCountry',
      '$BillingAccountBillingType',
      '$BillingAccountBillingTypePrice',
      '$BillingAccountAddress',
    ];
    const actions = [];

    actions.push(BillingAccountPipelineCatalog.createBillingAccount);
    actions.push(BillingAccountPipelineCatalog.getOneBillingAccount);
    this._execute(app, req, res, checks, actions);
  }

  /**
   * PUT One BillingAccount
   * /darkbo/billing/billingaccounts/:billingAccountId
   */
  static updateBillingAccounts(app, checksToPerform, req, res) {
    const checks = [
      ...checksToPerform,
      'BillingAccountName',
      'BillingAccountEmail',
      'BillingAccountBillingDate',
      'BillingAccountAccountingId',
      'BillingAccountCompanyName',
      'BillingAccountPostalCode',
      'BillingAccountCity',
      '$BillingAccountCountry',
      'BillingAccountBillingType',
      'BillingAccountBillingTypePrice',
      'BillingAccountAddress',
    ];
    const actions = [];

    actions.push(BillingAccountPipelineCatalog.getOneBillingAccount);
    actions.push(BillingAccountPipelineCatalog.updateBillingAccount);
    this._execute(app, req, res, checks, actions);
  }

  /**
   * DELETE One BillingAccount
   * /darkbo/billing/billingaccounts/:billingAccountId
   */
  static deleteBillingAccounts(app, checksToPerform, req, res) {
    const checks = [...checksToPerform];
    const actions = [];

    actions.push(BillingAccountPipelineCatalog.getOneBillingAccount);
    actions.push(BillingAccountPipelineCatalog.deleteBillingAccount);
    this._execute(app, req, res, checks, actions, 'null');
  }

  // ===========================================
  // =                                         =
  // =   BillingAccount Garages CRUD Methods   =
  // =                                         =
  // ===========================================

  /**
   * POST One Garage for a given BillingAccount
   * ? why with an s then ? => addBillingAccountsGarages
   * Just add an existing Garage, donesn't create it
   * /darkbo/billing/billingaccounts/:billingAccountId/garages
   */
  static addBillingAccountsGarages(app, checksToPerform, req, res) {
    const checks = [...checksToPerform, '$GarageId'];
    const actions = [];

    actions.push(BillingAccountPipelineCatalog.getOneBillingAccount);
    actions.push(BillingAccountPipelineCatalog.getOneGarage);
    actions.push(BillingAccountPipelineCatalog.findAlreadyTakenGarages);
    actions.push(BillingAccountPipelineCatalog.checkIfGarageIsAlreadyTaken);
    actions.push(BillingAccountPipelineCatalog.addGaragetoBillingAccount);
    actions.push(BillingAccountPipelineCatalog.getOneBillingAccount);
    this._execute(app, req, res, checks, actions);
  }

  /**
   * DELETE One Garage for a given BillingAccount
   * just --> REMOVE <-- a Garage from a BillingAccount DOES NOT really Delete the Garage ;)
   * /darkbo/billing/billingaccounts/:billingAccountId/garages/:garageId
   */
  static removeBillingAccountsGarages(app, checksToPerform, req, res) {
    const checks = [...checksToPerform, '$GarageId'];
    const actions = [];

    actions.push(BillingAccountPipelineCatalog.getOneBillingAccount);
    actions.push(BillingAccountPipelineCatalog.getOneGarage);
    actions.push(BillingAccountPipelineCatalog.checkIfGarageExistsInBillingAccount);
    actions.push(BillingAccountPipelineCatalog.removeGarageFromBillingAccount);
    actions.push(BillingAccountPipelineCatalog.getOneBillingAccount);
    this._execute(app, req, res, checks, actions);
  }

  /**
   * !DEPRECATED! use graphql garage-set-create-subscriptions instead
   * @deprecated kept so api.interface.routes.js does not throw an error
   * Create a new subscription for a given Garage
   * @param app The express 'app'
   * @param checksToPerform The fields to check
   * @param req The express 'req'
   * @param res The express 'res'
   */
  // greyboUrls.BILLING.BILLING_ACCOUNTS.GARAGES.SUBSCRIPTIONS.CREATE
  // /darkbo/billing/billingaccounts/:billingAccountId/garages/:garageId/
  static createBillingAccountsGaragesSubscriptions(app, checksToPerform, req, res) {
    throw new Error('DEPRECATED: use graphql garageSetCreateSubscriptions instead');
  }

  /**
   * !DEPRECATED! use graphql garage-set-update-subscriptions instead
   * @deprecated kept so api.interface.routes.js does not throw an error
   * Update a running subscription for a given Garage
   * @param app The express 'app'
   * @param checksToPerform The fields to check
   * @param req The express 'req'
   * @param res The express 'res'
   */
  // greyboUrls.BILLING.BILLING_ACCOUNTS.GARAGES.SUBSCRIPTIONS.UPDATE
  // /darkbo/billing/billingaccounts/:billingAccountId/garages/:garageId/
  static updateBillingAccountsGaragesSubscriptions(app, checksToPerform, req, res) {
    throw new Error('DEPRECATED: use graphql garageSetUpdateSubscriptions instead');
  }

  /**
   * !DEPRECATED! use graphql garage-set-stop-subscriptions instead
   * @deprecated kept so api.interface.routes.js does not throw an error
   * Stop a running subscription for a given Garage
   * @param app The express 'app'
   * @param checksToPerform The fields to check
   * @param req The express 'req'
   * @param res The express 'res'
   */
  static stopBillingAccountsGaragesSubscriptions(app, checksToPerform, req, res) {
    throw new Error('DEPRECATED: use graphql garageSetStopSubscriptions instead');
  }

  // ===========================================
  // =                                         =
  // =     BillingAccount Bill CRUD Methods    =
  // =                                         =
  // ===========================================

  /**
   * Imitate the CRON logic, try to generate a bill for now
   * Send it as CSV if asked to, otherwise as JSON
   * @param app The express 'app'
   * @param checksToPerform The fields to check
   * @param req The express 'req'
   * @param res The express 'res'
   */
  static getBillBillingAccounts(app, checksToPerform, req, res) {
    const billingHandler = new BillingHandler(moment().tz('UTC').valueOf(), app);

    billingHandler.generateBill((err, bill) => {
      if (err) {
        console.log(err);
        res.status(500).send(err.toString());
      } else if (req.query.format && req.query.format === 'csv') {
        res.status(200).setHeader('Content-Type', 'text/csv');
        res.set({ 'Content-Disposition': 'attachment; filename="facturation.csv"' });
        res.setHeader('charset', 'utf-8');
        res.end(billingHandler.billToCsvString(bill), 'utf-8');
      } else {
        res.status(200).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(bill));
      }
    });
  }

  /**
   * Generate a bill for the current month
   * Send it as CSV if asked to, otherwise as JSON
   * @param app The express 'app'
   * @param checksToPerform The fields to check
   * @param req The express 'req'
   * @param res The express 'res'
   */
  static getCurrentMonthBillBillingAccounts(app, checksToPerform, req, res) {
    const billingHandler = new BillingHandler(moment().tz('UTC').endOf('month').valueOf(), app);

    billingHandler.forceGenerateBill((err, bill) => {
      if (err) {
        console.log(err);
        res.status(500).send(err.toString());
      } else if (req.query.format && req.query.format === 'csv') {
        res.status(200).setHeader('Content-Type', 'text/csv');
        res.set({ 'Content-Disposition': 'attachment; filename="facturation.csv"' });
        res.setHeader('charset', 'utf-8');
        res.end(billingHandler.billToCsvString(bill), 'utf-8');
      } else {
        res.status(200).setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(bill));
      }
    });
  }
}

module.exports = BillingAccountsController;
