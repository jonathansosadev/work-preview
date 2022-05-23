const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const chai = require('chai');
const _ = require('lodash');
const moment = require('moment');
require('moment-timezone');

const timezone = 'Europe/Paris';
const locale = 'fr';
moment.locale(locale);
moment.tz(timezone);

const expect = chai.expect;

describe('GarageHistoryPeriod methods test', () => {
  it('test getDisplayableDate method', (done) => {
    const weekPeriod = '2014-week24';
    const result = GarageHistoryPeriod.getDisplayableDate({ period: weekPeriod });
    expect(result).to.equal('semaine 24 2014');
    const monthPeriod = '2016-month05';
    const result2 = GarageHistoryPeriod.getDisplayableDate({ period: monthPeriod });
    expect(result2).to.equal('mai 2016');
    const dailyPeriod = '2015-08-06';
    const result3 = GarageHistoryPeriod.getDisplayableDate({ period: dailyPeriod });
    expect(result3).to.equal('06 août 2015');
    done();
  });
  it('test getCockpitAvailablePeriods method', (done) => {
    const isPeriodsExist = (res, periods) => {
      expect(periods.length).to.equal(res.length);
      _.each(periods, (period) => {
        expect(_.find(res, (record) => record.id.toString() === period.toString())).to.exist;
      });
    };
    /** tester le mois d'avril */
    let today = moment('2017-03-21').toDate();
    let garageCreatedAt = moment('2016-04-08');

    isPeriodsExist(GarageHistoryPeriod.getCockpitAvailablePeriods(garageCreatedAt.toDate(), today), [
      GarageHistoryPeriod.LAST_QUARTER,
      GarageHistoryPeriod.ALL_HISTORY,
      GarageHistoryPeriod.CURRENT_YEAR,
      2016,
      moment(today).subtract(1, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(2, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(3, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(4, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(5, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(6, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(3, 'month').format(GarageHistoryPeriod.QUARTER_FORMAT),
      moment(today).subtract(6, 'month').format(GarageHistoryPeriod.QUARTER_FORMAT),
      moment(today).subtract(9, 'month').format(GarageHistoryPeriod.QUARTER_FORMAT),
    ]);

    today = moment('2017-10-09').toDate();
    garageCreatedAt = moment('2017-04-08');

    isPeriodsExist(GarageHistoryPeriod.getCockpitAvailablePeriods(garageCreatedAt.toDate(), today), [
      GarageHistoryPeriod.LAST_QUARTER,
      GarageHistoryPeriod.ALL_HISTORY,
      GarageHistoryPeriod.CURRENT_YEAR,
      moment(today).subtract(2, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(3, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(4, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(5, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(6, 'month').format(GarageHistoryPeriod.MONTHLY_FORMAT),
      moment(today).subtract(6, 'month').format(GarageHistoryPeriod.QUARTER_FORMAT),
    ]);
    done();
  });
  it('test getPeriodMaxDate method', (done) => {
    expect(moment(GarageHistoryPeriod.getPeriodMaxDate('2014-week24')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2014-06-15 23:59:59.999'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMaxDate('2016-month05')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2016-05-31 23:59:59.999'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMaxDate('2016-month10')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2016-10-31 23:59:59.999'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMaxDate('2016-month11')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2016-11-30 23:59:59.999'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMaxDate('2015-08-06')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2015-08-06 23:59:59.999'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMaxDate('2017-quarter3')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2017-09-30 23:59:59.999'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMaxDate('2016-quarter4')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2016-12-31 23:59:59.999'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMaxDate('2017')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2017-12-31 23:59:59.999'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMaxDate(GarageHistoryPeriod.CURRENT_YEAR))).to.above(
      moment('12-31 23:59:59', 'MM-DD HH:mm:ss')
    );
    expect(
      moment(GarageHistoryPeriod.getPeriodMaxDate(GarageHistoryPeriod.ALL_HISTORY)).format('YYYY-MM-DD HH:mm:ss')
    ).to.above(moment(2147483646999, 'x').format('YYYY-MM-DD HH:mm:ss'));
    expect(
      moment(GarageHistoryPeriod.getPeriodMaxDate(GarageHistoryPeriod.LAST_QUARTER)).format('YYYY-MM-DD HH:mm:ss')
    ).to.equal(moment().format('YYYY-MM-DD HH:mm:ss'));
    done();
  });
  it('test isValidPeriod weekly', (done) => {
    expect(GarageHistoryPeriod.isValidPeriod('2017-week18')).to.be.true;
    expect(GarageHistoryPeriod.isValidPeriod('2017-week1')).to.be.true;
    done();
  });
  it('test getPeriodMinDate method', (done) => {
    expect(moment(GarageHistoryPeriod.getPeriodMinDate('2014-week24')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2014-06-09 00:00:00.000'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMinDate('2016-month05')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2016-05-01 00:00:00.000'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMinDate('2016-month10')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2016-10-01 00:00:00.000'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMinDate('2016-month11')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2016-11-01 00:00:00.000'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMinDate('2015-08-06')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2015-08-06 00:00:00.000'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMinDate('2017-quarter3')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2017-07-01 00:00:00.000'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMinDate('2016-quarter4')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2016-10-01 00:00:00.000'
    );
    expect(moment(GarageHistoryPeriod.getPeriodMinDate('2017')).format('YYYY-MM-DD HH:mm:ss.SSS')).to.equal(
      '2017-01-01 00:00:00.000'
    );
    expect(
      moment(GarageHistoryPeriod.getPeriodMinDate(GarageHistoryPeriod.CURRENT_YEAR)).format('YYYY-MM-DD HH:mm:ss.SSS')
    ).to.equal(`${moment().year()}-01-01 00:00:00.000`);
    expect(
      moment(GarageHistoryPeriod.getPeriodMinDate(GarageHistoryPeriod.ALL_HISTORY)).format('YYYY-MM-DD HH:mm:ss')
    ).to.equal(moment('1970-01-01T00:00:00.000Z').format('YYYY-MM-DD HH:mm:ss'));
    expect(
      moment(GarageHistoryPeriod.getPeriodMinDate(GarageHistoryPeriod.LAST_QUARTER)).format('YYYY-MM-DD HH:mm:ss')
    ).to.equal(moment().subtract(90, 'days').format('YYYY-MM-DD HH:mm:ss'));
    done();
  });
});
