const path = require('path');
const chalk = require('chalk');

const apiImporter = require('./api.importer');

/**
 * GarageScoreAPI Class
 * Entry point for the RESTful API
 * Will automatically import all components
 * The API is CONVENTION over CONFIGURATION
 * Respect the folder hierarchy and everything will be alright :)
 * @requires path
 * @requires chalk
 * @requires api.importer
 */
class GarageScoreAPI {
  // ==============================
  // =        CONSTRUCTOR         =
  // ==============================

  /**
   * Build the GarageScoreAPI Instance
   * @param app the express 'app'
   * @constructs
   */
  constructor(app) {
    this._app = app;
    this._componentsPattern = path.join(__dirname, 'components/*/*.component.js');
    this._components = apiImporter.importComponents(this._componentsPattern);

    this._start();
  }

  // ==============================
  // =      PUBLIC METHODS        =
  // ==============================

  // Sorry, don't wanna be famous

  // ==============================
  // =      PRIVATE METHODS       =
  // ==============================

  /**
   * Start the API
   * @private
   */
  _start() {
    try {
      console.time(chalk.blue('Started The GarageScore Billing API In'));
      for (const component of Object.values(this._components)) {
        component.instance = new component.Class(this._app);
      }
      console.timeEnd(chalk.blue('Started The GarageScore Billing API In'));
    } catch (e) {
      console.error(e.message);
      process.exit();
    }
  }
}

module.exports = (app) => new GarageScoreAPI(app);
