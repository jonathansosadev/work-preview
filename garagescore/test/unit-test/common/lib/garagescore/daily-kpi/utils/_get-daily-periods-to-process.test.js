const { expect } = require('chai');
const moment = require('moment');
const TestApp = require('../../../../../../../common/lib/test/test-app');
const _getDailyPeriodsToProcess = require('../../../../../../../common/lib/garagescore/daily-kpi/utils/_get-daily-periods-to-process');

const app = new TestApp();

describe('_getDailyPeriodsToProcess', () => {
  before(async () => {
    await app.reset();
  });

  it('should throw an error if there is an invalid Date id in args', () => {
    const invalidPeriod = new Date('yolo');
    expect(() => _getDailyPeriodsToProcess([new Date(), invalidPeriod]))
      .to.throw()
      .with.property('message')
      .that.contains(invalidPeriod);
  });

  it('should throw an error if there is an invalid KpiDailyPeriods id in args', () => {
    const invalidPeriod = 202112;
    expect(() => _getDailyPeriodsToProcess([20211201, invalidPeriod, 20211231]))
      .to.throw()
      .with.property('message')
      .that.contains(invalidPeriod);
  });

  it('should correctly generate dailyPeriods from a date and from a dailyPeriod', () => {
    const testCase = '20210101';

    const date = moment.utc(testCase, 'YYYYMMDD').toDate();

    const periodsFromDate = _getDailyPeriodsToProcess([date]);
    const periodsFromDaily = _getDailyPeriodsToProcess([testCase]);

    expect(periodsFromDate.length).to.equal(31);
    periodsFromDate.map((p) => expect(p.token.toString().slice(0, 6)).to.equal('202101'));
    expect(periodsFromDate.length).to.be.equal(periodsFromDaily.length);
    expect(periodsFromDate).to.be.deep.equal(periodsFromDaily);
  });

  it('should correctly generate dailyPeriods if lastQuarter is affected', () => {
    const testCase = moment.utc();

    const periodsFromDate = _getDailyPeriodsToProcess([testCase.toDate()]);

    const periodsFromDaily = _getDailyPeriodsToProcess([testCase.format('YYYYMMDD')]);

    expect(periodsFromDate.length).to.be.equal(periodsFromDaily.length);
    expect(periodsFromDate).to.be.deep.equal(periodsFromDaily);

    // we expect 91 days from last quarter and the number of days until the end of the month
    const daysLeftUntilEndOfMonth = testCase.clone().endOf('month').diff(testCase, 'days');
    expect(periodsFromDate.length).to.equal(91 + daysLeftUntilEndOfMonth);
  });
});
