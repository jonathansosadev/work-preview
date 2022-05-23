const { getUserGarages } = require('../../../../models/user/user-mongo');
const { JobTypes } = require('../../../../../frontend/utils/enumV2');
const Scheduler = require('../../scheduler/scheduler');
const serializer = require('../../../util/serializer');
const queryGenerators = require('../queries/query-generators');
const { ObjectId } = require('mongodb');
const { MOMO, log } = require('../../../util/log');

async function createStartExportJob(args = {}, query, locale = 'fr', fullLocale = 'fr_FR') {
  return Scheduler.upsertJob(
    JobTypes.START_EXPORT,
    {
      ...args,
      query: serializer.serialize(query),
      locale,
      fullLocale, // avoid duplicate payload
      timestamp: new Date().getTime(),
    },
    new Date(),
    { immediate: true }
  );
}

module.exports = async (app, frequencies = []) => {
  if (!frequencies.length) {
    return;
  }
  const configurations = await app.models.CockpitExportConfiguration.getMongoConnector()
    .find({
      frequency: { $in: frequencies },
    })
    .toArray();

  for (const config of configurations) {
    const userGarageIds = await getUserGarages(app, config.userId, { _id: true });
    const query = await queryGenerators.generate({
      app,
      args: config,
      userGarageIds: userGarageIds.map(({ _id }) => _id.toString()),
    });

    await createStartExportJob(
      {
        exportName: config.name,
        exportType: config.exportType,
        periodId: config.periodId,
        startPeriodId: config.startPeriodId,
        endPeriodId: config.endPeriodId,
        frequency: config.frequency,
        dataTypes: config.dataTypes,
        garageIds: config.garageIds,
        fields: config.fields,
        recipients: config.recipients,
        exportConfigurationId: new ObjectId(config._id),
      },
      query,
      config.locale,
      config.fullLocale
    );

    log.info(
      MOMO,
      `Creating export job for exportConfiguration : ${config._id.toString()} | Name : ${config.name} | Frequency : ${
        config.frequency
      }`
    );
  }
  return;
};
