import i18n from '../../i18n';
import {COUNTRY_CODES, CURRENCIES_LABELS, DAY_NAMES} from '../constants';
import {SelectOption} from '../types';
import {
  FORM_NAMES,
  OFFER_CATEGORIES,
  OFFER_CATEGORIES_OPTIONS,
  OFFER_CONFIRM_TYPE_OPTIONS,
  OFFER_CONFIRM_TYPES,
  OFFER_TEMPLATES,
  PRICE_TYPE_OPTIONS,
  PRICES_FIELD,
  PRICE_UNITS_OPTIONS,
  SUPPLIER_CATEGORIES,
  EXTRA_PRICE_FORM_NAMES,
} from './constants';
import {State as AvailabilityState} from '../../components/dashboard/DurationPicker/DurationPicker';

const WAIVO_NET_FEE: {[key in OFFER_TEMPLATES]?: number} = {
  [OFFER_TEMPLATES.waivo1500]: 18,
  [OFFER_TEMPLATES.waivo2500]: 21,
  [OFFER_TEMPLATES.waivo5000]: 24,
};
const WAIVO_REVENUE_HOST_MINIMUM = 1;
const WAIVO_CHEKIN_COMMISSION = 3;

const calcNetFeeWithCommissions = (netFeeWithoutCommissions = 0) => {
  return netFeeWithoutCommissions + WAIVO_REVENUE_HOST_MINIMUM + WAIVO_CHEKIN_COMMISSION;
};

const INTERNAL_SUPPLIER_OPTION: SelectOption = {
  label: i18n.t('internal_service'),
  value: '',
};

type AvailabilityDay = AvailabilityState[keyof AvailabilityState];
const availabilityDay: AvailabilityDay = {
  isAllDay: false,
  startTime: null,
  endTime: null,
  isChecked: false,
  endOptions: [],
  startOptions: [],
};

const INIT_OFFER_CATEGORIES_OPTIONS = [
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.checkInCheckOut],
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.transportation],
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.fAndB],
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.seasonal],
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.family],
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.romantic],
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.healthAndSpa],
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.artAndCulture],
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.services],
  OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.others],
];

type TemplateField = {
  value: any;
  readonly?: boolean;
  required?: boolean;
  tooltipText?: string;
  min?: number;
  max?: number;
};
export const INIT_FORM_FIELDS: {[key in FORM_NAMES]?: TemplateField} = {
  [FORM_NAMES.title]: {value: '', readonly: false},
  [FORM_NAMES.selectedHousings]: {value: undefined, readonly: false},
  [FORM_NAMES.duration]: {value: undefined, readonly: false},
  [FORM_NAMES.description]: {value: '', readonly: false},
  [FORM_NAMES.pricesItems]: {value: [], readonly: false},
  [FORM_NAMES.priceType]: {value: '', readonly: false},
  [FORM_NAMES.picture]: {value: undefined, readonly: false},
  [FORM_NAMES.highlight]: {value: '', readonly: false},
  [FORM_NAMES.spots]: {value: '', readonly: false},
  [FORM_NAMES.supplier]: {
    value: INTERNAL_SUPPLIER_OPTION,
    readonly: false,
  },
  [FORM_NAMES.confirmation_type]: {
    value: OFFER_CONFIRM_TYPE_OPTIONS[OFFER_CONFIRM_TYPES.auto],
    readonly: false,
  },
  [FORM_NAMES.category]: {
    value: OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.others],
    readonly: false,
  },
};

function getCategoriesByTemplate(template: OFFER_TEMPLATES) {
  switch (template) {
    case OFFER_TEMPLATES.waivo1500:
    case OFFER_TEMPLATES.waivo2500:
    case OFFER_TEMPLATES.waivo5000:
      return [OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.propertyProtection]];
    default:
      return INIT_OFFER_CATEGORIES_OPTIONS;
  }
}

type GetFieldsParams = {
  protectionAmount: string | number;
};
function getFieldsByTemplate(
  template: OFFER_TEMPLATES,
  params?: GetFieldsParams,
): {[key in FORM_NAMES | EXTRA_PRICE_FORM_NAMES]?: TemplateField} {
  const fullDay = {
    ...availabilityDay,
    isAllDay: true,
    isChecked: true,
  };

  switch (template) {
    case OFFER_TEMPLATES.checkIn:
      return {
        ...INIT_FORM_FIELDS,
        [FORM_NAMES.picture]: {
          value: '004b35cbb43c4ba7ba3fc2e29ac403b7',
        },
        [FORM_NAMES.category]: {
          value: OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.checkInCheckOut],
        },
        [FORM_NAMES.title]: {
          value: i18n.t('early_check_in'),
        },
        [FORM_NAMES.description]: {
          value: i18n.t('enjoy_your_house_from_hours'),
        },
        [FORM_NAMES.priceType]: {
          value: PRICE_TYPE_OPTIONS.SINGLE_PRICE,
        },
        [FORM_NAMES.pricesItems]: {
          value: [
            {[PRICES_FIELD.price]: 6, [PRICES_FIELD.unit]: PRICE_UNITS_OPTIONS.PER_UNIT},
          ],
        },
        [FORM_NAMES.highlight]: {
          value: i18n.t('enter_at_time'),
        },
        [FORM_NAMES.duration]: {
          value: {
            [DAY_NAMES.everyday]: fullDay,
            [DAY_NAMES.monday]: fullDay,
            [DAY_NAMES.tuesday]: fullDay,
            [DAY_NAMES.wednesday]: fullDay,
            [DAY_NAMES.thursday]: fullDay,
            [DAY_NAMES.friday]: fullDay,
            [DAY_NAMES.saturday]: fullDay,
            [DAY_NAMES.sunday]: fullDay,
          },
        },
      };
    case OFFER_TEMPLATES.checkOut:
      return {
        ...INIT_FORM_FIELDS,
        [FORM_NAMES.picture]: {
          value: 'efc0f2604a7e4c19b26ccaf73089b5fe',
        },
        [FORM_NAMES.category]: {
          value: OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.checkInCheckOut],
        },
        [FORM_NAMES.title]: {
          value: i18n.t('late_check_out'),
        },
        [FORM_NAMES.description]: {
          value: i18n.t('leave_property_at_hours_later'),
        },
        [FORM_NAMES.priceType]: {
          value: PRICE_TYPE_OPTIONS.SINGLE_PRICE,
        },
        [FORM_NAMES.pricesItems]: {
          value: [
            {[PRICES_FIELD.price]: 6, [PRICES_FIELD.unit]: PRICE_UNITS_OPTIONS.PER_UNIT},
          ],
        },
        [FORM_NAMES.highlight]: {
          value: i18n.t('leave_at_time'),
        },
        [FORM_NAMES.duration]: {
          value: {
            [DAY_NAMES.everyday]: fullDay,
            [DAY_NAMES.monday]: fullDay,
            [DAY_NAMES.tuesday]: fullDay,
            [DAY_NAMES.wednesday]: fullDay,
            [DAY_NAMES.thursday]: fullDay,
            [DAY_NAMES.friday]: fullDay,
            [DAY_NAMES.saturday]: fullDay,
            [DAY_NAMES.sunday]: fullDay,
          },
        },
      };
    case OFFER_TEMPLATES.waivo1500:
    case OFFER_TEMPLATES.waivo2500:
    case OFFER_TEMPLATES.waivo5000:
      return {
        [FORM_NAMES.title]: {
          value: i18n.t(`damage_protection_price`, {
            price: params?.protectionAmount,
          }),
          readonly: true,
        },
        [FORM_NAMES.selectedHousings]: {
          value: undefined,
        },
        [FORM_NAMES.description]: {
          value: i18n.t('waivo_offer_description_value'),
          readonly: true,
        },
        [FORM_NAMES.priceType]: {
          value: PRICE_TYPE_OPTIONS.SINGLE_PRICE,
        },
        [FORM_NAMES.picture]: {
          value: 'dae9a366-7715-486a-b4d9-863f1941903d',
        },
        [FORM_NAMES.highlight]: {
          value: i18n.t('waivo_offer_highlight', {
            price: params?.protectionAmount,
          }),
          readonly: true,
        },
        [FORM_NAMES.supplier]: {
          value: {
            label: i18n.t('waivo'),
            value: null,
          },
          readonly: true,
        },
        [FORM_NAMES.confirmation_type]: {
          value: OFFER_CONFIRM_TYPE_OPTIONS[OFFER_CONFIRM_TYPES.manual],
          readonly: true,
        },
        [FORM_NAMES.category]: {
          value: OFFER_CATEGORIES_OPTIONS[OFFER_CATEGORIES.propertyProtection],
          readonly: true,
        },
        [EXTRA_PRICE_FORM_NAMES.feeToGuest]: {
          value: calcNetFeeWithCommissions(WAIVO_NET_FEE[template]),
          readonly: true,
        },
        [EXTRA_PRICE_FORM_NAMES.revenueToHost]: {
          value: 1,
          min: 1,
          max:
            100 -
            calcNetFeeWithCommissions(WAIVO_NET_FEE[template]) +
            WAIVO_REVENUE_HOST_MINIMUM,
        },
      };
    case OFFER_TEMPLATES.custom:
      return INIT_FORM_FIELDS;
    default:
      return INIT_FORM_FIELDS;
  }
}

export type OfferTemplate = {
  value: OFFER_TEMPLATES;
  fields: {[key in FORM_NAMES | EXTRA_PRICE_FORM_NAMES]?: TemplateField};
  availabilitySection: boolean;
  priceSection: boolean;
  categories: SelectOption[];
  housingsFilter?: {countries?: string[]};
  suppliersCategory?: SUPPLIER_CATEGORIES;
  templateDescription?: {text: string};
  currency?: string;
};
const OFFER_TEMPLATES_DATA: {[key in OFFER_TEMPLATES]: OfferTemplate} = {
  [OFFER_TEMPLATES.custom]: {
    value: OFFER_TEMPLATES.custom,
    fields: getFieldsByTemplate(OFFER_TEMPLATES.custom),
    categories: getCategoriesByTemplate(OFFER_TEMPLATES.custom),
    availabilitySection: true,
    priceSection: true,
  },
  [OFFER_TEMPLATES.checkIn]: {
    value: OFFER_TEMPLATES.checkIn,
    fields: getFieldsByTemplate(OFFER_TEMPLATES.checkIn),
    categories: getCategoriesByTemplate(OFFER_TEMPLATES.checkIn),
    availabilitySection: true,
    priceSection: true,
  },
  [OFFER_TEMPLATES.checkOut]: {
    value: OFFER_TEMPLATES.checkOut,
    fields: getFieldsByTemplate(OFFER_TEMPLATES.checkOut),
    categories: getCategoriesByTemplate(OFFER_TEMPLATES.checkOut),
    availabilitySection: true,
    priceSection: true,
  },
  [OFFER_TEMPLATES.waivo1500]: {
    value: OFFER_TEMPLATES.waivo1500,
    fields: getFieldsByTemplate(OFFER_TEMPLATES.waivo1500, {
      protectionAmount: '$1,500',
    }),
    categories: getCategoriesByTemplate(OFFER_TEMPLATES.waivo1500),
    availabilitySection: false,
    priceSection: false,
    housingsFilter: {countries: [COUNTRY_CODES.us]},
    suppliersCategory: SUPPLIER_CATEGORIES.special,
    templateDescription: {
      text: i18n.t('waivo_template_offer_description'),
    },
    currency: CURRENCIES_LABELS.usd,
  },
  [OFFER_TEMPLATES.waivo2500]: {
    value: OFFER_TEMPLATES.waivo2500,
    fields: getFieldsByTemplate(OFFER_TEMPLATES.waivo2500, {
      protectionAmount: '$2,500',
    }),
    categories: getCategoriesByTemplate(OFFER_TEMPLATES.waivo2500),
    availabilitySection: false,
    priceSection: false,
    housingsFilter: {countries: [COUNTRY_CODES.us]},
    suppliersCategory: SUPPLIER_CATEGORIES.special,
    templateDescription: {
      text: i18n.t('waivo_template_offer_description'),
    },
    currency: CURRENCIES_LABELS.usd,
  },
  [OFFER_TEMPLATES.waivo5000]: {
    value: OFFER_TEMPLATES.waivo5000,
    fields: getFieldsByTemplate(OFFER_TEMPLATES.waivo5000, {
      protectionAmount: '$5,000',
    }),
    categories: getCategoriesByTemplate(OFFER_TEMPLATES.waivo5000),
    availabilitySection: false,
    priceSection: false,
    housingsFilter: {countries: [COUNTRY_CODES.us]},
    suppliersCategory: SUPPLIER_CATEGORIES.special,
    templateDescription: {
      text: i18n.t('waivo_template_offer_description'),
    },
    currency: CURRENCIES_LABELS.usd,
  },
};

export {
  WAIVO_NET_FEE,
  OFFER_TEMPLATES_DATA,
  INTERNAL_SUPPLIER_OPTION,
  INIT_OFFER_CATEGORIES_OPTIONS,
  WAIVO_CHEKIN_COMMISSION,
  WAIVO_REVENUE_HOST_MINIMUM,
  availabilityDay,
  calcNetFeeWithCommissions,
};
