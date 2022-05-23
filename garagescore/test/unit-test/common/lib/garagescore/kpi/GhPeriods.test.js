const GhPeriods = require('../../../../../../common/lib/garagescore/kpi/GhPeriods');
const { expect } = require('chai');


describe('GhPeriods', () => {
  describe('getPeriodsToConsolidateDaily', () => {
    it('01.01.2022 => should compute lastQuarter, 2021-quarter4, 2021-month11 and 2021-month10', async () => {
      const date = new Date(2022, 0, 1);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(4);
      expect(periods).to.have.members(['lastQuarter', '2021-quarter4', '2021-month11', '2021-month10']);
    });

    it('05.01.2022 => should compute lastQuarter, 2021-quarter4, 2021-month11 and 2021-month10', async () => {
      const date = new Date(2022, 0, 5);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(4);
      expect(periods).to.have.members(['lastQuarter', '2021-quarter4', '2021-month11', '2021-month10']);
    });

    it('10.01.2022 => should compute lastQuarter, 2021-quarter4, 2021-month11 and 2021-month10', async () => {
      const date = new Date(2022, 0, 10);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(4);
      expect(periods).to.have.members(['lastQuarter', '2021-quarter4', '2021-month11', '2021-month10']);
    });

    it('11.01.2022 => should compute lastQuarter, 2021-quarter4, 2021-month12, 2021-month11 and 2021-month10', async () => {
      const date = new Date(2022, 0, 11);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(5);
      expect(periods).to.have.members(['lastQuarter', '2021-quarter4', '2021-month12', '2021-month11', '2021-month10']);
    });

    it('20.01.2022 => should compute lastQuarter, 2021-quarter4, 2021-month12, 2021-month11 and 2021-month10', async () => {
      const date = new Date(2022, 0, 20);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(5);
      expect(periods).to.have.members(['lastQuarter', '2021-quarter4', '2021-month12', '2021-month11', '2021-month10']);
    });

    it('31.03.2022 => should compute lastQuarter, 2021-quarter4, 2022-month02, 2022-month01 and 2021-month12', async () => {
      const date = new Date(2022, 2, 31);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(5);
      expect(periods).to.have.members(['lastQuarter', '2021-quarter4', '2022-month02', '2022-month01', '2021-month12']);
    });

    it('01.04.2022 => should compute lastQuarter, 2022-quarter1, 2022-month02, 2022-month01', async () => {
      const date = new Date(2022, 3, 1);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(4);
      expect(periods).to.have.members(['lastQuarter', '2022-quarter1', '2022-month02', '2022-month01']);
    });

    it('11.04.2022 => should compute lastQuarter, 2022-quarter1, 2022-month03, 2022-month02, 2022-month01', async () => {
      const date = new Date(2022, 3, 11);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(5);
      expect(periods).to.have.members(['lastQuarter', '2022-quarter1', '2022-month03', '2022-month02', '2022-month01']);
    });

    it('02.11.2022 => should compute lastQuarter, 2022-quarter3, 2022-month09, 2022-month08', async () => {
      const date = new Date(2022, 10, 2);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(4);
      expect(periods).to.have.members(['lastQuarter', '2022-quarter3', '2022-month09', '2022-month08']);
    });

    it('12.11.2022 => should compute lastQuarter, 2022-quarter3, 2022-month10, 2022-month09, 2022-month08', async () => {
      const date = new Date(2022, 10, 12);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(5);
      expect(periods).to.have.members(['lastQuarter', '2022-quarter3', '2022-month10', '2022-month09', '2022-month08']);
    });

    it('01.12.2022 => should compute lastQuarter, 2022-quarter3, 2022-month10, 2022-month09', async () => {
      const date = new Date(2022, 11, 1);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(4);
      expect(periods).to.have.members(['lastQuarter', '2022-quarter3', '2022-month10', '2022-month09']);
    });

    it('11.12.2022 => should compute lastQuarter, 2022-quarter3, 2022-month11, 2022-month10, 2022-month09', async () => {
      const date = new Date(2022, 11, 11);
      const periods = GhPeriods.getPeriodsToConsolidateDaily(date);
      expect(periods).to.be.an('array').and.to.have.lengthOf(5);
      expect(periods).to.have.members(['lastQuarter', '2022-quarter3', '2022-month11', '2022-month10', '2022-month09']);
    });
  });
});
