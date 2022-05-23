enum SEARCH_RESERVATION_FORM_NAMES {
  booking_reference = 'booking_reference',
  lead_email = 'default_invite_email',
  check_in_date = 'check_in_date',
  check_out_date = 'check_out_date',
}

enum MOBILE_SEARCH_STEPS {
  bookingReference = 1,
  dateAndEmail = 2,
}

export {SEARCH_RESERVATION_FORM_NAMES, MOBILE_SEARCH_STEPS};
