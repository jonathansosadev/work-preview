const path = require('path');

const apiImporter = require('../api.importer');

/**
 * Interface for the components main module
 * For instance users.component.js must implements this Interface
 * @interface
 * @requires path
 * @requires chalk
 * @requires api.importer
 */
class IApiComponent {
  // ==============================
  // =        CONSTRUCTOR         =
  // ==============================

  /**
   * Build the IApiComponent Instance
   * @param componentName the name of the component which is
   * implementing this interface, for instance 'users' for 'users.component.js'
   * @param app the express 'app'
   * @constructs
   */
  constructor(componentName, app) {
    this._app = app;
    this._instanceFolder = 'configuration';
    this._staticFolder = 'execution';
    this._interfacesPattern = path.join(__dirname, `${this._instanceFolder}/api.interface.!(*component).js`);
    this._staticInterfacesPattern = this._interfacesPattern.replace(this._instanceFolder, this._staticFolder);
    this._componentsPatternBase = `../components/${componentName}/${this._instanceFolder}/${componentName}.!(*component).js`;
    this._componentsPattern = path.join(__dirname, this._componentsPatternBase);
    this._staticComponentsPattern = this._componentsPattern.replace(this._instanceFolder, this._staticFolder);
    this._interfaces = apiImporter.importComponents(this._interfacesPattern, 2);
    this._staticInterfaces = apiImporter.importComponents(this._staticInterfacesPattern, 2);
    this._components = apiImporter.importComponents(this._componentsPattern, 1);
    this._staticComponents = apiImporter.importComponents(this._staticComponentsPattern, 1);

    this._start();
  }

  // ==============================
  // =      PUBLIC METHODS        =
  // ==============================

  /**
   * GET the components
   * @returns {{}}
   * @public
   */
  get components() {
    return this._components;
  }

  /**
   * GET the interfaces
   * @returns {{}}
   * @public
   */
  get interfaces() {
    return this._interfaces;
  }

  // ==============================
  // =      PRIVATE METHODS       =
  // ==============================

  /**
   * Load the component
   * @private
   */
  _start() {
    this._createComponentsInstancesAndCheckComponents('interfaces', 'components');
    this._createComponentsInstancesAndCheckComponents('staticInterfaces', 'staticComponents', true);
    for (const component of Object.keys(this._components)) {
      this._components[component].instance.start(this._staticComponents, this._components);
    }
  }

  /**
   * Go through all the interfaces and build the component module
   * based on thoe interfaces. If an implementation is missing an error will be thrown
   * from a sub function. For instance if I have the 'api.interface.routes' interface and
   * if my 'user.component.js' does not have a 'user.routes.js' that implements the
   * 'api.interface.routes' an error will be thrown.
   * @private
   * @throws {Error}
   */
  _createComponentsInstancesAndCheckComponents(interfacesName, componentsName, excluded = false) {
    const interfaces = this[`_${interfacesName}`];
    const components = this[`_${componentsName}`];
    const interfacesNamesKeys = Object.keys(interfaces);
    const errorBase = 'IApiComponent :: _checkComponentsInheritance() :: ';
    let capitalizedName = '';

    for (const name of interfacesNamesKeys) {
      capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
      this._checkImplementation(name, components, capitalizedName, errorBase);
      this._createComponentsInstances(name, componentsName, excluded);
      this._checkInheritance(name, interfaces, components, capitalizedName, errorBase, excluded);
    }
  }

  /**
   * Check if an interface has its implementation. If I have an interface 'api.interface.routes'
   * I must have a 'my-component.routes.js' that implements the said interface
   * @param name the interface name, for isntance 'routes'
   * @param components the components list
   * @param capitalizedName the name of the interface but capitalized. For display / debug purpose only
   * @param errorBase the base string for the error message (if something goes wrong). For display / debug only
   * @private
   * @throws {Error}
   */
  _checkImplementation(name, components, capitalizedName, errorBase) {
    if (!components[name]) {
      throw new Error(`${errorBase} must have a file to implement the interface IApi ${capitalizedName}`);
    }
  }

  /**
   * Now that we know that a component has a file that implements an interface
   * We check that this file really inherits the good class !
   * @param name the name of the interface
   * @param interfaces the interfaces
   * @param components the components
   * @param capitalizedName the name of the interface but capitalized. For display / debug purpose only
   * @param errorBase the base string for the error message (if something goes wrong). For display / debug only
   * @param excluded if the components are excluded or not from instantiation
   * @private
   */
  _checkInheritance(name, interfaces, components, capitalizedName, errorBase, excluded) {
    const inherits = components[name].instance instanceof interfaces[name].Class;

    if (!excluded && !inherits) {
      throw new Error(`${errorBase} must implement the interface IApi ${capitalizedName}`);
    }
  }

  /**
   * If every implementation / inheritance checks went good, we create a new instance :)
   * @param name the name of the module to instantiate, for instance 'routes'
   * @param componentsName the name of the components list
   * @param excluded if the components are excluded of not from instantiation
   * @private
   */
  _createComponentsInstances(name, componentsName, excluded) {
    if (!excluded) {
      this[`_${componentsName}`][name].instance = new this[`_${componentsName}`][name].Class(this._app);
    } else {
      this[`_${componentsName}`][name].instance = null;
    }
  }

  /**
   * Emits an event when a component is ready, for isntance if I have a 'user.component.js' and
   * a 'orders.component.js' this function will emit 'api::ready::user' and 'api::ready::orders' events
   * @param name the name of the component
   * @private
   */
  _emitReadyEvent(name) {
    this._app.emit(`api::ready::${name}`);
  }
}

module.exports = IApiComponent;
