const gsEmail = {
  regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // eslint-disable-line no-useless-escape,max-len
  removalOfUnauthorizedCharactersRegexp: /[^a-zA-Z0-9!#$%&@'*+-/=?^_`{|}~.]/g,
};

module.exports = gsEmail;
