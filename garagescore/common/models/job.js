const jobHandler = require('../../workers/jobs/job-handler');
const JobsScript = require('../../workers/jobs/jobs-scripts.js');
const _appReviewNamespace = require('./_app-review-namespace');
const { ObjectID } = require('mongodb');


function JobDefinition(Job) {
  _appReviewNamespace(Job);

  // find jobs related to a dataId
  Job.findJobsWithDataId = async function findJobsWithDataId(dataId) {
    return Job.getMongoConnector().find({
      $or: [
        { 'payload.dataId': dataId.toString() },
        { 'payload.dataId': new ObjectID(dataId) },
      ]
    }).toArray();
  };

  // aggregate job to do some monitoring
  Job.aggregateStatusAndDate = async function aggregateStatusAndDate(cb) {
    const minScheduledAtAsDate = new Date();
    minScheduledAtAsDate.setDate(minScheduledAtAsDate.getDate() - 16);
    minScheduledAtAsDate.setHours(23, 59, 59, 999);

    const res = await Job.getMongoConnector()
      .aggregate([
        {
          $match: {
            scheduledAtAsDate: { $gt: minScheduledAtAsDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$scheduledAtAsDate' },
              month: { $month: '$scheduledAtAsDate' },
              day: { $dayOfMonth: '$scheduledAtAsDate' },
              status: '$status',
              type: '$type',
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const o = {};
    res.forEach((r) => {
      const { type, status, day, month, year } = r._id;
      const date = `${day}/${month}/${year}`;
      if (!o[type]) {
        o[type] = {};
      }
      if (!o[type][status]) {
        o[type][status] = {};
      }
      o[type][status][date] = r.count;
    });

    let jobs = Object.keys(o);
    jobs = jobs.map((type) => ({
      type,
      info: o[type],
    }));

    cb(null, jobs);
  };

  // force a job to run (usually for tests)
  Job.prototype.run = async function run() {
    if (!JobsScript(this.type)) {
      throw new Error(`Impossible to run a job with unknown type ${this.type}`);
    }
    const script = JobsScript(this.type);
    const handler = jobHandler('now', script, 'Embedded worker');
    await handler(JSON.stringify({ jobId: this.jobId, payload: this.payload }), () => {});
  };
}

module.exports = JobDefinition;
