/** Help compute day number and decaminutes */

const oneMinute = 1000 * 60;
const tenMinutes = 1000 * 60 * 10;
const decaMinute = 1000 * 60 * 10; // alias for ten minutes
const oneHour = 1000 * 60 * 60;
const twoHours = oneHour * 2;
const oneDay = 8.64e7;

const dayNumber = (date) => Math.floor(date.getTime() / oneDay);
const decaMinuteNumber = (date) => Math.floor(date.getTime() / tenMinutes);
const hourNumber = (date) => Math.floor(date.getTime() / oneHour);
const twoHoursNumber = (date) => Math.floor(date.getTime() / twoHours);
const dayNumberToDate = (day) => new Date(day * oneDay);
const decaMinuteToDate = (deca) => new Date(deca * decaMinute);
const minuteNumberToDate = (min) => new Date(min * oneMinute);
const isDayNumberAWeekEnd = (day) => {
  const dd = dayNumberToDate(day).getUTCDay();
  return dd === 6 || dd === 0; // 6 = Saturday, 0 = Sunday
};

const firstDayOfNextMonthDayNumber = () => {
  const nextMonth = new Date();
  nextMonth.setDate(1);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return Math.floor(nextMonth.getTime() / 8.64e7);
};

const minuteNumber = (date) => Math.floor(date.getTime() / oneMinute);

module.exports = {
  oneMinute,
  tenMinutes,
  decaMinute,
  oneHour,
  twoHours,
  oneDay,
  hourNumber,
  twoHoursNumber,
  minuteNumberToDate,
  decaMinuteToDate,
  // day number of today
  todayDayNumber: () => Math.floor(Date.now() / oneDay),
  // date to day number
  dayNumber,
  // date after x days from a date
  addDaysToDate: (date, days) => new Date(date.getTime() + days * oneDay),
  // date after x days from a timestamp
  addDaysToTime: (time, days) => new Date(time + days * oneDay),
  // day number after x days from now
  daysAfterNow: (days) => dayNumber(new Date(Date.now() + days * oneDay)),
  // day number to date
  dayNumberToDate,

  firstDayOfNextMonthDayNumber,
  // date to minute number
  minuteNumber,
  addMinutesToDate: (date, min) => {
    const dateInMin = minuteNumber(date);
    return minuteNumberToDate(dateInMin + min);
  },
  // date to decaminute number
  decaMinuteNumber: (date) => Math.floor(date.getTime() / tenMinutes),
  // date after x decaminutes from a date
  addDecaMinutesToDate: (date, decaMinutes) => new Date(date.getTime() + decaMinutes * tenMinutes),
  // date after x decaminutes from a timestamp
  addDecaMinutesToTime: (time, decaMinutes) => new Date(time + decaMinutes * tenMinutes),
  // decaminute number after x decaminutes from now
  decaMinutesAfterNow: (decaMinutes) => decaMinuteNumber(new Date(Date.now() + decaMinutes * tenMinutes)),
  // hour number after x hours from now
  hourAfterNow: (hours) => hourNumber(new Date(Date.now() + hours * oneHour)),
  displayHour: (hNumber) => new Date(oneHour * hNumber),

  // check if a day number is a saturday or sunday
  isDayNumberAWeekEnd,
  getNextWeekEnd: function getNextSaturday(day) {
    while (!isDayNumberAWeekEnd(day)) {
      day++; // eslint-disable-line no-param-reassign
    }
    return day;
  },

  /**
   * Return Date passed in parameter
   */
  modifyDate: (dateToSet, hours, mins, secs, millisecs) => {
    dateToSet.setHours(hours);
    dateToSet.setMinutes(mins);
    dateToSet.setSeconds(secs);
    dateToSet.setMilliseconds(millisecs);

    return dateToSet;
  },
  /**
   * return the monday and sunday daynumber
   * of the week of a date
   */
  getStartAndEndOfTheWeekFromDayNumber: (n) => {
    const d = dayNumberToDate(n);
    // https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return { minDayNumber: dayNumber(monday), maxDayNumber: dayNumber(monday) + 6 };
  },
  /**
   * return diff between two date
   * not my work, from : http://www.finalclap.com/faq/88-javascript-difference-date
   */
  dateDiff: (date1, date2) => {
    class Diff {
      constructor(diff) {
        this.sec = diff.sec;
        this.min = diff.min;
        this.hour = diff.hour;
        this.day = diff.day;
      }
      toString() {
        return `${this.day}j ${this.hour}h ${this.min}min`;
      }
    }

    const diff = {}; // Initialisation du retour
    let tmp = date2 - date1;

    tmp = Math.floor(tmp / 1000); // Nombre de secondes entre les 2 dates
    diff.sec = tmp % 60; // Extraction du nombre de secondes

    tmp = Math.floor((tmp - diff.sec) / 60); // Nombre de minutes (partie entière)
    diff.min = tmp % 60; // Extraction du nombre de minutes

    tmp = Math.floor((tmp - diff.min) / 60); // Nombre d'heures (entières)
    diff.hour = tmp % 24; // Extraction du nombre d'heures

    tmp = Math.floor((tmp - diff.hour) / 24); // Nombre de jours restants
    diff.day = tmp;

    return new Diff(diff);
  },
  /**
   * Checks if a date is a leap year (29 february exists)
   * @param {Date} date
   * @return {Boolean}
   */
  isLeapYear: function (date) {
    const year = date.getFullYear();
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  },
  /**
   * Set hours, minutes, seconds, and milliseconds to 0
   * @param {Date} date
   * @return {Date} the updated date
   */
  setTimeToZero: function (date) {
    date.setHours(0, 0, 0, 0);
    return new Date(date);
  },
  /**
   * Add n days to a Date (remove days if n is negative)
   * @param {Date} date
   * @param {Number} days the number of days to add (can be negative)
   * @return {Date} the updated date
   */
  addDays: function (date, days = 0) {
    date.setDate(date.getDate() + days);
    return new Date(date);
  },
  /**
   * Add n months to a Date (remove months if n is negative)
   * @param {Date} date
   * @param {Number} months the number of months to add (can be negative)
   * @return {Date} the updated date
   */
  addMonths: function (date, months = 0) {
    date.setMonth(date.getMonth() + months);
    return new Date(date);
  },
};
