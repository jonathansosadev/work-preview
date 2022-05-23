const app = require('../../../../../server/server');
const { convertToTimezoneDate } = require('../../../../../frontend/utils/exports/helper');

module.exports = {
  getSheetName(i18n) {
    return i18n.$t('sheetName');
  },

  getColumns({ i18n, fields }) {
    return [
      {
        header: i18n.$t('garagePublicDisplayName'),
        key: 'garagePublicDisplayName',
        width: 50,
        resolve(data, garage) {
          return (garage && garage.publicDisplayName) || '';
        },
      },
      {
        header: i18n.$t('customerFullName'),
        key: 'customerFullName',
        width: 20,
        resolve(data) {
          return data.get('customer.fullName.value') || '';
        },
      },
      {
        header: i18n.$t('customerCity'),
        key: 'customerCity',
        width: 20,
        resolve(data) {
          return data.get('customer.city.value') || '';
        },
      },
      {
        header: i18n.$t('reviewCreatedAt'),
        key: 'reviewCreatedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          return convertToTimezoneDate(data.get('service.createdAt'), rawGarage.timezone);
        },
      },
      {
        header: i18n.$t('reviewCommentText'),
        key: 'reviewCommentText',
        width: 50,
        resolve(data) {
          return data.get('review.comment.text') || '';
        },
      },
      {
        header: i18n.$t('reviewRating'),
        key: 'reviewRating',
        width: 20,
        style: { numFmt: '#####0' },
        resolve(data) {
          let rating = data.get('review.rating.value') === null ? '' : data.get('review.rating.value') / 2;
          if (rating === 21 || rating === -21) {
            rating = rating === -21 ? i18n.$t('dontRecommend') : i18n.$t('recommend');
          }
          return rating;
        },
      },
      {
        header: i18n.$t('reviewReplyText'),
        key: 'reviewReplyText',
        width: 20,
        resolve(data) {
          return data.get('review.reply.text') || '';
        },
      },
      {
        header: i18n.$t('reviewReplyApprovedAt'),
        key: 'reviewReplyApprovedAt',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(data, rawGarage) {
          return convertToTimezoneDate(data.get('service.approvedAt'), rawGarage.timezone);
        },
      },
      {
        header: i18n.$t('sourceType'),
        key: 'sourceType',
        width: 20,
        resolve(data) {
          return data.get('source.type') || '';
        },
      },
    ];
  },

  async getRow({ i18n, fields, data: rawData, garage: rawGarage }) {
    const data = new app.models.Data(rawData);
    const row = {};

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = col.resolve(data, rawGarage);
      })
    );

    return row;
  },
};
