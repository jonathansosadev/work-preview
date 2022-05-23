const SourceTypes = require('../../../models/data/type/source-types.js');

module.exports = Object.freeze({
  oldId: 'default',
  name: 'Par défaut',
  type: 'Dealership',
  duration: 30,
  disableSmsWithValidEmails: true,
  followupAndEscalate: {
    DataFile: {
      lead: {
        followup: {
          enabled: true,
          delay: 80,
        },
        escalate: {
          enabled: true,
          stage_1: 24,
          stage_2: 32,
        },
      },
      unsatisfied: {
        followup: {
          enabled: true,
          delay: 40,
        },
        escalate: {
          enabled: true,
          stage_1: 8,
          stage_2: 24,
        },
      },
    },
    XLeads: {
      lead: {
        followup: {
          enabled: true,
          delay: 9,
        },
        escalate: {
          enabled: true,
          stage_1: 3,
          stage_2: 4,
        },
      },
    },
    Manual: {
      lead: {
        followup: {
          enabled: true,
          delay: 80,
        },
        escalate: {
          enabled: true,
          stage_1: 24,
          stage_2: 32,
        },
      },
      unsatisfied: {
        followup: {
          enabled: true,
          delay: 40,
        },
        escalate: {
          enabled: true,
          stage_1: 8,
          stage_2: 24,
        },
      },
    },
    Automation: {
      lead: {
        followup: {
          enabled: true,
          delay: 0.5,
        },
        escalate: {
          enabled: true,
          stage_1: 0.25,
          stage_2: 0.1,
        },
      },
    },
  },
  chains: {
    Maintenance: {
      contacts: [
        {
          key: 'maintenance_email_1_make',
          delay: 0,
        },
        {
          key: 'maintenance_sms_1',
          delay: 0,
        },
        {
          key: 'maintenance_email_2_make',
          delay: 6,
        },
        {
          key: 'maintenance_email_3',
          delay: 19,
        },
      ],
      thanks: {
        complete_satisfied: 'maintenance_email_thanks_1_make',
        complete_unsatisfied: 'maintenance_email_thanks_2',
        incomplete_satisfied: 'maintenance_email_thanks_3',
        incomplete_unsatisfied: 'maintenance_email_thanks_4',
      },
      recontacts: {
        enabled: false,
        dayOfNextMonth: 0,
        respondents: {
          email: '',
          sms: '',
        },
        nonRespondents: {
          email: '',
          sms: '',
        },
      },
    },
    NewVehicleSale: {
      contacts: [
        {
          key: 'sale_email_1',
          delay: 19,
        },
        {
          key: 'sale_sms_1',
          delay: 19,
        },
        {
          key: 'sale_email_2',
          delay: 24,
        },
      ],
      thanks: {
        complete_satisfied: 'sale_email_thanks_1',
        complete_unsatisfied: 'sale_email_thanks_2',
        incomplete_satisfied: 'sale_email_thanks_3',
        incomplete_unsatisfied: 'sale_email_thanks_4',
      },
      recontacts: {
        enabled: false,
        dayOfNextMonth: 0,
        respondents: {
          email: '',
          sms: '',
        },
        nonRespondents: {
          email: '',
          sms: '',
        },
      },
    },
    UsedVehicleSale: {
      contacts: [
        {
          key: 'sale_email_1',
          delay: 3,
        },
        {
          key: 'sale_sms_1',
          delay: 3,
        },
        {
          key: 'sale_email_2',
          delay: 8,
        },
      ],
      thanks: {
        complete_satisfied: 'sale_email_thanks_1',
        complete_unsatisfied: 'sale_email_thanks_2',
        incomplete_satisfied: 'sale_email_thanks_3',
        incomplete_unsatisfied: 'sale_email_thanks_4',
      },
      recontacts: {
        enabled: false,
        dayOfNextMonth: 0,
        respondents: {
          email: '',
          sms: '',
        },
        nonRespondents: {
          email: '',
          sms: '',
        },
      },
    },
    VehicleInspection: {
      contacts: [
        {
          key: 'vehicle_inspection_email_1',
          delay: 0,
        },
        {
          key: 'vehicle_inspection_sms_1',
          delay: 0,
        },
        {
          key: 'vehicle_inspection_email_2',
          delay: 1,
        },
        {
          key: 'vehicle_inspection_email_3',
          delay: 1,
        },
      ],
      thanks: {
        complete_satisfied: 'vehicle_inspection_email_thanks_1',
        complete_unsatisfied: 'vehicle_inspection_email_thanks_2',
        incomplete_satisfied: 'vehicle_inspection_email_thanks_3',
        incomplete_unsatisfied: 'vehicle_inspection_email_thanks_4',
      },
      recontacts: {
        enabled: false,
        dayOfNextMonth: 0,
        respondents: {
          email: '',
          sms: '',
        },
        nonRespondents: {
          email: '',
          sms: '',
        },
      },
    },
  },
});
