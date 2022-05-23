const { MOMO, log } = require('../../../../common/lib/util/log');
const colors = require('colors/safe');
const { isUnitTest } = require('../../../../common/lib/util/process-env');

colors.setTheme({
  basic: 'white',
  debug: 'blue',
  info: 'cyan',
  success: 'green',
  warn: 'yellow',
  error: 'red',
});

module.exports = new Proxy(
  {},
  {
    get(_, key) {
      return (...[message, ...args]) => {
        if (key === 'error') {
          return log.error(MOMO, message, ...args);
        }
        // log only errors in unit tests
        if (isUnitTest()) {
          return;
        }
        const colorToUse = colors[key] || colors['basic'];
        return console.log(colorToUse(message), ...args);
      };
    },
  }
);
