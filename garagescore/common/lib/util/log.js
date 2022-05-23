const c = require('colors/safe');
// const debug = require('debug');
const colorPerLevel = {
  debug: c.white,
  info: c.blue,
  warning: c.magenta,
  error: c.red,
  fatal: c.red,
};
const format = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false,
};

const _timeStamps = []; // use by time and timeand

const logger = (lvl, maintainer, message, error) => {
  if (!maintainer) throw new Error('The maintainer is mandatory.');
  try {
    const stack = new Error().stack.split('\n');
    const ppath = stack[3].replace(/\\/g, '/').match(/garagescore\/([^)]*)/);
    const path = (ppath && ppath[1]) || 'Unknown path';
    const ffuncName = stack[3].match(/at ([^ ]*)/);
    const funcName = (ffuncName && ffuncName[1]) || 'Unknown method';
    const errorMsg = (error && error.toString()) || '';
    const errorStack = (error && error.stack && error.stack.match(/.*garagescore[^)]*/g)) || [];
    const date = new Date();
    const listToDisplay = [
      { data: message || '', color: c.green },
      { data: `L0G_${lvl}`, color: null },
      { data: date.toLocaleTimeString('fr-FR', format), color: c.black },
      { data: path || '', color: c.magenta },
      { data: funcName || '', color: c.cyan },
      { data: errorMsg || '', color: c.red.underline },
      { data: errorStack.join(', ').replace(/ +(?= )/g, ''), color: c.magenta },
      { data: maintainer || 'Le Ouss', color: c.blue },
      { data: Date.now().toString(), color: null },
    ];
    if (process.env.NODE_ENV !== 'production') {
      // TODO check if we are on heroku
      console.log(`${colorPerLevel[lvl](message)} ${c.gray(path)}`);
      if (errorMsg) {
        console.error(c.red(errorMsg), errorStack);
      }
    } else {
      console.log(c.dim(`${listToDisplay.map((e) => (e.color && e.color(e.data)) || e.data).join('\t')}`));
    }
  } catch (e) {
    console.log(e, { lvl, maintainer, message });
  }
};
// mimic console.time
const time = (maintainer, name) => {
  _timeStamps[name] = new Date();
};
const _timeCapture = (maintainer, name) => {
  if (_timeStamps[name]) {
    const timeStamp = +new Date() - _timeStamps[name];
    const seconds = Math.floor(timeStamp / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    let timeStr = `${name}:`;
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
    logger('debug', maintainer, timeStr);
  }
};
// mimic console.timeEnd
const timeEnd = (maintainer, name) => {
  _timeCapture(maintainer, name);
};
const loggers = [
  /** LOG LEVELS **/
  // DEBUG < INFO < WARNING < ERROR < FATAL
  'debug', //    For testing or debugging (ex: "${value} should be = 5")
  'info', //     To give useful information (ex: "The script finished with success !")
  'warning', //  To notify that there is something happening that shouldn't happen (ex: "Couldn't find this user id: ${userId}")
  'error', //    To notify when something went wrong, we need to check it quickly (ex: "findById need a id !")
  'fatal', //     To notify WE NEED TO FIX THAT RIGHT NOW (ex: "More than 20 000 contacts are waiting, we should do something bru")
  /** ********** **/
];

module.exports = {
  time,
  timeEnd,
  log: {
    ...loggers.reduce((acc, key) => {
      acc[key] = (...args) => logger(key, ...args);
      return acc;
    }, {}),
  },
  FED: 'FED',
  SIMON: 'SIMON',
  JS: 'JS',
  ANASS: 'ANASS',
  TIBO: 'TIBO',
  BANG: 'BANG',
  MOMO: 'MOMO',
  HUGO: 'HUGO',
  IZAD: 'IZAD',
  SAMAN: 'SAMAN',
  FLO: 'FLO',
  JEAN: 'JEAN',
  JON: 'JON',
  ALEX: 'ALEX',
  ALL: 'ALL',
  RGA: 'RGA',
};
