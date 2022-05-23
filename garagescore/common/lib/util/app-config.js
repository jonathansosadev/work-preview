/**
 * App various configurations
 */

const GarageTypes = require('../../../common/models/garage.type.js');
const DataTypes = require('../../../common/models/data/type/data-types.js');
const { GaragesTest } = require('../../../frontend/utils/enumV2');

const garageConfigs = { fr: {}, es: {}, ca: {}, en: {}, fr_BE: {}, nl_BE: {} };

garageConfigs.fr[GarageTypes.DEALERSHIP] = {
  defaultScenarioId: '5b50c4427c8ff70003e42a8a', // Used to initialised garages
  exampleGarageId: GaragesTest.GARAGE_DUPONT, // Used to test the job, example: test survey
};
garageConfigs.fr[GarageTypes.MOTORBIKE_DEALERSHIP] = {
  defaultScenarioId: '5c0e73553ce3a100149dfcf4',
  exampleGarageId: GaragesTest.MOTO_DUBOIS,
};
garageConfigs.fr[GarageTypes.UTILITY_CAR_DEALERSHIP] = {
  defaultScenarioId: '5bef01681a01cd0014cbb145',
  exampleGarageId: '', // TODO
};
garageConfigs.fr[GarageTypes.AGENT] = {
  defaultScenarioId: '5beee8a4582cf900141a14b7',
  exampleGarageId: GaragesTest.AGENT_DUPONT,
};
garageConfigs.fr[GarageTypes.VEHICLE_INSPECTION] = {
  defaultScenarioId: '5bd0c9de34f3e7001421c57f',
  exampleGarageId: GaragesTest.VEHICULE_INSPECTION_DURANT,
};
garageConfigs.fr[GarageTypes.CAR_REPAIRER] = {
  defaultScenarioId: '5beee8a4582cf900141a14b7',
  exampleGarageId: GaragesTest.GARAGE_DUPONT, // TODO
};
garageConfigs.fr[GarageTypes.CAR_RENTAL] = {
  defaultScenarioId: '5beee8a4582cf900141a14b7',
  exampleGarageId: '', // TODO
};
garageConfigs.fr[GarageTypes.CARAVANNING] = {
  defaultScenarioId: '60fa80f1e942bb4d13f330b8',
  exampleGarageId: GaragesTest.CARAVANING_MARTIN,
};

// es
garageConfigs.es[GarageTypes.DEALERSHIP] = {
  defaultScenarioId: '5b50c4427c8ff70003e42a8a',
  exampleGarageId: GaragesTest.GARAGE_DEL_BOSQUE,
};
garageConfigs.es[GarageTypes.MOTORBIKE_DEALERSHIP] = {
  defaultScenarioId: '5c0e73553ce3a100149dfcf4',
  exampleGarageId: GaragesTest.MOTO_DEL_MAR,
};
garageConfigs.es[GarageTypes.AGENT] = {
  defaultScenarioId: '5beee8a4582cf900141a14b7',
  exampleGarageId: GaragesTest.AGENTE_DEL_LAGO,
};
garageConfigs.es[GarageTypes.VEHICLE_INSPECTION] = {
  defaultScenarioId: '5bd0c9de34f3e7001421c57f',
  exampleGarageId: GaragesTest.VEHICULE_INSPECTION_DEL_CIELO,
};
garageConfigs.es[GarageTypes.CARAVANNING] = {
  defaultScenarioId: '60fa80f1e942bb4d13f330b8',
  exampleGarageId: GaragesTest.CARAVANING_GARCIA,
};

// ca
garageConfigs.ca[GarageTypes.DEALERSHIP] = {
  defaultScenarioId: '5b50c4427c8ff70003e42a8a',
  exampleGarageId: GaragesTest.GARAGE_NORD,
};
garageConfigs.ca[GarageTypes.MOTORBIKE_DEALERSHIP] = {
  defaultScenarioId: '5c0e73553ce3a100149dfcf4',
  exampleGarageId: GaragesTest.MOTO_SUD,
};
garageConfigs.ca[GarageTypes.AGENT] = {
  defaultScenarioId: '5beee8a4582cf900141a14b7',
  exampleGarageId: GaragesTest.AGENT_OEST,
};
garageConfigs.ca[GarageTypes.VEHICLE_INSPECTION] = {
  defaultScenarioId: '5bd0c9de34f3e7001421c57f',
  exampleGarageId: GaragesTest.VEHICULE_INSPECTION_CENTRE,
};
garageConfigs.ca[GarageTypes.CARAVANNING] = {
  defaultScenarioId: '60fa80f1e942bb4d13f330b8',
  exampleGarageId: GaragesTest.CARAVANING_OUEST,
};

// us
garageConfigs.en[GarageTypes.DEALERSHIP] = {
  defaultScenarioId: '5b50c4427c8ff70003e42a8a',
  exampleGarageId: GaragesTest.GARAGE_SMITH,
};
garageConfigs.en[GarageTypes.MOTORBIKE_DEALERSHIP] = {
  defaultScenarioId: '5c0e73553ce3a100149dfcf4',
  exampleGarageId: GaragesTest.MOTO_MOORE,
};
garageConfigs.en[GarageTypes.AGENT] = {
  defaultScenarioId: '5beee8a4582cf900141a14b7',
  exampleGarageId: GaragesTest.AGENT_TESLA_HOUSTON,
};
garageConfigs.en[GarageTypes.VEHICLE_INSPECTION] = {
  defaultScenarioId: '5bd0c9de34f3e7001421c57f',
  exampleGarageId: GaragesTest.VEHICULE_INSPECTION_CLARK,
};
garageConfigs.en[GarageTypes.CARAVANNING] = {
  defaultScenarioId: '60fa80f1e942bb4d13f330b8',
  exampleGarageId: GaragesTest.CARAVANING_WILL,
};

// fr_BE
garageConfigs.fr_BE[GarageTypes.DEALERSHIP] = {
  defaultScenarioId: '5b50c4427c8ff70003e42a8a',
  exampleGarageId: GaragesTest.GARAGE_LAMBERT,
};
garageConfigs.fr_BE[GarageTypes.MOTORBIKE_DEALERSHIP] = {
  defaultScenarioId: '5c0e73553ce3a100149dfcf4',
  exampleGarageId: GaragesTest.MOTO_LAMBERT,
};
garageConfigs.fr_BE[GarageTypes.AGENT] = {
  defaultScenarioId: '5beee8a4582cf900141a14b7',
  exampleGarageId: GaragesTest.AGENT_LAMBERT,
};
garageConfigs.fr_BE[GarageTypes.VEHICLE_INSPECTION] = {
  defaultScenarioId: '5bd0c9de34f3e7001421c57f',
  exampleGarageId: GaragesTest.VEHICULE_INSPECTION_LAMBERT,
};
garageConfigs.fr_BE[GarageTypes.CARAVANNING] = {
  defaultScenarioId: '60fa80f1e942bb4d13f330b8',
  exampleGarageId: GaragesTest.CARAVANING_RICHARD,
};

// nl_BE
garageConfigs.nl_BE[GarageTypes.DEALERSHIP] = {
  defaultScenarioId: '5b50c4427c8ff70003e42a8a',
  exampleGarageId: GaragesTest.GARAGE_MERTENS,
};
garageConfigs.nl_BE[GarageTypes.MOTORBIKE_DEALERSHIP] = {
  defaultScenarioId: '5c0e73553ce3a100149dfcf4',
  exampleGarageId: GaragesTest.MOTO_MERTENS,
};
garageConfigs.nl_BE[GarageTypes.AGENT] = {
  defaultScenarioId: '5beee8a4582cf900141a14b7',
  exampleGarageId: GaragesTest.AGENT_MERTENS,
};
garageConfigs.nl_BE[GarageTypes.VEHICLE_INSPECTION] = {
  defaultScenarioId: '5bd0c9de34f3e7001421c57f',
  exampleGarageId: GaragesTest.VEHICULE_INSPECTION_MERTENS,
};
garageConfigs.nl_BE[GarageTypes.CARAVANNING] = {
  defaultScenarioId: '60fa80f1e942bb4d13f330b8',
  exampleGarageId: GaragesTest.CARAVANING_MERTENS,
};

const _camelToKebab = (s) => s.replace(/(.)([A-Z])/g, '$1-$2').toLowerCase();

const _concernedDataTypes = (garageType) => {
  if (garageType === GarageTypes.VEHICLE_INSPECTION) {
    return [DataTypes.VEHICLE_INSPECTION];
  }
  return [DataTypes.MAINTENANCE, DataTypes.NEW_VEHICLE_SALE, DataTypes.USED_VEHICLE_SALE];
};

module.exports = {
  getExampleGarageId: (garageType, lang = 'fr') =>
    (garageConfigs[lang][garageType] && garageConfigs[lang][garageType].exampleGarageId) ||
    garageConfigs.fr[GarageTypes.DEALERSHIP].exampleGarageId,
  getDefaultScenarioId: (garageType, lang = 'fr') =>
    (garageConfigs[lang][garageType] && garageConfigs[lang][garageType].defaultScenarioId) ||
    garageConfigs.fr[GarageTypes.DEALERSHIP].defaultScenarioId,
  camelToKebab: _camelToKebab,
  concernedDataTypes: _concernedDataTypes,
  getAllExampleGarageIds: () => {
    let allGarages = [];
    for (let lang of Object.keys(garageConfigs)) {
      for (let type of Object.keys(garageConfigs[lang])) {
        if (garageConfigs[lang][type].exampleGarageId !== '') {
          allGarages.push(garageConfigs[lang][type].exampleGarageId);
        }
      }
    }
    return allGarages;
  },
};
