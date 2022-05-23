const globule = require('globule');

/**
 * ApiImporter Class
 * A set of tools to import your components
 * Usually you don't have to do anything
 * Just put your components file into your component folder
 * And they will be imported and configured for you
 * @requires globule
 */
class ApiImporter {
  // ==============================
  // =        CONSTRUCTOR         =
  // ==============================

  // No constructor when all methods are statics

  // ==============================
  // =      PUBLIC METHODS        =
  // ==============================

  /**
   * Imports your components based on a file pattern
   * @param pattern the pattern used to find your components file
   * @param pos the position of the componentName in the componentFile
   * @returns {*} an object containing your components, their file names and class
   * @static
   * @public
   */
  static importComponents(pattern, pos = 0) {
    const componentsFiles = globule.find(pattern);

    return this._importComponents(componentsFiles, pos);
  }

  // ==============================
  // =      PRIVATE METHODS       =
  // ==============================

  /**
   * Basically does the same job as the public method with the same name
   * Just used to split the work into small entities
   * @param componentsFiles the files to import
   * @param pos the position of the componentName in the componentFile
   * @returns {{}} an object containing your components, their file names and class
   * @private
   * @static
   */
  static _importComponents(componentsFiles, pos) {
    const result = {};
    let componentName = '';

    for (const componentFile of componentsFiles) {
      componentName = this._buildComponentName(componentFile, pos);
      result[componentName] = this._buildComponent(componentFile);
    }
    return result;
  }

  /**
   * Build a component object based on a file name
   * @param componentFile the file name of your component my-component.component.js
   * @returns {{}} the built object containing the given file name and the class of the component
   * @private
   * @static
   */
  static _buildComponent(componentFile) {
    const component = {};

    component.file = componentFile;
    component.Class = require(componentFile); // eslint-disable-line
    return component;
  }

  /**
   * Build the component name based on the file and a position
   * @param componentFile the file name of the component
   * @param pos the position of the component name into the file name
   * @returns {string} the name of the component
   * @private
   * @static
   */
  static _buildComponentName(componentFile, pos) {
    return componentFile.split('/').pop().split('.')[pos];
  }
}

module.exports = ApiImporter;
