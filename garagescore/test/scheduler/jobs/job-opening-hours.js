const { expect } = require('chai');
const moment = require('moment-timezone');
const TestApp = require('../../../common/lib/test/test-app');
const { insertJob } = require('../../../common/lib/garagescore/scheduler/scheduler.js');
const { JobTypes } = require('../../../frontend/utils/enumV2');

const app = new TestApp();
const timezone = 'Africa/Maseru';
const morningOpeningHour = 7;
const morningOpeningMinute = 30;

describe('Test planNextAppointmentInOpeningHoursAfterXHoursFromDate', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('Set a job in opening hours', async function test() {
    await app.addGarage({ timezone });
    const garage = await app.models.Garage.findOne({
      where: {},
      fields: { googlePlace: 1, timezone: 1 },
    });
    expect(garage.googlePlace.openingHours[0].close.day).to.be.equal(1);

    const jobDate = moment({
      year: 2020,
      month: 3,
      day: 23,
      hour: 16,
      minute: 1,
    }).tz(timezone);
    const job = await insertJob(
      JobTypes.SEND_LEAD_FOLLOWUP,
      {}, // No need to test the scheduler
      jobDate,
      {
        planJobAfterXHoursOfOpeningHours: {
          hours: 7,
          googleOpeningHours: garage.googlePlace.openingHours,
          timezone: garage.timezone,
        },
      }
    );
    const expectedDate = moment({
      year: 2020,
      month: 3,
      day: jobDate.toDate().getDate() + 1,
      hour: morningOpeningHour,
      minute: morningOpeningMinute,
    }).tz(timezone);
    expect(job.scheduledAtAsDate).eql(expectedDate.toDate());
  });
  it('Should not set a job before 9am', async function test() {
    await app.addGarage({ timezone });
    const garage = await app.models.Garage.findOne({ where: {}, fields: { googlePlace: 1, timezone: 1 } });
    expect(garage.googlePlace.openingHours[0].close.day).to.be.equal(1);
    const jobDate = moment({
      year: 2020,
      month: 3,
      day: 23,
      hour: 18,
      minute: 1,
    }).tz(timezone);
    const minimumScheduledHour = 9;
    const job = await insertJob(
      JobTypes.SEND_LEAD_FOLLOWUP,
      {}, // No need to test the scheduler
      jobDate,
      {
        planJobAfterXHoursOfOpeningHours: {
          hours: 1,
          googleOpeningHours: garage.googlePlace.openingHours,
          timezone: garage.timezone,
          minimumScheduledHour,
        },
      }
    );

    const expectedDate = moment({
      year: 2020,
      month: 3,
      day: jobDate.toDate().getDate() + 1,
      hour: minimumScheduledHour,
      minute: 0,
    }).tz(timezone);
    expect(job.scheduledAtAsDate).eql(expectedDate.toDate());
  });
  it('Set a job out of opening hours', async function test() {
    await app.addGarage({ timezone });
    const garage = await app.models.Garage.findOne({ where: {}, fields: { googlePlace: 1, timezone: 1 } });
    expect(garage.googlePlace.openingHours[0].close.day).to.be.equal(1);
    const jobDate = moment({
      year: 2020,
      month: 3,
      day: 23,
      hour: 17,
      minute: 0,
    }).tz(timezone);
    const job = await insertJob(
      JobTypes.SEND_LEAD_FOLLOWUP,
      {}, // No need to test the scheduler
      jobDate,
      {
        planJobAfterXHoursOfOpeningHours: {
          hours: 9,
          googleOpeningHours: garage.googlePlace.openingHours,
          timezone: garage.timezone,
        },
        noWeekEnd: true,
      }
    );
    const expectedDate = moment({
      year: 2020,
      month: 3,
      day: jobDate.toDate().getDate() + 1,
      hour: morningOpeningHour,
      minute: morningOpeningMinute,
    }).tz(timezone);
    expect(job.scheduledAtAsDate).eql(expectedDate.toDate());
  });
  it('Set a job in opening hours friday afternoon', async function test() {
    await app.addGarage({ timezone });
    const garage = await app.models.Garage.findOne({ where: {}, fields: { googlePlace: 1, timezone: 1 } });
    expect(garage.googlePlace.openingHours[0].close.day).to.be.equal(1);
    const jobDate = moment({
      year: 2020,
      month: 3,
      day: 24,
      hour: 16,
      minute: 0,
    }).tz(timezone);
    const job = await insertJob(
      JobTypes.SEND_LEAD_FOLLOWUP,
      {}, // No need to test the scheduler
      jobDate,
      {
        planJobAfterXHoursOfOpeningHours: {
          hours: 13,
          googleOpeningHours: garage.googlePlace.openingHours,
          timezone: garage.timezone,
        },
      }
    );
    const expectedDate = moment({
      year: 2020,
      month: 3,
      day: 27, // monday
      hour: morningOpeningHour,
      minute: morningOpeningMinute,
    }).tz(timezone);
    expect(job.scheduledAtAsDate).eql(expectedDate.toDate());
  });
  it('Half hour test on job within working hours', async function test() {
    await app.addGarage({ timezone });
    const garage = await app.models.Garage.findOne({ where: {}, fields: { googlePlace: 1, timezone: 1 } });
    expect(garage.googlePlace.openingHours[0].close.day).to.be.equal(1);
    const jobDate = moment({
      year: 2020,
      month: 3,
      day: 29,
      hour: 15,
      minute: 15,
    }).tz(timezone);
    const job = await insertJob(
      JobTypes.ESCALATE,
      {}, // No need to test the scheduler
      jobDate,
      {
        planJobAfterXHoursOfOpeningHours: {
          hours: 0.5,
          googleOpeningHours: garage.googlePlace.openingHours,
          timezone: garage.timezone,
        },
        noWeekEnd: true,
        saturdayOk: true,
      }
    );
    const expectedDate = moment({
      year: 2020,
      month: 3,
      day: 29,
      hour: 15,
      minute: 45,
    }).tz(timezone);
    expect(job.scheduledAtAsDate).eql(expectedDate.toDate());
  });
  it('test job before the start of the day', async function test() {
    await app.addGarage({ timezone });
    const garage = await app.models.Garage.findOne({ where: {}, fields: { googlePlace: 1, timezone: 1 } });
    const jobDate = moment({
      year: 2020,
      month: 3,
      day: 29,
      hour: 4,
      minute: 15,
    }).tz(timezone);
    const job = await insertJob(
      JobTypes.ESCALATE,
      {}, // No need to test the scheduler
      jobDate,
      {
        planJobAfterXHoursOfOpeningHours: {
          hours: 0.01,
          googleOpeningHours: garage.googlePlace.openingHours,
          timezone: garage.timezone,
        },
        noWeekEnd: true,
        saturdayOk: true,
      }
    );
    const expectedDate = moment({
      year: 2020,
      month: 3,
      day: 29,
      hour: morningOpeningHour,
      minute: morningOpeningMinute,
    }).tz(timezone);
    expect(job.scheduledAtAsDate).eql(expectedDate.toDate());
  });
});
