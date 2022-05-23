const app = require('../../../server/server');
const _processArguments = require('./utils/_process-arguments');
const _prepareEntities = require('../../../common/lib/garagescore/daily-kpi/utils/_prepare-entities');
const { _calculateKpiForGivenPeriod } = require('../../../common/lib/garagescore/daily-kpi/utils/_aggregators');
const _prepareFinalKpis = require('../../../common/lib/garagescore/daily-kpi/utils/_prepare-final-kpis');
const _buildBulkWriteFromKpis = require('../../../common/lib/garagescore/daily-kpi/utils/_build-bulkwrite-from-kpis');
const { generateBackupCollection, restoreFromBackupCollection } = require('./utils/_backup-collection');
const _dropDocuments = require('./utils/_drop');
const { getPeriods, chunkify, getTimeElapsed } = require('./utils/_misc');
const AsyncPool = require('../../migration/scopes/asyncPool');
const { MOMO, time, timeEnd } = require('../../../common/lib/util/log');
const Logger = require('./utils/_logger');
const config = require('config');
const { MongoClient } = require('mongodb');

const GLOBAL = {
  startTimestamp: null,
  documents: {
    inserted: 0,
    updated: 0,
    add({ inserted = 0, updated = 0 }) {
      this.inserted += inserted;
      this.updated += updated;
    },
  },
  periods: {
    all: [],
    processed: [],
    failed: [],
    status() {
      return `${this.processed.length + this.failed.length} / ${this.all.length}`;
    },
    add({ period, error = null }) {
      if (error) {
        this.failed.push(period.token);
        return Logger.error(`========== FAILED FOR PERIOD: ${period.token} (${this.status()}) ==========`, error.stack);
      }
      this.processed.push(period.token);
      return Logger.success(
        `========== COMPLETED FOR PERIOD: ${period.token} (${this.status()}) ========== Time elapsed: ${getTimeElapsed(
          GLOBAL.startTimestamp
        )}`
      );
    },
  },
  generateReport() {
    const { inserted = 0, updated = 0 } = this.documents;
    const { processed = [], failed = [] } = this.periods;

    Logger.info('============ REPORT ============');
    Logger.info('\u2022 Documents :');
    Logger.info('\t inserted : ', inserted);
    Logger.info('\t updated  : ', updated);
    Logger.info('\u2022 Periods :');
    Logger.info('\t processed: ', processed.length);
    Logger.info('\t failed   : ', failed.length);
    timeEnd(MOMO, '\x1b[32m Done Generating All KPIs In \x1b[0m');
    Logger.info('================================');

    // in case a period failed
    if (failed.length) {
      Logger.error('[ERROR] Some periods failed, nothing was saved in the kpiByPeriod collection');
      Logger.error('Failed periods: ');
      failed.forEach((period) => Logger.error(`\t\u2022  ${period}`));

      return { success: false };
    }

    return { success: true };
  },
};

const MONGO = {
  DB: null,
  // since we are using $out, we need to save the indexes to set them later
  originalIndexes: null,
  collections: {
    backup: {
      name: 'kpiByPeriodBackup',
      connector: null,
    },
    // used to temporarly store the Kpi's
    // if the script finishes successfully it will perform a $out on kpiByPeriod and drop the kpiByPeriodTmp
    tmp: {
      name: 'kpiByPeriodTmp',
      connector: null,
    },
  },
  async saveOriginalIndexes(application) {
    this.originalIndexes = await application.models.KpiByPeriod.getMongoConnector().indexes();
  },
  async setOriginalIndexes(targetCollectionConnector) {
    return targetCollectionConnector.createIndexes(this.originalIndexes);
  },
  async initTmpCollection(application) {
    Logger.info('Initializing temporary collection');
    await application.models.KpiByPeriod.getMongoConnector()
      .aggregate([{ $match: {} }, { $out: this.collections.tmp.name }])
      .toArray();
    await this.setOriginalIndexes(this.collections.tmp.connector);
    Logger.success('Temporary collection successfully initialized');
  },
  async init() {
    const client = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
    this.DB = client.db();

    for (const collection in this.collections) {
      this.collections[collection].connector = this.DB.collection(this.collections[collection].name);
    }
  },
};

app.on('booted', async () => {
  try {
    time(MOMO, '\x1b[32m FULL SCRIPT \x1b[0m');

    // process script arguments
    const formattedArgv = _processArguments(process.argv.slice(2));

    // connect to mongo and initialize direct mongo connectors
    await MONGO.init();

    // save the indexes of the kpiByPeriod collection
    await MONGO.saveOriginalIndexes(app);

    // will copy the backup collection to the kpi collection and exit
    if (formattedArgv['restore'] === true) {
      await restoreFromBackupCollection(app, MONGO);
    }

    const tmpCollectionConnector = MONGO.collections.tmp.connector;
    // copy the content and the indexes of the kpi collection to the tmp collection
    await MONGO.initTmpCollection(app);

    // generate a backup collection named 'kpiByPeriodBackup'
    await generateBackupCollection(app, MONGO.collections.backup.name);

    // drop all documents that matches userIds, garageIds and periodIds specified in the arguments
    if (formattedArgv['drop'] === true) {
      await _dropDocuments(tmpCollectionConnector, formattedArgv);
    }

    time(MOMO, '\x1b[32m Done Generating All KPIs In \x1b[0m');
    GLOBAL.startTimestamp = Number(Date.now());

    // get periods to process
    GLOBAL.periods.all = getPeriods(formattedArgv);

    // prepare entities (list of garageIds and userIds)
    const [garageEntities, userEntities] = await _prepareEntities(app, formattedArgv.garageIds || []);
    Logger.info('Starting computing periods with asyncPoolSize ', Number(formattedArgv.asyncPoolSize));
    await AsyncPool(Number(formattedArgv.asyncPoolSize), GLOBAL.periods.all, async (period) => {
      try {
        const aggregateOutputs = await _calculateKpiForGivenPeriod(app, period, formattedArgv.garageIds || []);
        const toUpsert = _prepareFinalKpis({ period, aggregateOutputs, garageEntities, userEntities });

        if (!toUpsert.length) {
          return;
        }
        for (const chunk of chunkify(toUpsert, 1000)) {
          const { nUpserted = 0, nModified = 0 } = await tmpCollectionConnector.bulkWrite(
            _buildBulkWriteFromKpis(chunk),
            {
              ordered: false,
            }
          );
          GLOBAL.documents.add({ inserted: nUpserted, updated: nModified });
        }
      } catch (error) {
        return GLOBAL.periods.add({ period, error });
      }
      // period was successfully processed
      return GLOBAL.periods.add({ period });
    });
    // generate and log the final Report
    const { success } = GLOBAL.generateReport();

    // if the script finished successfully, perform a $out on kpiByPeriod and drop the kpiByPeriodTmp
    if (success) {
      Logger.info("Saving Kpi's in KpiByPeriod collection ...");
      await tmpCollectionConnector.aggregate([{ $out: 'kpiByPeriod' }]).toArray();
      Logger.info('Generating indexes ...');
      await MONGO.setOriginalIndexes(app.models.KpiByPeriod.getMongoConnector());
      Logger.info('Deleting temporary collection ...');
      await tmpCollectionConnector.drop();
      Logger.success('[SUCCESS] : All done, exiting ...');
    }

    timeEnd(MOMO, '\x1b[32m FULL SCRIPT \x1b[0m');
    process.exit(0);
  } catch (error) {
    Logger.error(`[ERROR] ${error.message}`, error.stack);
    process.exit(1);
  }
});
