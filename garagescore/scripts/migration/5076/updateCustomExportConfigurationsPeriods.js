const app = require('../../../server/server.js');
const moment = require('moment');
const { ObjectId } = require('mongodb');
const { getPeriodMinDate, getPeriodMaxDate, MONTHLY_FORMAT } = require('../../../common/models/garage-history.period');
const { ExportPeriods } = require('../../../frontend/utils/enumV2');

function tokenize(referenceDate) {
  return moment(referenceDate).format(MONTHLY_FORMAT);
}

app.on('booted', async () => {
  try {
    console.time('MIGRATION_EXPORT');
    const mongoConnector = app.models.CockpitExportConfiguration.getMongoConnector();
    const res = await mongoConnector.find({}).project({ periodId: true }).toArray();

    for (const config of res) {
      const updatedFields = {
        frequency: 'NONE',
      };

      // remove the value 'CustomPeriod' from DB
      if (config.periodId === 'CustomPeriod') {
        updatedFields.periodId = null;
        await mongoConnector.updateOne({ _id: ObjectId(config._id) }, { $set: updatedFields });
        continue;
      }

      // those periodIds are still valid, only add the new fields
      if ([ExportPeriods.CURRENT_YEAR, ExportPeriods.ALL_HISTORY].includes(config.periodId)) {
        updatedFields.startPeriodId = null;
        updatedFields.endPeriodId = null;
        await mongoConnector.updateOne({ _id: ObjectId(config._id) }, { $set: updatedFields });
        continue;
      }

      // update all the configuration from lastQuarter to LAST_QUARTER
      if (config.periodId === 'lastQuarter') {
        updatedFields.periodId = ExportPeriods.LAST_QUARTER;
        updatedFields.startPeriodId = null;
        updatedFields.endPeriodId = null;
        await mongoConnector.updateOne({ _id: ObjectId(config._id) }, { $set: updatedFields });
        continue;
      }
      // deprecated periodIds, convert them to customPeriods
      if (config.periodId && ![...ExportPeriods.values()].includes(config.periodId)) {
        try {
          updatedFields.startPeriodId = tokenize(getPeriodMinDate(config.periodId));
          updatedFields.endPeriodId = tokenize(getPeriodMaxDate(config.periodId));
          updatedFields.periodId = null;
          await mongoConnector.updateOne({ _id: ObjectId(config._id) }, { $set: updatedFields });
        } catch (error) {
          console.log('\x1b[31m', `Error occured : ${error.message}`, '\x1b[0m');
        }
      }
    }
    console.timeEnd('MIGRATION_EXPORT');

    console.log('\x1b[32m', `[SUCCESS] updated ${res.length} documents`, '\x1b[0m');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
