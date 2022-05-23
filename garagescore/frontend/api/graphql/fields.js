import satisfaction from './cockpit/satisfaction';
import contacts from './cockpit/contacts';
import ereputation from './cockpit/ereputation';
import opinion from './cockpit/opinion';
import internalKpi from './grey-bo/internal-kpi.js';
import monthlySummaries from './grey-bo/monthly-summaries';

const _jobAcronyms = ['APV', 'VN', 'VO', 'VI'];
const _genericListGenerator = (prefix, value) => { // eslint-disable-line
  return _jobAcronyms.reduce((acc, job) => {
    acc[`${prefix}${job}`] = value; // eslint-disable-line
    return acc;
  }, {});
};

export default {
  cockpit: {
    garageHistoryRating() {
      return {
        score: String,
        ..._genericListGenerator('score', String),
        scoreNPS: String,
      };
    },

    satisfaction,
    contacts,
    ereputation,
    opinion
  },
  greybo: {
    internalKpi,
    monthlySummaries
  },
}
