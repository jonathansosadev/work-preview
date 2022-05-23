import {format as formatGivenDate, parseISO} from 'date-fns';

function formatDate(date: string, format = 'dd MMM yyyy') {
  const pureDate = date.slice(0, -1);
  return formatGivenDate(parseISO(pureDate), format);
}

const DATE_FORMAT = 'YYYY-MM-DD';

export {formatDate, DATE_FORMAT};
