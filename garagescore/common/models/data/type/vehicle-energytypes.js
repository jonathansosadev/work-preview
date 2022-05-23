const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum(
  {
    fuel: 'fuel',
    diesel: 'diesel',
    electric: 'electric',
    hybrid: 'hybrid',
    pluginHybrid: 'pluginHybrid',
    dieselOrFuel: 'diesel_fuel',
    hybridOrPluginHybrid: 'hybrid_pluginHybrid',
    hybridOrPluginHybridOrElectric: 'hybrid_pluginHybrid_electric',
    hydrogen: 'hydrogen',
    gpl: 'gpl',
    unknown: 'unknown',
  },
  {
    /** used for getFormattedString **/
    displayName(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`);
      }
      switch (value) {
        case this.fuel:
          return 'Essence';
        case this.diesel:
          return 'Diesel';
        case this.electric:
          return 'Electrique';
        case this.hybrid:
          return 'Hybride';
        case this.pluginHybrid:
          return 'Hybride rechargeable';
        case this.dieselOrFuel:
          return 'Diesel ou Essence';
        case this.hybridOrPluginHybridOrElectric:
          return 'Hybride ou Hybride rechargeable ou Electrique';
        case this.unknown:
          return 'Ne sait pas';
        default:
          return value;
      }
    },
    getFormattedString(data) {
      if (data.get('lead.energyType') && data.get('lead.energyType').length > 0) {
        let result = this.displayName(data.get('lead.energyType')[0]);
        for (let i = 1; i < data.get('lead.energyType').length; i++) {
          result = `${result}, ${this.displayName(data.get('lead.energyType')[i])}`;
        }
        return result;
      }
      return null;
    },
  }
);
