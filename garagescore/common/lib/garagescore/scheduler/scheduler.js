/**
 *
 * JOB SCHEDULER
 *
 *  you give the scheduler a date, a jobType, an optional payload and optional constraints,
 *  and he schedules the job to be processed by our workers.
 *
 * Additional Constraints specs :
 *
 * setMin: X -> tells the job to search for a timeSlot in the future ending by X minutes after
 * the initial programmed Date (x = 15 : 16h34 -> 17h15, 16h14 -> 16h15)
 * setHour
 * setDay
 * utc: X -> sets the locale (UTC+X) for the constraints to be effective
 * noWeekEnd: Prevent the jobHandler to set the value during the week-end (following the locale)
 * saturdayOk (goes with noWeekEnd): if noWeekEnd is set, saturdayOk makes it possible to schedule on saturday.
 * workingHours: Only schedule the timeSlot during working hours (9 -> 18)
 */

const objectHash = require('object-hash');
let app = require('../../../../server/server');
const timeHelper = require('../../util/time-helper');
const { JobStatuses, JobTypes } = require('../../../../frontend/utils/enumV2');
const { getJobDateFromConstraints, checkJobDateConstraints } = require('./jobDateHelpers');

const jobConfigs = require('../../../../workers/jobs/jobs-configurations');
const { FED, JS, log } = require('../../util/log');
const Producer = require('../../mq/workers/producer');

// For testing purposes
const setAppForTests = (appTest) => {
  app = appTest;
};

// Generate unique key, different generation for each jobType (since unique attributes are variable following type)
const generateJobKey = (jobType, payload) => {
  if (!jobType || !payload) {
    const errorMsg = `Argument should not be null : jobType:${jobType} - payload:${payload}`;
    log.error(FED, errorMsg);
    throw new Error(errorMsg);
  }
  const cleanPayload = JSON.parse(JSON.stringify(payload)); // clean payload from hidden fields
  switch (jobType) {
    // Test job
    case JobTypes.TEST_RATING_UPDATED:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    // Contacts
    case JobTypes.SEND_CONTACT_HIGH_PRIORITY:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.SEND_CONTACT_MEDIUM_PRIORITY:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.SEND_CONTACT_LOW_PRIORITY:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    // Datas
    case JobTypes.SEND_AUTOMATIC_REPLY: {
      const { dataId } = cleanPayload;
      return `${jobType.toString()}_${objectHash({ dataId })}`;
    }
    // Lead & unsatisfied tickets
    case JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.CLOSE_EXPIRED_LEAD_TICKET:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.SEND_UNSATISFIED_FOLLOWUP:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.POSSIBLE_SUCCESS_ALERT:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.SEND_LEAD_FOLLOWUP:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.ESCALATE: {
      const { dataId, type, stage } = cleanPayload;
      return `${jobType.toString()}_${objectHash({ dataId, type, stage })}`;
    }
    case JobTypes.UPDATE_UNSATISFIED_DELAY_STATUS:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    // XLeads
    case JobTypes.CROSS_LEADS_INCOMING_CALL:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.CROSS_LEADS_INCOMING_EMAIL:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER: {
      const { dataId, stage } = cleanPayload;
      return `${jobType.toString()}_${objectHash({ dataId, stage })}`;
    }
    // Automation
    case JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.AUTOMATION_CREATE_TICKET:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.AUTOMATION_RESET_PRESSURE:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.AUTOMATION_CHECK_CONTACT_MODIFICATION:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    // Misc
    case JobTypes.SHORT_URL_REFRESH:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.MAILGUN_EVENT:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.START_EXPORT:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.CLEAN_EXPORT:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    case JobTypes.EXTERNAL_API:
      return `${jobType.toString()}_${objectHash(cleanPayload)}`;
    default:
      throw new Error(`Invalid generateJobKey for jobType:${jobType} (payload:${payload})`);
  }
};

// Check if the timeSlot given by the scheduler has a free slot to host the job, following the jobType maximal limit per minute
const _isTimeSlotFree = async (jobType, requestsPerMinute, jobDate) => {
  if (!requestsPerMinute) {
    const errorMsg = `RequestsPerMinute is null or 0 : ${jobType}. Can't plan job`;
    log.error(FED, errorMsg);
    throw new Error(errorMsg);
  }
  const countJobAlreadyPlanned = await app.models.Job.count({
    type: jobType,
    scheduledAt: timeHelper.minuteNumber(new Date(jobDate)),
  });
  return countJobAlreadyPlanned < requestsPerMinute;
};

// Get a possible slot to save the job to be processed to (in mins)
const getNextTimeSlot = async (jobType, constraints, jobDate, requestsPerMinute) => {
  constraints = constraints || {}; // eslint-disable-line no-param-reassign
  jobDate = getJobDateFromConstraints(jobDate, constraints); // eslint-disable-line no-param-reassign
  while (!(await _isTimeSlotFree(jobType, requestsPerMinute, jobDate))) {
    jobDate = timeHelper.addMinutesToDate(jobDate, 1); // eslint-disable-line no-param-reassign
    jobDate = getJobDateFromConstraints(jobDate, constraints); // eslint-disable-line no-param-reassign
  }
  return jobDate;
};

// Add a job in BDD, considering it isn't yet existing or has been taken care of if it did exist.
const _addJob = async (jobType, payload, jobInMinutes, jobKey, partition, status = JobStatuses.WAITING) => {
  const job = new app.models.Job({
    jobId: jobKey,
    partition,
    type: jobType,
    status,
    scheduledAt: jobInMinutes,
    scheduledAtAsDate: timeHelper.minuteNumberToDate(jobInMinutes),
    payload,
  });
  await job.save();

  if (status === JobStatuses.IMMEDIATE) {
    await startImmediateJob(jobKey);
  }

  return job;
};

const _mainCreateJob = async (jobType, payload, jobDate, constraints, upsert, partition) => {
  checkJobDateConstraints(constraints);
  const key = generateJobKey(jobType, payload);
  const alreadyExistingJob = await app.models.Job.find({ where: { jobId: key }, fields: { id: true, jobId: true } });
  if (alreadyExistingJob.length > 0) {
    if (upsert) {
      log.debug(FED, `Job already exists (${alreadyExistingJob[0].getId().toString()}). Will be replaced.`);
      await alreadyExistingJob[0].destroy();
    } else {
      const errorMsg = `Can't insert job, already exists (${alreadyExistingJob[0]
        .getId()
        .toString()}) : ${jobType}:${JSON.stringify(payload)}`;
      log.error(FED, errorMsg);
      throw new Error(errorMsg);
    }
  }
  const config = jobConfigs(jobType);
  const jobDateInMin = timeHelper.minuteNumber(
    await getNextTimeSlot(jobType, constraints, new Date(jobDate), config.requestsPerMinute)
  );
  const status = constraints && constraints.immediate ? JobStatuses.IMMEDIATE : JobStatuses.WAITING;
  return _addJob(jobType, payload, jobDateInMin, key, partition, status);
};

// Cancelling a job
const cancelJob = async (jobType, payload, onlyWaitingJobs = true) => {
  const key = generateJobKey(jobType, payload);
  try {
    const find = { _id: key };
    if (onlyWaitingJobs) {
      find.status = JobStatuses.WAITING;
    }
    const info = await app.models.Job.getMongoConnector().updateMany(find, { $set: { status: JobStatuses.CANCELLED } });
    return info.modifiedCount > 0;
  } catch (e) {
    log.error(FED, e.message);
  }
  return false;
};

// Remove a job if it exists, return false if it didn't exists
const removeJob = async (jobType, payload, onlyWaitingJobs = false) => {
  const key = generateJobKey(jobType, payload);
  try {
    const find = { jobId: key };
    if (onlyWaitingJobs) {
      find.status = JobStatuses.WAITING;
    }
    const info = await app.models.Job.destroyAll(find);
    return info.count > 0;
  } catch (e) {
    log.error(FED, e.message);
  }
  return false;
};

// Insert a job if it doesn't exist
const insertJob = async (jobType, payload, jobDate, constraints, partition) =>
  _mainCreateJob(jobType, payload, jobDate, constraints, false, partition);

// Insert a job, and if it exists, replace it by the newly computed one.
const upsertJob = async (jobType, payload, jobDate, constraints, partition) =>
  _mainCreateJob(jobType, payload, jobDate, constraints, true, partition);

// notice by a worker that a job has been processed
const jobDone = async (jobId, runTime, processedBy, error) => {
  const data = {
    jobId,
    processedBy,
    runTime,
    status: JobStatuses.DONE,
    finishedAt: new Date(),
  };
  if (error) {
    data.errorMsg = error.message;
    data.status = JobStatuses.ERROR;
  }
  await app.models.Job.updateAll({ _id: jobId }, data);
};

const _producerPerQueue = {};
// return a producer to publish message in a queue
const _getMessageQueueProducer = async (queueName) => {
  if (_producerPerQueue[queueName]) {
    return _producerPerQueue[queueName];
  }
  log.debug(JS, `Init queue producer for ${queueName}`);
  const producer = new Producer(queueName);
  await producer.start();
  _producerPerQueue[queueName] = producer;
  return producer;
};

const WORKER_ID = Math.random().toString(36).substr(2, 3); // random 3 chars
// start up till [maxJobTocreate] jobs
// returns the number of jobs started
// start === ask the app to run it as soon as possible
const startWaitingJobs = async (maxJobTocreate = 100) => {
  // first reserve the jobs (so another process dont start the same jobs)
  const where = {
    status: JobStatuses.WAITING,
    and: [
      { scheduledAt: { gt: 500000 } }, // jobs to old to be valid
      { scheduledAt: { lte: timeHelper.minuteNumber(new Date()) } },
    ],
  };
  const jobs = await app.models.Job.find({ where, limit: maxJobTocreate, order: 'scheduledAt ASC' });
  for (const job of jobs) {
    // this update should be atomic (all document at the same time)
    // doing it like this defeat the purpose but neither loopback and mongo can limit their update :/
    // IDEA FOR THE FUTURE: use a distributed lock (with redis?)
    await job.updateAttribute('status', WORKER_ID);
  }
  let queue;
  let jobsStartedCount = 0;
  const jobsStillRemaining = maxJobTocreate === jobs.length;
  console.log({ jobsStillRemaining, maxJobTocreate, jobsLength: jobs.length });
  for (const job of jobs) {
    try {
      let alreadyInQueue = false;
      if (job.partition)
        alreadyInQueue = await app.models.Job.findOne({
          where: { status: JobStatuses.INQUEUE, partition: job.partition },
        });
      /**
       * PARTITION: This is a way to synchronise data so we don't save twice a data and remove previous changes.
       * This way, only one job with a same partition key will be in the QUEUE
       * Example: job.partition === `CROSS-LEAD-${garageId}` -> Only one job BY GARAGE will be started at the same time :)
       */
      if (!alreadyInQueue) {
        // Not in queue, good to go.
        const config = jobConfigs(job.type);
        queue = config.queue;
        const producer = await _getMessageQueueProducer(queue);
        const skimmedJob = { jobId: job.jobId, payload: job.payload };
        await producer.publish(skimmedJob);
        await job.updateAttribute('status', JobStatuses.INQUEUE);
        jobsStartedCount++;
      } else await job.updateAttribute('status', JobStatuses.WAITING); // Otherwise, just put it to waiting again
    } catch (e) {
      log.error(JS, `Error publishing job ${JSON.stringify(job)} in queue ${queue}`, e);
    }
  }
  log.info(JS, `jobStarted: ${jobsStartedCount}`);
  return jobsStillRemaining;
};

const startImmediateJob = async (jobId) => {
  const job = await app.models.Job.findOne({ where: { jobId } });
  let queue;

  try {
    if (job.partition) {
      throw new Error("You can't have partition with immediate job");
    }

    await job.updateAttribute('status', WORKER_ID);

    const config = jobConfigs(job.type);
    queue = config.queue;
    const producer = await _getMessageQueueProducer(queue);
    const skimmedJob = { jobId: job.jobId, payload: job.payload };
    await producer.publish(skimmedJob);
    await job.updateAttribute('status', JobStatuses.INQUEUE);
  } catch (e) {
    log.error(JS, `Error publishing job ${JSON.stringify(job)} in queue ${queue}`, e);
  }

  return job;
};

module.exports = {
  jobDone,
  insertJob,
  upsertJob,
  cancelJob,
  removeJob,
  startWaitingJobs,
  startImmediateJob,
  setAppForTests,
  generateJobKey,
  JobTypes,
  getNextTimeSlot,
};
