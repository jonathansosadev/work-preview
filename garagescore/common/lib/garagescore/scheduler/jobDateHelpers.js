const moment = require('moment-timezone');
const Holidays = require('date-holidays');

const MIN_WORKING_HOUR = 9;
const MAX_WORKING_HOUR = 18;

const MIN_SMS_HOUR = { hour: 8, minute: 0 };
const MAX_SMS_HOUR = { hour: 20, minute: 30 };

const WEEK_LENGTH = 7;
const MAX_DISTANCE = 1000 * 60 * 60 * 24 * 30; // 30 days is the MAX distance to plan the job when using planJobAfterXHoursOfOpeningHours

const fallBackWeek = [
  { open: { day: 1, time: '0730' }, close: { day: 1, time: '1200' } },
  { open: { day: 1, time: '1330' }, close: { day: 1, time: '1900' } },
  { open: { day: 2, time: '0730' }, close: { day: 2, time: '1200' } },
  { open: { day: 2, time: '1330' }, close: { day: 2, time: '1900' } },
  { open: { day: 3, time: '0730' }, close: { day: 3, time: '1200' } },
  { open: { day: 3, time: '1330' }, close: { day: 3, time: '1900' } },
  { open: { day: 4, time: '0730' }, close: { day: 4, time: '1200' } },
  { open: { day: 4, time: '1330' }, close: { day: 4, time: '1900' } },
  { open: { day: 5, time: '0730' }, close: { day: 5, time: '1200' } },
  { open: { day: 5, time: '1330' }, close: { day: 5, time: '1900' } },
  { open: { day: 6, time: '0730' }, close: { day: 6, time: '1200' } },
];

/** ------------------------------------------------- NEW OPENING HOURS HANDLE ------------------------------------------------- */

/**
 * Compute week period dates from jobDate
 * @param  {Date} from
 * @param  {{day:Number, time:String}} period
 * @param  {String} timezone
 * @return {Date}
 */
const ___googlePeriodToDate = (from, { day, time }) => {
  const date = moment(from.getTime()).toDate();
  date.setDate(date.getDate() + (day - date.getDay())); // get diff from today date
  date.setHours(time.slice(0, 2), time.slice(2, 4)); // set opening hour from google format "0730" (7h30)
  return date;
};

/**
 * Create a work week object based on the jobDate and the openingHours
 * @param  {Date} date
 * @param  {Object} openingHours
 * @param  {String} timezone
 * @param  {Number} minimumScheduledHour=0
 * @return {Object}
 */
const __initWorkingWeek = (date, openingHours, timezone, minimumScheduledHour = 0) => {
  // { open: "0730", close: "1900" } to date : { open: new Date(...), ... }
  const week = [];
  for (const period of openingHours) {
    let open = ___googlePeriodToDate(date, period.open, timezone);
    const getHoursNoOffset = open.getHours();
    if (minimumScheduledHour && getHoursNoOffset < minimumScheduledHour) {
      open.setHours(minimumScheduledHour);
      open.setMinutes(0);
    }
    const close = ___googlePeriodToDate(date, period.close, timezone);
    week.push({ open, close });
  }
  return week;
};

/** ---------------------------------------------------------------------------------------------------------------------------- */

/*
BEGINNING OF CONSTRAINTS PROCESSING FUNCTIONS
Each modify function processing a constraint returns either true if the original date has been modified or false if it hasn't.
 */

/**
 * Try to force the date to an exact day
 * @param  {Date} jobDate
 * @param  {Number} setDay - day of the month
 * @return {Boolean}
 */
const _modifyWithSetDay = (jobDate, setDay) => {
  if (typeof setDay === 'number' && jobDate.date() !== setDay) {
    if (setDay < jobDate.date()) {
      jobDate.add(1, 'months');
    }
    // If date = 31 and month only have 30, we set then compare (moment put the last day of month if overflow)
    jobDate.date(setDay);
    jobDate.hour(0);
    jobDate.minute(0);
    while (jobDate.date() !== setDay) {
      jobDate.add(1, 'months');
      jobDate.date(setDay);
      jobDate.hour(0);
      jobDate.minute(0);
    }
    return true;
  }
  return false;
};

/**
 * Try to force the date to an exact hour
 * @param  {Date} jobDate
 * @param  {Number} setHour
 * @return {Boolean}
 */
const _modifyWithSetHour = (jobDate, setHour) => {
  if (typeof setHour === 'number' && jobDate.hour() !== setHour) {
    if (setHour < jobDate.hour()) {
      jobDate.add(1, 'days');
    }
    jobDate.hour(setHour);
    return true;
  }
  return false;
};

/**
 * Try to force the date to an exact minute
 * @param  {Date} jobDate
 * @param  {Number} setMin
 * @return {Boolean}
 */
const _modifyWithSetMinute = (jobDate, setMin) => {
  if (typeof setMin === 'number' && jobDate.minute() !== setMin) {
    if (setMin < jobDate.minute()) {
      jobDate.add(1, 'hours');
    }
    jobDate.minute(setMin);
    return true;
  }
  return false;
};

/**
 * TODO: refactor with __initWorkingWeek and _modifyWithOpeningHours
 * Working hours from MIN_WORKING_HOUR to MAX_WORKING_HOUR
 * @param  {Date} jobDate
 * @param  {Object} workingHours
 * @return {Boolean}
 */
const _modifyWithWorkingHours = (jobDate, workingHours) => {
  if (!workingHours) {
    // No need to do anything here, option isn't toggled
    return false;
  }
  if (jobDate.hour() < MIN_WORKING_HOUR) {
    jobDate.hour(MIN_WORKING_HOUR);
    jobDate.minute(0);
    return true;
  }
  if (jobDate.hour() >= MAX_WORKING_HOUR) {
    jobDate.hour(MIN_WORKING_HOUR);
    jobDate.minute(0);
    jobDate.day(jobDate.day() + 1);
    return true;
  }
  return false;
};

const _modifyWithSmsHours = (jobDate, smsHours) => {
  if (!smsHours) {
    // No need to do anything here, option isn't toggled
    return false;
  }
  if (
    jobDate.hour() < MIN_SMS_HOUR.hour ||
    (jobDate.hour() === MIN_SMS_HOUR.hour && jobDate.minute() < MIN_SMS_HOUR.minute)
  ) {
    jobDate.hour(MIN_SMS_HOUR.hour);
    jobDate.minute(MIN_SMS_HOUR.minute);
    return true;
  }
  if (
    jobDate.hour() > MAX_SMS_HOUR.hour ||
    (jobDate.hour() === MAX_SMS_HOUR.hour && jobDate.minute() >= MAX_SMS_HOUR.minute)
  ) {
    jobDate.hour(MIN_SMS_HOUR.hour);
    jobDate.minute(MIN_SMS_HOUR.minute);
    jobDate.day(jobDate.day() + 1);
    return true;
  }
  return false;
};

/**
 * Try to set the date to an opening hour of the working day in the week
 * @param  {{momentDate: Date}} params
 * @param  {Date} unmodifiedJobDate
 * @param  {{hours:Number,googleOpeningHours:Object,timezone:String,minimumScheduledHour:Number}} constraints
 * @return {Boolean}
 */
const _modifyWithOpeningHours = (params, unmodifiedJobDate, planJobAfterXHoursOfOpeningHours) => {
  if (!planJobAfterXHoursOfOpeningHours) return;
  const { hours, googleOpeningHours, timezone, minimumScheduledHour } = planJobAfterXHoursOfOpeningHours;
  // console.log('Total min start at: ', currentMin);
  const jobDate = params.momentDate.toDate(); // This will return a copy of the Date that the moment uses
  const newDate = new Date(unmodifiedJobDate.getTime() + (hours || 0) * 60 * 60 * 1000);
  const week = __initWorkingWeek(
    unmodifiedJobDate,
    googleOpeningHours || fallBackWeek,
    timezone || 'Europe/Paris',
    minimumScheduledHour
  );
  const newDateInPeriod = (period) => {
    const b = newDate.getTime() >= period.open.getTime() && newDate.getTime() <= period.close.getTime();
    return b;
  };
  while (!week.find(newDateInPeriod)) {
    // till we are not in opening hours, we are going to add 1min
    newDate.setMinutes(newDate.getMinutes() + 1); // move forward in date
    if (!week.find((p) => p.close.getTime() > newDate.getTime())) {
      // Is week in the pass? Yes, move the week forward then (add 7 days to all periods)
      for (const period of week) {
        // eslint-disable-line no-restricted-syntax
        period.open.setDate(period.open.getDate() + WEEK_LENGTH);
        period.close.setDate(period.close.getDate() + WEEK_LENGTH);
      }
    }
    if (newDate > unmodifiedJobDate + MAX_DISTANCE)
      throw new Error('30 days later... still not found, abort mission...');
  }
  if (newDate > jobDate) {
    // JobDate is anterior to the newDate, we set it to the new date
    jobDate.setTime(newDate.getTime());
    params.momentDate = moment(jobDate); // eslint-disable-line
    return true;
  }
  return false; // JobDate is already good
};

/**
 * Disable sending through the week-end
 * @param  {Date} jobDate
 * @param  {Boolean} noWeekEnd
 * @param  {Boolean} saturdayOk
 * @param  {Boolean}
 */
const _modifyWithNoWeekEnd = (jobDate, noWeekEnd, saturdayOk) => {
  if (!noWeekEnd) {
    // No need to do anything here, option isn't toggled
    return false;
  }
  let saturdayDay = 6;
  if (saturdayOk) {
    saturdayDay = 0;
  }
  let hasBeenModified = false;
  while (jobDate.day() === 0 || jobDate.day() === saturdayDay) {
    jobDate.day(jobDate.day() + 1);
    jobDate.hour(0);
    jobDate.minute(0);
    hasBeenModified = true;
  }
  return hasBeenModified;
};

const _modifyWithPublicHoliday = (jobDate, noPublicHolyday, noSunday = true, locale = 'fr_FR') => {
  if (!noPublicHolyday) {
    // No need to do anything here, option isn't toggled
    return false;
  }

  let holidayLocale = 'fr_FR';
  if (locale && typeof locale === 'string') holidayLocale = locale.split('_')[1];

  const hd = new Holidays(holidayLocale);
  let hasBeenModified = false;
  let dateToTest = jobDate.clone();

  const _isPublicHoliday = (date) => {
    const isHoliday = hd.isHoliday(date);
    if (isHoliday && isHoliday[0] && isHoliday[0].type === 'public') {
      hasBeenModified = true;
      return true;
    }
    //If we are sunday
    if (noSunday && date.day() === 0) {
      hasBeenModified = true;
      return true;
    }
    return false;
  };

  let iteration = 0;
  //Prevent infiny loop : if we make 10 iterations we leave the loop
  while (_isPublicHoliday(dateToTest) && iteration < 10) {
    iteration++;
    dateToTest.add(1, 'days');
  }
  if (hasBeenModified) {
    jobDate.set(dateToTest.toObject());
  }
  return hasBeenModified;
};

/**
 * check constraints and throw error if there is a visible problem
 * @param  {Object} constraints
 * @return {Void}
 */
const checkJobDateConstraints = (constraints) => {
  const error = 'Error in constraints : ';
  if (!constraints) {
    return;
  }
  if (constraints.setMin < 0 || constraints.setMin > 59) {
    throw new Error(`${error}setMin invalid value (${constraints.setMin})`);
  }
  if (constraints.setHour < 0 || constraints.setHour > 23) {
    throw new Error(`${error}setHour invalid value (${constraints.setHour})`);
  }
  if (constraints.workingHours && (constraints.setHour < MIN_WORKING_HOUR || constraints.setHour >= MAX_WORKING_HOUR)) {
    throw new Error(
      `${error}setHour invalid value (within working hours ${MIN_WORKING_HOUR}->${MAX_WORKING_HOUR}) (${constraints.setHour})`
    );
  }
  if (constraints.setDay < 1 || constraints.setDay > 31) {
    throw new Error(`${error}setDay invalid value (${constraints.setDay})`);
  }
  if (constraints.utc < -15 || constraints.utc > 15) {
    throw new Error(`${error}utc invalid value (${constraints.utc})`);
  }
};

/**
 * Postpone the date to fit the constraints given
 * @param  {Date} jobDate
 * @param  {Object} constraints
 * @return {Date}
 */
const getJobDateFromConstraints = (jobDate, constraints) => {
  const params = { momentDate: moment(jobDate) };
  if (constraints.utc) {
    params.momentDate.utcOffset(constraints.utc);
  }
  const startingDate = params.momentDate.toDate(); // Starting at date for _modifyWithOpeningHours
  // Each time we try to get a date that fits the constraints, we increment this value. When it reaches a certain threshold,
  // we throw an error to avoid any infinite loop provoked by a precise invalid mix in date and constraints
  let amountOfTimesDateHasBeenModified = 0;
  while (
    _modifyWithSetDay(params.momentDate, constraints.setDay) ||
    _modifyWithNoWeekEnd(params.momentDate, constraints.noWeekEnd, constraints.saturdayOk) ||
    _modifyWithPublicHoliday(
      params.momentDate,
      constraints.noPublicHolyday,
      constraints.noSunday,
      constraints.locale
    ) ||
    _modifyWithWorkingHours(params.momentDate, constraints.workingHours) || // try to find a slot IN default working hours
    _modifyWithSmsHours(params.momentDate, constraints.smsHours) ||
    // Decrement delta only in working hours till planJobAfterXHoursOfOpeningHours.hours is 0
    _modifyWithOpeningHours(params, startingDate, constraints.planJobAfterXHoursOfOpeningHours) ||
    _modifyWithSetHour(params.momentDate, constraints.setHour) ||
    _modifyWithSetMinute(params.momentDate, constraints.setMin)
  ) {
    amountOfTimesDateHasBeenModified++;
    if (amountOfTimesDateHasBeenModified === 1000) {
      const errorMsg = `Error while trying to get a date with given constraints : too many iterations. ${JSON.stringify(
        constraints
      )}, ${params.momentDate}`;
      throw new Error(errorMsg);
    }
  }
  return params.momentDate.toDate();
};

module.exports = {
  MIN_WORKING_HOUR,
  MAX_WORKING_HOUR,
  _modifyWithSetDay,
  getJobDateFromConstraints,
  checkJobDateConstraints,
};
