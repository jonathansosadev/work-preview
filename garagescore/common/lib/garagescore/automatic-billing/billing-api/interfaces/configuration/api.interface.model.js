const loopback = require('loopback');

/**
 * Interface for the components models
 * @requires loopback
 * @interface
 */
class IApiModel {
  // ==============================
  // =        CONSTRUCTOR         =
  // ==============================

  /**
   * Build the IApiModel Instance
   * @param modelConfig the configuration of the model (datasource, public,  etc)
   * @param model the model object
   * @constructs
   */
  constructor(app, modelConfig, model) {
    if (typeof modelConfig !== 'object' || typeof model !== 'object') {
      throw new Error('IApiModel:: Constructor:: Missing or bad params');
    }
    this._app = app;
    this._modelConfig = modelConfig;
    this._model = model;
  }

  // ==============================
  // =      PUBLIC METHODS        =
  // ==============================

  /**
   * Start the model module
   * Register the component model into the ORM
   * @public
   */
  start() {
    const model = this._model;
    const modelConfig = this._modelConfig;

    if (process.env.NODE_ENV === 'test') {
      this.setTestEnv();
    }
    this._app.model(loopback.createModel(model), modelConfig);
  }

  /**
   * GET the model configuration
   * @returns {{}} the model configuration
   */
  get modelConfig() {
    return this._modelConfig;
  }

  /**
   * GET the model itself
   * @returns {{}}
   */
  get model() {
    return this._model;
  }

  /**
   * SET the env to test
   */
  setTestEnv() {
    this._model.mongodb.collection += '_test';
  }

  // ==============================
  // =      PRIVATE METHODS       =
  // ==============================

  // I have nothing to hide
}

module.exports = IApiModel;
