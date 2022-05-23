const Logger = require('./_logger');

async function generateBackupCollection(app, backupCollectionName) {
  try {
    Logger.info('Generating backup collection ...');

    // You have to call toArray on a $out
    // https://stackoverflow.com/questions/49835278/mongodb-node-js-out-with-aggregation-only-working-if-calling-toarray

    await app.models.KpiByPeriod.getMongoConnector()
      .aggregate([{ $match: {} }, { $out: backupCollectionName }])
      .toArray();

    Logger.success(`Backup collection ${backupCollectionName} successfully generated`);
  } catch (error) {
    Logger.error('[ERROR] Failed to generate backup collection', error.stack);
    process.exit(1);
  }
}

async function restoreFromBackupCollection(app, MONGO) {
  try {
    Logger.warn(
      '[WARNING] : This operation will delete ALL documents in KpiByPeriod collection and replace them with the content of the backup collection'
    );
    Logger.warn('[WARNING] : You have 10 seconds to stop the script');
    await new Promise((resolve) => setTimeout(resolve, 10000));
    Logger.warn('[WARNING] : Times up, proceeding with the operation');

    const backupCollectionConnector = MONGO.collections.backup.connector;
    // check if there are any documents in the backup collection
    const count = await backupCollectionConnector.count();
    if (count === 0) {
      Logger.error('Backup collection is empty, nothing to restore');
      process.exit(1);
    }
    // restore all documents from the backup collection and set the indexes
    Logger.info('Restoring KPIs from backup collection ...');
    await backupCollectionConnector.aggregate([{ $match: {} }, { $out: 'kpiByPeriod' }]).toArray();
    await MONGO.setOriginalIndexes(app.models.KpiByPeriod.getMongoConnector());
    Logger.success(`KPIs successfully restored from the backup collection`);

    process.exit(0);
  } catch (error) {
    Logger.error('[ERROR] Failed to restore KPIs from backup collection', error.stack);
    process.exit(1);
  }
}

module.exports = {
  generateBackupCollection,
  restoreFromBackupCollection,
};
