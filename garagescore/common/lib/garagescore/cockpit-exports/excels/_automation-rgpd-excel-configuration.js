module.exports = {
  getSheetName(i18n) {
    return i18n.$t('sheetName');
  },

  getColumns({ i18n, fields }) {
    return [
      {
        header: i18n.$t('BA_COM__PUBLIC_DISPLAY_NAME'),
        key: 'BA_COM__PUBLIC_DISPLAY_NAME',
        width: 30,
        resolve(customer, garage) {
          return (garage && garage.publicDisplayName) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__GENDER'),
        key: 'BA_COM__GENDER',
        width: 10,
        resolve(customer, garage) {
          return (customer && i18n.$t(customer.gender)) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__FULLNAME'),
        key: 'BA_COM__FULLNAME',
        width: 30,
        resolve(customer, garage) {
          return (customer && customer.fullName) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__EMAIL'),
        key: 'BA_COM__EMAIL',
        width: 30,
        resolve(customer, garage) {
          return (customer && customer.email) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__PHONE'),
        key: 'BA_COM__PHONE',
        width: 20,
        resolve(customer, garage) {
          return (customer && customer.phone) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__CITY'),
        key: 'BA_COM__CITY',
        width: 30,
        resolve(customer, garage) {
          return (customer && customer.city) || '';
        },
      },
      {
        header: i18n.$t('BA_COM__VEHICLE_PLATE'),
        key: 'BA_COM__VEHICLE_PLATE',
        width: 25,
        resolve(customer, garage) {
          return (customer && customer.plate) || '';
        },
      },
      {
        header: i18n.$t('BA_RGPD__STATUS'),
        key: 'BA_RGPD__STATUS',
        width: 15,
        resolve(customer, garage) {
          return customer && customer.unsubscribed ? i18n.$t('No') : i18n.$t('Yes');
        },
      },
      {
        header: i18n.$t('BA_RGPD__DATE_OPT_OUT'),
        key: 'BA_RGPD__DATE_OPT_OUT',
        width: 15,
        style: { numFmt: 'dd/mm/yyyy' },
        resolve(customer, garage) {
          return (customer && customer.unsubscribedDate) || '';
        },
      },
    ].filter((column) => !fields || !fields.length || fields.includes(column.key));
  },

  async getRow({ i18n, fields, customer, garage }) {
    const row = {};

    await Promise.all(
      this.getColumns({ i18n, fields }).map(async (col) => {
        row[col.key] = col.resolve(customer, garage);
      })
    );

    return row;
  },
};
