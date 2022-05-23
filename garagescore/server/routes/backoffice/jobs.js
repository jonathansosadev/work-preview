/**
 * Execute a job immediately, should only use for recette
 */
const { ObjectId } = require('mongodb');
const { startImmediateJob } = require('../../../common/lib/garagescore/scheduler/scheduler');
const { JobTypes } = require('../../../frontend/utils/enumV2');

// get customer email and merge with jobs list
const _getCustomerEmail = async (app, jobsList, customerIds) => {
  let jobs = [...jobsList];
  const customersEmails = await app.models.Customer.getMongoConnector()
    .find({
      _id: { $in: customerIds.map(({ payload }) => ObjectId(payload.customerId)) },
    })
    .project({ _id: 1, emailList: 1, phoneList: 1 })
    .toArray();
  // merge customer email with jobs
  jobs = jobs.map((job) => {
    const customer = customersEmails.find((customer) => customer._id.toString() === job.payload.customerId);
    if (customer) {
      job.payload.phoneList = customer.phoneList;
      job.payload.emailList = customer.emailList;
    }
    return job;
  });

  return jobs;
};

const _index = async function _events(app, req, res) {
  res.render('darkbo/darkbo-application/view-and-execute-jobs.nunjucks', {
    current_tab: 'monitoring',
  });
};

const _getJobs = async function _events(app, req, res) {
  const { type, jobId } = req.body;
  const where = {
    type: { $in: JobTypes.values() },
  };
  if (type && type !== 'ALL_TYPES') {
    where.type = type;
  }
  if (jobId) {
    where._id = jobId;
  }
  // retrieve jobs
  let jobs = await app.models.Job.getMongoConnector()
    .find(where)
    .sort({
      scheduledAt: -1,
    })
    .limit(10)
    .toArray();
  const customerIds = jobs.filter(({ payload }) => payload.customerId);
  // customer emails
  if (customerIds && customerIds.length > 0) {
    jobs = await _getCustomerEmail(app, jobs, customerIds);
  }

  res.json(jobs);
};

const _getTypes = async function _events(app, req, res) {
  const allJob = JobTypes.values();
  allJob.unshift('ALL_TYPES');
  res.json(allJob);
};

const _execute = async function _events(app, req, res) {
  const { jobId } = req.body;
  if (!jobId) {
    res.status(400).end();
    return;
  }

  const job = await app.models.Job.getMongoConnector().findOne({ _id: jobId });
  if (!job) {
    res.json('jobId not found');
    return;
  }

  await startImmediateJob(jobId);

  res.json("job is INQUEUE, it's will be execute ASAP");
};

const _more = async function _events(app, req, res) {
  const { scheduledAt, type } = req.body;
  const where = {
    type: { $in: JobTypes.values() },
    scheduledAt: { $lt: scheduledAt },
  };

  if (type && type !== 'ALL_TYPES') {
    where.type = type;
  }

  let jobs = await app.models.Job.getMongoConnector()
    .find(where)
    .sort({
      scheduledAt: -1,
    })
    .limit(10)
    .toArray();

  const customerIds = jobs.filter(({ payload }) => payload.customerId);
  // customer emails
  if (customerIds && customerIds.length > 0) {
    jobs = await _getCustomerEmail(app, jobs, customerIds);
  }
  res.json(jobs);
};

module.exports = {
  index: _index,
  getJobs: _getJobs,
  getTypes: _getTypes,
  execute: _execute,
  more: _more,
};
