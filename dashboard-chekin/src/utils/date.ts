import {format as formatGivenDate, parseISO} from 'date-fns';
import moment, {Moment} from 'moment';
import {DatepickerDate} from './types';

function formatDate(date: string, format = 'dd MMM yyyy') {
  const pureDate = date.slice(0, -1);
  return formatGivenDate(parseISO(pureDate), format);
}

function getTimezoneDate(date: Moment | Date | string, timezone: string) {
  if (!date) {
    console.error('Timezone date is missing.');
    return moment();
  }

  const formattedDate = moment.tz(date, 'UTC').format('YYYY-MM-DDTHH:mm');
  return moment.tz(formattedDate, timezone);
}

function preloadDefaultDate(date?: DatepickerDate | Moment) {
  if (date) {
    return moment(date);
  }
  return null;
}

export {formatDate, getTimezoneDate, preloadDefaultDate};
