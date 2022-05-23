import CHART_CONFIGURATION from './configuration';
import { cloneDeep } from 'lodash';
import { ChartConfigViews } from '~/utils/enumV2';

const LocalStorageHelper = {
  key: '__Custeed-Analytics__',
  /**
   * Checks if localStorage is enabled on user's device
   * @returns {Boolean} localStorage can be used on user's browser
   */

  isEnabled: () => {
    try {
      if (!localStorage) {
        return false;
      }
      const testKey = '__localStorage__test';
      localStorage.setItem(testKey, null);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },
  /**
   * Safely get an item from localStorage, returns null if it fails
   * @param {String}  key  the localStorage key name
   * @returns {String|null} localStorage item or null
   */

  safeLocaleStorageGetItem: (key = null) => {
    if (!key || !localStorage) {
      return null;
    }

    try {
      const localStorageItem = localStorage.getItem(key);
      return localStorageItem;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  /**
   * Safely set an item in localStorage, returns null if it fails
   * @param {String}  key  the localStorage key name
   * @param {String}  item  the localStorage value to set
   * @returns {(String|null)} localStorage item or null
   */

  safeLocaleStorageSetItem: (key = null, localStorageItem = null) => {
    if (!key || !localStorage) {
      return null;
    }
    try {
      localStorage.setItem(key, localStorageItem);
      return localStorageItem;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  /**
   * Parse a json inside a try-catch
   * @param {String}  json a stringified json
   * @returns {(Object|null)} parsed json or null
   */

  safeJSONParse: (json = '') => {
    if (!json) {
      return null;
    }

    try {
      const parsed = JSON.parse(json);
      return parsed;
    } catch {
      return null;
    }
  },

  /**
   * Remove keys that we are not saving in localStorage
   * @param {CHART_CONFIGURATION}  chartConfig  chart configuration
   * @returns {Chart_LocalStorageChartConfiguration} a chart configuration that can be set in localStorage
   */

  convertChartConfigToLocalStorageFormat: (chartConfig) => {
    /* avoid mutating the chartConfig */
    const filtered = cloneDeep(chartConfig.components);
    /* keep only the view key */
    for (const page in filtered) {
      for (const component in filtered[page]) {
        filtered[page][component] = { view: filtered[page][component]['view'] };
      }
    }
    return filtered;
  },
  /**
   * set chart configuration in localStorage after converting it to localStorage format
   * @param {CHART_CONFIGURATION}  updatedChartConfig  chart configuration
   */

  setChartConfigInLocalStorage: (updatedChartConfig) => {
    /* convert chart configuration to localStorage format */
    const chartConfig = LocalStorageHelper.convertChartConfigToLocalStorageFormat(updatedChartConfig);
    /* set in localStorage */
    LocalStorageHelper.safeLocaleStorageSetItem(LocalStorageHelper.key, JSON.stringify(chartConfig));
  },

  //--------------------------------------------------------------------------------------//
  //                               LocalStorage Validation                                //
  //--------------------------------------------------------------------------------------//

  /**
   * Retrieve the chart configuration from localStorage and checks if it is valid. Otherwise return the default config
   * @returns {Chart_LocalStorageChartConfiguration} parsed chart configuration in localStorage format
   */

  getConfigFromLocalStorage: () => {
    /* the original chart configuration used as a fallback */
    const originalConfig = LocalStorageHelper.convertChartConfigToLocalStorageFormat(CHART_CONFIGURATION);

    /* step 1 : retrieve chart config from local storage */
    const rawConfig = LocalStorageHelper.safeLocaleStorageGetItem(LocalStorageHelper.key);
    if (!rawConfig) {
      return originalConfig;
    }

    /*step 2 : safely parse configuration */
    const parsedConfig = LocalStorageHelper.safeJSONParse(rawConfig);
    if (!parsedConfig) {
      return originalConfig;
    }

    /*step 3 : validate the configuration */
    const isValid = LocalStorageHelper.isLocalStorageConfigValid(parsedConfig, originalConfig);
    if (!isValid) {
      return originalConfig;
    }

    /* we can safely use the configuration coming from local storage */
    return parsedConfig;
  },
  /**
   * Checks if the chart configuration in localStorage format is valid or not
   * @param {Chart_LocalStorageChartConfiguration}  localStorageConfig  the configuration in localStorage format to validate
   * @param {Chart_LocalStorageChartConfiguration}  originalConfig  the original configuration in localStorage format to compare against
   * @returns {Boolean} localStorageConfig is valid or not
   */

  isLocalStorageConfigValid: function (localStorageConfig = null, originalConfig = null) {
    if (!localStorageConfig || !originalConfig) {
      return false;
    }

    /* utility function */
    const areArraysEqual = (a = null, b = null) => {
      return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
    };

    /* step1 : we compare the routesNames */
    const localStorage_routeNames = Object.keys(localStorageConfig);
    const original_routeNames = Object.keys(originalConfig);

    if (!areArraysEqual(localStorage_routeNames, original_routeNames)) {
      return false;
    }

    /* step2 : we compare the componentsName of each route */
    const areComponentsValid = localStorage_routeNames.every((localStorage_route) => {
      const localStorage_componentsNames = Object.keys(localStorageConfig[localStorage_route] || {});
      const original_componentsNames = Object.keys(originalConfig[localStorage_route]);

      if (!areArraysEqual(localStorage_componentsNames, original_componentsNames)) {
        return false;
      }
      /* step3 : we compare the components config (only one key is allowed : view) */
      const areComponentsConfigsValid = localStorage_componentsNames.every((localStorage_componentName) => {
        const localStorage_componentConfig = localStorageConfig[localStorage_route][localStorage_componentName];
        /* compare the content of the component config , the only allowed key is view */
        return (
          Object.keys(localStorage_componentConfig).length === 1 &&
          ChartConfigViews.hasValue(localStorage_componentConfig.view)
        );
      });

      return areComponentsConfigsValid;
    });

    return areComponentsValid;
  },
};

export default LocalStorageHelper;
