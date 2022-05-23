const KpiPeriods = require('../../../../../../common/lib/garagescore/kpi/KpiPeriods');
const { expect } = require('chai');


describe('KpiPeriods', () => {

  describe('getPeriodIntervalPeriodList', () => {
    it('same start and end returns [start]', async () => {
      const start = 202109;
      const periodList = KpiPeriods.getPeriodIntervalPeriodList(start, start);
      expect(periodList).to.be.an('array').and.to.have.lengthOf(1);
      expect(periodList[0]).to.equal(start);
    });
    it('returns all monthly periods inside the interval [start, end]', async () => {
      const start = 202102;
      const end = 202109;
      const periodList = KpiPeriods.getPeriodIntervalPeriodList(start, end);
      expect(periodList).to.be.an('array').and.to.have.lengthOf(8);
      for (let i = 0; i < 8; i++) {
        expect(periodList[i]).to.equal(202102 + i);
      }
    });
    it('returns all monthly periods inside the interval [start, end] (not same start year)', async () => {
      const start = 202010;
      const end = 202109;
      const periodList = KpiPeriods.getPeriodIntervalPeriodList(start, end);
      expect(periodList).to.be.an('array').and.to.have.lengthOf(12);
      for (let i = 0; i < 3; i++) {
        expect(periodList[i]).to.equal(202010 + i);
      }
      for (let i = 0; i < 9; i++) {
        expect(periodList[i + 3]).to.equal(202101 + i);
      }
    });
    it('if start is before end it works the same', async () => {
      const start = 202010;
      const end = 202109;
      const periodList = KpiPeriods.getPeriodIntervalPeriodList(start, end);
      const periodListReverse = KpiPeriods.getPeriodIntervalPeriodList(end, start);
      expect(periodList.length).to.equal(periodListReverse.length);
      for (let i = 0; i < periodList.length; i++) {
        expect(periodList[i]).to.equal(periodListReverse[i]);
      }
    });
    it('returns [] if either start or end is not a valid monthly period', async () => {
      const valid = 202109;
      const year = 2021;
      const quarter = 20213;
      const ghPeriod = '2020-month12';
      const troll = 'plop';
      expect(KpiPeriods.getPeriodIntervalPeriodList(valid, year)).to.have.lengthOf(0);
      expect(KpiPeriods.getPeriodIntervalPeriodList(year, valid)).to.have.lengthOf(0);
      expect(KpiPeriods.getPeriodIntervalPeriodList(valid, quarter)).to.have.lengthOf(0);
      expect(KpiPeriods.getPeriodIntervalPeriodList(quarter, valid)).to.have.lengthOf(0);
      expect(KpiPeriods.getPeriodIntervalPeriodList(valid, ghPeriod)).to.have.lengthOf(0);
      expect(KpiPeriods.getPeriodIntervalPeriodList(ghPeriod, valid)).to.have.lengthOf(0);
      expect(KpiPeriods.getPeriodIntervalPeriodList(valid, troll)).to.have.lengthOf(0);
      expect(KpiPeriods.getPeriodIntervalPeriodList(troll, valid)).to.have.lengthOf(0);
    });
  });


});
