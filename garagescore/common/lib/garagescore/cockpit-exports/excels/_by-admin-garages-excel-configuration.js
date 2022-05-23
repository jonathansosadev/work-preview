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
        header: i18n.$t('BAG_COM__BUSINESS_NAME'),
        key: 'BAG_COM__BUSINESS_NAME',
        width: 30,
        resolve({ user }) {
          if (user.externalId && user.publicDisplayName) {
            return `[${user.externalId}] - ${user.publicDisplayName}`;
          }
          return user.publicDisplayName || '';
        },
      },
      {
        header: i18n.$t('BAG_COM__GENDER'),
        key: 'BAG_COM__GENDER',
        width: 20,
        resolve({ user }) {
          return user.civility || '';
        },
      },
      {
        header: i18n.$t('BAG_COM__FULLNAME'),
        key: 'BAG_COM__FULLNAME',
        width: 20,
        resolve({ user }) {
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';

          return `${firstName} ${lastName}`.trim();
        },
      },
      {
        header: i18n.$t('BAG_COM__FIRSTNAME'),
        key: 'BAG_COM__FIRSTNAME',
        width: 20,
        resolve({ user }) {
          return user.firstName || '';
        },
      },
      {
        header: i18n.$t('BAG_COM__LASTNAME'),
        key: 'BAG_COM__LASTNAME',
        width: 20,
        resolve({ user }) {
          return user.lastName || '';
        },
      },
      {
        header: i18n.$t('BAG_COM__EMAIL'),
        key: 'BAG_COM__EMAIL',
        width: 20,
        resolve({ user }) {
          return user.email || '';
        },
      },
      {
        header: i18n.$t('BAG_COM__PHONE'),
        key: 'BAG_COM__PHONE',
        width: 20,
        resolve({ user }) {
          return user.phone || '';
        },
      },
      {
        header: i18n.$t('BAG_COM__MOBILE'),
        key: 'BAG_COM__MOBILE',
        width: 20,
        resolve({ user }) {
          return user.mobilePhone || '';
        },
      },
      {
        header: i18n.$t('BAG_COM__JOB'),
        key: 'BAG_COM__JOB',
        width: 20,
        resolve({ user }) {
          return user.job || '';
        },
      },
      {
        header: i18n.$t('BAG_COM__ROLE'),
        key: 'BAG_COM__ROLE',
        width: 20,
        resolve({ user }) {
          return user.role || '';
        },
      },
      {
        header: i18n.$t('BAG_COM__TICKET_CONFIGURATION_UNSATISFIED_MAINTENANCE'),
        key: 'BAG_COM__TICKET_CONFIGURATION_UNSATISFIED_MAINTENANCE',
        width: 20,
        resolve({ assigns }) {
          if (assigns && assigns.includes('Unsatisfied_Maintenance')) {
            return i18n.$t('Yes');
          }
          return i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAG_COM__TICKET_CONFIGURATION_UNSATISFIED_VN'),
        key: 'BAG_COM__TICKET_CONFIGURATION_UNSATISFIED_VN',
        width: 20,
        resolve({ assigns }) {
          if (assigns && assigns.includes('Unsatisfied_NewVehicleSale')) {
            return i18n.$t('Yes');
          }
          return i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAG_COM__TICKET_CONFIGURATION_UNSATISFIED_VO'),
        key: 'BAG_COM__TICKET_CONFIGURATION_UNSATISFIED_VO',
        width: 20,
        resolve({ assigns }) {
          if (assigns && assigns.includes('Unsatisfied_UsedVehicleSale')) {
            return i18n.$t('Yes');
          }
          return i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAG_COM__TICKET_CONFIGURATION_LEAD_MAINTENANCE'),
        key: 'BAG_COM__TICKET_CONFIGURATION_LEAD_MAINTENANCE',
        width: 20,
        resolve({ assigns }) {
          if (assigns && assigns.includes('Lead_Maintenance')) {
            return i18n.$t('Yes');
          }
          return i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAG_COM__TICKET_CONFIGURATION_LEAD_VN'),
        key: 'BAG_COM__TICKET_CONFIGURATION_LEAD_VN',
        width: 20,
        resolve({ assigns }) {
          if (assigns && assigns.includes('Lead_NewVehicleSale')) {
            return i18n.$t('Yes');
          }
          return i18n.$t('No');
        },
      },
      {
        header: i18n.$t('BAG_COM__TICKET_CONFIGURATION_LEAD_VO'),
        key: 'BAG_COM__TICKET_CONFIGURATION_LEAD_VO',
        width: 20,
        resolve({ assigns }) {
          if (assigns && assigns.includes('Lead_UsedVehicleSale')) {
            return i18n.$t('Yes');
          }
          return i18n.$t('No');
        },
      },
    ].filter((column) => !fields || !fields.length || fields.includes(column.key));
  },

  async getRow({ i18n, fields, user, assigns }) {
    const row = {};

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = col.resolve({ user, assigns });
      })
    );

    return row;
  },
};
