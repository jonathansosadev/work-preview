import i18n from '../../i18n';
import {SelectOption} from '../types';

enum FORM_NAMES {
  title = 'title',
  highlight = 'highlight',
  description = 'description',
  priceType = 'price_type',
  pricesItems = 'items',
  supplier = 'supplier',
  category = 'category',
  confirmation_type = 'confirmation_type',
  picture = 'offer_image',
  spots = 'quantity',
  template = 'template',
  duration = 'duration_availabilities',
  selectedHousings = 'housings_ids',
  extraDetailedPrice = 'extra_detailed_price',
}

enum EXTRA_PRICE_FORM_NAMES {
  revenueToHost = 'user_revenue',
  feeToGuest = 'fee_to_guest',
}

enum PRICE_TYPES {
  single = 'SINGLE_PRICE',
  multiple = 'MULTIPLE_PRICE',
  dateTime = 'DATA_AND_TIME_RANGE_PRICE',
}

enum OFFER_CONFIRM_TYPES {
  auto = 'AUTO',
  manual = 'MANUAL',
}

enum OFFER_TEMPLATES {
  custom = 'CUSTOM',
  checkIn = 'EARLY_CHECK_IN',
  checkOut = 'LATE_CHECK_OUT',
  waivo1500 = 'WAIVO_PROPERTY_PROTECTION_1500',
  waivo2500 = 'WAIVO_PROPERTY_PROTECTION_2500',
  waivo5000 = 'WAIVO_PROPERTY_PROTECTION_5000',
}

enum OFFER_CATEGORIES {
  checkInCheckOut = 'CHECK_IN_CHECK_OUT',
  transportation = 'TRANSPORTATION',
  fAndB = 'F_AND_B',
  seasonal = 'SEASONAL',
  family = 'FAMILY',
  romantic = 'ROMANTIC',
  healthAndSpa = 'HEALTH_AND_SPA',
  artAndCulture = 'ART_AND_CULTURE',
  activities = 'ACTIVITIES',
  services = 'SERVICES',
  propertyProtection = 'PROPERTY_PROTECTION',
  others = 'OTHERS',
}

enum SUPPLIER_CATEGORIES {
  standard = 'STANDARD',
  special = 'SPECIAL',
}

enum PRICES_FIELD {
  price = 'price',
  unit = 'unit_type',
  name = 'name',
  day = 'day',
}

enum UNIT_PRICE_TYPES {
  unit = 'PER_UNIT',
  day = 'PER_DAY',
  person = 'PER_PERSON',
  group = 'PER_GROUP',
}

enum DEAL_STATUSES {
  requested = 'REQUESTED',
  approved = 'APPROVED',
  rejected = 'REJECTED',
  paid = 'PAID',
}

const OFFER_CONFIRM_TYPE_OPTIONS = {
  [OFFER_CONFIRM_TYPES.auto]: {
    value: OFFER_CONFIRM_TYPES.auto,
    label: i18n.t('auto'),
  },
  [OFFER_CONFIRM_TYPES.manual]: {
    value: OFFER_CONFIRM_TYPES.manual,
    label: i18n.t('manual'),
  },
};

const OFFER_CATEGORIES_OPTIONS = {
  [OFFER_CATEGORIES.checkInCheckOut]: {
    value: OFFER_CATEGORIES.checkInCheckOut,
    label: i18n.t('check_in_or_check_out'),
  },
  [OFFER_CATEGORIES.transportation]: {
    value: OFFER_CATEGORIES.transportation,
    label: i18n.t('transportation'),
  },
  [OFFER_CATEGORIES.fAndB]: {
    value: OFFER_CATEGORIES.fAndB,
    label: i18n.t('f_and_b'),
  },
  [OFFER_CATEGORIES.seasonal]: {
    value: OFFER_CATEGORIES.seasonal,
    label: i18n.t('seasonal'),
  },
  [OFFER_CATEGORIES.family]: {
    value: OFFER_CATEGORIES.family,
    label: i18n.t('family'),
  },
  [OFFER_CATEGORIES.romantic]: {
    value: OFFER_CATEGORIES.romantic,
    label: i18n.t('romantic'),
  },
  [OFFER_CATEGORIES.healthAndSpa]: {
    value: OFFER_CATEGORIES.healthAndSpa,
    label: i18n.t('health_and_spa'),
  },
  [OFFER_CATEGORIES.artAndCulture]: {
    value: OFFER_CATEGORIES.artAndCulture,
    label: i18n.t('art_and_culture'),
  },
  [OFFER_CATEGORIES.activities]: {
    value: OFFER_CATEGORIES.activities,
    label: i18n.t('activities'),
  },
  [OFFER_CATEGORIES.services]: {
    value: OFFER_CATEGORIES.services,
    label: i18n.t('services'),
  },
  [OFFER_CATEGORIES.propertyProtection]: {
    value: OFFER_CATEGORIES.propertyProtection,
    label: i18n.t('property_protection'),
  },
  [OFFER_CATEGORIES.others]: {
    value: OFFER_CATEGORIES.others,
    label: i18n.t('others'),
  },
};

const PRICE_TYPE_OPTIONS: {
  [key in PRICE_TYPES]?: {value: PRICE_TYPES; label: string};
} = {
  [PRICE_TYPES.single]: {
    value: PRICE_TYPES.single,
    label: i18n.t('single_price_type'),
  },
  [PRICE_TYPES.multiple]: {
    value: PRICE_TYPES.multiple,
    label: i18n.t('multiple_price_type'),
  },
  // Future feature
  // [PRICE_TYPES.dateTime]: {
  //     value: PRICE_TYPES.dateTime,
  //     label: i18n.t('date_and_time_range_price'),
  //   },
};

const PRICE_UNITS_OPTIONS: {
  [key in UNIT_PRICE_TYPES | '']?: SelectOption<void, UNIT_PRICE_TYPES>;
} = {
  [UNIT_PRICE_TYPES.unit]: {
    value: UNIT_PRICE_TYPES.unit,
    label: i18n.t('per_unit'),
  },
  [UNIT_PRICE_TYPES.person]: {
    value: UNIT_PRICE_TYPES.person,
    label: i18n.t('per_person'),
  },
  [UNIT_PRICE_TYPES.group]: {
    value: UNIT_PRICE_TYPES.group,
    label: i18n.t('per_group'),
  },
  [UNIT_PRICE_TYPES.day]: {
    value: UNIT_PRICE_TYPES.day,
    label: i18n.t('per_day'),
  },
};

export {
  PRICE_TYPE_OPTIONS,
  PRICE_UNITS_OPTIONS,
  FORM_NAMES,
  EXTRA_PRICE_FORM_NAMES,
  UNIT_PRICE_TYPES,
  PRICE_TYPES,
  OFFER_TEMPLATES,
  PRICES_FIELD,
  DEAL_STATUSES,
  OFFER_CATEGORIES_OPTIONS,
  OFFER_CONFIRM_TYPE_OPTIONS,
  OFFER_CONFIRM_TYPES,
  OFFER_CATEGORIES,
  SUPPLIER_CATEGORIES,
};
