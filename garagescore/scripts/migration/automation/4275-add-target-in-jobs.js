const app = require('../../../server/server');
const { BANG, log } = require('../../../common/lib/util/log');
const { ObjectId } = require('mongodb');
const { JobStatuses, JobTypes } = require('../../../frontend/utils/enumV2');

/**
 * Script oneshoot
 * deleted me when #4275 is merge and executed on master
 */
const addTargetInJob = async (job) => {
  const campaign = await app.models.AutomationCampaign.getMongoConnector().findOne(
    {
      _id: ObjectId(job.payload.campaignId.toString()),
    },
    { projection: { target: 1 } }
  );

  await app.models.Job.getMongoConnector().updateOne(
    { _id: job._id.toString() },
    { $set: { 'payload.target': campaign.target } }
  );
  log.info(BANG, `--> update job: ${job._id}, with target: ${campaign.target}`);
};

app.on('booted', async () => {
  try {
    console.time('execution_time');
    log.info(BANG, `--> retrieve jobs ongoing...`);
    const jobs = await app.models.Job.getMongoConnector()
      .find({
        type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
        status: JobStatuses.WAITING,
        scheduledAtAsDate: { $gte: new Date('2021-05-10T00:00:00.000Z') },
      })
      .project({
        _id: 1,
        payload: 1,
      })
      .toArray();

    log.info(BANG, `--> retrieve ${jobs.length} jobs`);
    for (const job of jobs) {
      await addTargetInJob(job);
    }

    log.info(BANG, `--> Processed ${jobs.length} jobs, script end without error`);
    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
