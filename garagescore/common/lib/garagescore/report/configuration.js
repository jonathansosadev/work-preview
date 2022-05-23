const moment = require('moment');
const GarageHistoryPeriod = require('../../../../common/models/garage-history.period');

function noWeekEnd(referenceDate) {
  const dayOfWeek = moment(referenceDate).day();
  if (dayOfWeek === 0) return moment(referenceDate).day(1);
  else if (dayOfWeek === 6) return moment(referenceDate).day(8);
  return moment(referenceDate);
}
function firstInstantOfLastDay(referenceDate) {
  return moment(referenceDate)
    .subtract(1, 'day')
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0)
    .toDate();
}
function firstInstantOfLastWeek(referenceDate) {
  return moment(referenceDate).day(-6).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0).toDate();
}
function firstInstantOfLastMonth(referenceDate) {
  return moment(referenceDate)
    .subtract(1, 'month')
    .date(1)
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0)
    .toDate();
}
function lastMonthNumber(referenceDate) {
  return moment(referenceDate).subtract(1, 'month').month();
}
function lastMonthYear(referenceDate) {
  return moment(referenceDate).subtract(1, 'month').year();
}

function todayAtMidnight(referenceDate) {
  return moment(referenceDate).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0).toDate();
}
function currentWeekMonday(referenceDate) {
  return moment(referenceDate).day(1).set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0).toDate();
}
function currentMonthTenthDay(referenceDate) {
  return noWeekEnd(moment(referenceDate).date(10))
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0)
    .toDate();
}
function currentMonthEleventhDay(referenceDate) {
  return noWeekEnd(moment(referenceDate).date(11))
    .set('hour', 0)
    .set('minute', 0)
    .set('second', 0)
    .set('millisecond', 0)
    .toDate();
}
function lastInstantOfLastDay(referenceDate) {
  return moment(referenceDate)
    .subtract(1, 'day')
    .set('hour', 23)
    .set('minute', 59)
    .set('second', 59)
    .set('millisecond', 999)
    .toDate();
}
function lastInstantOfLastWeek(referenceDate) {
  return moment(referenceDate)
    .day(0)
    .set('hour', 23)
    .set('minute', 59)
    .set('second', 59)
    .set('millisecond', 999)
    .toDate();
}
function lastInstantOfLastMonth(referenceDate) {
  return moment(referenceDate)
    .date(1)
    .subtract(1, 'day')
    .set('hour', 23)
    .set('minute', 59)
    .set('second', 59)
    .set('millisecond', 999)
    .toDate();
}

const configs = [
  {
    id: 'daily',
    label: 'journalier',
    label2: '',
    sendDate: todayAtMidnight,
    referenceDateMin: firstInstantOfLastDay,
    referenceDateMax: lastInstantOfLastDay,
    tokenDate: GarageHistoryPeriod.tokenizeLastday.bind(GarageHistoryPeriod),
    mustSave: true,
    enable: true,
    userFilter: {
      'user.reportConfigs.daily.enable': true,
    },
  },
  {
    id: 'weekly',
    label: 'hebdomadaire',
    label2: 'de la semaine ',
    sendDate: currentWeekMonday,
    referenceDateMin: firstInstantOfLastWeek,
    referenceDateMax: lastInstantOfLastWeek,
    tokenDate: GarageHistoryPeriod.tokenizeLastWeek.bind(GarageHistoryPeriod),
    mustSave: true,
    enable: true,
    userFilter: {
      'user.reportConfigs.weekly.enable': true,
    },
  },
  {
    id: 'monthly',
    label: 'mensuel',
    label2: 'du mois ',
    sendDate: currentMonthTenthDay,
    referenceDateMin: firstInstantOfLastMonth,
    referenceDateMax: lastInstantOfLastMonth,
    tokenDate: GarageHistoryPeriod.tokenizeLastMonth.bind(GarageHistoryPeriod),
    mustSave: true,
    enable: true,
    userFilter: {
      'user.reportConfigs.monthly.enable': true,
    },
  },
  {
    id: 'monthlySummary',
    label: 'Synthèse mensuelle',
    label2: 'du mois ',
    sendDate: currentMonthEleventhDay,
    month: lastMonthNumber,
    year: lastMonthYear,
    mustSave: true,
    enable: true,
    userFilter: {
      'user.reportConfigs.monthlySummary.enable': true,
    },
  },
];
configs.get = function getConfig(id) {
  for (let i = 0; i < configs.length; i++) {
    if (id === configs[i].id) {
      return configs[i];
    }
  }
  return null;
};
configs.keys = () => configs.map((c) => c.id);

module.exports = configs;
