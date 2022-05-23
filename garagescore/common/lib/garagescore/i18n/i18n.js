const moment = require('moment-timezone');

module.exports = class i18n {
  constructor(jsonPath, { locale = 'fr', from = 'backoffice' } = {}) {
    const regExp = new RegExp('/', 'g');
    this.jsonPathTranslation = `${from}:${jsonPath.replace(regExp, ':')}`;
    const lang = locale.split(/[_-]/)[0];
    this.jsonContent = require(`../../../../frontend/translations/${lang}.json`); // eslint-disable-line global-require
    this.locale = lang;
    if (!this.jsonContent) throw new Error('JSON file not found');
  }

  capitalize(s) {
    return s
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  fixLocale() {
    if (!this.locale || typeof this.locale !== 'string' || this.locale.length < 2) {
      this.locale = 'fr'; // locale defaults to french
    }
    this.locale = this.locale.toLocaleLowerCase().substring(0, 2);
  }

  fixTimezone() {
    if (!this.timezone || typeof this.timezone !== 'string') {
      this.timezone = 'Europe/Paris'; // locale defaults to french
    }
  }

  $t(key, interpolations = {}) {
    if (!key) {
      return '';
    }

    this.fixLocale();
    // getting the value corresponding to the key, if not found returns the key
    let result =
      this.jsonContent && this.jsonContent[this.jsonPathTranslation] && this.jsonContent[this.jsonPathTranslation][key];
    if (!result) return key;
    // Making the interpolations I.E. replacing {interpolationKey} by the value of interpolations[interpolationKey]
    for (const [interpolationKey, value] of Object.entries(interpolations)) {
      if (value) result = result.replace(new RegExp(`{${interpolationKey}}`, 'g'), value);
    }
    // Returning final result with interpolations
    return result;
  }

  // WARNING : do not use $dd with Date() , the function will always return today's date
  // example : $dd(Date("2021-09-13T02:00:00Z"), 'DD MMM YYYY') => 10 Févr. 2021 (today's date)
  // example : $dd(Date("2011-09-13T02:00:00Z"), 'DD MMM YYYY') => 10 Févr. 2021 (today's date)
  // example : $dd(Date(null), 'DD MMM YYYY') => 10 Févr. 2021 (today's date)
  // use new Date()

  $dd(rawDate, format) {
    this.fixLocale();
    this.fixTimezone();

    if (!rawDate) {
      console.error('$dd: no date provided');
      return '';
    }

    const date = new Date(rawDate);
    const locale = this.locale;
    const timezone = this.timezone;

    if (!locale) {
      console.error('$dd: no locale found');
      return '';
    }

    if (!timezone) {
      console.error('$dd: no timezone found');
      return '';
    }

    let momentFormat = '';

    if (format === 'long') {
      // Example: Lundi 23 Février 1993
      momentFormat = 'dddd DD MMMM YYYY';
    }
    if (format === 'DD MMMM YYYY') {
      // Example: 23 Février 1993
      momentFormat = 'DD MMMM YYYY';
    }
    if (format === 'DD MMM YYYY') {
      // Example: 23 Fév. 1993
      momentFormat = 'DD MMM YYYY';
    }
    if (format === 'date shortTime') {
      // 23 Février 1993 à 23h42
      momentFormat = 'DD MMMM YYYY HH:mm';
    }
    if (format === 'shortTime') {
      // Example: 23h42
      momentFormat = 'HH:mm';
    }
    if (format === 'short') {
      // Example: 23/02/1993 -> KeySim's birthday
      momentFormat = 'DD/MM/YYYY';
    }

    return this.capitalize(moment(date).tz(timezone).locale(locale).format(momentFormat));
  }
};
