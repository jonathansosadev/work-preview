import React from 'react';
import {
  LOCK_ACCESS_TYPES,
  CREDITOR_TYPES,
  SECURITY_DEPOSIT_STATUSES,
  AGGREGATED_RESERVATION_PAYMENTS_STATUSES,
  CURRENCIES,
  PAYMENT_PROVIDERS,
  UPSELLING_PAYMENTS_STATUS,
  HOUSING_VERIFICATION_TYPE,
  SECURITY_DEPOSIT_PROCESS_STATUSES,
  SUBSCRIPTION_PRODUCT_TYPES,
  SECURITY_DEPOSIT_DISPLAY_STATUSES,
  CUSTOM_DOCUMENTS_TYPES,
} from './constants';
import {
  GUESTS_REGISTER_RESERVATION_STATUS,
  IDENTITY_VERIFICATION_RESERVATION_STATUS,
  ONLINE_CHECKIN_RESERVATION_STATUS,
  PAYMENTS_RESERVATION_STATUS,
  POLICE_RESERVATION_STATUS,
  REMOTE_ACCESS_RESERVATION_STATUS,
  SECURITY_DEPOSIT_RESERVATION_STATUS,
  STATS_RESERVATION_STATUS,
  TAXES_RESERVATION_STATUS,
} from './newStatuses';
import {RESERVATION_PAYMENT_STATUSES} from '../components/dashboard/ReservationPayments';
import {BOOKING_FORM_FEES_NAMES} from 'components/dashboard/HousingBookingPaymentsSection';
import {FEES_OPTIONS_PAYLOAD} from '../components/dashboard/FeesOptions';
import {Moment} from 'moment';
export type ReactEntity = React.ReactNode | JSX.Element | string;

export type valueof<T> = T[keyof T];
export type InputEventType = React.ChangeEvent<HTMLInputElement>;
export type TextAreaEventType = React.ChangeEvent<HTMLTextAreaElement>;
export type FormEventType = React.FormEvent<HTMLFormElement>;
export type SelectOption<DataType = any, ValueType = string> = {
  label: any;
  value: ValueType;
  data?: DataType;
};
export type LinkOption = {
  label: string;
  link: {
    pathname: string;
    state: any;
  };
};
export type DatepickerDate = Date | number | null | undefined;
export type Country = {
  name: string;
  code: string;
  alpha_3: string;
};
export type Division = {
  code: string;
  name: string;
  type: string;
};
export type District = {
  country: Country;
  division_level_1: Division;
};
export type Province = District & {
  division_level_2: Division;
};
export type City = Province & {
  division_level_3: Division;
};
export type Status = 'loading' | 'error' | 'success' | 'idle';
export type PurposeOfStay = {
  id: string;
  name: string;
};
export type TaxExemption = {
  name: string;
  id: string;
  stat_type: string;
};
export type Room = {
  number: string;
  housing_id?: string;
  id?: string;
  external_id?: string;
  external_name?: string;
  building?: string;
  capacity?: number;
  double_beds?: number;
  guests?: Guest[];
  is_check_in_sent?: boolean;
  is_check_out_sent?: boolean;
  single_beds?: number;
  type?: string;
};

export type ExternalSource = {
  id?: string;
  housing?: string;
  type: string;
  url: string;
};

export type StatusDetails = {
  code: string;
  details: string;
  label: string;
  meaning: string;
};

export type Document = {
  back_side_scan: null | string;
  back_side_scan_download: null | string;
  back_side_scan_key: string;
  expiration_date: null | string;
  front_side_scan: null | string;
  front_side_scan_download: null | string;
  front_side_scan_key: string;
  id: string;
  issue_date: null | string;
  issue_place: any;
  number: string;
  type: string;
  type_str: string;
};

export type Guest = {
  arrived_from: any;
  biomatch_doc: string | null;
  biomatch_doc_download: string | null;
  biomatch_passed: boolean;
  biomatch_selfie: string | null;
  biomatch_selfie_download: string | null;
  birth_date: string;
  birth_place: any;
  citizenship: Country;
  created_at: string;
  document: Document;
  documents: Document[];
  document_passed: boolean;
  email: string;
  full_name: string;
  gender: string;
  id: string;
  ifa_status: string;
  is_use_in_contract: boolean;
  language: string;
  name: string;
  names: {name: string; surname: string};
  nationality: Country;
  next_destination: any;
  origin: string;
  phone: string;
  phone_details: {code: string; number: string};
  purpose_of_stay: string;
  residence: any;
  room: any;
  second_surname: string;
  signature: string | null;
  status: string;
  status_display: string;
  statuses: {
    police: {
      in: StatusDetails;
      out: StatusDetails;
    };
    statistics: {
      in: StatusDetails;
      out: StatusDetails;
    };
    data: StatusDetails;
    arrival: StatusDetails;
  };
  surname: string;
  tax_exemption: string;
  fiscal_code: string;
  full_tourist_tax: number | null;
};

export type GuestGroup = {
  id: string;
  leader_id: string;
  type: string;
  members: Guest[];
  number_of_guests: number;
};

export type Location = {
  name: string;
  address: string;
  city: string;
  country: Country;
  details: {
    division_level_1: any;
    division_level_2: any;
    division_level_3: any;
  };
  postal_code: string;
  full_address: string;
};

export type ReservationSource = {
  id: string;
  name: string;
};

export type ShortHousing = {
  checkin_online_sending_settings_id: string | null;
  default_email_language: string;
  upselling_payments_status: UPSELLING_PAYMENTS_STATUS;
  id: string;
  is_contract_enabled: boolean;
  is_self_online_check_in_enabled: boolean;
  is_stat_registration_enabled: boolean;
  is_auto_police_registration_enabled: boolean;
  rooms: Room[];
  seasons: string[];
  name: string;
  police_account?: {
    id: string;
  };
  police_account_id?: string;
  stat_account?: {
    delay: string;
    external_housing_id: string;
    external_location_id: string;
    id: string;
    local_send_time: string;
    password: string;
    send_mode: string;
    type: string;
    url: string;
    username: string;
  };
  location: Location;
  security_deposit_amount: string;
  security_deposit_status: SECURITY_DEPOSIT_STATUSES;
  reservation_payments_status: RESERVATION_PAYMENT_STATUSES;
  [BOOKING_FORM_FEES_NAMES.charge_fees_to_guest]: FEES_OPTIONS_PAYLOAD;
  commission_responsibility_for_tourist_tax: string;
  commission_responsibility_for_extra_service: string;
};

export type Housing = ShortHousing & {
  checkin_online_link: string;
  default_email_language: string;
  is_self_online_check_in_enabled: boolean;
  is_biometric_match_for_all_enabled: boolean;
  time_zone: string;
  external_sources: ExternalSource[];
  status_display: string;
  status: string;
  is_police_registration_enabled: boolean;
  is_stat_registration_enabled: boolean;
  is_capture_stat_fields_enabled: boolean;
  has_host_protection_insurance: boolean;
  host_protection_insurance_provider: string;
  readonly tax_exempt_sources_nested: ReservationSource[];
  readonly booking_exempt_sources_nested: ReservationSource[];
  readonly deposit_exempt_sources_nested: ReservationSource[];
  readonly extra_service_exempt_sources_nested: ReservationSource[];
  is_deactivated: boolean;
  is_smart_lock_enabled: boolean;
  verification_type: HOUSING_VERIFICATION_TYPE;
  origin: string;
  manager_origin: string;
  police_account?: {
    id: string;
  };
  stat_account?: {
    id: string;
  };
};

export type User = {
  payment_commission_for_user: number;
  company_name: string;
  are_any_payments_activated: boolean;
  payment_commission_for_guest: number;
  payment_commission_for_not_eu_guest: number;
  payment_commission_for_eu_guest: number;
  manager?: string;
  balance: number;
  is_taxes_or_deposits_activated: boolean;
  count_of_housings_to_import: number;
  count_of_reservations_to_import: number;
  checkin_online_sending_settings_id: string | null;
  created_at: string;
  delete_picture: null | string;
  is_police_registration_free: boolean;
  email: string;
  estimated_range_of_managed_properties: string;
  first_name: string;
  first_surname: string;
  groups: any[];
  guests_quantity: number;
  has_paid: boolean;
  has_seen_dashboard_instruction: boolean;
  has_seen_properties_page: boolean;
  has_seen_reservation_instruction: boolean;
  housings_quantity: number;
  id: string;
  is_active: boolean;
  is_icals_allowed: boolean;
  is_import_finished: boolean;
  is_integrated: boolean;
  is_subscription_required: boolean;
  is_trial: boolean;
  language: string;
  last_login: string;
  last_name: string;
  middle_name: string;
  name: string;
  origin: string;
  phone: string;
  phone_details: {
    code: string;
    number: string;
  };
  picture: {
    created_at: string;
    id: string;
    src: string;
  } | null;
  reservations_quantity: number;
  second_surname: string;
  segment: string;
  show_buttons_add_delete_import_housings: boolean;
  show_buttons_add_edit_delete_import_reservations: boolean;
  show_buttons_refresh_housings: boolean;
  show_buttons_refresh_reservations: boolean;
  show_importation_and_welcome_pop_ups: boolean;
  show_buttons_mapping: boolean;
  show_buttons_add_edit_delete_reservations: boolean;
  show_button_import_reservations: boolean;
  have_manually_refresh_token_possibility: boolean;
  show_add_housing_modal: boolean;
  subscription_quantity: string;
  subscription_status: string;
  subscription_type: string;
  surname: string;
  want_see_reservation_instruction: boolean;
  want_see_upselling_instructions: boolean;
  is_payments_activated: boolean;
  import_status:
    | 'IMPORT_STARTED'
    | 'WAITING_FOR_MAPPING'
    | 'MAPPING_TASK_SENT'
    | 'MAPPING_IN_PROGRESS'
    | 'IMPORT_FINISHED'
    | 'SYNC_TASK_SENT';
  currency: CURRENCIES;
  is_beta_tester: boolean;
  upselling_commission: number;
};

export type UserBusinessInformation = {
  additional_information: string;
  company_legal_name: string;
  has_agreed_with_terms_and_conditions: boolean;
  mailing_address: string;
  phone: string;
  primary_contact_email: string;
  primary_contact_name: string;
};

type SecurityDeposit = {
  id: string;
  charged_amount: number;
  status: SECURITY_DEPOSIT_PROCESS_STATUSES;
  display_status: SECURITY_DEPOSIT_DISPLAY_STATUSES;
  amount: string;
  auth_code: string;
  customer_id: string;
  payment_external_id: string;
  external_id: string;
  guest_payment_account: GuestPaymentAccount;
  guest_payment_account_id: string;
  ip_address: string;
  is_holding_expired: boolean;
  is_complete: boolean;
};

type PaymentRefund = {
  id: string;
  status: 'NEW' | 'CONFIRMED' | 'PARTIALLY' | 'REJECTED';
  requested_amount: string;
  approved_amount: string;
  status_details: string;
  ip_address: string;
  reservation_id: string;
};

export type Reservation = {
  is_security_deposit_activated: boolean;
  complete_status: 'INCOMPLETE' | 'COMPLETE';
  security_deposit_amount: string;
  security_deposit: null | SecurityDeposit;
  payment_refund: null | PaymentRefund;
  manuallyUpdated?: boolean;
  have_taxes_been_paid: boolean;
  have_payments_been_paid: boolean;
  checkin_online_emails_sent: number;
  housing: Housing;
  check_in_date: string;
  check_out_date: string;
  aggregated_status: string;
  assigned_to: string;
  created_at: string;
  currency: string;
  default_invite_email: string;
  default_leader_full_name: string;
  deposit: null;
  external_id: string;
  external_room_id: string;
  fee: null;
  guest_group: GuestGroup;
  id: string;
  max_nights_taxable: number | null;
  nights_exempted: number | null;
  nights_of_stay: number;
  nights_taxable: number | null;
  occupied_rooms_quantity: number;
  origin: string;
  people_exempted: number | null;
  people_taxable: number | null;
  price: number | null;
  rooms_data: Room;
  should_be_paid_on_chekin_online: boolean;
  signup_form_link: string;
  status: string;
  status_display: string;
  status_invite_email_sending: string | null;
  status_invite_email_sending_display: string | null;
  tax: number | null;
  total_nights: number | null;
  aggregated_payments_status: AGGREGATED_RESERVATION_PAYMENTS_STATUSES;
  id_verification_retry_link: string;
  all_guests_passed_biomatch: boolean;
  booking_reference: string;
};

export type PoliceAccount = {
  delay: string;
  certificate_password: string;
  establishment_number: string;
  external_id: string;
  external_name: string;
  id: string;
  local_send_time: string;
  password: string;
  type: string;
  url: string;
  username: string;
  username_type: string;
};

export type PoliceReceipt = {
  housing: string;
  id: string;
  owner: string;
  police_type: string;
  protocol_date: string;
  protocol_number: string;
  registered_guests_num: number;
};

export type StatReceipt = {
  date: string;
  housing: string;
  id: string;
  owner: string;
  stat_type: string;
};

export type Contract = {
  check_in_date: string;
  created_at: string;
  data: Reservation;
  file: string;
  housing: string;
  id: string;
  leader: string;
  leader_name: string;
  manager: string;
  reservation: string;
  status: Status;
  status_details: StatusDetails | null;
  updated_at: string;
};

export type Guestbook = {
  book_num: number;
  created_by_task_id: string;
  ending_date: string;
  file: string;
  housing: string;
  housing_name: string;
  manager_email: string;
  pages_num: number;
  starting_date: string;
  starting_num: number;
  total_books_num: number;
};

export type GuestbookSettings = {
  housing: string;
  starting_num: number;
};

export type PeriodItem = {
  plan: string;
  product: string;
  quantity: number;
  interval: string;
};

export type Subscription = {
  type: string;
  quantity_allowed: number;
  quantity_used: number;
  current_accommodations_qty: {[key in SUBSCRIPTION_PRODUCT_TYPES]: number};
  current_period_items: PeriodItem[];
  next_period_items: PeriodItem[];
  coupon: string | null;
  stripe_id: string;
  cancellation_date?: any;
  scheduled_to_cancel: boolean;
  credit_card_last4: string;
  currency: string;
  customer: string;
  customer_stripe_id: string;
  description: string;
  has_credit_card: boolean;
  id: string;
  is_payment_action_required: boolean;
  last_status: string;
  pay_link: string;
  status: string;
  trial_end_epoch: string;
};

export type Plan = {
  id: string;
  interval: string;
  type: string;
  name: string;
  unique_id: string;
  amount: number;
  amount_with_tax: number;
  product: SUBSCRIPTION_PRODUCT_TYPES;
  currency: CURRENCIES;
  is_free: boolean;
  quantity: number;
};

export type Card = {
  brand: string;
  country: string;
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string;
  last4: string;
};

export type BillingDetails = {
  name: string;
  address: {
    city: string;
    country: string;
    line1: string;
    line2: string;
    postal_code: string;
    state?: string;
  };
  tax_id: TaxId;
};

export type PaymentMethod = {
  card: Card;
  billing_details: BillingDetails;
  created: number;
  customer: string;
  id: string;
  livemode: boolean;
  metadata: any;
  object: string;
  type: string;
};

export type TaxId = {
  id: string;
  object: string;
  country: string;
  created: number;
  livemode: boolean;
  type: string;
  value: string;
};

export type Group = {
  name: string;
};

export type EntryForm = {
  created_at: string;
  data: Reservation;
  file: null | string;
  guest: string;
  housing: string;
  id: string;
  police_check_in_at: null | string;
  reservation: string;
  sequence_number: number;
  status: string;
  status_details: null | string;
  updated_at: string;
};

export type ServiceHousing = {
  id: string;
  external_id: string;
  core_housing_id: string | null;
  core_room_id: string;
  name: string;
  isLoading?: boolean;
};

export type EmailStatistics = {
  success: number;
  error: number;
  overall: number;
};

export type LightReservation = {
  checkin_online_sending_settings_id: string;
  complete_status: 'INCOMPLETE' | 'COMPLETE';
  is_security_deposit_activated: boolean;
  security_deposit_amount: string;
  security_deposit: null | SecurityDeposit;
  payment_refund: null | PaymentRefund;
  manuallyUpdated?: boolean;
  checkin_online_emails_sent: number;
  check_in_date: string;
  check_out_date: string;
  aggregated_status: string;
  have_taxes_been_paid: boolean;
  have_payments_been_paid: boolean;
  assigned_to: string;
  created_at: string;
  currency: string;
  default_invite_email: string;
  default_leader_full_name: string;
  default_email_language: string;
  default_phone_number: string;
  source_name?: string;
  default_phone_number_details: {
    code: string;
    number: string;
  };
  deposit: null;
  external_id: string;
  external_room_id: string;
  fee: null;
  guest_group_id: string;
  id: string;
  housing_id: string;
  max_nights_taxable: number | null;
  nights_exempted: number | null;
  nights_of_stay: number;
  nights_taxable: number | null;
  occupied_rooms_quantity: number;
  origin: string;
  people_exempted: number | null;
  people_taxable: number | null;
  price: number | null;
  rooms_data: Room;
  should_be_paid_on_chekin_online: boolean;
  signup_form_link: string;
  status: string;
  status_display: string;
  status_invite_email_sending: string | null;
  status_invite_email_sending_display: string | null;
  tax: number | null;
  total_nights: number | null;
  room_id?: string | null;
  is_auto_checkin_online_disabled: boolean;
  already_paid_amount: string | number;
  due_amount_to_pay: string | number;
  total_amount_to_pay: number;
  payment_link: string;
  upselling_link: string;
  aggregated_payments_status: AGGREGATED_RESERVATION_PAYMENTS_STATUSES;
  is_self_online_check_in_enabled: boolean;
  id_verification_retry_link: string;
  all_guests_passed_biomatch: boolean;
  damage_insurance_status: null | string;
  booking_reference: string;
};

export type ReservationStatusesDetails = {
  id: string;
  housing_name: string;
  guest_leader_name: string;
  check_in_date: string;
  guests: string;
  status_complete: 'INCOMPLETE' | 'COMPLETE';
  guest_registration_status: GUESTS_REGISTER_RESERVATION_STATUS;
  online_check_in_status: ONLINE_CHECKIN_RESERVATION_STATUS;
  identity_verification_status: IDENTITY_VERIFICATION_RESERVATION_STATUS;
  remote_access_status: REMOTE_ACCESS_RESERVATION_STATUS;
  payment_status: PAYMENTS_RESERVATION_STATUS;
  tax_status: TAXES_RESERVATION_STATUS;
  deposit_status: SECURITY_DEPOSIT_RESERVATION_STATUS;
  police_status: POLICE_RESERVATION_STATUS;
  statistics_status: STATS_RESERVATION_STATUS;
};

export type DocumentReport = {
  created_at: string;
  fields_set: string[];
  from_date: string;
  id: string;
  owner_email: string;
  to_date: string;
  updated_at: string;
};

export type ReportFieldsAndDate = {
  from_date: string | undefined;
  to_date: string | undefined;
  fields_set: string[];
};

export type LockUser = {
  account_name: string;
  id: string;
  password: string;
  token: string;
  username: string;
  vendor: string;
};

export type Lock = {
  id: string;
  type: string;
  external_id: string;
  housing: string;
  user: string;
  name: string;
  access_code?: string;
  access_type?: LOCK_ACCESS_TYPES;
  room_id?: string;
  room_number?: string;
  vendor: string;
};

export type UnlockLink = {
  collection_code: string;
  has_expired: boolean;
  id: string;
  lock_id: string;
  pass_code: string;
  reservation_id: string;
  token: string;
  unlock_link: string;
  valid_from: string;
  valid_through: string;
};

export type TaxRate = {
  active: boolean;
  created: number;
  description: null | string;
  display_name: string;
  id: string;
  inclusive: boolean;
  jurisdiction: null | string;
  livemode: boolean;
  metadata: {};
  object: string;
  percentage: number;
};

export type Coupon = {
  amount_off: null | number;
  coupon: string;
  created: number;
  currency: null | string;
  duration: string;
  duration_in_months: null | number;
  id: string;
  livemode: boolean;
  max_redemptions: null | string;
  metadata: {};
  name: string;
  object: string;
  percent_off: number;
  redeem_by: null | string;
  times_redeemed: number;
  valid: boolean;
};

export type Discount = {
  coupon: Coupon | null;
  customer: string;
  end: null | string;
  id: string;
  invoice: null | string;
  invoice_item: null | string;
  object: string;
  promotion_code: null | number;
  start: number;
  subscription: string;
};

export type LineItemPlan = {
  active: boolean;
  aggregate_usage: null | string;
  amount: number;
  amount_decimal: string;
  billing_scheme: string;
  created: number;
  currency: string;
  id: string;
  interval: string;
  interval_count: number;
  livemode: boolean;
  metadata: {};
  nickname: string;
  object: string;
  product: string;
  tiers: null | string;
  tiers_mode: null | string;
  transform_usage: null | string;
  trial_period_days: number;
  usage_type: string;
};

export type LineItemPrice = {
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  id: string;
  livemode: boolean;
  lookup_key: null | string;
  metadata: {};
  nickname: string;
  object: string;
  product: string;
  recurring: {
    aggregate_usage: null | string;
    interval: string;
    interval_count: number;
    trial_period_days: number;
    usage_type: string;
  };
  tiers_mode: null;
  transform_quantity: null;
  type: string;
  unit_amount: number;
};

export type LineItem = {
  amount: number;
  currency: string;
  description: string;
  discount_amounts: {
    amount: number;
    discount: string;
  }[];
  discountable: boolean;
  discounts: string[];
  id: string;
  livemode: boolean;
  metadata: {};
  object: string;
  period: {end: number; start: number};
  plan: LineItemPlan;
  price: LineItemPrice;
  proration: boolean;
  quantity: number;
  subscription: string;
  subscription_item: string;
  tax_amounts: {amount: number; inclusive: boolean; tax_rate: string}[];
  tax_rates: string[];
  type: string;
  unique_id: string;
};

export type Invoices = {
  account_country: string;
  account_name: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  application_fee_amount: number | null;
  attempt_count: number;
  attempted: boolean;
  billing: string;
  billing_reason: string;
  charge: null | number;
  collection_method: string;
  created: number;
  currency: string;
  custom_fields: null | string[];
  customer: string;
  customer_address: null | string;
  customer_email: string;
  customer_name: null | string;
  customer_phone: null | string;
  customer_shipping: null | string;
  customer_tax_exempt: string;
  customer_tax_ids: string[];
  default_payment_method: null | string;
  default_source: null | string;
  default_tax_rates: TaxRate[];
  description: string;
  discount: Discount;
  discounts: string[];
  due_date: null | string;
  ending_balance: number;
  footer: null | string;
  lines: {
    has_more: boolean;
    object: string;
    total_count: number;
    url: string;
    data: LineItem[];
  };
  livemode: boolean;
  metadata: {};
  next_payment_attempt: number;
  number: string;
  object: string;
  paid: boolean;
  payment_intent: null | any;
  period_end: number;
  period_start: number;
  post_payment_credit_notes_amount: number;
  pre_payment_credit_notes_amount: number;
  receipt_number: null | number;
  starting_balance: number;
  statement_descriptor: null | string;
  status: string;
  status_transitions: {
    finalized_at: null | string;
    marked_uncollectible_at: null | number;
    paid_at: null | number;
    voided_at: null | number;
  };
  subscription: string;
  subtotal: number;
  tax: number;
  tax_percent: number;
  total: number;
  total_discount_amounts: {
    amount: number;
    discount: string;
  }[];
  total_tax_amounts: {amount: number; inclusive: boolean; tax_rate: string}[];
  transfer_data: null;
  webhooks_delivered_at: null;
};

export type PlanTotalPrice = {
  currency: string;
  price: number;
  price_with_tax: number;
  quantity: number;
};

export type CurrentItemsInCurrency = {
  total_price_in_currency: number;
  items_in_currency: Plan[];
};

export type ExternalLock = {
  name: string;
  id: string;
};

export type TempLock = {
  name: string;
  type: string;
  access_type?: LOCK_ACCESS_TYPES;
  room_id?: string;
  room_number?: string;
  [key: string]: any;
};

export type AccessProvider = {
  type: string;
  logoSrc?: string;
  descriptionText?: string;
  status: string;
  name: string;
  id?: string;
};

export type GuestReport = {
  created_at: string;
  fields_set: string[];
  from_date: string;
  id: string;
  owner_email: string;
  to_date: string;
  updated_at: string;
};

export type SeasonRule = {
  id: string;
  less_than: null | number;
  price?: null | number;
  percent?: null | number;
  season_id: string;
  up_to: null | number;
};

export type Exemption = {
  exemption_type: string;
  id: string;
  price?: null | number;
  percent?: null | number;
  season_id: string;
};

export type SeasonLink = {
  housing_id: string;
  id: string;
  season_id: string;
};

export type Season = {
  exemptions: Exemption[];
  price_per_night: number;
  from_date: string;
  housings: string[];
  id: string;
  is_by_percent: boolean;
  percentage_per_booking: string;
  is_max_nights_taxed: boolean;
  max_nights: number | null;
  max_nights_rate: number | null;
  name: string;
  rules: SeasonRule[];
  season_links: SeasonLink[];
  to_date: string;
  has_departmental_tax: boolean;
  has_region_tax: boolean;
  municipal_percentage: number;
  municipal_tariff: number;
  is_classified: boolean;
};

export type PaymentDocument = {
  back_side_scan: null | string;
  expiration_date: null | string;
  front_side_scan: string;
  guest: null | string;
  id: string;
  issue_date: null | string;
  issue_place: {
    address: string;
    city: string;
    community: string;
    comune: string;
    country: string;
    district: string;
    division_level_1: string;
    division_level_2: string;
    division_level_3: string;
    municipality: string;
    postal_code: string;
    province: string;
    region: string;
  };
  number: string;
  type: string;
  url: string;
};

export enum PAYMENTS_SETTINGS_STATUSES {
  new = 'NEW',
  validating = 'VALIDATING',
  valid = 'VALID',
  invalid = 'INVALID',
  fillingInProgress = 'FILLING_IN_PROGRESS',
  waitForFilling = 'PAYMENTS_SETTINGS_WAIT_FOR_FILLING',
  detailsSubmitted = 'DETAILS_SUBMITTED',
  fillingFinished = 'FILLING_FINISHED',
  readyForValidation = 'READY_FOR_VALIDATION',
}

export type PaymentsSettings = {
  company_name: string;
  creditor_type: CREDITOR_TYPES;
  documents: PaymentDocument[];
  iban: string;
  id: string;
  provider: PAYMENT_PROVIDERS;
  status: PAYMENTS_SETTINGS_STATUSES;
  status_details: string;
  swift: string;
  currency: CURRENCIES;
  vat_percentage: number;
};

export enum PaymentMovementType {
  writeOff = 'WRITE_OFF',
  accrual = 'ACCRUAL',
  refund = 'REFUND',
}
export enum PaymentType {
  reservationTaxes = 'RESERVATION_TAXES',
  reservationGeneral = 'RESERVATION_GENERAL',
  reservationSecurityDeposit = 'RESERVATION_SECURITY_DEPOSIT',
}
export type PaymentMovement = {
  amount: number;
  amount_without_taxes: number;
  created_at: string;
  created_at_date: string;
  id: string;
  type: PaymentMovementType;
  payment_type?: PaymentType;
  housing_name?: string;
  guest_name?: string;
};

export type PaymentsMovements = {
  [key: string]: PaymentMovement[];
};

export type PaymentGuestList = {age: number; exemption: string}[];

export type GuestPayment = {
  amount: number;
  calculate_only: boolean;
  guest_list: PaymentGuestList;
  id: string;
  reservation_id: string;
};

export type GuestPaymentAccount = {
  external_id: string;
  id: string;
  provider: 'PAYCOMET';
  reservation_id: string;
  status: 'NEW' | 'CONFIRMED' | 'REJECTED';
  status_details: string;
  temporary_token: string;
  token: string;
};

export type PropertieConection = AccessProvider;

export type CustomField = {
  field_type: string;
  id: string;
  is_custom: boolean;
  is_required: boolean;
  name: string;
  names: {[key: string]: string}[];
  placeholders: {[key: string]: string}[];
};

export type CustomForm = {
  country: string;
  fields_set: {
    form_id: string;
    id: string;
    order: number;
    is_required: boolean;
    is_leaders_field: boolean;
    field: CustomField;
  }[];
  housings: string[];
  id: string;
  name: string;
};

export type HousingExemption = Readonly<{
  id: string;
  tax_exempt_sources_nested: ReservationSource[];
  booking_exempt_sources_nested: ReservationSource[];
  deposit_exempt_sources_nested: ReservationSource[];
  extra_service_exempt_sources_nested: ReservationSource[];
}>;

export type QueryKey<T> = {queryKey: T};

export type Paginated<Result = any> = {
  count: number;
  next: null | string;
  previous: null | string;
  results: Result[];
};

export type FormMoment = any;

export type LanguageOption = {
  value: string;
  label: string;
  iso2: string;
};

export type CoreError = {
  code: string;
  message: string;
  status_code: number;
  errors: {code: number; field: string; message: string}[];
};

export type UpsellingBannersInfo = {
  id: string;
  user: string;
  try_now_banner_status: 'ACTIVE' | 'INACTIVE';
  try_now_banner_last_shown_at: Date | Moment;
  created_at: string;
  updated_at: string;
};

export type SuperHogHousing = {
  addressLine1: string;
  addressLine2: string;
  country: string;
  friendlyName: string;
  id: number;
  numberOfBedrooms: number;
  postcode: string;
  town: string;
  selected?: SelectOption;
  is_self_online_check_in_enabled?: boolean;
};

export type SuperHogChekinHousing = {
  external_id: string;
  housing: string;
  id?: string;
};

export type CustomDocument = {
  type: CUSTOM_DOCUMENTS_TYPES;
  name: string;
  title: string;
  text_format: string;
  html_format: string;
  housings: string[];
  country: string | Country;
  id: string;
  is_active: boolean;
  user_email: string;
  user_id: string;
  created_at: string;
};
