module.exports = {
  decodeArguments(args) {
    Object.keys(args).forEach((arg) => {
      let value = args[arg];
      if (typeof value === 'string') {
        value = decodeURIComponent(value);
      }
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            if (typeof value[i] !== 'object') {
              value[i] = decodeURIComponent(value[i]);
            }
          }
        } else if (!(value instanceof Date && !isNaN(value.valueOf()))) {
          value = JSON.parse(decodeURIComponent(value));
        }
      }
      args[arg] = value; // eslint-disable-line no-param-reassign
    });
    return args;
  },
};
