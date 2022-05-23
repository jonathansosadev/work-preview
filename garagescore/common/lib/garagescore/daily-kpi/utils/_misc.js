const KpiPeriods = require('../../kpi/KpiPeriods');

function getTimeElapsed(startTimestamp) {
  const timeStamp = Number(new Date()) - startTimestamp;
  const seconds = Math.floor(timeStamp / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  let timeStr = '';
  if (hours >= 1) {
    timeStr += ` ${hours}h`;
  }
  if (minutes >= 1) {
    timeStr += ` ${minutes % 60}m`;
  }
  if (seconds >= 1) {
    timeStr += ` ${seconds % 60}s`;
  }
  if (timeStamp >= 1) {
    timeStr += ` ${timeStamp % 1000}ms`;
  }

  return timeStr;
}

function getPeriods(formattedArgv = {}) {
  // closeRanged is specified in args
  if (formattedArgv['closeRanged']) {
    return KpiPeriods.getPeriodsAffectedByGivenDate(new Date());
  }

  // a list of periodIds is specified in args
  if (formattedArgv['periodIds']) {
    return formattedArgv.periodIds.map((p) => KpiPeriods.getPeriodObjectFromKpiPeriodToken(p));
  }

  // by default , return all periods
  return KpiPeriods.getAllPastPeriods();
}

function* chunkify(itr, size) {
  let chunk = [];
  for (const v of itr) {
    chunk.push(v);
    if (chunk.length === size) {
      yield chunk;
      chunk = [];
    }
  }
  if (chunk.length) {
    yield chunk;
  }
}

module.exports = {
  getTimeElapsed,
  getPeriods,
  chunkify,
};
