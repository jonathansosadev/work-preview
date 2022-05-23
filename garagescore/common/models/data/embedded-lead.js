
const LeadTypes = require('./type/lead-types');
const LeadSaleTypes = require('./type/lead-sale-types');
const LeadTimings = require('./type/lead-timings');
const LeadTradeInTypes = require('./type/lead-trade-in-types');
const EnergyTypes = require('./type/vehicle-energytypes');
const LeadFinancing = require('./type/lead-financing');
const DataTypes = require('./type/data-types');
const leadSaleCategories = require('./type/lead-sale-categories');
const leadFinancingCredit = require('./type/lead-financing-credit');
const leadFinancingCashVo = require('./type/lead-financing-cash-vo');
const leadFinancingCashVn = require('./type/lead-financing-cash-vn');


/**
 * A lead
 */

const model = () => ({
  properties: {
    /* when the lead was reported */
    reportedAt: {
      type: 'date',
      required: true,
    },
    potentialSale: {
      type: 'boolean',
      default: false,
    },
    /* used or new */
    saleType: {
      type: LeadSaleTypes.type,
    },
    /* When the user want to buy */
    timing: {
      type: LeadTimings.type,
    },
    categories: {
      type: leadSaleCategories.type,
    },
    /* desired vehicle */
    knowVehicle: {
      type: 'boolean',
      default: false,
    },
    /* desired vehicle */
    vehicle: {
      type: 'string',
    },
    brands: [
      {
        type: Object,
      },
    ],

    energyType: [
      {
        type: EnergyTypes.type,
      },
    ],
    bodyType: [
      {
        type: 'string',
      },
    ],
    /* would it be a trade in (Oui, Non, je sais pas*/
    tradeIn: {
      type: LeadTradeInTypes.type,
    },
    /* cross lead/sale */
    financing: {
      type: LeadFinancing.type,
    },
    financingCredit: {
      type: leadFinancingCredit.type,
    },
    financingCashVo: {
      type: leadFinancingCashVo.type,
    },
    financingCashVn: {
      type: leadFinancingCashVn.type,
    },
    /* cross lead/sale */
    isConverted: {
      type: 'boolean',
      default: false,
    },
    /* lead converted to a sale */
    isConvertedToSale: {
      type: 'boolean',
      default: false,
    },
    /* lead converted to tradein */
    isConvertedToTradeIn: {
      type: 'boolean',
      default: false,
    },
    /* lead converted to tradein */
    convertedToTradeInAt: {
      type: 'date',
    },
    /* data id for a lead converted to a tradein */
    convertedTradeInDataId: {
      type: 'string',
    },
    /* type (vn/vo) for a lead converted to a sale */
    convertedSaleType: {
      type: DataTypes.type,
    },
    /* data id for a lead converted to a sale */
    convertedSaleDataId: {
      type: 'string',
    },
    convertedToSaleAt: {
      type: 'date',
    },
  },
});
// check if the lead is not actually already ordered
const isPotentialSale = function isPotentialSale(leadType) {
  return LeadTypes.isLead(leadType);
};
/** get corresponding data to convertedSaleDataId */
const getConvertedSaleData = function getConvertedSaleData() {
  return new Promise((resolve, reject) => {
    const dataId = this.get('lead.convertedSaleDataId');
    if (!dataId) {
      reject(new Error('getConvertedSaleData: no convertedSaleDataId'));
      return;
    }
    this.app().models.Data.findById(dataId, (e, data) => {
      if (e) {
        reject(e);
        return;
      }
      resolve(data);
    });
  });
};
/** get corresponding data to convertedSaleDataId */
const getConvertedTradeInData = function getConvertedTradeInData() {
  return new Promise((resolve, reject) => {
    const dataId = this.get('lead.convertedTradeInDataId');
    if (!dataId) {
      reject(new Error('getConvertedSaleData: no convertedTradeInDataId'));
      return;
    }
    this.app().models.Data.findById(dataId, (e, data) => {
      if (e) {
        reject(e);
        return;
      }
      resolve(data);
    });
  });
};
const prototypeMethods = {
  getConvertedSaleData,
  getConvertedTradeInData,
};
const staticMethods = {
  isPotentialSale,
};

module.exports = { model, prototypeMethods, staticMethods };
