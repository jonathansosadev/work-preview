function extractCriteria(i18n, data, criteriaName, subCriteriaName) {
  if (!data.get('unsatisfiedTicket.createdAt')) {
    return '';
  }

  if (Array.isArray(data.get('unsatisfied.criteria'))) {
    const criteria = data.get('unsatisfied.criteria').find((c) => c.label === criteriaName);

    if (subCriteriaName) {
      const subCriteria = criteria && criteria.values && criteria.values.find((v) => v === subCriteriaName);
      if (subCriteria) {
        return i18n.$t('Yes');
      } else {
        return '';
      }
    }

    if (criteria) {
      return i18n.$t('Yes');
    }
  }

  return '';
}

module.exports = (i18n) => [
  //    ----------------------- MAINTENANCE -----------------------

  {
    header: i18n.$t('BD_UNS__MAINTENANCE_CRITERIA_1'),
    key: 'BD_UNS__MAINTENANCE_CRITERIA_1',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance1');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_1'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_1',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance1', 'Maintenance1');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_2'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_2',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance1', 'Maintenance2');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_3'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_3',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance1', 'Maintenance3');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_4'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_4',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance1', 'Maintenance4');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_24'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_24',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance1', 'Maintenance24');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_CRITERIA_2'),
    key: 'BD_UNS__MAINTENANCE_CRITERIA_2',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance2');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_5'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_5',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance2', 'Maintenance5');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_6'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_6',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance2', 'Maintenance6');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_7'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_7',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance2', 'Maintenance7');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_8'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_8',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance2', 'Maintenance8');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_CRITERIA_3'),
    key: 'BD_UNS__MAINTENANCE_CRITERIA_3',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance3');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_10'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_10',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance3', 'Maintenance10');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_11'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_11',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance3', 'Maintenance11');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_12'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_12',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance3', 'Maintenance12');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_13'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_13',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance3', 'Maintenance13');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_CRITERIA_4'),
    key: 'BD_UNS__MAINTENANCE_CRITERIA_4',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance4');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_15'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_15',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance4', 'Maintenance15');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_16'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_16',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance4', 'Maintenance16');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_17'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_17',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance4', 'Maintenance17');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_18'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_18',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance4', 'Maintenance18');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_CRITERIA_5'),
    key: 'BD_UNS__MAINTENANCE_CRITERIA_5',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance5');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_20'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_20',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance5', 'Maintenance20');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_21'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_21',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance5', 'Maintenance21');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_22'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_22',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance5', 'Maintenance22');
    },
  },
  {
    header: i18n.$t('BD_UNS__MAINTENANCE_SUB_CRITERIA_23'),
    key: 'BD_UNS__MAINTENANCE_SUB_CRITERIA_23',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'Maintenance5', 'Maintenance23');
    },
  },

  //    ----------------------- SALE NEW -----------------------

  {
    header: i18n.$t('BD_UNS__SALE_NEW_CRITERIA_1'),
    key: 'BD_UNS__SALE_NEW_CRITERIA_1',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew1');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_1'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_1',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew1', 'SaleNew1');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_2'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_2',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew1', 'SaleNew2');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_3'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_3',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew1', 'SaleNew3');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_4'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_4',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew1', 'SaleNew4');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_CRITERIA_2'),
    key: 'BD_UNS__SALE_NEW_CRITERIA_2',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew2');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_5'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_5',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew2', 'SaleNew5');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_6'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_6',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew2', 'SaleNew6');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_7'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_7',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew2', 'SaleNew7');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_8'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_8',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew2', 'SaleNew8');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_CRITERIA_3'),
    key: 'BD_UNS__SALE_NEW_CRITERIA_3',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew3');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_10'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_10',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew3', 'SaleNew10');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_11'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_11',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew3', 'SaleNew11');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_12'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_12',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew3', 'SaleNew12');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_13'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_13',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew3', 'SaleNew13');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_CRITERIA_4'),
    key: 'BD_UNS__SALE_NEW_CRITERIA_4',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew4');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_15'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_15',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew4', 'SaleNew15');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_16'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_16',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew4', 'SaleNew16');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_17'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_17',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew4', 'SaleNew17');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_18'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_18',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew4', 'SaleNew18');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_CRITERIA_5'),
    key: 'BD_UNS__SALE_NEW_CRITERIA_5',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew5');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_20'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_20',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew5', 'SaleNew20');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_21'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_21',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew5', 'SaleNew21');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_22'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_22',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew5', 'SaleNew22');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_NEW_SUB_CRITERIA_23'),
    key: 'BD_UNS__SALE_NEW_SUB_CRITERIA_23',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleNew5', 'SaleNew23');
    },
  },

  //    ----------------------- SALE USED -----------------------

  {
    header: i18n.$t('BD_UNS__SALE_USED_CRITERIA_1'),
    key: 'BD_UNS__SALE_USED_CRITERIA_1',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed1');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_1'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_1',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed1', 'SaleUsed1');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_2'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_2',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed1', 'SaleUsed2');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_3'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_3',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed1', 'SaleUsed3');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_4'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_4',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed1', 'SaleUsed4');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_CRITERIA_3'),
    key: 'BD_UNS__SALE_USED_CRITERIA_3',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed3');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_10'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_10',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed3', 'SaleUsed10');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_11'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_11',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed3', 'SaleUsed11');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_12'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_12',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed3', 'SaleUsed12');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_13'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_13',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed3', 'SaleUsed13');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_CRITERIA_4'),
    key: 'BD_UNS__SALE_USED_CRITERIA_4',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed4');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_15'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_15',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed4', 'SaleUsed15');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_16'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_16',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed4', 'SaleUsed16');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_17'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_17',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed4', 'SaleUsed17');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_18'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_18',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed4', 'SaleUsed18');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_CRITERIA_5'),
    key: 'BD_UNS__SALE_USED_CRITERIA_5',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed5');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_20'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_20',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed5', 'SaleUsed20');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_21'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_21',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed5', 'SaleUsed21');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_22'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_22',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed5', 'SaleUsed22');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_23'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_23',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed5', 'SaleUsed23');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_CRITERIA_6'),
    key: 'BD_UNS__SALE_USED_CRITERIA_6',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed6');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_25'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_25',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed6', 'SaleUsed25');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_26'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_26',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed6', 'SaleUsed26');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_27'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_27',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed6', 'SaleUsed27');
    },
  },
  {
    header: i18n.$t('BD_UNS__SALE_USED_SUB_CRITERIA_28'),
    key: 'BD_UNS__SALE_USED_SUB_CRITERIA_28',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'SaleUsed6', 'SaleUsed28');
    },
  },

  //    ----------------------- VEHICLE INSPECTION -----------------------

  {
    header: i18n.$t('BD_UNS__VEHICLE_INSPECTION_CRITERIA_1'),
    key: 'BD_UNS__VEHICLE_INSPECTION_CRITERIA_1',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'VehicleInspectionCriterion_0');
    },
  },
  {
    header: i18n.$t('BD_UNS__VEHICLE_INSPECTION_CRITERIA_2'),
    key: 'BD_UNS__VEHICLE_INSPECTION_CRITERIA_2',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'VehicleInspectionCriterion_1');
    },
  },
  {
    header: i18n.$t('BD_UNS__VEHICLE_INSPECTION_CRITERIA_3'),
    key: 'BD_UNS__VEHICLE_INSPECTION_CRITERIA_3',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'VehicleInspectionCriterion_2');
    },
  },
  {
    header: i18n.$t('BD_UNS__VEHICLE_INSPECTION_CRITERIA_4'),
    key: 'BD_UNS__VEHICLE_INSPECTION_CRITERIA_4',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'VehicleInspectionCriterion_3');
    },
  },
  {
    header: i18n.$t('BD_UNS__VEHICLE_INSPECTION_CRITERIA_5'),
    key: 'BD_UNS__VEHICLE_INSPECTION_CRITERIA_5',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'VehicleInspectionCriterion_4');
    },
  },
  {
    header: i18n.$t('BD_UNS__VEHICLE_INSPECTION_CRITERIA_6'),
    key: 'BD_UNS__VEHICLE_INSPECTION_CRITERIA_6',
    width: 20,
    resolve({ data }) {
      return extractCriteria(i18n, data, 'VehicleInspectionCriterion_5');
    },
  },
];
