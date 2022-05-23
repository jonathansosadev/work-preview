const chai = require('chai');
const moment = require('moment');
const ReportConfiguration = require('../../../common/lib/garagescore/report/configuration');

const expect = chai.expect;
chai.should();

describe('Test report send dates:', () => {
  describe('Monthly', () => {
    const monthlyConfig = ReportConfiguration.get('monthly');
    const date1 = moment('01-12-2016 03:00', 'DD-MM-YYYY HH:mm').toDate();
    const date2 = moment('28-03-2016 18:00', 'DD-MM-YYYY HH:mm').toDate();
    it('test period date', (done) => {
      const result1 = monthlyConfig.tokenDate(date1);
      expect(result1).to.equals('2016-month11');
      const result2 = monthlyConfig.tokenDate(date2);
      expect(result2).to.equals('2016-month02');
      done();
    });
    it('test send date', (done) => {
      const result1 = monthlyConfig.sendDate(date1);
      expect(moment(result1).format('DD-MM-YYYY HH:mm:ss')).to.equals('12-12-2016 00:00:00');
      const result2 = monthlyConfig.sendDate(date2);
      expect(moment(result2).format('DD-MM-YYYY HH:mm:ss')).to.equals('10-03-2016 00:00:00');
      done();
    });
    it('test min date', (done) => {
      const result1 = monthlyConfig.referenceDateMin(date1);
      expect(moment(result1).format('DD-MM-YYYY HH:mm:ss')).to.equals('01-11-2016 00:00:00');
      const result2 = monthlyConfig.referenceDateMin(date2);
      expect(moment(result2).format('DD-MM-YYYY HH:mm:ss')).to.equals('01-02-2016 00:00:00');
      done();
    });
    it('test max date', (done) => {
      const result1 = monthlyConfig.referenceDateMax(date1);
      expect(moment(result1).format('DD-MM-YYYY HH:mm:ss')).to.equals('30-11-2016 23:59:59');
      const result2 = monthlyConfig.referenceDateMax(date2);
      expect(moment(result2).format('DD-MM-YYYY HH:mm:ss')).to.equals('29-02-2016 23:59:59');
      done();
    });
  });
  describe('Weekly', () => {
    const weeklyConfig = ReportConfiguration.get('weekly');
    const date1 = moment('01-12-2016 03:00', 'DD-MM-YYYY HH:mm').toDate();
    const date2 = moment('28-03-2016 18:00', 'DD-MM-YYYY HH:mm').toDate();
    it('test period date', (done) => {
      const result1 = weeklyConfig.tokenDate(date1);
      expect(result1).to.equals('2016-week47');
      const result2 = weeklyConfig.tokenDate(date2);
      expect(result2).to.equals('2016-week12');
      done();
    });
    it('test send date', (done) => {
      const result1 = weeklyConfig.sendDate(date1);
      expect(moment(result1).format('DD-MM-YYYY HH:mm:ss')).to.equals('28-11-2016 00:00:00');
      const result2 = weeklyConfig.sendDate(date2);
      expect(moment(result2).format('DD-MM-YYYY HH:mm:ss')).to.equals('28-03-2016 00:00:00');
      done();
    });
    it('test min date', (done) => {
      const result1 = weeklyConfig.referenceDateMin(date1);
      expect(moment(result1).format('DD-MM-YYYY HH:mm:ss')).to.equals('21-11-2016 00:00:00');
      const result2 = weeklyConfig.referenceDateMin(date2);
      expect(moment(result2).format('DD-MM-YYYY HH:mm:ss')).to.equals('21-03-2016 00:00:00');
      done();
    });
    it('test max date', (done) => {
      const result1 = weeklyConfig.referenceDateMax(date1);
      expect(moment(result1).format('DD-MM-YYYY HH:mm:ss')).to.equals('27-11-2016 23:59:59');
      const result2 = weeklyConfig.referenceDateMax(date2);
      expect(moment(result2).format('DD-MM-YYYY HH:mm:ss')).to.equals('27-03-2016 23:59:59');
      done();
    });
  });
  describe('Daily', () => {
    const weeklyConfig = ReportConfiguration.get('daily');
    const date1 = moment('01-12-2016 03:00', 'DD-MM-YYYY HH:mm').toDate();
    const date2 = moment('28-03-2016 18:00', 'DD-MM-YYYY HH:mm').toDate();
    it('test period date', (done) => {
      const result1 = weeklyConfig.tokenDate(date1);
      expect(result1).to.equals('2016-11-30');
      const result2 = weeklyConfig.tokenDate(date2);
      expect(result2).to.equals('2016-03-27');
      done();
    });
    it('test send date', (done) => {
      const result1 = weeklyConfig.sendDate(date1);
      expect(moment(result1).format('DD-MM-YYYY HH:mm:ss')).to.equals('01-12-2016 00:00:00');
      const result2 = weeklyConfig.sendDate(date2);
      expect(moment(result2).format('DD-MM-YYYY HH:mm:ss')).to.equals('28-03-2016 00:00:00');
      done();
    });
    it('test min date', (done) => {
      const result1 = weeklyConfig.referenceDateMin(date1);
      expect(moment(result1).format('DD-MM-YYYY HH:mm:ss')).to.equals('30-11-2016 00:00:00');
      const result2 = weeklyConfig.referenceDateMin(date2);
      expect(moment(result2).format('DD-MM-YYYY HH:mm:ss')).to.equals('27-03-2016 00:00:00');
      done();
    });
    it('test max date', (done) => {
      const result1 = weeklyConfig.referenceDateMax(date1);
      expect(moment(result1).format('DD-MM-YYYY HH:mm:ss')).to.equals('30-11-2016 23:59:59');
      const result2 = weeklyConfig.referenceDateMax(date2);
      expect(moment(result2).format('DD-MM-YYYY HH:mm:ss')).to.equals('27-03-2016 23:59:59');
      done();
    });
  });
});
