import React from 'react';
import {CURRENCIES} from './constants';
import {PAYMENT_PROVIDERS} from './constants';

export type valueof<T> = T[keyof T];
export type InputEventType = React.ChangeEvent<HTMLInputElement>;
export type FormEventType = React.FormEvent<HTMLFormElement>;
export type SelectOptionType = {
  value: string | number;
  label: string | JSX.Element | React.ReactNode;
};
export type Country = {
  name: string;
  code: string;
  alpha_3: string;
};
export type Status = 'loading' | 'error' | 'success' | 'idle';
export type DatepickerDateType = Date | number | null | undefined;

export type StatusDetails = {
  code: string;
  details: string;
  label: string;
  meaning: string;
};

export type Guest = {
  arrived_from: any;
  biomatch_doc: string | null;
  biomatch_passed: boolean;
  biomatch_selfie: string | null;
  document_passed: boolean;
  birth_date: string;
  birth_place: any;
  citizenship: Country;
  created_at: string;
  document: any;
  documents: any[];
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

export type SeasonRule = {
  id: string;
  less_than: null | number;
  price: number;
  season_id: string;
  up_to: null | number;
};

export type Exemption = {
  exemption_type: string;
  id: string;
  price: number;
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
  is_max_nights_taxed: boolean;
  max_nights: number | null;
  max_nights_rate: number | null;
  name: string;
  rules: SeasonRule[];
  season_links: SeasonLink[];
  to_date: string;
};

enum CREDITOR_TYPES {
  individual = 'INDIVIDUAL',
  freelance = 'FREELANCE',
  company = 'COMPANY',
}

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
}

export type PaymentsSettings = {
  balance: number;
  company_name: string;
  external_account_id: string;
  creditor_type: CREDITOR_TYPES;
  documents: PaymentDocument[];
  iban: string;
  id: string;
  provider: PAYMENT_PROVIDERS;
  status: PAYMENTS_SETTINGS_STATUSES;
  status_details: string;
  swift: string;
  currency: CURRENCIES;
};

export type LanguageOption = SelectOptionType & {icon: string};

export type ReservationSource = {
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

export enum DAY_NAMES {
  monday = 'MON',
  tuesday = 'TUE',
  wednesday = 'WED',
  thursday = 'THU',
  friday = 'FRI',
  saturday = 'SAT',
  sunday = 'SUN',
}

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

type SecurityDeposit = {
  id: string;
  charged_amount: number;
  status: 'NEW' | 'CANCELED' | 'RELEASED' | 'CONFIRMED';
  amount: string;
  auth_code: string;
  guest_payment_account: GuestPaymentAccount;
  guest_payment_account_id: string;
  ip_address: string;
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

export type GuestGroup = {
  id: string;
  leader_id: string;
  type: string;
  members: Guest[];
  number_of_guests: number;
};

export enum HOUSING_VERIFICATION_TYPE {
  mandatoryDocumentAndSelfie = 'MANDATORY_DOCUMENT_AND_SELFIE',
  mandatoryDocumentOnly = 'MANDATORY_DOCUMENT_ONLY',
  optionalDocumentAndSelfie = 'OPTIONAL_DOCUMENT_AND_SELFIE',
  optionalDocumentOnly = 'OPTIONAL_DOCUMENT_ONLY',
}

export type Reservation = {
  is_security_deposit_activated: boolean;
  complete_status: 'INCOMPLETE' | 'COMPLETE';
  security_deposit_amount: string;
  security_deposit: null | SecurityDeposit;
  payment_refund: null | PaymentRefund;
  manuallyUpdated?: boolean;
  have_taxes_been_paid: boolean;
  checkin_online_emails_sent: number;
  housing: any;
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
  should_be_paid_on_chekin_online: boolean;
  signup_form_link: string;
  status: string;
  status_display: string;
  status_invite_email_sending: string | null;
  status_invite_email_sending_display: string | null;
  tax: number | null;
  total_nights: number | null;
  all_guests_passed_biomatch: string;
  id_verification_retry_link?: string;
};
