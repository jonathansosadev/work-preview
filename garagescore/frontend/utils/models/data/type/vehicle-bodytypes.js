import GarageTypes from '../../garage.type.js'

const bodyTypes = {}
bodyTypes[GarageTypes.DEALERSHIP] = {
  CITADINE: 'urban',
  BERLINE: 'berline',
  BREAK: 'break',
  SUV: 'suv',
  MONOSPACE: 'monospace',
  COUPE: 'coupe',
  UTILITY_VEHICLE: 'utility_vehicle',
  UNKNOWN: 'Unknown'
}
bodyTypes[GarageTypes.MOTORBIKE_DEALERSHIP] = {
  CUSTOM: 'Custom',
  GT: 'GT',
  ROADSTER: 'Roadster',
  SPORTIVE: 'Sportive',
  SUPERMOTARD: 'Supermotard',
  TRAIL: 'Trail',
  SCOOTER: 'Scooter',
  UNKNOWN: 'Unknown'
}

let allBodyTypes = {}
for (const garageType of Object.keys(bodyTypes)) {
  allBodyTypes = { ...allBodyTypes, ...bodyTypes[garageType] }
}

function _displayName(value, language = 'fr') {
  if (typeof value === 'undefined') {
    console.error('The given value is undefined')
    return ''
  }
  if (value === 'unknown') return 'Je ne sais pas' // Temp for old 'unknown' type to delete after 01/03/2019
  if (!Object.values(allBodyTypes).includes(value)) {
    console.error(`Value '${value}' is not supported`)
    return value
  }
  return value // translate(value, language)
}

export default {
  BodyTypes: allBodyTypes,
  bodyTypesByGarageType(garageType = GarageTypes.DEALERSHIP) {
    return bodyTypes[garageType] || bodyTypes[GarageTypes.DEALERSHIP]
  },
  getBodyTypesByGarageType(garageType = GarageTypes.DEALERSHIP) {
    // Default
    return Object.values(
      bodyTypes[garageType] || bodyTypes[GarageTypes.DEALERSHIP]
    ).map((t) => ({ value: t, text: _displayName(t) }))
  },
  displayName: _displayName,
  displayArray(array, language = 'fr') {
    if (array && array.length) {
      return array.map((val) => _displayName(val, language)).join(', ')
    }
    return 'Non défini'
  },
  getFormattedString(data) {
    if (Array.isArray(data.get('lead.bodyType')))
      return data.get('lead.bodyType').join(', ')
    return null
  }
}
