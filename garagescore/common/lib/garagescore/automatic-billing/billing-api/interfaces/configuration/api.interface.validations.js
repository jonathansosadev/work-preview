/**
 * Interface for the components validations
 * @interface
 */
class IApiValidations {
  // ==============================
  // =        CONSTRUCTOR         =
  // ==============================

  /**
   * everything is a social construction
   * @constructs
   */
  constructor(app, modelName, ...validators) {
    this._app = app;
    this._modelName = modelName;
    this._validators = validators;
  }

  // ==============================
  // =      PUBLIC METHODS        =
  // ==============================

  /**
   * Nothing to start yet
   * @public
   */
  start() {
    for (const validator of this._validators) {
      this._findValidation(validator.split('.'));
    }
  }

  // ==============================
  // =      PRIVATE METHODS       =
  // ==============================

  /**
   * Find all the validations rules and execute them
   * @param validatorArgs set of validation rules
   * @private
   */
  _findValidation(validatorArgs) {
    const property = validatorArgs[0];
    const rules = validatorArgs.slice(1);

    for (const rule of rules) {
      this[`_${rule.toLowerCase()}`](property);
    }
  }

  /**
   * apply the validatesUniquenessOf from loopback orm
   * @param property the property name that must be unique
   * @private
   */
  _unique(property) {
    const options = { message: `${property} must be unique in ${this._modelName}` };

    this._app.models[this._modelName].validatesUniquenessOf(property, options);
  }
}

module.exports = IApiValidations;
