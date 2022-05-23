module.exports = {
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
   * Stringify a json inside a try-catch
   * @param {Object} obj something that can be stringified
   * @returns {string} stringified obj
   */

  safeJSONStringify: (obj = null) => {
    if (!obj) {
      return '';
    }

    try {
      const stringified = JSON.stringify(obj);
      return stringified;
    } catch {
      return '';
    }
  },
};
