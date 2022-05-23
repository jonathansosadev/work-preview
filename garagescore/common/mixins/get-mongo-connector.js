/**
 * Provide the getMongoConnector method to the model
 */
const mongoProfiler = require('../lib/garagescore/monitoring/mongo-profiler');

function mixin(Model) {
  Model.getMongoConnector = (options = {}) => {
    let collection = Model.getDataSource().connector.collection(Model.modelName);
    collection = mongoProfiler.wrapCollection(collection, options.profiling);
    return collection;
  };
}
module.exports = mixin;
