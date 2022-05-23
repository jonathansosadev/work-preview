const moment = require('moment-timezone');
const { expect } = require('chai');

const { _modifyWithSetDay } = require('../../../../../../common/lib/garagescore/scheduler/jobDateHelpers');

describe('modifyWithSetDay', () => {
  let date;
  beforeEach(() => {
    date = moment({ year: 1995, month: 2, day: 19 });
  });

  it('Should not change the date and return false if setDay is not a number', () => {
    const expected = moment(date);
    expect(_modifyWithSetDay(date, '')).eql(false);
    expect(date).eql(expected);
  });

  it('Should not change the date and return false if setDay is the same day', () => {
    const expected = moment(date);
    expect(_modifyWithSetDay(date, date.date())).eql(false);
    expect(date).eql(expected);
  });

  it('Should change the date day to match setDay and return true', () => {
    const setDay = date.date() + 1;
    const expected = moment(date).date(setDay);
    expect(_modifyWithSetDay(date, setDay)).eql(true);
    expect(date).eql(expected);
  });

  it('Should change the date month to match setDay and return true', () => {
    // !month index start at 0 in js
    const setDay = date.date() - 1;
    const expected = moment(date)
      .month(date.month() + 1)
      .date(setDay);
    expect(_modifyWithSetDay(date, setDay)).eql(true);
    expect(date).eql(expected);
  });

  //TODO test WTF while loop
});
