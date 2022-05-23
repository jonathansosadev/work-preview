const configs = {};

const { AutoBrands, MotoBrands, CaravanBrands, OtherBrands } = require('../../../frontend/utils/enumV2');

const brands = [...AutoBrands.values(), ...MotoBrands.values(), ...CaravanBrands.values(), ...OtherBrands.values()];
const commonBrands = [
  ...AutoBrands.valuesWithFilter('top5', true),
  ...MotoBrands.valuesWithFilter('top5', true),
  ...CaravanBrands.valuesWithFilter('top5', true),
  ...OtherBrands.valuesWithFilter('top5', true),
];

function cloneConfig(config, params) {
  let newConfig = JSON.parse(JSON.stringify(config));
  newConfig = Object.assign(newConfig, params);
  return newConfig;
}

configs['e-reputation'] = {
  id: 'e-reputation',
  autoMakeUserAndGarages: true,
  name: '',
  makes: brands,
  commonMakes: commonBrands,
  canRecontact: true,
  canChoosePayment: true,
  withPrimaryMakes: true,
  withSecondaryMakes: false,
  withDealer: false,
  withPromoCode: true,
  hideSubscriptionMessageOnSummaryEmail: true,
  services: { maintenance: true, sales: true, leads: true, analytics: true, data: true },
  plans: {
    eReputation: { publicPrice: 19, discount: 0, finalPrice: 19 },
  },
  contacts: {
    role: true,
    groupeName: true,
    other: false,
  },
};
const laCentrale = {
  name: '',
  id: 'la-centrale',
  makes: brands,
  commonMakes: commonBrands,
  canRecontact: true,
  canChoosePayment: true,
  withPrimaryMakes: true,
  withSecondaryMakes: true,
  withDealer: false,
  services: { maintenance: true, sales: true, leads: true, analytics: true, data: true },
  plans: {
    maintenance: { publicPrice: 59, discount: 0, finalPrice: 59 },
    sales: { publicPrice: 39, discount: 100, finalPrice: null },
    leads: { publicPrice: 39, discount: 100, finalPrice: null },
    analytics: { publicPrice: 19, discount: 100, finalPrice: null },
    data: { publicPrice: 5, discount: 100, finalPrice: null },
  },
  contacts: {
    role: true,
    groupeName: true,
    other: true,
  },
};

configs.gcr201804cbm = JSON.parse(JSON.stringify(laCentrale));
configs.gcr201804cbm.id = 'gcr201804cbm';

const alliance210518 = {
  id: 'alliance',
  makes: [OtherBrands.TOP_GARAGE, OtherBrands.ETAPE_AUTO, OtherBrands.PRECISIUM],
  canRecontact: false,
  canChoosePayment: false,
  withPrimaryMakes: false,
  withSecondaryMakes: false,
  withDealer: true,
  services: { maintenance: true, sales: false, leads: false, analytics: false, data: false },
  plans: {
    maintenance: { publicPrice: 39, discount: 49, finalPrice: 19.9 },
    sales: { publicPrice: 10, discount: 0, finalPrice: 10 },
    leads: { publicPrice: 10, discount: 0, finalPrice: 10 },
  },
  dms: [
    'EBP Méca',
    'Sage Apimécanique',
    'Solware Next',
    'Solware Winmotor2',
    'Ciléa',
    "Autres DMS non compatibles pour l'instant",
  ],
  contacts: {
    role: false,
    groupeName: false,
    other: false,
  },
};

const confOrigin = alliance210518;

// for webpack we can't have dynamic images, so insted of having only one field logo: 'logo-gp.png', we do logo_gp:true
configs.tg2220155 = cloneConfig(confOrigin, {
  name: OtherBrands.TOP_GARAGE,
  logo_tg: true,
});
configs.tc4114611 = cloneConfig(confOrigin, {
  name: OtherBrands.TOP_CARROSSERIE,
  logo_tc: true,
});
configs.gp623391 = cloneConfig(confOrigin, {
  name: OtherBrands.GARAGE_PREMIER,
  logo_gp: true,
});
configs.ea3002375 = cloneConfig(confOrigin, {
  name: OtherBrands.ETAPE_AUTO,
  logo_ea: true,
});
configs.mg33060 = cloneConfig(confOrigin, {
  name: OtherBrands.MON_GARAGE,
  logo_mg: true,
  logo_mc: true,
});
configs.pr4608290 = cloneConfig(confOrigin, {
  name: OtherBrands.PRECISIUM,
  logo_pg: true,
  logo_pc: true,
});
configs.gc6519088 = cloneConfig(confOrigin, {
  name: OtherBrands.GARAGE_AND_CO,
  logo_gc: true,
});

configs.pa621241 = cloneConfig(confOrigin, {
  name: OtherBrands.PIECES_AUTO,
  logo_pa: true,
});
module.exports = configs;
