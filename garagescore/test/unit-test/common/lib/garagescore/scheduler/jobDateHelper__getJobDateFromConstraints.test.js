const moment = require('moment-timezone');
const { expect } = require('chai');

const { getJobDateFromConstraints } = require('../../../../../../common/lib/garagescore/scheduler/jobDateHelpers');

describe('Compute Job date from constraints', () => {
  let constraints = {};

  beforeEach(() => {
    constraints = {};
  });

  it('Should return the same date if no contraints are specified', () => {
    const date = new Date(2020, 0, 10, 10, 0);
    expect(getJobDateFromConstraints(date, {})).eql(date);
  });

  // test use case https://github.com/garagescore/garagescore/issues/4723
  it('Should set job date to respect xlead stage_2 event on saturday', () => {
    const openingHours = [
      { close: { day: 1, time: '1200' }, open: { day: 1, time: '0800' } },
      { close: { day: 1, time: '1900' }, open: { day: 1, time: '1400' } },
      { close: { day: 2, time: '1200' }, open: { day: 2, time: '0800' } },
      { close: { day: 2, time: '1900' }, open: { day: 2, time: '1400' } },
      { close: { day: 3, time: '1200' }, open: { day: 3, time: '0800' } },
      { close: { day: 3, time: '1900' }, open: { day: 3, time: '1400' } },
      { close: { day: 4, time: '1200' }, open: { day: 4, time: '0800' } },
      { close: { day: 4, time: '1900' }, open: { day: 4, time: '1400' } },
      { close: { day: 5, time: '1200' }, open: { day: 5, time: '0800' } },
      { close: { day: 5, time: '1900' }, open: { day: 5, time: '1400' } },
      { close: { day: 6, time: '1200' }, open: { day: 6, time: '0900' } },
      { close: { day: 6, time: '1900' }, open: { day: 6, time: '1400' } },
    ];
    constraints = {
      noWeekEnd: true,
      saturdayOk: true,
      planJobAfterXHoursOfOpeningHours: {
        hours: 4,
        googleOpeningHours: openingHours,
        timezone: 'Europe/Paris',
        minimumScheduledHour: 9,
      },
    };

    const jobDate = moment({ year: 2021, month: 7, day: 28, hour: 12 }).tz('Europe/Paris');
    const expectedJobDate = moment({ year: 2021, month: 7, day: 28, hour: 16 }).tz('Europe/Paris');

    expect(getJobDateFromConstraints(jobDate, constraints)).eql(expectedJobDate.toDate());
  });

  it('Should set job date to respect xlead stage_2', () => {
    const openingHours = [
      { open: { day: 1, time: '0830' }, close: { day: 1, time: '1200' } },
      { open: { day: 1, time: '1400' }, close: { day: 1, time: '1900' } },
      { open: { day: 2, time: '0830' }, close: { day: 2, time: '1200' } },
      { open: { day: 2, time: '1400' }, close: { day: 2, time: '1900' } },
      { open: { day: 3, time: '0830' }, close: { day: 3, time: '1200' } },
      { open: { day: 3, time: '1400' }, close: { day: 3, time: '1900' } },
      { open: { day: 4, time: '0830' }, close: { day: 4, time: '1200' } },
      { open: { day: 4, time: '1400' }, close: { day: 4, time: '1900' } },
      { open: { day: 5, time: '0830' }, close: { day: 5, time: '1200' } },
      { open: { day: 5, time: '1400' }, close: { day: 5, time: '1900' } },
      { open: { day: 6, time: '0830' }, close: { day: 6, time: '1200' } },
    ];
    constraints = {
      planJobAfterXHoursOfOpeningHours: {
        hours: 4,
        googleOpeningHours: openingHours,
        timezone: 'Europe/Paris',
      },
    };

    const jobDate = moment({ year: 2021, month: 10, day: 4, hour: 16, minute: 30 }).tz('Europe/Paris');
    const expectedJobDate = moment({ year: 2021, month: 10, day: 5, hour: 8, minute: 30 }).tz('Europe/Paris');

    expect(getJobDateFromConstraints(jobDate, constraints)).eql(expectedJobDate.toDate());
  });

  // test use case https://github.com/garagescore/garagescore/issues/4723
  it('Should set job date to respect minimumScheduledHour', () => {
    const openingHours = [
      { open: { day: 1, time: '0830' }, close: { day: 1, time: '1200' } },
      { open: { day: 1, time: '1400' }, close: { day: 1, time: '1900' } },
      { open: { day: 2, time: '0830' }, close: { day: 2, time: '1200' } },
      { open: { day: 2, time: '1400' }, close: { day: 2, time: '1900' } },
      { open: { day: 3, time: '0830' }, close: { day: 3, time: '1200' } },
      { open: { day: 3, time: '1400' }, close: { day: 3, time: '1900' } },
      { open: { day: 4, time: '0830' }, close: { day: 4, time: '1200' } },
      { open: { day: 4, time: '1400' }, close: { day: 4, time: '1900' } },
      { open: { day: 5, time: '0830' }, close: { day: 5, time: '1200' } },
      { open: { day: 5, time: '1400' }, close: { day: 5, time: '1900' } },
      { open: { day: 6, time: '0830' }, close: { day: 6, time: '1200' } },
    ];
    constraints = {
      planJobAfterXHoursOfOpeningHours: {
        hours: 4,
        googleOpeningHours: openingHours,
        timezone: 'Europe/Paris',
        minimumScheduledHour: 9,
      },
    };

    const jobDate = moment({ year: 2021, month: 10, day: 4, hour: 16, minute: 30 }).tz('Europe/Paris');
    const expectedJobDate = moment({ year: 2021, month: 10, day: 5, hour: 9, minute: 0 }).tz('Europe/Paris');

    expect(getJobDateFromConstraints(jobDate, constraints)).eql(expectedJobDate.toDate());
  });

  it('Should set job in the same opening period', () => {
    const openingHours = [
      { open: { day: 1, time: '0830' }, close: { day: 1, time: '1200' } },
      { open: { day: 1, time: '1400' }, close: { day: 1, time: '1900' } },
      { open: { day: 2, time: '0830' }, close: { day: 2, time: '1200' } },
      { open: { day: 2, time: '1400' }, close: { day: 2, time: '1900' } },
      { open: { day: 3, time: '0830' }, close: { day: 3, time: '1200' } },
      { open: { day: 3, time: '1400' }, close: { day: 3, time: '1900' } },
      { open: { day: 4, time: '0830' }, close: { day: 4, time: '1200' } },
      { open: { day: 4, time: '1400' }, close: { day: 4, time: '1900' } },
      { open: { day: 5, time: '0830' }, close: { day: 5, time: '1200' } },
      { open: { day: 5, time: '1400' }, close: { day: 5, time: '1900' } },
      { open: { day: 6, time: '0830' }, close: { day: 6, time: '1200' } },
    ];
    const hours = 1;
    constraints = {
      planJobAfterXHoursOfOpeningHours: {
        hours,
        googleOpeningHours: openingHours,
        timezone: 'Europe/Paris',
      },
    };

    const jobDate = moment({ year: 2021, month: 10, day: 4, hour: 14, minute: 30 }).tz('Europe/Paris');
    const expectedJobDate = jobDate.clone().hour(jobDate.hour() + hours);
    expect(getJobDateFromConstraints(jobDate, constraints)).eql(expectedJobDate.toDate());
  });
});
