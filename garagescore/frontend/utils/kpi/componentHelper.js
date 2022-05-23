import { DataTypes } from '~/utils/enumV2';

function transformDataDataTypeId(kpiData, dataTypeId) {
  if (dataTypeId) {
    const newKpiData = {};
    for (const key of Object.keys(kpiData)) {
      const notApvVnVo = !key.includes('Apv')
        && !key.includes('Vn')
        && !key.includes('Vo');
      if (key.includes('countUnsatisfied') && notApvVnVo) {
        if (dataTypeId === DataTypes.MAINTENANCE) {
          newKpiData[key] = kpiData[`${key}Apv`];
        } else if (dataTypeId === DataTypes.NEW_VEHICLE_SALE) {
          newKpiData[key] = kpiData[`${key}Vn`];
        } else if (dataTypeId === DataTypes.USED_VEHICLE_SALE) {
          newKpiData[key] = kpiData[`${key}Vo`];
        }
      }
    }
    return newKpiData;
  }
  return kpiData;
}

function transformDataLeadSaleType(kpiData, LeadSaleTypeSuffix, keyToInclude) {
  if (!LeadSaleTypeSuffix || !keyToInclude) {
    return kpiData;
  }
  const keyHasNoSuffix = (key) => ['Apv', 'Vn', 'Vo', 'Unknown'].every((s) => !key.includes(s));
  return Object.fromEntries(
    Object.keys(kpiData)
      .filter((key) => key.includes(keyToInclude) && keyHasNoSuffix(key))
      .map((key) => [key, kpiData[key + LeadSaleTypeSuffix]])
  );
}

export {
  transformDataDataTypeId,
  transformDataLeadSaleType,
};
