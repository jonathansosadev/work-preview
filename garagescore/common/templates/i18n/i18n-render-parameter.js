/** return the i18n variable needed by the nunjucks renderer */

const fr = require('../../../frontend/translations/fr.json');
const es = require('../../../frontend/translations/es.json');
const ca = require('../../../frontend/translations/ca.json');
const en = require('../../../frontend/translations/en.json');
const nl = require('../../../frontend/translations/nl.json');
const pt = require('../../../frontend/translations/pt.json');

const i18n = {
  fr,
  es,
  ca,
  en,
  nl,
  pt,
};

module.exports = JSON.stringify(i18n);
