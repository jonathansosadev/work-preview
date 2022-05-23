import {
  DEAL_STATUSES,
  OFFER_CATEGORIES,
  OFFER_CONFIRMATION_TYPES,
  OFFER_PRICE_TYPES,
  OFFER_PRICES_FIELD,
  UNIT_PRICE_TYPES,
} from './constants';
import {DAY_NAMES} from '../types';

export type Supplier = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  phone_number_details: {code: string; number: string};
};

export type PriceItem = {
  id: string;
  quantity?: number;
  [OFFER_PRICES_FIELD.name]?: string;
  [OFFER_PRICES_FIELD.unit]?: UNIT_PRICE_TYPES;
  [OFFER_PRICES_FIELD.price]?: number | string;
  [OFFER_PRICES_FIELD.day]?: DAY_NAMES;
};

export type RequestedItems = {
  item: string;
  quantity: number;
};

export type Offer = {
  id: string;
  title: string;
  highlight: string;
  description: string;
  is_active: boolean;
  price_type: OFFER_PRICE_TYPES;
  confirmation_type: OFFER_CONFIRMATION_TYPES;
  category: OFFER_CATEGORIES;
  housings_ids: string[];
  items: PriceItem[];
  availability: {
    quantity: number;
    duration_availabilities: {
      weekday:
        | DAY_NAMES.monday
        | DAY_NAMES.tuesday
        | DAY_NAMES.wednesday
        | DAY_NAMES.thursday
        | DAY_NAMES.friday
        | DAY_NAMES.saturday
        | DAY_NAMES.sunday;
      hours_start: string;
      hours_end: string;
      is_all_day: boolean;
    }[];
  };
  offer_image?: {
    name: string;
    category: string;
    image: string;
    id: string;
    user_id: string | null;
  };
  supplier?: string;
};

export type Deal = {
  core_guest_id: string;
  core_guest_name: string;
  core_housing_id: string;
  core_housing_name: string;
  core_reservation_id: string;
  guest_email: string;
  guest_payment: string;
  id: string;
  offer: Offer;
  offer_id: string;
  paid_at?: string;
  paid_at_date?: string;
  quantity: number;
  reservation_payment?: unknown;
  status: DEAL_STATUSES;
  supplier_name: string;
  requested_for_date: string;
  requested_for_time: string;
  requested_for: string;
  number_of_people: number;
  requested_items: RequestedItems[];
};
