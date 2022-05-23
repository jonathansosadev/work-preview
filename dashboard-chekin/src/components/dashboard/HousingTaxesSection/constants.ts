import {HOUSING_FORM_NAMES} from '../../../utils/formNames';

const DEFAULT_EXEMPTIONS_AMOUNT = 0;
const MIN_PRICE = 0;
const MIN_AGE = 0;
const MIN_NIGHTS_NUMBER_TAXED = 1;
const CURRENT_YEAR = new Date().getFullYear();

enum SEASON_NAMES {
  high = 'HIGH',
  low = 'LOW',
}

enum FORM_NAMES {
  lowAmount = 'lowAmount',
  highAmount = 'highAmount',
  lessThanAge = 'lessThanAge',
  maxNightsTaxed = 'maxNightsTaxed',
  moreThanAge = 'moreThanAge',
  betweenLowAge = 'betweenLowAge',
  betweenHighAge = 'betweenHighAge',
  moreThanHighSeasonAmount = 'moreThanHighSeasonAmount',
  moreThanLowSeasonAmount = 'moreThanLowSeasonAmount',
  betweenHighSeasonAmount = 'betweenHighSeasonAmount',
  betweenLowSeasonAmount = 'betweenLowSeasonAmount',
  lessThanHighSeasonAmount = 'lessThanHighSeasonAmount',
  lessThanLowSeasonAmount = 'lessThanLowSeasonAmount',
}

enum EXTRA_FORM_NAMES {
  exemptions = 'exemptions',
}

enum FORM_NAMES_FRANCE_TAXES {
  hasDepartmentalTax = 'has_departmental_tax',
  hasRegionTax = 'has_region_tax',
  municipalPercentage = 'municipal_percentage',
  municipalTariff = 'municipal_tariff',
  isClassified = 'is_classified',
}

const FORM_TAXES_FEES_NAMES = {
  discount_fees_from_my_balance:
    HOUSING_FORM_NAMES.commission_responsibility_for_tourist_tax,
  charge_fees_to_guest: HOUSING_FORM_NAMES.commission_responsibility_for_tourist_tax,
};

const AGE_CALCULATOR_FORM_NAMES = [
  FORM_NAMES.moreThanAge,
  FORM_NAMES.lessThanAge,
  FORM_NAMES.betweenLowAge,
  FORM_NAMES.betweenHighAge,
  FORM_NAMES.moreThanLowSeasonAmount,
  FORM_NAMES.lessThanLowSeasonAmount,
  FORM_NAMES.moreThanHighSeasonAmount,
  FORM_NAMES.lessThanHighSeasonAmount,
  FORM_NAMES.betweenLowSeasonAmount,
  FORM_NAMES.betweenHighSeasonAmount,
];

const FRANCE_STAT_EXEMPTIONS = ['UNDER18', 'TEC', 'EA', 'MR'];

export {
  DEFAULT_EXEMPTIONS_AMOUNT,
  MIN_PRICE,
  MIN_AGE,
  MIN_NIGHTS_NUMBER_TAXED,
  CURRENT_YEAR,
  SEASON_NAMES,
  EXTRA_FORM_NAMES,
  FORM_NAMES,
  FORM_NAMES_FRANCE_TAXES,
  FORM_TAXES_FEES_NAMES,
  AGE_CALCULATOR_FORM_NAMES,
  FRANCE_STAT_EXEMPTIONS,
};
