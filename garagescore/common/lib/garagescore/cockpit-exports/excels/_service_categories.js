const { ServiceCategories } = require('../../../../../frontend/utils/enumV2');
const { extractKpiFromKey } = require('./_common');

module.exports = (i18n) =>
  ServiceCategories.values().map((serviceCategory) => {
    const exportColumnKey = ServiceCategories.getPropertyFromValue(serviceCategory, 'exportColumnKey');
    const kpiByPeriodKey = ServiceCategories.getPropertyFromValue(serviceCategory, 'kpiByPeriodKey');
    return {
      header: i18n.$t(exportColumnKey),
      key: exportColumnKey,
      width: 20,
      resolve({ document, dataTypes }) {
        return extractKpiFromKey({
          document,
          dataTypes,
          key: kpiByPeriodKey,
        });
      },
    };
  });
