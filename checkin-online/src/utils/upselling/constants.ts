enum OFFER_PRICE_TYPES {
  single = 'SINGLE_PRICE',
  multiple = 'MULTIPLE_PRICE',
  dateTime = 'DATA_AND_TIME_RANGE_PRICE',
}

enum OFFER_PRICES_FIELD {
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

enum OFFER_CONFIRMATION_TYPES {
  auto = 'AUTO',
  manual = 'MANUAL',
}

enum OFFER_CATEGORIES {
  checkInCheckOut = 'CHECK_IN_CHECK_OUT',
  transportation = 'TRANSPORTATION',
  other = 'OTHER',
}

export {
  OFFER_PRICE_TYPES,
  OFFER_PRICES_FIELD,
  UNIT_PRICE_TYPES,
  DEAL_STATUSES,
  OFFER_CONFIRMATION_TYPES,
  OFFER_CATEGORIES,
};
