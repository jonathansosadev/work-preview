/**
 * Help find the best hint to use from a $match stage
 */
const { JS, log } = require('../../util/log');

module.exports = function hint($match) {
  let garagesCount = 0;
  if ($match['0'] && $match['0'].$in) {
    garagesCount = $match['0'].$in.length;
  } else if ($match['0']) {
    garagesCount = 1;
  }
  let periodsCount = 0;
  if ($match['4'] && $match['4'].$in) {
    periodsCount = $match['4'].$in.length;
  } else if ($match['4']) {
    periodsCount = 1;
  }

  if (periodsCount === 0 && garagesCount === 0) {
    log.debug(
      JS,
      `KpiByPeriod (${JSON.stringify({ garagesCount, periodsCount })}) using no hint, $match=${JSON.stringify($match)}`
    );
    return null;
  }
  if (garagesCount === 0 && periodsCount > 0) {
    log.debug(
      JS,
      `KpiByPeriod (${JSON.stringify({ garagesCount, periodsCount })}) hint index 'period', $match=${JSON.stringify(
        $match
      )}`
    );
    return 'period';
  }

  log.debug(
    JS,
    `KpiByPeriod (${JSON.stringify({ garagesCount, periodsCount })}) hint index 'garageId', $match=${JSON.stringify(
      $match
    )}`
  );
  return 'garageId';
};
