var Observable = require('zen-observable'); // remove when Observable is supported in node

/**
 * Find datas in db using mongo projections, returning instances with only a selection of fields
 * reducing network overload
 * Be carefull, if not projected, required fields will be defaulted, ie a field like
 * Data.shouldSurfaceInStatistics will be returned with its default true value
 */

function findWithProjectionMixin(Model, options) {
  /*
   * Returns an Observable you can loop through with a foreach
   * Example:
   * app.models.Data.findWithProjection({}, { 'source.raw.cells' : 1 })
   * .forEach(async (data) => {
   *  // called for every data
   * // only 'data.source.raw.cells' is filled
   * }).then(() => {
   *  // called when the loop is done
   * }).catch(err => {
   *  // exception handler
   * });
   *
   * @where: mongo query
   * @projection: object of projected fields
   */
  Model.findWithProjection = function (where, projection, limit = 100000000, sort) {
    return new Observable(function (observer) {
      const run = async function run() {
        // opening a new connection can create errors
        // i leave the code here fyi, it doesnt work, use directly loopbacks connector
        // const db = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
        // records = await db.collection('datas').find(where);
        let records = null;
        try {
          const connector = Model.getDataSource().connector;
          const Datas = connector.collection(Model.modelName);
          records = Datas.find(where);
          if (sort) {
            records.sort(sort);
          }
          records.project(projection);
          let hasNext = await records.hasNext();
          while (hasNext && limit > 0) {
            const record = await records.next();
            const instance = new Model(record);
            observer.next(instance);
            hasNext = await records.hasNext();
            limit--; // eslint-disable-line
          }
          observer.complete();
          records.close();
        } catch (e) {
          try {
            records.close();
          } catch (ee) {
            console.error(ee);
          }
          observer.error(e);
        }
      };
      run();
    });
  };
}
module.exports = findWithProjectionMixin;
