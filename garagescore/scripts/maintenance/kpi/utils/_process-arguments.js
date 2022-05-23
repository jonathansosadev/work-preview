const ArgParser = require('minimist');
const { ObjectId } = require('mongodb');
const kpiPeriods = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const Logger = require('./_logger');

function processIds(rawIds = []) {
  const ids = rawIds.split(',').map((id) => id.trim());
  for (const id of ids) {
    if (!ObjectId.isValid(id)) {
      Logger.error(`Invalid Id detected ${id}`);
      process.exit(1);
    }
  }

  return ids;
}

function processPeriods(rawPeriods = []) {
  const periodIds = rawPeriods.split(',').map((period) => period.trim());
  const availablePeriods = kpiPeriods.getAllPastPeriods().map((period) => `${period.token}`);

  for (const periodId of periodIds) {
    if (!availablePeriods.includes(periodId)) {
      Logger.error(`Invalid periodId detected ${periodId}`, periodId);
      process.exit(1);
    }
  }

  return periodIds;
}

module.exports = function _processArguments(argv = []) {
  const processedArgs = ArgParser(argv, {
    string: ['userIds', 'garageIds', 'periodIds', 'asyncPoolSize'],
    boolean: ['help', 'drop', 'closeRanged', 'restore'],
    default: { help: false, drop: false, closeRanged: false, restore: false, asyncPoolSize: 10 },
    unknown: (arg) => {
      Logger.error(`The argument "${arg}" is not recognized, use --help for more information`);
      process.exit(1);
    },
  });

  if (processedArgs.help) {
    const help = [
      'This script will regenerate KPIs for all or specified entities. Possible arguments are:',
      '--help : will display what you are currently reading (^_^)',
      '--drop : will destroy all or specified entities before regenerating them',
      '--periodIds : will regenerate only for the specified (comma separated) periods, example: --periodId="10,202109"',
      '--garageIds : will regenerate only for the specified (comma separated) garageIds, example: --garageIds="5609171770ad25190055d4fc,5609173770ad25190055d4fd"',
      '--restore : will restore all KPIs from the backup collection',
      'The [periodIds] arguments will affect the --drop argument we will only drops given entities that match all conditions ($and)',
      'The --closeRanged will regenerate only for lastQuarter and the current month, it cannot be used with --periodIds',
    ];
    Logger.info(help.join('\n\t\u2022  '));
    process.exit(0);
  }

  // process userIds
  if ('userIds' in processedArgs) {
    Logger.warn('Argument --userIds is currently disabled');
    process.exit(1);
    processedArgs.userIds = processIds(processedArgs.userIds);
  }

  // process garageIds
  if ('garageIds' in processedArgs) {
    processedArgs.garageIds = processedArgs.garageIds.split(',').map((gId) => gId.trim());
    if (!processedArgs.garageIds.every(ObjectId.isValid)) {
      Logger.error('Invalid garageIds detected');
      process.exit(1);
    }
  }

  // process periodIds
  if ('periodIds' in processedArgs) {
    processedArgs.periodIds = processPeriods(processedArgs.periodIds);
    if (processedArgs.closeRanged === true) {
      Logger.error('Incompatible arguments --closeRanged and --periodIds detected');
      process.exit(1);
    }
  }

  // Log args :
  const usedArguments = Object.keys(processedArgs).filter((arg) => arg !== '_' && processedArgs[arg]);
  if (!usedArguments.length) {
    return processedArgs;
  }

  Logger.info('Running script with arguments : ');
  for (const arg of usedArguments) {
    Logger.info(`\t\u2022 ${arg} : \x1b[0m ${processedArgs[arg]}`);
  }

  return processedArgs;
};
