const moment = require('moment');

const KpiPerMaintainer = {
  'jscarinos@garagescore.com': [
    'WEEKLY_TECH1',
    'WEEKLY_TECH2',
    'WEEKLY_TECH3',
    'WEEKLY_TECH4',
    'WEEKLY_TECH5',
    'WEEKLY_TECH10',
    'MONTHLY_TECH1',
    'MONTHLY_TECH2',
    'SNIPPET_TECH',
  ],
  'rbourbilieres@garagescore.com': ['MONTHLY_PROD1', 'MONTHLY_PROD2', 'SNIPPET_PROD'],
  'bbodrefaux@garagescore.com': ['MONTHLY_BRANCH1', 'MONTHLY_BRANCH2', 'SNIPPET_BRANCH'],
  'awettling@garagescore.com': ['MONTHLY_PM1', 'MONTHLY_PM2', 'SNIPPET_PM'],
  'oguillemot@garagescore.com': ['MONTHLY_MARKET1', 'MONTHLY_MARKET2', 'SNIPPET_MARKET'],
  'bdechenaud@garagescore.com': ['MONTHLY_GLOBAL1', 'MONTHLY_GLOBAL2', 'MONTHLY_GLOBAL3', 'MONTHLY_GLOBAL4'],
  'mgrihangne@garagescore.com': ['MONTHLY_BIZ1', 'MONTHLY_BIZ2', 'SNIPPET_BIZ'],
  'cseguy@garagescore.com': ['MONTHLY_HR1', 'MONTHLY_HR2', 'SNIPPET_HR'],
  'agomez@garagescore.com': ['MONTHLY_BIZINTER1', 'MONTHLY_BIZINTER2', 'SNIPPET_BIZINTER'],
};

module.exports = function InternalKPIDef(InternalKPI) {
  // detailled values of my service kpis
  // get data used by the greybo kpi editor from the database
  // filter only the kpis maintained by the user
  InternalKPI.getMyKpis = async (user) => {
    if (!user) {
      return [];
    }
    const kpis = await InternalKPI.find({});
    const myKpis = KpiPerMaintainer[user.email] || [];
    const data = {};
    // init
    myKpis.forEach((k) => {
      data[k] = { name: k, values: [] };
    });
    // get values from db
    kpis.forEach((kpi) => {
      const { name, valuesPerPeriod } = kpi;
      if (myKpis.indexOf(name) >= 0) {
        const kv = [];
        Object.keys(valuesPerPeriod).forEach((k) => {
          kv.push({ k, v: valuesPerPeriod[k] });
        });
        data[name] = { name, values: kv };
      }
    });
    return Object.values(data);
  };
  // set kpis edited from the greybo
  // used a loopback remote method (i should have made a graphql but we try to KISS here)
  InternalKPI.setMyKpis = async (userEmail, kpis) => {
    const myKpis = KpiPerMaintainer[userEmail] || [];
    for (let i = 0; i < myKpis.length; i++) {
      const name = myKpis[i];
      try {
        await InternalKPI.upsert({ name, maintainer: userEmail, valuesPerPeriod: kpis[name] || {} });
      } catch (e) {
        console.error(e);
      }
    }
    return 'OK';
  };

  InternalKPI.remoteMethod('setMyKpis', {
    http: {
      path: '/setMyKpis',
      verb: 'post',
    },
    accepts: [
      {
        arg: 'userEmail',
        type: 'string',
        required: true,
      },
      {
        arg: 'kpis',
        type: 'object',
        required: true,
      },
    ],
    returns: [
      {
        arg: 'status',
        type: 'string',
      },
    ],
  });
  // summary of every kpis of every services
  // public data used to display the internal kpis report in the greybo
  // fetch the data in the db and format them for vue
  InternalKPI.getPublicReport = async () => {
    const kpis = await InternalKPI.find({});
    const res = [];
    const currentWeek = moment().add(-1, 'WEEK').format('WWYYYY');
    const lastWeek = moment().add(-2, 'WEEK').format('WWYYYY');
    const fourWeeks = [
      moment().add(-2, 'WEEK').format('WWYYYY'),
      moment().add(-3, 'WEEK').format('WWYYYY'),
      moment().add(-4, 'WEEK').format('WWYYYY'),
      moment().add(-5, 'WEEK').format('WWYYYY'),
    ];
    const currentMonth = moment().add(-1, 'MONTH').format('MMYYYY');
    const lastMonth = moment().add(-2, 'MONTH').format('MMYYYY');
    const twelveMonths = [
      moment().add(-2, 'MONTH').format('MMYYYY'),
      moment().add(-3, 'MONTH').format('MMYYYY'),
      moment().add(-4, 'MONTH').format('MMYYYY'),
      moment().add(-5, 'MONTH').format('MMYYYY'),
      moment().add(-6, 'MONTH').format('MMYYYY'),
      moment().add(-7, 'MONTH').format('MMYYYY'),
      moment().add(-8, 'MONTH').format('MMYYYY'),
      moment().add(-9, 'MONTH').format('MMYYYY'),
      moment().add(-10, 'MONTH').format('MMYYYY'),
      moment().add(-11, 'MONTH').format('MMYYYY'),
      moment().add(-12, 'MONTH').format('MMYYYY'),
      moment().add(-13, 'MONTH').format('MMYYYY'),
    ];
    kpis.forEach((kpi) => {
      const name = kpi.getId();
      const weekly = name.indexOf('WEEKLY') >= 0;
      const monthly = name.indexOf('MONTHLY') >= 0;
      if (weekly) {
        let mean = 0;
        let i = 0;
        fourWeeks.forEach((w) => {
          if (kpi.valuesPerPeriod[w]) {
            mean += parseFloat(kpi.valuesPerPeriod[w], 10);
            i++;
          }
        });
        if (i) {
          mean /= i;
        }
        const last = parseFloat(kpi.valuesPerPeriod[lastWeek] || 0, 10);
        const current = parseFloat(kpi.valuesPerPeriod[currentWeek] || 0, 10);
        res.push({ name, values: [mean, last, current] });
      } else if (monthly) {
        let mean = 0;
        let i = 0;
        twelveMonths.forEach((m) => {
          if (kpi.valuesPerPeriod[m]) {
            mean += parseFloat(kpi.valuesPerPeriod[m], 10);
          }
          i++;
        });
        if (i) {
          mean /= i;
        }
        const last = parseFloat(kpi.valuesPerPeriod[lastMonth] || 0, 10);
        const current = parseFloat(kpi.valuesPerPeriod[currentMonth] || 0, 10);
        res.push({ name, values: [mean, last, current] });
      } else if (name.indexOf('SNIPPET') === 0 && kpi.valuesPerPeriod[currentMonth]) {
        res.push({ name, values: [kpi.valuesPerPeriod[currentMonth]] });
      }
    });
    return res;
  };
};
