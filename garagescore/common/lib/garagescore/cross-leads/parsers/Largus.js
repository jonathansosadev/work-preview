const { fm, lm, decode, decodePhone } = require('../util.js');
const VehicleEnergyTypes = require('../../../../models/data/type/vehicle-energytypes');

const vehicleInfo = (func) => ({
  vehicleBrandModel: ({ html }) => decode(func(html.match(/Le véhicule concerné est : ([^<]*)<br>/))).trim(),
  vehiclePrice: ({ html }) => parseFloat(func(html.match(/Prix( |): ([^<]*)EUR/))),
  vehicleId: ({ html }) => func(html.match(/ID du véhicule( |): ([^<]*)/)),
  vehicleEnergy: ({ html }) => func(html.match(/Type de carburant( |): ([^<]*)/)),
  vehicleColor: ({ html }) => func(html.match(/Couleur du véhicule( |): ([^<]*)/)),
  vehicleYear: ({ html }) => func(html.match(/Année du véhicule( |): ([^<]*)/)),
});

module.exports = {
  minimumFieldsToParse: 4,
  parsers: [
    {
      sourceSubtype: 'LargusVo',
      adUrl: () => 'https://pro.largus.fr/login/',
      email: ({ html }) => lm(html.match(/Email( |): ([^<]*)<br>/)),
      phone: ({ html }, { locale }) => decodePhone(lm(html.match(/Téléphone : ([^<]*)<br>/)), locale),
      lastName: ({ html }) => lm(html.match(/Nom( |): ([^<]*)/)),
      brandModel: ({ html }) => lm(html.match(/Le véhicule concerné est : ([^<]*)<br>/)).trim(),
      energyType: ({ html }) => {
        const energy = vehicleInfo(lm).vehicleEnergy({ html });
        return VehicleEnergyTypes[energy.toLowerCase()] ? [VehicleEnergyTypes[energy.toLowerCase()]] : null;
      },
      vehicleRegistrationPlate: ({ html }) =>
        fm(html.match(/\([\w]{2,4}(|-)[\w]{2,4}(|-)[\w]{2}?(?=\))/)).replace('(', ''),
      message: ({ html }) => {
        let message =
          "Un client est intéressé par l'une de vos annonces diffusées sur les sites de la Galaxie Argus (incluant la Marketplace Facebook).\n\n"; // eslint-disable-line
        message += 'Veuillez trouver également plus d’informations :\n';
        const vehicleInfos = vehicleInfo(fm); // Takes the "Type de carburant" in front on the field
        message += `\t${Object.keys(vehicleInfos)
          .map((func) => {
            try {
              return vehicleInfos[func]({ html });
            } catch (e) {
              return null;
            }
          })
          .filter((e) => e)
          .join('\n\t')}`;
        return decode(message);
      },
      ...vehicleInfo(lm), // Takes last match to only keep the value (remove "Type de carburant", ...)
    },
  ],
};
