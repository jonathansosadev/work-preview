const TestApp = require('../../../common/lib/test/test-app');

const chai = require('chai');

const expect = chai.expect;

const app = new TestApp();

const scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');
const { JobStatuses, JobTypes } = require('../../../frontend/utils/enumV2');
const jobConfigs = require('../../../workers/jobs/jobs-configurations');

const createDateAsUTC = (date) => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds())
  );
};

describe('Scheduler', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    scheduler.setAppForTests(app);
  });

  it('insertJob', async () => {
    const insertedItem = await scheduler.insertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId: '5ce46cbf94a7009632396f81', i: 0 },
      new Date('January 25 2045 19:08'),
      {}
    );
    expect(!!insertedItem).to.equals(true);
    const itemFromBdd = await app.models.Job.find({
      where: {
        jobId: scheduler.generateJobKey(JobTypes.TEST_RATING_UPDATED, { dataId: '5ce46cbf94a7009632396f81', i: 0 }),
      },
    });
    expect(itemFromBdd.length).to.equals(1);
  });
  it('insertJob postpone date if too many jobs on the same minute', async () => {
    for (let i = 0; i < jobConfigs(JobTypes.TEST_RATING_UPDATED).requestsPerMinute; i++) {
      const insertedItem = await scheduler.insertJob(
        JobTypes.TEST_RATING_UPDATED,
        { dataId: '5ce46cbf94a7009632396f81', i },
        new Date('January 25 2045 19:08'),
        {}
      );
      expect(new Date(insertedItem.scheduledAtAsDate).toString()).to.equals(
        new Date('January 25 2045 19:08').toString()
      );
    }
    for (
      let i = jobConfigs(JobTypes.TEST_RATING_UPDATED).requestsPerMinute;
      i < jobConfigs(JobTypes.TEST_RATING_UPDATED).requestsPerMinute + 5;
      i++
    ) {
      const insertedItem = await scheduler.insertJob(
        JobTypes.TEST_RATING_UPDATED,
        { dataId: '5ce46cbf94a7009632396f81', i },
        new Date('January 25 2045 19:08'),
        {}
      );
      expect(new Date(insertedItem.scheduledAtAsDate).toString()).to.equals(
        new Date('January 25 2045 19:09').toString()
      );
    }
  });
  it('insertJob should throw error when job already exist', async () => {
    let insertedItem = await scheduler.insertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId: '5ce46cbf94a7009632396f81', i: 0 },
      new Date('January 25 2045 19:08'),
      {}
    );
    expect(!!insertedItem).to.equals(true);
    const itemFromBdd = await app.models.Job.find({
      where: {
        jobId: scheduler.generateJobKey(JobTypes.TEST_RATING_UPDATED, { dataId: '5ce46cbf94a7009632396f81', i: 0 }),
      },
    });
    expect(itemFromBdd.length).to.equals(1);
    insertedItem = null;
    try {
      insertedItem = await scheduler.insertJob(
        JobTypes.TEST_RATING_UPDATED,
        { dataId: '5ce46cbf94a7009632396f81', i: 0 },
        new Date('January 25 2045 19:08'),
        {
          setMin: 15,
          workingHours: true,
          noWeekEnd: true,
        }
      );
    } catch (e) {
      expect(e.toString().indexOf("Can't insert job, already exists")).to.not.equals(-1);
    }
    expect(insertedItem).to.equals(null);
  });
  it('upsertJob with and without job already existing', async () => {
    let insertedItem = await scheduler.upsertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId: '5ce46cbf94a7009632396f81', i: 0 },
      new Date('January 25 2045 19:08'),
      {
        setMin: 15,
        workingHours: true,
        noWeekEnd: true,
      }
    );
    expect(!!insertedItem).to.equals(true);
    let itemFromBdd = await app.models.Job.find({
      where: {
        jobId: scheduler.generateJobKey(JobTypes.TEST_RATING_UPDATED, { dataId: '5ce46cbf94a7009632396f81', i: 0 }),
      },
    });
    expect(itemFromBdd.length).to.equals(1);
    insertedItem = await scheduler.upsertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId: '5ce46cbf94a7009632396f81', i: 0 },
      new Date('January 25 2045 19:08'),
      {
        setMin: 15,
        workingHours: true,
        noWeekEnd: true,
      }
    );
    expect(!!insertedItem).to.equals(true);
    itemFromBdd = await app.models.Job.find({
      where: {
        jobId: scheduler.generateJobKey(JobTypes.TEST_RATING_UPDATED, { dataId: '5ce46cbf94a7009632396f81', i: 0 }),
      },
    });
    expect(itemFromBdd.length).to.equals(1);
  });
  it('insertJob with impossible values (setMin))', async () => {
    try {
      const insertedItem = await scheduler.insertJob(
        JobTypes.TEST_RATING_UPDATED,
        { dataId: '5ce46cbf94a7009632396f81', i: 0 },
        new Date('January 25 2045 19:08'),
        {
          setMin: 63,
          noWeekEnd: true,
        }
      );
      expect(!!insertedItem).to.equals(false);
    } catch (e) {
      expect(e.toString().indexOf('setMin invalid value')).to.not.equals(-1);
    }
  });
  it('insertJob with conflicting constraints (hour / workingHours)', async () => {
    try {
      const insertedItem = await scheduler.insertJob(
        JobTypes.TEST_RATING_UPDATED,
        { dataId: '5ce46cbf94a7009632396f81', i: 0 },
        new Date('January 25 2045 19:08'),
        {
          setMin: 15,
          setHour: 23,
          workingHours: true,
          noWeekEnd: true,
        }
      );
      expect(!!insertedItem).to.equals(false);
    } catch (e) {
      expect(e.toString().indexOf('within working hours')).to.not.equals(-1);
    }
  });
  it('insertJob with constraints (utc, week-end, working hours, setMin)', async () => {
    const insertedItem = await scheduler.insertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId: '5ce46cbf94a7009632396f81', i: 0 },
      new Date('January 27 2045 20:08'),
      {
        // utc: (new Date().getTimezoneOffset() / -60), // returns system UTC+X+1, dunno why
        setMin: 15,
        workingHours: true,
        noWeekEnd: true,
      }
    );
    expect(!!insertedItem).to.equals(true);
    expect(new Date(insertedItem.scheduledAtAsDate).toString()).to.equals(new Date('January 30 2045 09:15').toString());
  });
  it('insertJob with constraints (utc, setmin, workinghours, noweekend)', async () => {
    const insertedItem = await scheduler.insertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId: '5ce46cbf94a7009632396f81', i: 0 },
      createDateAsUTC(new Date('January 25 2019 20:08')),
      {
        // utc: (new Date().getTimezoneOffset() / -60), // returns system UTC+X+1, dunno why
        setMin: 15,
        workingHours: true,
        noWeekEnd: true,
      }
    );
    expect(!!insertedItem).to.equals(true);
    expect(new Date(insertedItem.scheduledAtAsDate).toString()).to.equals(new Date('January 28 2019 09:15').toString());
  });
  it('insertJob with constraints (utc, setmin, setHour, setDay, workinghours, noweekend)', async () => {
    const dateTest = createDateAsUTC(new Date('January 26 2010 20:08'));
    const insertedItem2 = await scheduler.insertJob(
      JobTypes.TEST_RATING_UPDATED,
      { i: 0, dataId: '5ce46cbf94a7009632396f81', obj: { test: 'tesmt' } }, // Le payload qui contient les données du job (sert a créer le jobId)
      dateTest, // La date mini a laquelle le job sera crée
      {
        // Les contraintes, a voir dans le fichier scheduler.js
        // utc: (new Date().getTimezoneOffset() / -60), // returns system UTC+X+1, dunno why
        setMin: 1,
        setHour: 9,
        setDay: 1,
        workingHours: true,
        noWeekEnd: true,
      }
    );
    expect(new Date(insertedItem2.scheduledAtAsDate).toString()).to.equals(
      new Date('February 01 2010 09:01').toString()
    );
  });

  it('cancelJob, with existing job (regular use case)', async () => {
    const dataId = '5ce46cbf94a7009632396f81';
    const insertedJob = await scheduler.insertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId },
      new Date('January 25 2045 19:08')
    );

    await scheduler.cancelJob(JobTypes.TEST_RATING_UPDATED, { dataId });

    const jobs = await app.jobs();
    expect(jobs).to.be.an('array').and.to.have.lengthOf(1);
    const { status } = jobs[0];
    expect(status).to.equal(JobStatuses.CANCELLED);
  });
  it('cancelJob, does nothing for non existing job', async () => {
    const dataId = '5ce46cbf94a7009632396f81';
    await scheduler.cancelJob(JobTypes.TEST_RATING_UPDATED, { dataId });

    const jobs = await app.jobs();
    expect(jobs).to.be.an('array').and.to.have.lengthOf(0);
  });
  it('cancelJob, targets the relevant job to set CANCELLED status', async () => {
    const dataId = '5ce46cbf94a7009632396f81';
    const jobToTarget = await scheduler.insertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId },
      new Date('January 25 2045 19:08')
    );
    const jobDiffPayload = await scheduler.insertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId: "I'm built different" },
      new Date('January 25 2045 19:08')
    );
    const jobDiffType = await scheduler.insertJob(
      JobTypes.SHORT_URL_REFRESH,
      { dataId },
      new Date('January 25 2045 19:08')
    );

    await scheduler.cancelJob(JobTypes.TEST_RATING_UPDATED, { dataId });

    const jobs = await app.jobs();
    expect(jobs).to.be.an('array').and.to.have.lengthOf(3);

    for (const { type, status, payload } of jobs) {
      if (type === JobTypes.TEST_RATING_UPDATED && payload.dataId === dataId) {
        expect(status, payload.dataId).to.equal(JobStatuses.CANCELLED);
      } else {
        expect(status, payload.dataId).to.equal(JobStatuses.WAITING);
      }
    }
  });
});
