const VehicleEnergyTypes = require('../../../../../models/data/type/vehicle-energytypes');
const { lm, decode, decodePhone } = require('../../util');

module.exports = {
  message: function ({ html }) {
    const message = decode(lm(html.match(/Message:([\s\S]*?)<br><b>/)));
    const minYear = decode(lm(html.match(/Année_minimum:([\s\S]*?)<br><b>/)));
    const maxKm = decode(lm(html.match(/Kilométrage_maximum:([\s\S]*?)<br><b>/)));
    const outsideColor = decode(lm(html.match(/Couleur_extérieur:([\s\S]*?)<br><b>/)));
    const insideColor = decode(lm(html.match(/Couleur_intérieur:([\s\S]*?)<br><b>/)));
    const options = decode(lm(html.match(/Options_souhaitées:([\s\S]*?)<br><b>/)));
    return `Année minimum: ${minYear}\nKilométrage maximum: ${maxKm}\nCouleur extérieur: ${outsideColor}\nCouleur intérieur: ${insideColor}\nOptions: ${options}\n\nMessage: ${message}`;
  },
  brandModel: ({ html }) => {
    const brand = decode(lm(html.match(/Marque:([\s\S]*?)<br><b>/)));
    const model = decode(lm(html.match(/Modèle:([\s\S]*?)<br><b>/)));
    const version = decode(lm(html.match(/Version:([\s\S]*?)<br><b>/)));
    const motorization = decode(lm(html.match(/Version:([\s\S]*?)<br><b>/)));
    return `${brand} / ${model} / ${version} / ${motorization}`;
  },
  vehiclePrice: ({ html }) => {
    const budget = decode(lm(html.match(/Budget_maximum:([\s\S]*?)<br><b>/)));
    return budget == 'NC' ? '0' : budget;
  },
  email: ({ html }) => {
    return decode(lm(html.match(/E-mail:([\s\S]*?)<br><b>/)));
  },
  phone: ({ html }, { locale }) => {
    return decodePhone(decode(lm(html.match(/Téléphone:([\s\S]*?)<br><b>/)).trim()), locale);
  },
  energyType: ({ html }) => {
    const energyRaw = decode(lm(html.match(/Motorisation:([\s\S]*?)<br><b>/)));
    const energyRawToEnumValue = {
      Hybride: VehicleEnergyTypes.hybrid,
      'Hybride Rechargeable': VehicleEnergyTypes.pluginHybrid,
      Electrique: VehicleEnergyTypes.electric,
      Essence: VehicleEnergyTypes.fuel,
      Diesel: VehicleEnergyTypes.diesel,
      GPL: VehicleEnergyTypes.gpl,
      Hydrogène: VehicleEnergyTypes.hydrogen,
    };
    return energyRawToEnumValue[energyRaw] ? [energyRawToEnumValue[energyRaw]] : undefined;
  },
  lastName: ({ html }) => decode(lm(html.match(/Nom:([\s\S]*?)<br><b>/))),
  firstName: ({ html }) => decode(lm(html.match(/Prénom:([\s\S]*?)<br><b>/))),
};
