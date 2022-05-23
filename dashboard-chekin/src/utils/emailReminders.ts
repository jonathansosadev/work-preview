type ReminderOptions = {
  default: {[key: string]: string};
  isPaymentsActive: {[key: string]: string};
  isIdentVerifyLeadGuestActive: {[key: string]: string};
  isIdentVerifyAllGuestActive: {[key: string]: string};
  isIdentVerifyLeadWithPaymentsActive: {[key: string]: string};
  isIdentVerifyAllGuestsWithPaymentsActive: {[key: string]: string};
};

export const LOCK_REMINDER_OPTIONS = {
  default: {
    is_sending_after_reservation_created_enabled:
      'is_smart_lock_email_after_reservation_created_enabled',
    is_sending_one_week_before_check_in_enabled:
      'is_smart_lock_email_one_week_before_check_in_enabled',
    is_sending_72_hours_before_check_in_enabled:
      'is_smart_lock_email_72_hours_before_check_in_enabled',
    is_sending_48_hours_before_check_in_enabled:
      'is_smart_lock_email_48_hours_before_check_in_enabled',
    is_sending_24_hours_before_check_in_enabled:
      'is_smart_lock_email_24_hours_before_check_in_enabled',
    is_sending_all_guest_have_been_registered:
      'is_smart_lock_email_after_all_guests_registered_enabled',
    is_sending_lead_guest_have_been_registered:
      'is_smart_lock_email_after_lead_guest_registered_enabled',
  },
  isPaymentsActive: {
    is_sending_after_all_payments_complete_enabled:
      'is_smart_lock_email_after_all_payments_complete',
    is_smart_lock_email_all_payment_and_all_guests_registered:
      'is_smart_lock_email_all_payment_and_all_guests_registered',
  },
  isIdentVerifyLeadGuestActive: {
    is_sending_lead_guest_have_been_identified:
      'is_smart_lock_email_after_lead_guest_passed_biomatch_enabled',
  },
  isIdentVerifyAllGuestActive: {
    is_sending_all_guests_have_been_identified:
      'is_smart_lock_email_after_all_guests_passed_biomatch_enabled',
  },
  isIdentVerifyLeadWithPaymentsActive: {
    is_smart_lock_email_all_payment_and_lead_guests_identified:
      'is_smart_lock_email_all_payment_and_lead_guests_identified',
  },
  isIdentVerifyAllGuestsWithPaymentsActive: {
    is_smart_lock_email_all_payment_and_all_guests_identified:
      'is_smart_lock_email_all_payment_and_all_guests_identified',
  },
};

const CUSTOM_FORMS_REMINDER_OPTIONS = {
  default: {
    is_sending_after_reservation_created_enabled:
      'sending_settings.is_sending_after_reservation_created_enabled',
    is_sending_all_guest_have_been_registered:
      'sending_settings.is_sending_after_all_guests_registered_enabled',
    is_sending_one_week_before_check_in_enabled:
      'sending_settings.is_sending_one_week_before_check_in_enabled',
    is_sending_72_hours_before_check_in_enabled:
      'sending_settings.is_sending_72_hours_before_check_in_enabled',
    is_sending_48_hours_before_check_in_enabled:
      'sending_settings.is_sending_48_hours_before_check_in_enabled',
    is_sending_24_hours_before_check_in_enabled:
      'sending_settings.is_sending_24_hours_before_check_in_enabled',
    is_sending_on_check_in_enabled: 'sending_settings.is_sending_on_check_in_enabled',
    is_sending_on_check_out_enabled: 'sending_settings.is_sending_on_check_out_enabled',
  },
  isPaymentsActive: {
    is_sending_after_all_payments_complete_enabled:
      'sending_settings.is_sending_after_all_payments_complete_enabled',
  },
  isIdentVerifyLeadGuestActive: {
    is_sending_lead_guest_have_been_identified:
      'sending_settings.is_sending_after_lead_guest_passed_biomatch_enabled',
  },
  isIdentVerifyAllGuestActive: {},
  isIdentVerifyLeadWithPaymentsActive: {},
  isIdentVerifyAllGuestsWithPaymentsActive: {},
};

interface BuildReminderOptions {
  isIdentityVerificationAllGuests?: boolean;
  isIdentityVerificationActive?: boolean;
  isPaymentsActive?: boolean;
}

function buildReminderOptionsIfIdentVerify({
  isIdentityVerificationActive,
  isIdentityVerificationAllGuests,
  isPaymentsActive,
  reminderOptions,
}: BuildReminderOptions & {reminderOptions: ReminderOptions}) {
  if (!isIdentityVerificationActive) return {};
  if (isPaymentsActive) {
    if (isIdentityVerificationAllGuests) {
      return {
        ...reminderOptions.isIdentVerifyLeadGuestActive,
        ...reminderOptions.isIdentVerifyLeadWithPaymentsActive,
        ...reminderOptions.isIdentVerifyAllGuestActive,
        ...reminderOptions.isIdentVerifyAllGuestsWithPaymentsActive,
      };
    } else {
      return {
        ...reminderOptions.isIdentVerifyLeadGuestActive,
        ...reminderOptions.isIdentVerifyLeadWithPaymentsActive,
      };
    }
  } else {
    if (isIdentityVerificationAllGuests) {
      return {
        ...reminderOptions.isIdentVerifyAllGuestActive,
        ...reminderOptions.isIdentVerifyLeadGuestActive,
      };
    } else {
      return reminderOptions.isIdentVerifyLeadGuestActive;
    }
  }
}

function buildReminderOptionsIfPaymentsActive(
  reminderOptions: ReminderOptions,
  isPaymentsActive = false,
) {
  if (isPaymentsActive) {
    return {...reminderOptions.default, ...reminderOptions.isPaymentsActive};
  }
  return reminderOptions.default;
}

function buildReminderOptionsRemoteAccess({
  isIdentityVerificationActive,
  isIdentityVerificationAllGuests,
  isPaymentsActive,
}: BuildReminderOptions) {
  return {
    ...buildReminderOptionsIfPaymentsActive(LOCK_REMINDER_OPTIONS, isPaymentsActive),
    ...buildReminderOptionsIfIdentVerify({
      reminderOptions: LOCK_REMINDER_OPTIONS,
      isIdentityVerificationActive,
      isIdentityVerificationAllGuests,
      isPaymentsActive,
    }),
  };
}

function buildCustomEmailsReminderOptions({
  isIdentityVerificationActive,
  isIdentityVerificationAllGuests,
  isPaymentsActive,
}: BuildReminderOptions) {
  return {
    ...buildReminderOptionsIfPaymentsActive(
      CUSTOM_FORMS_REMINDER_OPTIONS,
      isPaymentsActive,
    ),
    ...buildReminderOptionsIfIdentVerify({
      reminderOptions: CUSTOM_FORMS_REMINDER_OPTIONS,
      isIdentityVerificationActive,
      isIdentityVerificationAllGuests,
      isPaymentsActive,
    }),
  };
}

export {
  buildReminderOptionsRemoteAccess,
  buildCustomEmailsReminderOptions,
  CUSTOM_FORMS_REMINDER_OPTIONS,
};
