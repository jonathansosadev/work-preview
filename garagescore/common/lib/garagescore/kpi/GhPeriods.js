const moment = require('moment');
const timeHelper = require('../../util/time-helper');

const absoluteMinimum = moment.utc('2016-01-01T00:00:00.000Z');
const GarageHistoryPeriod = require('../../../models/garage-history.period');

const GhPeriods = {
  /* 
  / We get all available periods in order to compute garage histories' kpis.
  */
  getPeriodsToConsolidateDaily(refDate) {
    const monthTokens = [];
    let iMonthsAgo;
    
    /* 
    /* Month tokens' computation
    /* 1 to 10 : compute M-2 and M-3
    /* 11 to 31 : compute M-1, M-2 and M-3
    */
    for (i = refDate.getDate() <= 10 ? 2 : 1; i <= 3; i++) {
      iMonthsAgo = moment(refDate).subtract(i, 'months').toDate();
      monthTokens.push(`${iMonthsAgo.getFullYear()}-month${`0${iMonthsAgo.getMonth() + 1}`.slice(-2)}`);
    }
    const lastQuarterPeriodToken =  `${iMonthsAgo.getFullYear()}-quarter${Math.floor(iMonthsAgo.getMonth() / 3) + 1}`;

    return [GarageHistoryPeriod.LAST_QUARTER, lastQuarterPeriodToken, ...monthTokens];
  }
};

module.exports = GhPeriods;
