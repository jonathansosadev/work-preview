const { ServiceMiddleMans } = require('../../../../../frontend/utils/enumV2');
const { extractKpiFromKey } = require('./_common');

module.exports = (i18n) =>
  ServiceMiddleMans.values().map((serviceMiddleMan) => {
    const exportColumnKey = ServiceMiddleMans.getPropertyFromValue(serviceMiddleMan, 'exportColumnKey');
    const kpiByPeriodKey = ServiceMiddleMans.getPropertyFromValue(serviceMiddleMan, 'kpiByPeriodKey');
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
