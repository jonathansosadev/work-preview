/** some helpers to define not-so-verbosely our model */
const reminderStatus = require('./type/userActions/reminder-status');
const {
  TicketActionNames,
  LeadTicketMissedReasons,
  UnsatisfiedTicketProvidedSolutions,
} = require('../../../frontend/utils/enumV2');

const define = (Model, field, type, required, defaultValue) => {
  const options = { type };
  if (required) {
    options.required = true;
  }
  if (defaultValue) {
    options.default = defaultValue;
  }
  Model.defineProperty(name, options);
};
const Revisable = {
  value: { type: 'string' },
  original: { type: 'string' },
  revised: { type: 'string' },
  isSyntaxOK: { type: 'boolean' },
  isOriginalSyntaxOk: { type: 'boolean' },
  isEmpty: { type: 'boolean' },
  isOriginalEmpty: { type: 'boolean' },
  isValidated: { type: 'boolean' },
  revisedAt: { type: 'date' },
};
const TicketAction = {
  name: { type: TicketActionNames.type },
  createdAt: { type: 'date' },
  assignerUserId: { type: 'string' }, // User Id
  previousTicketManagerId: { type: 'string' }, // User Id
  ticketManagerId: { type: 'string' }, // User Id
  comment: { type: 'string' },
  reminderFirstDay: { type: 'number' }, // a Day number (see timeHelper)
  reminderStatus: { type: reminderStatus.type },
  reminderNextDay: { type: 'number' }, // a Day number (see timeHelper)
  reminderTriggeredByUserId: { type: 'string' },
  reminderActionName: { type: TicketActionNames.type },
  missedSaleReason: [
    {
      type: LeadTicketMissedReasons.type,
      required: true,
    },
  ],
  providedSolutions: [
    {
      type: UnsatisfiedTicketProvidedSolutions.type,
      required: true,
    },
  ],
  newValue: { type: 'string' },
  previousValue: { type: 'string' },
  closedForInactivity: { type: 'boolean' },
  crossLeadConverted: { type: 'boolean' },
  unsatisfactionResolved: { type: 'boolean' },
  field: { type: 'string' },
};
const RevisableContact = {
  value: { type: 'string' },
  original: { type: 'string' },
  originalContactStatus: { type: 'string' },
  originalContactStatusExplain: { type: 'string' },
  revised: { type: 'string' },
  isSyntaxOK: { type: 'boolean' },
  isNC: { type: 'boolean' } /* Detected as nc like nc@nc.com */,
  isOriginalSyntaxOk: { type: 'boolean' } /* Did the customer unsubscribe to our services */,
  isEmpty: { type: 'boolean' },
  isValidated: { type: 'boolean' },
  isUnsubscribed: { type: 'boolean' } /* Did the customer unsubscribe to our services */,
  isDropped: { type: 'boolean' } /* dropped for emails */,
  isComplained: { type: 'boolean' } /* spam for emails */,
  isOriginalUnsubscribed: { type: 'boolean' } /* Did the customer unsubscribe to our services */,
  isOriginalDropped: { type: 'boolean' } /* dropped for emails */,
  isOriginalComplained: { type: 'boolean' } /* spam for emails */,
  revisedAt: { type: 'date' },
};
const RevisableDate = {
  value: { type: 'date' },
  original: { type: 'date' },
  revised: { type: 'date' },
  revisedAt: { type: 'date' },
};

module.exports = {
  define: (Model, field, type, options) => {
    define(Model, field, type, options.required, options.default);
  },
  TicketAction,
  Revisable,
  RevisableDate,
  RevisableContact,
};
