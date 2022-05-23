/** determine the s3 path of the campaign to import for a given day*/

const moment = require('moment');
const { log, TIBO } = require('../../../util/log');

module.exports = function (garage, date, dataType) {
  const fileSuffix = garage.getUploadedFileSuffix(dataType);
  const year = moment(date).format('YYYY');
  const month = moment(date).format('MM');
  const day = moment(date).format('DD');
  const enFormattedDate = moment(date).format('YYYY_MM_DD');

  if (!fileSuffix) {
    log.error(TIBO, `[PathFunction] :: ERROR :: Cannot Create Path For Garage ${garage.id}, Please Check fileSuffix`);
    return null;
  }

  return `${year}/${month}/${day}/${garage.id}/${enFormattedDate}-${garage.id}-${dataType}.${fileSuffix}`;
  // Keeping the old path in comment for legacy purpose
  /*  return [
    uploadFolder,
    'gid-' + garage.id,
    year,
    month,
    formattedDate + '-' + dataType + '-' + garage.slug + '.' + fileSuffix,
  ].join(s);*/
};
