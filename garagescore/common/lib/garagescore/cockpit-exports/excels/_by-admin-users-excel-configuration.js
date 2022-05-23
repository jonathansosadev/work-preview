const { GaragesAlerts, GaragesReportConfigs } = require('../../../../../frontend/utils/enumV2');
const { getDeepFieldValue: deep } = require('../../../util/object');

module.exports = {
  getSheetName(i18n) {
    return i18n.$t('SheetName');
  },

  getColumns({ i18n, fields }) {
    return [
      //----------------------------------------------------
      //----------------------COMMON------------------------
      //----------------------------------------------------
      {
        header: i18n.$t('BAU_COM__GENDER'),
        key: 'BAU_COM__GENDER',
        width: 10,
        resolve({ user }) {
          return user.civility || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__FULLNAME'),
        key: 'BAU_COM__FULLNAME',
        width: 30,
        resolve({ user }) {
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';

          return `${firstName} ${lastName}`.trim();
        },
      },
      {
        header: i18n.$t('BAU_COM__FIRSTNAME'),
        key: 'BAU_COM__FIRSTNAME',
        width: 20,
        resolve({ user }) {
          return user.firstName || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__LASTNAME'),
        key: 'BAU_COM__LASTNAME',
        width: 20,
        resolve({ user }) {
          return user.lastName || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__EMAIL'),
        key: 'BAU_COM__EMAIL',
        width: 20,
        resolve({ user }) {
          return user.email || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__PHONE'),
        key: 'BAU_COM__PHONE',
        width: 20,
        resolve({ user }) {
          return user.phone || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__MOBILE'),
        key: 'BAU_COM__MOBILE',
        width: 20,
        resolve({ user }) {
          return user.mobilePhone || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__JOB'),
        key: 'BAU_COM__JOB',
        width: 20,
        resolve({ user }) {
          return user.job || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__ROLE'),
        key: 'BAU_COM__ROLE',
        width: 20,
        resolve({ user }) {
          return user.role || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__GARAGES_COUNT'),
        key: 'BAU_COM__GARAGES_COUNT',
        width: 20,
        resolve({ garages }) {
          if (!garages || !Array.isArray(garages) || !garages.length) {
            return 0;
          }
          return garages.length;
        },
      },
      {
        header: i18n.$t('BAU_COM__GARAGES'),
        key: 'BAU_COM__GARAGES',
        width: 50,
        resolve({ garages }) {
          if (!garages || !Array.isArray(garages) || !garages.length) {
            return '';
          }
          return garages.map((garage) => garage.publicDisplayName || '').join(' |');
        },
      },
      {
        header: i18n.$t('BAU_COM__BUSINESS_NAME'),
        key: 'BAU_COM__BUSINESS_NAME',
        width: 20,
        resolve({ user }) {
          return user.businessName || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__ADDRESS'),
        key: 'BAU_COM__ADDRESS',
        width: 20,
        resolve({ user }) {
          return user.address || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__POSTCODE'),
        key: 'BAU_COM__POSTCODE',
        width: 20,
        resolve({ user }) {
          return user.postCode || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__CITY'),
        key: 'BAU_COM__CITY',
        width: 20,
        resolve({ user }) {
          return user.city || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__ADDRESS2'),
        key: 'BAU_COM__ADDRESS2',
        width: 20,
        resolve({ user }) {
          return user.address2 || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__LAST_COCKPIT_OPEN_AT'),
        key: 'BAU_COM__LAST_COCKPIT_OPEN_AT',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ user }) {
          return user.lastCockpitOpenAt || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__CREATED_AT'),
        key: 'BAU_COM__CREATED_AT',
        width: 20,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve({ user }) {
          return user.createdAt || '';
        },
      },
      {
        header: i18n.$t('BAU_COM__ACCESS_HOME'),
        key: 'BAU_COM__ACCESS_HOME',
        width: 20,
        resolve({ user }) {
          return deep(user, 'authorization.ACCESS_TO_WELCOME') ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ACCESS_SATISFACTION'),
        key: 'BAU_COM__ACCESS_SATISFACTION',
        width: 20,
        resolve({ user }) {
          return deep(user, 'authorization.ACCESS_TO_SATISFACTION') ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ACCESS_LEADS'),
        key: 'BAU_COM__ACCESS_LEADS',
        width: 20,
        resolve({ user }) {
          return deep(user, 'authorization.ACCESS_TO_LEADS') ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ACCESS_AUTOMATION'),
        key: 'BAU_COM__ACCESS_AUTOMATION',
        width: 20,
        resolve({ user }) {
          return deep(user, 'authorization.ACCESS_TO_AUTOMATION') ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ACCESS_CONTACTS'),
        key: 'BAU_COM__ACCESS_CONTACTS',
        width: 20,
        resolve({ user }) {
          return deep(user, 'authorization.ACCESS_TO_CONTACTS') ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ACCESS_EREPUTATION'),
        key: 'BAU_COM__ACCESS_EREPUTATION',
        width: 20,
        resolve({ user }) {
          return deep(user, 'authorization.ACCESS_TO_E_REPUTATION') ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ACCESS_ESTABLISHMENT'),
        key: 'BAU_COM__ACCESS_ESTABLISHMENT',
        width: 20,
        resolve({ user }) {
          return deep(user, 'authorization.ACCESS_TO_ESTABLISHMENT') ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ACCESS_TEAM'),
        key: 'BAU_COM__ACCESS_TEAM',
        width: 20,
        resolve({ user }) {
          return deep(user, 'authorization.ACCESS_TO_TEAM') ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ACCESS_ADMIN'),
        key: 'BAU_COM__ACCESS_ADMIN',
        width: 20,
        resolve({ user }) {
          return deep(user, 'authorization.ACCESS_TO_ADMIN') ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_UNSATISFIED_VI'),
        key: 'BAU_COM__ALERTS_UNSATISFIED_VI',
        width: 20,
        resolve({ user }) {
          return deep(user, `allGaragesAlerts.${GaragesAlerts.UNSATISFIED_VI}`) ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_UNSATISFIED_MAINTENANCE'),
        key: 'BAU_COM__ALERTS_UNSATISFIED_MAINTENANCE',
        width: 20,
        resolve({ user }) {
          return deep(user, `allGaragesAlerts.${GaragesAlerts.UNSATISFIED_MAINTENANCE}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_UNSATISFIED_VN'),
        key: 'BAU_COM__ALERTS_UNSATISFIED_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `allGaragesAlerts.${GaragesAlerts.UNSATISFIED_VN}`) ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_UNSATISFIED_VO'),
        key: 'BAU_COM__ALERTS_UNSATISFIED_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `allGaragesAlerts.${GaragesAlerts.UNSATISFIED_VO}`) ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_LEAD_APV'),
        key: 'BAU_COM__ALERTS_LEAD_APV',
        width: 20,
        resolve({ user }) {
          return deep(user, `allGaragesAlerts.${GaragesAlerts.LEAD_APV}`) ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_LEAD_VN'),
        key: 'BAU_COM__ALERTS_LEAD_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `allGaragesAlerts.${GaragesAlerts.LEAD_VN}`) ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_LEAD_VO'),
        key: 'BAU_COM__ALERTS_LEAD_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `allGaragesAlerts.${GaragesAlerts.LEAD_VO}`) ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_EREPUTATION'),
        key: 'BAU_COM__ALERTS_EREPUTATION',
        width: 20,
        resolve({ user }) {
          return deep(user, `allGaragesAlerts.${GaragesAlerts.EREPUTATION}`) ? i18n.$t('Yes') : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_DAILY_UNSATISFIED_VI'),
        key: 'BAU_COM__ALERTS_DAILY_UNSATISFIED_VI',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.daily.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VI}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_DAILY_UNSATISFIED_MAINTENANCE'),
        key: 'BAU_COM__ALERTS_DAILY_UNSATISFIED_MAINTENANCE',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.daily.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_MAINTENANCE}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_DAILY_UNSATISFIED_VN'),
        key: 'BAU_COM__ALERTS_DAILY_UNSATISFIED_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.daily.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VN}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_DAILY_UNSATISFIED_VO'),
        key: 'BAU_COM__ALERTS_DAILY_UNSATISFIED_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.daily.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VO}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_DAILY_LEAD_VN'),
        key: 'BAU_COM__ALERTS_DAILY_LEAD_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.daily.${GaragesReportConfigs.REPORT_CONFIGS_LEAD_VN}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_DAILY_LEAD_VO'),
        key: 'BAU_COM__ALERTS_DAILY_LEAD_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.daily.${GaragesReportConfigs.REPORT_CONFIGS_LEAD_VO}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_WEEKLY_UNSATISFIED_VI'),
        key: 'BAU_COM__ALERTS_WEEKLY_UNSATISFIED_VI',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.weekly.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VI}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_WEEKLY_UNSATISFIED_MAINTENANCE'),
        key: 'BAU_COM__ALERTS_WEEKLY_UNSATISFIED_MAINTENANCE',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.weekly.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_MAINTENANCE}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_WEEKLY_UNSATISFIED_VN'),
        key: 'BAU_COM__ALERTS_WEEKLY_UNSATISFIED_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.weekly.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VN}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_WEEKLY_UNSATISFIED_VO'),
        key: 'BAU_COM__ALERTS_WEEKLY_UNSATISFIED_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.weekly.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VO}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_WEEKLY_LEAD_VN'),
        key: 'BAU_COM__ALERTS_WEEKLY_LEAD_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.weekly.${GaragesReportConfigs.REPORT_CONFIGS_LEAD_VN}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_WEEKLY_LEAD_VO'),
        key: 'BAU_COM__ALERTS_WEEKLY_LEAD_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.weekly.${GaragesReportConfigs.REPORT_CONFIGS_LEAD_VO}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_UNSATISFIED_VI'),
        key: 'BAU_COM__ALERTS_MONTHLY_UNSATISFIED_VI',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthly.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VI}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_UNSATISFIED_MAINTENANCE'),
        key: 'BAU_COM__ALERTS_MONTHLY_UNSATISFIED_MAINTENANCE',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthly.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_MAINTENANCE}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_UNSATISFIED_VN'),
        key: 'BAU_COM__ALERTS_MONTHLY_UNSATISFIED_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthly.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VN}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_UNSATISFIED_VO'),
        key: 'BAU_COM__ALERTS_MONTHLY_UNSATISFIED_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthly.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VO}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_LEAD_VN'),
        key: 'BAU_COM__ALERTS_MONTHLY_LEAD_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthly.${GaragesReportConfigs.REPORT_CONFIGS_LEAD_VN}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_LEAD_VO'),
        key: 'BAU_COM__ALERTS_MONTHLY_LEAD_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthly.${GaragesReportConfigs.REPORT_CONFIGS_LEAD_VO}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_VI'),
        key: 'BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_VI',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthlySummary.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VI}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_MAINTENANCE'),
        key: 'BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_MAINTENANCE',
        width: 20,
        resolve({ user }) {
          return deep(
            user,
            `reportConfigs.monthlySummary.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_MAINTENANCE}`
          )
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_VN'),
        key: 'BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthlySummary.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VN}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_VO'),
        key: 'BAU_COM__ALERTS_MONTHLY_SUMMARY_UNSATISFIED_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthlySummary.${GaragesReportConfigs.REPORT_CONFIGS_UNSATISFIED_VO}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_SUMMARY_LEAD_VN'),
        key: 'BAU_COM__ALERTS_MONTHLY_SUMMARY_LEAD_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthlySummary.${GaragesReportConfigs.REPORT_CONFIGS_LEAD_VN}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_SUMMARY_LEAD_VO'),
        key: 'BAU_COM__ALERTS_MONTHLY_SUMMARY_LEAD_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthlySummary.${GaragesReportConfigs.REPORT_CONFIGS_LEAD_VO}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_SUMMARY_CONTACTS_APV'),
        key: 'BAU_COM__ALERTS_MONTHLY_SUMMARY_CONTACTS_APV',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthlySummary.${GaragesReportConfigs.REPORT_CONFIGS_CONTACTS_APV}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_SUMMARY_CONTACTS_VN'),
        key: 'BAU_COM__ALERTS_MONTHLY_SUMMARY_CONTACTS_VN',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthlySummary.${GaragesReportConfigs.REPORT_CONFIGS_CONTACTS_VN}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAU_COM__ALERTS_MONTHLY_SUMMARY_CONTACTS_VO'),
        key: 'BAU_COM__ALERTS_MONTHLY_SUMMARY_CONTACTS_VO',
        width: 20,
        resolve({ user }) {
          return deep(user, `reportConfigs.monthlySummary.${GaragesReportConfigs.REPORT_CONFIGS_CONTACTS_VO}`)
            ? i18n.$t('Yes')
            : i18n.$t('No');
        },
      },
    ].filter((column) => !fields || !fields.length || fields.includes(column.key));
  },

  async getRow({ i18n, fields, user, garages }) {
    const row = {};

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = col.resolve({ garages, user });
      })
    );

    return row;
  },
};
