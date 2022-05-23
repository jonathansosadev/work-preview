import {SelectOption} from '../../../utils/types';
import {DAY_NAMES} from '../../../utils/constants';
import {PRICES_FIELD, UNIT_PRICE_TYPES} from '../../../utils/upselling';

export type PriceItemType = {
  [PRICES_FIELD.name]?: string;
  [PRICES_FIELD.unit]?: SelectOption<void, UNIT_PRICE_TYPES>;
  [PRICES_FIELD.price]?: number | string;
  [PRICES_FIELD.day]?: DAY_NAMES;
};
