import {Moment} from 'moment';
import {
  DEAL_STATUSES,
  OFFER_CATEGORIES,
  OFFER_CONFIRM_TYPES,
  OFFER_TEMPLATES,
  PRICE_TYPES,
  PRICES_FIELD,
  SUPPLIER_CATEGORIES,
  UNIT_PRICE_TYPES,
} from './constants';
import {DAY_NAMES} from '../constants';
import {OfferPicture} from '../../components/dashboard/PictureLibraryModal/PictureLibraryModal';

export type Supplier = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  phone_number_details: {code: string; number: string};
  can_be_deleted: boolean;
  is_editable: boolean;
  is_hide: boolean;
  category: SUPPLIER_CATEGORIES;
};

type PriceItem = {
  [PRICES_FIELD.name]?: string;
  [PRICES_FIELD.unit]?: UNIT_PRICE_TYPES;
  [PRICES_FIELD.price]?: number | string;
  [PRICES_FIELD.day]?: DAY_NAMES;
};

export type Offer = {
  id: string;
  title: string;
  highlight: string;
  description: string;
  is_active: boolean;
  price_type: PRICE_TYPES;
  revenue_to_host: string | number;
  fee_to_guest: string | number;
  net_fee: string | number;
  confirmation_type: OFFER_CONFIRM_TYPES;
  category: OFFER_CATEGORIES;
  housings_ids: string[];
  template: OFFER_TEMPLATES;
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
  items?: PriceItem[];
  offer_image?: OfferPicture;
  supplier?: string;
  supplier_name?: string;
  pricing_policy_values?: any;
  extra_detailed_price: {
    provider_fee?: string | number;
    app_fee?: string | number;
    user_revenue?: string | number;
    insurance_amount?: string | number;
  };
};

export type Deal = {
  core_guest_id: string;
  core_guest_name: string;
  core_housing_id: string;
  core_housing_name: string;
  core_reservation_id: string;
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
  requested_for: string;
  requested_for_date: string;
  requested_for_time: string;
  number_of_people: number;
};

export type UpsellingBannersInfo = {
  id: string;
  user: string;
  try_now_banner_status: 'ACTIVE' | 'INACTIVE';
  try_now_banner_last_shown_at: Date | Moment;
  created_at: string;
  updated_at: string;
};
