/**
 * {
 *   watcherName: [
 *      methodToCallName,
 *      methodToCallName,
 *   ]
 * }
 */
export function watchersFactory(fetchQueriesByDataName) {
  const watcherFunctions = {};
  Object.entries(fetchQueriesByDataName).forEach(
    ([dataName, fetchQueries]) => {
      watcherFunctions[dataName] = function (newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        const methods = fetchQueries || [];
        methods.forEach(methodName => {
          try {
            this[methodName]();
          } catch (error) {
            console.error(error);
          }
        });
      };
    });

  return watcherFunctions;
}
