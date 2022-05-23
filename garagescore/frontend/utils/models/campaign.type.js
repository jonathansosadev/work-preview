import Enum from '~/utils/enum.js'
import jobsEnum from '~/utils/models/types';

const vehicules = new Enum({
  VEHICLE_SALE: 'VehicleSale',
  ...jobsEnum,
  UNKNOWN: 'Unknown'
})

const isSale = (value) => {
  return (value === this.VEHICLE_SALE || value === this.NEW_VEHICLE_SALE || value === this.USED_VEHICLE_SALE);
}

const displayName = (value, language = 'fr') => {
  if (language !== 'fr') {
    throw new Error(`Language ${language} is not supported`);
  }
  switch (value) {
    case this.MAINTENANCE : return 'Atelier';
    case this.VEHICLE_SALE : return 'Vente';
    case this.NEW_VEHICLE_SALE : return 'V.neuf';
    case this.USED_VEHICLE_SALE : return 'V.occasion';
    case this.VEHICLE_INSPECTION : return 'Contrôle technique';
    case this.UNKNOWN : return 'inconnu';
    default: return value;
  }
}

export { vehicules, isSale, displayName };
