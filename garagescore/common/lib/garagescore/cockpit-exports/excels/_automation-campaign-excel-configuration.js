const { AutomationCampaignsEventsType } = require('../../../../../frontend/utils/enumV2');

module.exports = {
  getSheetName(i18n) {
    return i18n.$t('sheetName');
  },

  getColumns({ i18n, fields }) {
    return [
      {
        header: i18n.$t('BA_CAMPAIGN__NAME'),
        key: 'BA_CAMPAIGN__NAME',
        width: 40,
        resolve(customer, garage, campaign) {
          let tag = i18n.$t('apv');
          if (/NVS/.test(campaign.target)) {
            tag = i18n.$t('vn');
          }
          if (/UVS/.test(campaign.target)) {
            tag = i18n.$t('vo');
          }
          return (campaign && `${i18n.$t(campaign.target)} - ${tag}`) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__DATE_LAST_STATUS'),
        key: 'BA_COM__DATE_LAST_STATUS',
        width: 15,
        style: { numFmt: 'dd/mm/yyyy' },
        hidden: true,
        resolve(customer, garage, campaign) {
          return (campaign && new Date(campaign.time)) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__LAST_STATUS'),
        key: 'BA_COM__LAST_STATUS',
        width: 15,
        hidden: true,
        resolve(customer, garage, campaign) {
          return (campaign && i18n.$t(campaign.type)) || '';
        },
      },
      {
        header: i18n.$t('BA_CAMPAIGN__TYPE'),
        key: 'BA_CAMPAIGN__TYPE',
        width: 10,
        resolve(customer, garage, campaign) {
          return (campaign && i18n.$t(campaign.contactType)) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__PUBLIC_DISPLAY_NAME'),
        key: 'BA_COM__PUBLIC_DISPLAY_NAME',
        width: 30,
        resolve(customer, garage, campaign) {
          return (garage && garage.publicDisplayName) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__GENDER'),
        key: 'BA_COM__GENDER',
        width: 10,
        resolve(customer, garage, campaign) {
          return (customer && i18n.$t(customer.gender)) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__FULLNAME'),
        key: 'BA_COM__FULLNAME',
        width: 30,
        resolve(customer, garage, campaign) {
          return (customer && customer.fullName) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__EMAIL'),
        key: 'BA_COM__EMAIL',
        width: 30,
        resolve(customer, garage, campaign) {
          return (customer && customer.email) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__PHONE'),
        key: 'BA_COM__PHONE',
        width: 20,
        resolve(customer, garage, campaign) {
          return (customer && customer.phone) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__CITY'),
        key: 'BA_COM__CITY',
        width: 30,
        resolve(customer, garage, campaign) {
          return (customer && customer.city) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__VEHICLE_PLATE'),
        key: 'BA_COM__VEHICLE_PLATE',
        width: 25,
        resolve(customer, garage, campaign) {
          return (customer && customer.plate) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__DATE_EVENT_CANNOT_CONTACT'),
        key: 'BA_COM__DATE_EVENT_CANNOT_CONTACT',
        width: 15,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(customer, garage, campaign) {
          return (campaign && campaign.status.PRESSURE_BLOCKED && campaign.campaignRunDay) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__IS_DATE_CURRENT_PERIOD_CANNOT_CONTACT'),
        key: 'BA_COM__IS_DATE_CURRENT_PERIOD_CANNOT_CONTACT',
        width: 10,
        resolve(customer, garage, campaign) {
          return (campaign && campaign.status.PRESSURE_BLOCKED && campaign.isCurrentPeriodNotSend) || '' ? 1 : 0;
        },
      },
      {
        header: i18n.$t('BA_COM__DATE_EVENT_RECEIVED'),
        key: 'BA_COM__DATE_EVENT_RECEIVED',
        width: 15,
        resolve(customer, garage, campaign) {
          const isSent = campaign.type === AutomationCampaignsEventsType.SENT;
          return (campaign && (campaign.status.RECEIVED || isSent) && campaign.campaignRunDay) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__IS_DATE_CURRENT_PERIOD_RECEIVED'),
        key: 'BA_COM__IS_DATE_CURRENT_PERIOD_RECEIVED',
        width: 10,
        resolve(customer, garage, campaign) {
          const isSent = campaign.type === AutomationCampaignsEventsType.SENT;
          return campaign && (campaign.status.RECEIVED || isSent) && campaign.isCurrentPeriodReceived ? 1 : 0;
        },
      },
      {
        header: i18n.$t('BA_COM__DATE_EVENT_OPENED'),
        key: 'BA_COM__DATE_EVENT_OPENED',
        width: 15,
        resolve(customer, garage, campaign) {
          return (campaign && campaign.status.OPENED && campaign.campaignRunDay) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__IS_DATE_CURRENT_PERIOD_OPENED'),
        key: 'BA_COM__IS_DATE_CURRENT_PERIOD_OPENED',
        width: 10,
        resolve(customer, garage, campaign) {
          return campaign && campaign.status.OPENED && campaign.isCurrentPeriodOpened ? 1 : 0;
        },
      },
      {
        header: i18n.$t('BA_COM__DATE_EVENT_LEAD'),
        key: 'BA_COM__DATE_EVENT_LEAD',
        width: 15,
        resolve(customer, garage, campaign) {
          const eventDay = campaign.eventDayLead || campaign.eventDay;
          return (campaign && campaign.status.LEAD && eventDay) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__IS_DATE_CURRENT_PERIOD_LEAD'),
        key: 'BA_COM__IS_DATE_CURRENT_PERIOD_LEAD',
        width: 10,
        resolve(customer, garage, campaign) {
          return campaign && campaign.status.LEAD && campaign.isCurrentPeriodLead ? 1 : 0;
        },
      },
      {
        header: i18n.$t('BA_COM__DATE_EVENT_CONVERTED'),
        key: 'BA_COM__DATE_EVENT_CONVERTED',
        width: 15,
        resolve(customer, garage, campaign) {
          return (campaign && campaign.status.CONVERTED && campaign.eventDay) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__IS_DATE_CURRENT_PERIOD_CONVERTED'),
        key: 'BA_COM__IS_DATE_CURRENT_PERIOD_CONVERTED',
        width: 10,
        resolve(customer, garage, campaign) {
          return campaign && campaign.status.CONVERTED && campaign.isCurrentPeriodConverted ? 1 : 0;
        },
      },
    ].filter((column) => !fields || !fields.length || fields.includes(column.key));
  },

  async getRow({ i18n, fields, customer, garage, campaign }) {
    const row = {};

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = col.resolve(customer, garage, campaign);
      })
    );

    return row;
  },
};
