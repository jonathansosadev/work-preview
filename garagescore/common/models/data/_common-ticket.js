const moment = require('moment');
const { promisify } = require('util');
const { ObjectID } = require('mongodb');

const app = require('../../../server/server');

const {
  ContactTypes,
  LeadTicketRequestTypes,
  TicketActionNames,
  JobTypes,
  GarageTypes,
  LeadSaleTypes,
  ExternalApi,
} = require('../../../frontend/utils/enumV2');
const DataTypes = require('./type/data-types');
const AlertType = require('../alert.types');
const GarageSubscriptionTypes = require('../garage.subscription.type');
const SourceTypes = require('./type/source-types');
const ReminderStatuses = require('./type/userActions/reminder-status.js');
const UnsatisfiedTicketStatuses = require('./type/unsatisfied-ticket-status.js');
const UnsatisfiedFollowupStatuses = require('./type/unsatisfied-followup-status');
const LeadTypes = require('./type/lead-types');
const LeadTicketStatuses = require('./type/lead-ticket-status.js');
const leadTicketTemperature = require('./type/ticket-temperature');
const LeadTimings = require('./type/lead-timings');
const AlertTypes = require('../../../common/models/alert.types');
const timeHelper = require('../../lib/util/time-helper');
const gsEmail = require('../../lib/util/email');
const ContactService = require('../../lib/garagescore/contact/service');
const AlertSubscriber = require('../../lib/garagescore/alert/subscriber');
const { FED, log } = require('../../lib/util/log');
const Scheduler = require('../../lib/garagescore/scheduler/scheduler.js');
const { addManager } = require('../../lib/garagescore/api/cockpit-top-filters');
const { hasAccessToGarage } = require('../user/user-methods');
// For Internal Events
const EventsEmitter = require('../../lib/garagescore/monitoring/internal-events/events-emitter');
const leadTicketContext = require('../../lib/garagescore/monitoring/internal-events/contexts/lead-ticket-context');

const _common = {
  INACTIVE_LEAD_DELAY: 90 * 8.64e7,
  INACTIVE_UNSATISFIED_DELAY: 30 * 8.64e7,

  //
  // ----------------------- STATIC FUNCTIONS -----------------------
  //

  /**
   * Returns the closest notification day in a ticket actions
   * @param actions The actions of a given ticket
   * @returns {number} The closest notification day in given actions
   */
  getNewNotificationDay(actions = []) {
    let notificationDay = 0;

    for (const action of actions) {
      if (action.name === TicketActionNames.REMINDER && action.reminderStatus === ReminderStatuses.NOT_RESOLVED) {
        if (action.reminderNextDay < notificationDay || notificationDay === 0) {
          notificationDay = action.reminderNextDay;
        }
      }
    }
    return notificationDay;
  },

  /**
   * Performs some precheck on a new action
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the ticket
   * @param args The new action you want to validate
   * @throw {Error} If the action is not validated
   */
  actionPreCheck(type, data, args) {
    const ticketStatus = type === 'lead' ? LeadTicketStatuses : UnsatisfiedTicketStatuses;
    const oldMangerId = data.get(`${type}Ticket.manager`);
    const newManagerId = args.ticketManagerId || args.assignerUserId || null;
    const dataId = data.getId().toString();
    if (args.name === TicketActionNames.REMINDER && args.reminderFirstDay <= timeHelper.dayNumber(new Date())) {
      throw new Error(`Invalid Action on #${dataId} - Cannot set a Reminder in the past (${args.reminderFirstDay})`);
    } else if (
      args.name === TicketActionNames[`${type.toUpperCase()}_CLOSED`] &&
      ticketStatus.isClosed(data.get(`${type}Ticket.status`))
    ) {
      throw new Error(`Invalid Action on #${dataId} - Cannot closed a ticket already closed (${args.name})`);
    } else if (
      args.name === TicketActionNames[`${type.toUpperCase()}_REOPENED`] &&
      !ticketStatus.isClosed(data.get(`${type}Ticket.status`))
    ) {
      throw new Error(`Invalid Action on #${dataId} - Cannot reopen a ticket already open (${args.name})`);
    } else if (args.name === TicketActionNames.TRANSFER && oldMangerId === newManagerId) {
      throw new Error(`Invalid Action on #${dataId} - Cannot transfer a ticket to the same user (${newManagerId})`);
    }
  },

  /**
   * Check if a given lead ticket was transformed to sale
   * @param data The data that contains the lead ticket
   * @returns {boolean} Whether the lead was transformed to sale or not
   */
  leadIsSold(data) {
    return !!(data && data.get('leadTicket.wasTransformedToSale'));
  },

  /**
   * Check if a given unsatisfied ticket was resolved
   * @param data The data that contains the unsatisfied ticket
   * @returns {boolean} Whether the unsatisfied was resolved or not
   */
  unsatisfiedIsResolved(data) {
    return !!(
      data &&
      ((data.get('unsatisfiedTicket.unsatisfactionResolved') === true &&
        data.get('unsatisfied.followupStatus') !== UnsatisfiedFollowupStatuses.NOT_RESOLVED) ||
        data.get('unsatisfied.followupStatus') === UnsatisfiedFollowupStatuses.RESOLVED)
    );
  },

  /**
   * Loop through every actions in a given lead ticket and determine the status of said ticket
   * See '/common/models/data/type/lead-ticket-status.js'
   * @param actions The lead ticket's array of actions
   * @param isSold Whether or not the lead was transformed to sale
   * @returns {string} The corresponding status, from the lead-ticket-status.js list
   */
  determineLeadStatusFromActions(actions = [], isSold = false, saleType = null) {
    const {
      CUSTOMER_CALL,
      MEETING,
      PROPOSITION,
      LEAD_CLOSED,
      LEAD_REOPENED,
      INCOMING_CALL,
      REMINDER,
      POSTPONED_LEAD,
    } = TicketActionNames;
    const {
      WAITING_FOR_CONTACT,
      WAITING_FOR_MEETING,
      MEETING_PLANNED,
      CONTACT_PLANNED,
      WAITING_FOR_PROPOSITION,
      PROPOSITION_PLANNED,
      WAITING_FOR_CLOSING,
      CLOSED_WITH_SALE,
      CLOSED_WITHOUT_SALE,
    } = LeadTicketStatuses;

    const statuses = LeadTicketStatuses.values();
    let newStatus = LeadTicketStatuses.WAITING_FOR_CONTACT;
    const isNewStatusAfter = (status) => statuses.indexOf(newStatus) > statuses.indexOf(status);
    const isNewStatusBefore = (status) => statuses.indexOf(newStatus) < statuses.indexOf(status);
    const isActive = ({ reminderStatus }) => reminderStatus !== ReminderStatuses.CANCELLED;
    const isRelevantReminder = ({ name, reminderStatus, cancelledByPostponedLead }) => {
      if (name === REMINDER) {
        return isActive({ reminderStatus }) || cancelledByPostponedLead;
      }
      return false;
    };

    let lastNonClosingStatus = WAITING_FOR_CONTACT;
    for (const action of actions || []) {
      if (action.name === CUSTOMER_CALL && isNewStatusBefore(WAITING_FOR_MEETING)) {
        newStatus = lastNonClosingStatus = WAITING_FOR_MEETING;
      } else if (action.name === MEETING && isNewStatusBefore(WAITING_FOR_PROPOSITION)) {
        if (saleType === LeadSaleTypes.MAINTENANCE) {
          newStatus = lastNonClosingStatus = WAITING_FOR_CLOSING;
        } else {
          newStatus = lastNonClosingStatus = WAITING_FOR_PROPOSITION;
        }
      } else if (action.name === PROPOSITION && isNewStatusBefore(WAITING_FOR_CLOSING)) {
        newStatus = lastNonClosingStatus = WAITING_FOR_CLOSING;
      } else if (action.name === LEAD_CLOSED) {
        newStatus = isSold ? CLOSED_WITH_SALE : CLOSED_WITHOUT_SALE;
      } else if (action.name === LEAD_REOPENED) {
        newStatus = lastNonClosingStatus;
      } else if (action.name === INCOMING_CALL) {
        newStatus = lastNonClosingStatus = WAITING_FOR_MEETING;
      } else if (isRelevantReminder(action)) {
        if (action.reminderActionName === CUSTOMER_CALL && isNewStatusBefore(CONTACT_PLANNED)) {
          newStatus = lastNonClosingStatus = CONTACT_PLANNED;
        } else if (action.reminderActionName === MEETING && isNewStatusBefore(MEETING_PLANNED)) {
          newStatus = lastNonClosingStatus = MEETING_PLANNED;
        } else if (action.reminderActionName === PROPOSITION && isNewStatusBefore(PROPOSITION_PLANNED)) {
          newStatus = lastNonClosingStatus = PROPOSITION_PLANNED;
        }
      } else if (action.name === POSTPONED_LEAD && isActive(action)) {
        // Note for my future self: Don't remove the elses in the else if...
        if (!isNewStatusAfter(CONTACT_PLANNED)) {
          newStatus = lastNonClosingStatus = CONTACT_PLANNED;
        } else if (!isNewStatusAfter(MEETING_PLANNED)) {
          newStatus = lastNonClosingStatus = MEETING_PLANNED;
        } else if (!isNewStatusAfter(PROPOSITION_PLANNED)) {
          newStatus = lastNonClosingStatus = PROPOSITION_PLANNED;
        }
      }
    }
    return newStatus;
  },

  /**
   * Loop through every actions in a given unsatisfied ticket and determine the status of said ticket
   * See '/common/models/data/type/unsatisfied-ticket-status.js'
   * @param actions The unsatisfied ticket's array of actions
   * @param isResolved Whether or not the unsatisfied was resolved
   * @returns {string} The corresponding status, from the unsatisfied-ticket-status.js list
   */
  determineUnsatisfiedStatusFromActions(actions = [], isResolved = false) {
    const isStatusAfter = (keys, status1, status2) => keys.indexOf(status1) < keys.indexOf(status2);
    const keys = UnsatisfiedTicketStatuses.values();
    let lastNonClosingStatus = UnsatisfiedTicketStatuses.WAITING_FOR_CONTACT;
    let newStatus = UnsatisfiedTicketStatuses.WAITING_FOR_CONTACT;

    for (const action of actions || []) {
      if (
        action.name === TicketActionNames.CUSTOMER_CALL &&
        isStatusAfter(keys, newStatus, UnsatisfiedTicketStatuses.WAITING_FOR_VISIT)
      ) {
        newStatus = lastNonClosingStatus = UnsatisfiedTicketStatuses.WAITING_FOR_VISIT;
      } else if (
        action.name === TicketActionNames.GARAGE_SECOND_VISIT &&
        isStatusAfter(keys, newStatus, UnsatisfiedTicketStatuses.WAITING_FOR_CLOSING)
      ) {
        // eslint-disable-line max-len
        newStatus = lastNonClosingStatus = UnsatisfiedTicketStatuses.WAITING_FOR_CLOSING;
      } else if (action.name === TicketActionNames.UNSATISFIED_CLOSED) {
        newStatus = isResolved
          ? UnsatisfiedTicketStatuses.CLOSED_WITH_RESOLUTION
          : UnsatisfiedTicketStatuses.CLOSED_WITHOUT_RESOLUTION;
      } else if (action.name === TicketActionNames.UNSATISFIED_REOPENED) {
        newStatus = lastNonClosingStatus;
      } else if (action.name === TicketActionNames.REMINDER && action.reminderStatus !== ReminderStatuses.CANCELLED) {
        // eslint-disable-line max-len
        if (
          action.reminderActionName === TicketActionNames.CUSTOMER_CALL &&
          isStatusAfter(keys, newStatus, UnsatisfiedTicketStatuses.CONTACT_PLANNED)
        ) {
          // eslint-disable-line max-len
          newStatus = lastNonClosingStatus = UnsatisfiedTicketStatuses.CONTACT_PLANNED;
        } else if (
          action.reminderActionName === TicketActionNames.GARAGE_SECOND_VISIT &&
          isStatusAfter(keys, newStatus, UnsatisfiedTicketStatuses.VISIT_PLANNED)
        ) {
          // eslint-disable-line max-len
          newStatus = lastNonClosingStatus = UnsatisfiedTicketStatuses.VISIT_PLANNED;
        }
      }
    }
    return newStatus;
  },

  /**
   * Returns the last action which had the effect of closing the given ticket
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the said ticket
   * @returns {*} Either null or the last closing action
   */
  getLastClosingAction(type, data) {
    const actions = data.get(`${type}Ticket.actions`) || [];
    let closingAction = null;

    for (const action of actions) {
      if (
        action.name === TicketActionNames[`${type.toUpperCase()}_CLOSED`] &&
        (!closingAction || moment(closingAction.createdAt).isBefore(action.createdAt))
      ) {
        closingAction = action;
      }
    }
    return closingAction;
  },

  hasOverdueReminder(ticket) {
    return (
      ticket.actions &&
      ticket.actions.some(
        (action) =>
          action.name === TicketActionNames.REMINDER &&
          action.reminderStatus === ReminderStatuses.NOT_RESOLVED &&
          new Date(action.reminderDate) > new Date()
      )
    );
  },

  hasMeaningfulAction(ticket) {
    return (
      ticket.actions &&
      ticket.actions.some(
        (action) =>
          [TicketActionNames.GARAGE_SECOND_VISIT, TicketActionNames.CUSTOMER_CALL].includes(action.name) ||
          (action.name === TicketActionNames.REMINDER &&
            action.reminderActionName === TicketActionNames.GARAGE_SECOND_VISIT &&
            action.reminderStatus !== ReminderStatuses.CANCELLED) ||
          (action.name === TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED && action.followupIsRecontacted === true)
      )
    );
  },
  /**
   * Determine the given ticket status from its actions
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the given ticket
   * @returns {string} The corresponding status
   */
  determineTicketStatus(type, data) {
    let newStatus = null;

    if (type === 'lead') {
      newStatus = _common.determineLeadStatusFromActions(
        data.get(`${type}Ticket.actions`),
        _common.leadIsSold(data),
        data.get('leadTicket.saleType')
      );
    } else {
      newStatus = _common.determineUnsatisfiedStatusFromActions(
        data.get(`${type}Ticket.actions`),
        _common.unsatisfiedIsResolved(data)
      );
    }
    return newStatus;
  },

  /**
   * Determine the default manager (userId) to be assigned to a given type of ticket
   * @param type The type of the ticket (lead/unsatisfied)
   * @param garage The garage to which the ticket belongs
   * @param data The data which contain the ticket
   * @returns { ObjectID | string } A userId or a empty string if default manager is not configured
   */
  getTicketDefaultManager(type, garage, data) {
    const conf = garage.ticketsConfiguration || {};
    let res = '';

    if (garage.type === GarageTypes.VEHICLE_INSPECTION) {
      res = conf.VehicleInspection || '';
    } else if (type === 'lead') {
      const saleType =
        data.get('lead.saleType') === LeadSaleTypes.UNKNOWN
          ? LeadSaleTypes.NEW_VEHICLE_SALE
          : data.get('lead.saleType');
      res = conf[`Lead_${saleType || LeadSaleTypes.NEW_VEHICLE_SALE}`] || '';
    } else if (type === 'unsatisfied') {
      res = conf[`Unsatisfied_${data.get('type')}`] || '';
    }

    return ObjectID.isValid(res) ? res : '';
  },

  //
  // ----------------------- INITIALIZATION FUNCTIONS -----------------------
  //

  /**
   * Initialize the leadTicket object in a given Data
   * @param data The data
   * @param rawGarage The garage to which belongs the data
   * @param rawManagerId The assigned userId if there is one
   * @param manualData The manualData object if the leadTicket is manually created from cockpit
   * @returns {Promise<*>} A Promise containing the data
   */
  async initLeadTicket(data, rawGarage, { rawManagerId, source, sourceData }) {
    const garage = rawGarage || (await app.models.Garage.findById(data.get('garageId').toString()));
    const managerId = rawManagerId || _common.getTicketDefaultManager('lead', garage, data);
    const assignerUserId = (sourceData && sourceData.userId) || null;
    const isSendNotification = !!managerId && !!assignerUserId;
    // 1. We check if we can create a lead ticket, otherwise we destroy the leadTicket
    if (source !== 'manual' && !data.get('lead.potentialSale')) {
      data.set('leadTicket', null);
      await Scheduler.removeJob(JobTypes.SEND_LEAD_FOLLOWUP, { dataId: data.getId().toString() });
      return data;
    }

    // 2. If we come from a manualTicket creation we need to init the legacy lead object first
    if (source === 'manual') await _common.initLeadFromManualData(data, sourceData);

    // 3. We initialize common values
    data.set('leadTicket', data.get('leadTicket') || {});
    if (data.get('type') === DataTypes.VEHICLE_INSPECTION) {
      // 3.1 vehicle inspection
      _common.initLeadTicketVIFields(data, sourceData);
    } else {
      // 3.2 others
      _common.initLeadTicketCommonFields(data, sourceData);
    }

    // 4. Then values that depend on the source
    if (source) {
      if (source === 'crossLeads') _common.initLeadTicketCrossLeadsFields(data, sourceData);
      if (source === 'automation') _common.initLeadTicketAutomationFields(data, sourceData);
    }

    // And right after, set a job that will close the ticket after x days without activity
    _common._updateCloseTicketJob('leadTicket', data, Date.now() + _common.INACTIVE_LEAD_DELAY);

    // 5. We add the initials actions

    if (!Array.isArray(data.get('leadTicket.actions')) || !data.get('leadTicket.actions').length) {
      data.set('leadTicket.actions', []);
      data.get('leadTicket.actions').push({
        name: TicketActionNames.LEAD_STARTED,
        createdAt: (sourceData && sourceData.createdAt) || new Date(),
        assignerUserId,
        comment: (sourceData && sourceData.leadComment) || '',
        isManual: source === 'manual',
        ticketManagerId: managerId,
      });
    }

    // 6. If there is a manager designed we set it, send notification if we got managerId and assignerUserId
    await _common.setManager('lead', data, { ticketManagerId: managerId, assignerUserId }, isSendNotification);

    // 7. Initialize additional actions depending on the source, mainly
    await _common.initLeadTicketActions(data, { source, sourceData });

    // 8. Ticket attributes are now created, saving the ticket to avoid bugs in the alerts
    await data.save();

    // We add the ticket to customers if it's not already done
    await Scheduler.upsertJob(
      JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER,
      { dataIds: [data.getId().toString()] },
      new Date()
    );

    // 10. We send the new lead alert
    await _common.sendLeadTicketCreationAlert(garage, data, { source, sourceData });

    // 11. Initialize the followupLead delay
    await data.createFollowupAndEscalateJob('lead', garage);

    // 12. Emit the ADD_LEAD_TICKET Internal Event
    _common.emitAddLeadTicketEvent(data, garage);

    // 13. send the lead to external API
    await _common.sendLeadToApi(data, garage);
    return data;
  },

  async initLeadFromManualData(data, manualData = null) {
    const creationDate = (manualData && manualData.createdAt) || new Date();

    if (!data.getId()) data = await data.save(); // eslint-disable-line

    // Setting the source
    if (manualData.sourceType) {
      data.set('source.type', manualData.sourceType);
    } else if (!data.get('source.type')) {
      data.set('source.type', DataTypes.MANUAL_LEAD);
    }
    // Some adjustment between creating ticket from pop-up and contact ticket
    manualData.brandModel = manualData.brandModel || manualData.leadBrandModel; // eslint-disable-line
    data.set('lead.reportedAt', creationDate);
    data.set('lead.type', manualData.leadType || LeadTypes.INTERESTED);
    if (manualData.email) {
      const email = manualData.email && manualData.email.replace(gsEmail.removalOfUnauthorizedCharactersRegexp, '');
      data.set('customer.contact.email.value', email);
    }
    if (manualData.phone) data.set('customer.contact.mobilePhone.value', manualData.phone);
    if (manualData.fullName) data.set('customer.fullName.value', manualData.fullName);

    if (manualData.leadSaleType === DataTypes.MAINTENANCE) {
      // Set fields specific to APV Leads
      data.set('lead.timing', LeadTimings.NOW);
      if (manualData.requestType && LeadTicketRequestTypes.hasValue(manualData.requestType)) {
        data.set('leadTicket.requestType', manualData.requestType);
      }
    } else {
      // Fields specific to Sales Leads
    }
  },

  formatBrandModel: (brands, withModel = true) =>
    brands
      .map((brand) => {
        let str = brand.brand;
        if (withModel && brand.model) str += `: ${brand.model}`;
        return str;
      })
      .join(', '),

  initLeadTicketCommonFields(data, manualData = null) {
    const creationDate = (manualData && manualData.createdAt) || new Date();
    const energyType = manualData ? manualData.leadEnergyType || manualData.leadEnergy : data.get('lead.energyType');
    const mobilePhone = (manualData && manualData.phone) || data.get('customer.contact.mobilePhone');
    const email = (manualData && manualData.email) || data.get('customer.contact.email');
    const makeModelFromData = `${data.get('vehicle.make.value') || ''} ${data.get('vehicle.model.value') || ''}`.trim();
    const makeModel = (manualData && manualData.vehicleModel) || makeModelFromData;
    let brandModel = data.get('lead.vehicle');
    if (manualData) {
      brandModel = manualData.brandModel;
    } else if (Array.isArray(data.get('lead.brands'))) {
      brandModel = this.formatBrandModel(data.get('lead.brands'));
    }

    data.set('leadTicket.touched', !!data.get('lead.isConvertedToSale'));
    data.set('leadTicket.reactive', !!data.get('lead.isConvertedToSale'));
    data.set('leadTicket.comment', (manualData && manualData.leadComment) || '');
    data.set('leadTicket.createdAt', creationDate);
    data.set('leadTicket.referenceDate', creationDate);
    data.set('leadTicket.status', data.get('leadTicket.status') || LeadTicketStatuses.WAITING_FOR_CONTACT);
    data.set('leadTicket.actions', data.get('leadTicket.actions') || []);
    data.set('leadTicket.manager', data.get('leadTicket.manager') || 'undefined');
    data.set('leadTicket.temperature', leadTicketTemperature.UNKNOWN);
    data.set('leadTicket.timing', (manualData && manualData.leadTiming) || data.get('lead.timing'));
    data.set('leadTicket.saleType', manualData ? manualData.leadSaleType : data.get('lead.saleType'));
    data.set('leadTicket.energyType', energyType);
    data.set('leadTicket.cylinder', (manualData && manualData.leadCylinder) || data.get('lead.cylinder') || []);
    data.set('leadTicket.bodyType', manualData ? manualData.leadBodyType : data.get('lead.bodyType'));
    data.set('leadTicket.knowVehicle', manualData ? !!manualData.brandModel : data.get('lead.knowVehicle'));
    data.set('leadTicket.budget', (manualData && manualData.leadBudget) || 'undefined');
    data.set('leadTicket.financing', manualData ? manualData.leadFinancing : data.get('lead.financing'));
    data.set('leadTicket.tradeIn', manualData ? manualData.leadTradeIn : data.get('lead.tradeIn'));
    data.set('leadTicket.customer.contact.mobilePhone', mobilePhone);
    data.set('leadTicket.customer.contact.email', email);
    data.set('leadTicket.customer.fullName', (manualData && manualData.fullName) || data.get('customer.fullName'));
    data.set('leadTicket.leadVehicle', data.get('lead.vehicle'));
    data.set('leadTicket.vehicle.plate', data.get('vehicle.plate'));
    data.set('leadTicket.type', manualData ? '' : data.get('type'));
    data.set('leadTicket.vehicle.makeModel', makeModel);
    data.set('leadTicket.brandModel', brandModel);
  },

  initLeadTicketVIFields(data) {
    const creationDate = new Date();
    const makeModel = `${data.get('vehicle.make.value') || ''} ${data.get('vehicle.model.value') || ''}`.trim();

    // Optin
    data.set('leadTicket.acceptTermOfSharing', !!data.get('lead.acceptTermOfSharing'));

    data.set('leadTicket.touched', !!data.get('lead.isConvertedToSale'));
    data.set('leadTicket.reactive', !!data.get('lead.isConvertedToSale'));
    data.set('leadTicket.comment', data.get('leadTicket.comment') || '');
    data.set('leadTicket.createdAt', creationDate);
    data.set('leadTicket.referenceDate', creationDate);
    data.set('leadTicket.status', data.get('leadTicket.status') || LeadTicketStatuses.WAITING_FOR_CONTACT);
    data.set('leadTicket.actions', data.get('leadTicket.actions') || []);
    data.set('leadTicket.timing', data.get('lead.timing'));
    data.set('leadTicket.saleType', data.get('lead.saleType'));
    data.set('leadTicket.energyType', data.get('lead.energyType'));
    data.set('leadTicket.financing', data.get('lead.financing'));
    data.set('leadTicket.tradeIn', data.get('lead.tradeIn'));
    data.set('leadTicket.testDrive', data.get('lead.testDrive'));
    data.set('leadTicket.customer.contact.mobilePhone', data.get('customer.contact.mobilePhone'));
    data.set('leadTicket.customer.contact.email', data.get('customer.contact.email'));
    data.set('leadTicket.customer.fullName', data.get('customer.fullName'));
    data.set('leadTicket.leadVehicle', data.get('lead.vehicle'));
    data.set('leadTicket.vehicle.plate', data.get('vehicle.plate'));
    data.set('leadTicket.type', data.get('type'));
    data.set('leadTicket.vehicle.makeModel', makeModel);
    data.set('leadTicket.brandModel', this.formatBrandModel(data.get('lead.brands')));
    //new Fields
    data.set('leadTicket.leadFundingQuestionCashBudgetVn', data.get('lead.leadFundingQuestionCashBudgetVn'));
    data.set('leadTicket.leadFundingQuestionCashBudgetVo', data.get('lead.leadFundingQuestionCashBudgetVo'));
    data.set('leadTicket.leadFundingQuestionCreditBudget', data.get('lead.leadFundingQuestionCreditBudget'));
    data.set('leadTicket.leadDesiredServices', data.get('lead.leadDesiredServices'));
    data.set('leadTicket.leadSaleCategories', data.get('lead.leadSaleCategories'));
    // not used
    data.set('leadTicket.manager', data.get('leadTicket.manager') || 'undefined');
    data.set('leadTicket.temperature', data.get('leadTicket.temperature') || leadTicketTemperature.UNKNOWN);
    data.set('leadTicket.cylinder', data.get('leadTicket.cylinder') || []);
    data.set('leadTicket.bodyType', data.get('lead.bodyType'));
    data.set('leadTicket.knowVehicle', data.get('lead.knowVehicle'));
    data.set('leadTicket.budget', data.get('leadTicket.budget') || 'undefined');
  },

  initLeadTicketCrossLeadsFields(data, crossLeadData) {
    data.set('leadTicket.crossLeadData', true);
    if (crossLeadData.type === 'Email') {
      data.set('leadTicket.sourceSubtype', crossLeadData.sourceSubtype);
      data.set('leadTicket.createdAt', crossLeadData.createdAt);
      data.set('leadTicket.customer.contact.email', crossLeadData.parsedFields.email);
      data.set('leadTicket.customer.contact.mobilePhone', crossLeadData.parsedFields.phone);
      data.set('leadTicket.customer.city', crossLeadData.parsedFields.city);
      data.set('leadTicket.saleType', SourceTypes.saleType(crossLeadData.sourceType)); // couldBeSetFromSubtype
      data.set('leadTicket.brandModel', crossLeadData.parsedFields.brandModel);
      data.set('leadTicket.energyType', crossLeadData.parsedFields.energyType);
      data.set('leadTicket.message', crossLeadData.parsedFields.message);
      data.set('leadTicket.adUrl', crossLeadData.parsedFields.adUrl);
      data.set('leadTicket.adId', crossLeadData.parsedFields.adId);
      data.set('leadTicket.vehicle.plate', crossLeadData.parsedFields.vehicleRegistrationPlate);
      data.set('leadTicket.vehicle.makeModel', crossLeadData.parsedFields.makeModel);
      data.set('leadTicket.budget', crossLeadData.parsedFields.vehiclePrice);
      data.set('leadTicket.requestType', crossLeadData.parsedFields.requestType || null);
      data.set('leadTicket.vehicle.mileage', crossLeadData.parsedFields.mileage || null);

      let parsedRawData = data.get('leadTicket.parsedRawData');
      if (!parsedRawData || !parsedRawData.push) data.set('leadTicket.parsedRawData', []);
      parsedRawData = data.get('leadTicket.parsedRawData');
      parsedRawData.push({ ...crossLeadData.parsedFields });
    }
    if (crossLeadData.type === 'Call') {
      const mobilePhone =
        (crossLeadData.payload && crossLeadData.payload.phone) || data.get('customer.contact.mobilePhone');
      data.set('leadTicket.createdAt', crossLeadData.createdAt);
      data.set('leadTicket.customer.contact.mobilePhone', mobilePhone);
      data.set('leadTicket.saleType', SourceTypes.saleType(crossLeadData.sourceType));
    }
    data.set('leadTicket.timing', LeadTimings.NOW);
  },

  initLeadTicketAutomationFields(data, automationData) {
    data.set('leadTicket.automation', true);
    data.set('leadTicket.automationCampaignId', automationData.campaignId);
    data.set('leadTicket.automationCustomerId', automationData.customerId);
    data.set('leadTicket.timing', LeadTimings.NOW);
    data.set('leadTicket.requestType', LeadTicketRequestTypes.INFORMATION_RESQUEST);
  },

  async sendContactToSubscribers(data, contactType, subscriptionType, payload) {
    // Another one...
    const contacts = [];
    const sendContact = promisify(ContactService.prepareForSend).bind(ContactService);
    const subscribers = (await app.models.Garage.getRealTimeSubscribers(data.get('garageId'), subscriptionType)) || [];
    for (const user of subscribers) {
      const contact = {
        type: contactType,
        to: user.email,
        recipient: user.fullName,
        from: 'no-reply@custeed.com',
        sender: 'GarageScore',
        payload: { dataId: data.getId().toString(), ...payload },
      };
      await sendContact(contact);
      contacts.push(contact);
    }
    return contacts;
  },

  async sendLeadTicketCreationAlert(garage, data, { source, sourceData }) {
    if (['manual', 'contactTicket'].includes(source)) {
      // In those cases we don't want to send the alert for manual ticket, returning directly
      return;
    }
    let alertType = null;
    if (source === 'automation') {
      switch (data.get('leadTicket.saleType')) {
        case LeadSaleTypes.MAINTENANCE:
          alertType = AlertType.AUTOMATION_LEAD_APV;
          break;
        case LeadSaleTypes.NEW_VEHICLE_SALE:
          alertType = AlertType.AUTOMATION_LEAD_VN;
          break;
        case LeadSaleTypes.USED_VEHICLE_SALE:
          alertType = AlertType.AUTOMATION_LEAD_VO;
          break;
        default:
          alertType = AlertType.AUTOMATION_LEAD_APV;
          break;
      }
    }
    if (source !== 'crossLeads') {
      // Do not send "alert" for XLeads, it's too slow to wait the cron (1 hours)
      await _common.sendTicketCreationAlert('lead', data, garage, alertType);
    } else {
      // Send contact to the subscribers NOW and program the next job
      let contactType = null;
      let subscriptionType = AlertType.LEAD_VO;

      if (sourceData.type === 'Email') contactType = ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL;
      else if (sourceData.type === 'Call' && sourceData.payload.duration) {
        if (garage.enableCrossLeadsSelfAssignCallAlert) {
          contactType = ContactTypes.CROSS_LEADS_SELF_ASSIGN_CALL;
        } else {
          return;
        }
      } else if (sourceData.type === 'Call' && !sourceData.payload.duration)
        contactType = ContactTypes.CROSS_LEADS_SELF_ASSIGN_MISSED_CALL;
      if ([DataTypes.NEW_VEHICLE_SALE, DataTypes.UNKNOWN].includes(SourceTypes.saleType(data.get('source.type'))))
        subscriptionType = AlertType.LEAD_VN;
      else if (SourceTypes.saleType(data.get('source.type')) === DataTypes.MAINTENANCE)
        subscriptionType = AlertType.LEAD_APV;

      const contacts = await this.sendContactToSubscribers(data, contactType, subscriptionType, { stage: 0 });
      if (contactType !== ContactTypes.CROSS_LEADS_SELF_ASSIGN_CALL) {
        // Don't send reminders for call that was answered
        const { googlePlace, timezone } = garage;
        await Scheduler.upsertJob(
          // Time reminder in 15mins
          JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER,
          {
            dataId: data.getId().toString(),
            stage: 1,
            contacts,
            googleOpeningHours: (googlePlace && googlePlace.openingHours) || null,
            timezone,
          },
          new Date(),
          {
            noWeekEnd: true,
            saturdayOk: true,
            planJobAfterXHoursOfOpeningHours: {
              hours: 15 / 60,
              googleOpeningHours: (googlePlace && googlePlace.openingHours) || null,
              timezone,
              minimumScheduledHour: 9,
            },
          }
        );
      }
    }
  },

  async initLeadTicketActions(data, { source, sourceData }) {
    if (source === 'crossLeads') {
      if (sourceData.type === 'Call') {
        await _common.addAction('lead', data, {
          createdAt: sourceData.createdAt,
          name: sourceData.payload.duration ? TicketActionNames.INCOMING_CALL : TicketActionNames.INCOMING_MISSED_CALL,
          callDuration: sourceData.payload.duration,
          sourceType: sourceData.sourceType,
          phone: sourceData.payload.phone,
        });
      } else if (sourceData.type === 'Email') {
        await _common.addAction('lead', data, {
          createdAt: sourceData.createdAt,
          name: TicketActionNames.INCOMING_EMAIL,
          sourceType: sourceData.sourceType,
          ...sourceData.parsedFields,
        });
      }
    } else if (source !== 'manual') {
      // If the lead is very old or already transformed to sale we automatically close it
      const inactive = moment(data.get('lead.reportedAt')).isBefore(
        moment().subtract(_common.INACTIVE_LEAD_DELAY, 'day')
      );
      if (data.get('lead.isConvertedToSale') || inactive) {
        await _common.addAction('lead', data, {
          createdAt: new Date(),
          name: TicketActionNames.LEAD_CLOSED,
          wasTransformedToSale: data.get('lead.isConvertedToSale'),
          crossLeadConverted: data.get('lead.convertedSaleDataId'),
          closedForInactivity: inactive,
          automaticClose: true,
        });
      }
    }
  },

  /**
   * Initialize the unsatisfiedTicket object in a given Data
   * @param data The data
   * @param rawGarage The garage to which belongs the data
   * @param rawManagerId The assigned userId if there is one
   * @param manualData The manualData object if the unsatisfiedTicket is manually created from cockpit
   * @returns {Promise<*>} A Promise containing the data
   */
  async initUnsatisfiedTicket(data, rawGarage, { rawManagerId, source, sourceData }) {
    const creationDate = new Date();
    const garage = rawGarage || (await app.models.Garage.findById(data.get('garageId').toString()));
    const managerId = rawManagerId || _common.getTicketDefaultManager('unsatisfied', garage, data);
    const isManual = source === 'manual';
    const assignerUserId = (sourceData && sourceData.userId) || null;
    const isSendNotification = !!managerId && !!assignerUserId;
    const isDetractor = data.review_isDetractor();
    const isSensitive = data.review_isSensitive(garage);
    const isDetractorContactTicket = data.review_isDetractorContactTicket();
    const isSensitiveContactTicket = data.review_isSensitiveContactTicket(garage);
    // 1. We check if we can create an unsatisfiedTicket
    if (!isManual && garage && !isDetractor && !isSensitive && !isDetractorContactTicket && !isSensitiveContactTicket) {
      data.set('unsatisfiedTicket', null);
      await Scheduler.removeJob(JobTypes.SEND_UNSATISFIED_FOLLOWUP, {
        dataId: data.getId().toString(),
      });
      return data;
    }

    // 2. If we come from a manualTicket creation we need to init the legacy unsatisfied object and stuff first
    if (isManual) {
      await _common.initUnsatisfiedFromManualData(data, sourceData, creationDate);
    }

    // 3. We initialize common values
    data.set('unsatisfiedTicket', {});
    _common.initUnsatisfiedTicketCommonFields(data, sourceData, creationDate);

    // And right after, set a job that will close the ticket after x days without activity
    _common._updateCloseTicketJob('unsatisfiedTicket', data, Date.now() + _common.INACTIVE_UNSATISFIED_DELAY);

    // 4. Then values that depend on the source
    if (source) {
      if (source === 'contactTicket') _common.initUnsatisfiedTicketContactFields(data, sourceData, creationDate);
    }

    // 5. We add the first action, the UNSATISFIED_STARTED one
    data.get('unsatisfiedTicket.actions').push({
      name: TicketActionNames.UNSATISFIED_STARTED,
      createdAt: creationDate,
      assignerUserId,
      comment: (sourceData && sourceData.comment) || null,
      isManual,
      ticketManagerId: managerId,
    });

    // 6. If there is a manager designed we set it, send notification if we got managerId and assignerUserId
    if (managerId) {
      await _common.setManager('unsatisfied', data, { ticketManagerId: managerId, assignerUserId }, isSendNotification);
    }

    // 8. We send the new unsatisfied alert
    if (!sourceData) {
      await _common.sendTicketCreationAlert('unsatisfied', data, garage);
    }

    // 9. If the unsatisfied is very old we automatically close it
    const inactiveDateBoundary = moment().subtract(_common.INACTIVE_UNSATISFIED_DELAY, 'day');
    const inactive = moment(data.get('review.createdAt')).isBefore(inactiveDateBoundary);
    if (inactive) {
      await _common.addAction('unsatisfied', data, {
        createdAt: new Date(),
        name: TicketActionNames.UNSATISFIED_CLOSED,
        closedForInactivity: inactive,
        automaticClose: true,
      });
    }

    await data.unsatisfiedTicket_updateDelayStatus();

    // 10. Add followup and escalate jobs
    await data.createFollowupAndEscalateJob('unsatisfied', garage);
    return data;
  },

  async initUnsatisfiedFromManualData(data, manualData, defaultCreationDate) {
    // Generate the id for manual tickets
    if (!data.getId()) data = await data.save();
    data.set('review.createdAt', defaultCreationDate);
    if (!data.get('source.type')) {
      data.set('source.type', DataTypes.MANUAL_UNSATISFIED);
    }
    if (!data.get('service.providedAt')) {
      data.set('service.providedAt', defaultCreationDate);
    }
    if (typeof manualData.score !== 'undefined') {
      data.set('review.rating.value', manualData.score);
    }
    if (manualData.unsatisfiedCriterias) {
      data.set('unsatisfied.criteria', manualData.unsatisfiedCriterias);
    }
    if (manualData.email) {
      const email = manualData.email && manualData.email.replace(gsEmail.removalOfUnauthorizedCharactersRegexp, '');
      data.set('customer.contact.email.value', email);
    }
    if (manualData.phone) {
      data.set('customer.contact.mobilePhone.value', manualData.phone);
    }
    if (manualData.fullName) {
      data.set('customer.fullName.value', manualData.fullName);
    }
  },

  initUnsatisfiedTicketCommonFields(data, manualData, defaultCreationDate) {
    const mobilePhone = (manualData && manualData.phone) || data.get('customer.contact.mobilePhone');
    const email = (manualData && manualData.email) || data.get('customer.contact.email');
    const fullName = (manualData && manualData.fullName) || data.get('customer.fullName');
    const frontDeskUserName = (manualData && manualData.frontDeskUserName) || data.get('service.frontDeskUserName');
    const makeModelFromData = `${data.get('vehicle.make.value') || ''} ${data.get('vehicle.model.value') | ''}`;
    const makeModel = (manualData && manualData.brandModel) || makeModelFromData;

    if (manualData && manualData.manualDataFromContactTicket) {
      data.set('unsatisfiedTicket.manualDataFromContactTicket', manualData.manualDataFromContactTicket);
    }
    data.set('unsatisfiedTicket.comment', (manualData && manualData.comment) || '');
    if (manualData && manualData.unsatisfiedCriteria) {
      data.set('unsatisfiedTicket.criteria', manualData.unsatisfiedCriteria);
    }
    data.set('unsatisfiedTicket.createdAt', defaultCreationDate);
    data.set('unsatisfiedTicket.referenceDate', defaultCreationDate);
    data.set('unsatisfiedTicket.touched', false);
    data.set('unsatisfiedTicket.reactive', false);
    data.set('unsatisfiedTicket.status', UnsatisfiedTicketStatuses.WAITING_FOR_CONTACT);
    data.set('unsatisfiedTicket.actions', []);
    data.set('unsatisfiedTicket.manager', 'undefined');
    data.set('unsatisfiedTicket.customer.contact.mobilePhone', mobilePhone);
    data.set('unsatisfiedTicket.customer.contact.email', email);
    data.set('unsatisfiedTicket.customer.fullName', fullName);
    data.set('unsatisfiedTicket.vehicle.make', (manualData && manualData.make) || data.get('vehicle.make.value'));
    data.set('unsatisfiedTicket.vehicle.model', (manualData && manualData.model) || data.get('vehicle.model.value'));
    data.set('unsatisfiedTicket.frontDeskUserName', frontDeskUserName);
    data.set('unsatisfiedTicket.vehicle.plate', (manualData && manualData.immat) || data.get('vehicle.plate.value'));
    data.set('unsatisfiedTicket.vehicle.vin', (manualData && manualData.vin) || data.get('vehicle.vin.value'));
    data.set('unsatisfiedTicket.type', (manualData && manualData.type) || data.get('type'));
    data.set('unsatisfiedTicket.vehicle.makeModel', makeModel);
    data.set(
      'unsatisfiedTicket.vehicle.mileage',
      (manualData && manualData.mileage) || data.get('vehicle.mileage.value')
    );
    data.set(
      'unsatisfiedTicket.vehicle.registrationDate',
      (manualData && manualData.registrationDate) || data.get('vehicle.registrationDate.value')
    );
  },

  initUnsatisfiedTicketContactFields(data, manualData, defaultCreationDate) {
    data.set('unsatisfiedTicket.manualDataFromContactTicket', true);
    if (!data.get('source.type')) {
      data.set('source.type', DataTypes.MANUAL_UNSATISFIED);
    }
    if (!data.get('service.providedAt')) {
      data.set('service.providedAt', defaultCreationDate);
    }
    if (manualData.unsatisfiedCriterias) {
      data.set('unsatisfied.criteria', manualData.unsatisfiedCriterias);
    }
    if (manualData.email) {
      const email = manualData.email && manualData.email.replace(gsEmail.removalOfUnauthorizedCharactersRegexp, '');
      data.set('customer.contact.email.value', email);
    }
    if (manualData.phone) {
      data.set('customer.contact.mobilePhone.value', manualData.phone);
    }
    if (manualData.fullName) {
      data.set('customer.fullName.value', manualData.fullName);
    }
  },

  //
  // ----------------------- TICKET ACTIONS RELATED FUNCTIONS -----------------------
  //

  /**
   * Add a new action to a ticket, this is kinda the main function here, it is very often the entry point
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the given ticket
   * @param args Information about the new action to add
   * @returns {Promise<*>} A Promise
   */
  async addAction(type, data, args) {
    // const dataSnapshot = await app.models.Kpi.createSnapshot(type, data);

    // 1. We perform so pre-check on the new action
    try {
      _common.actionPreCheck(type, data, args);
    } catch (e) {
      return Promise.reject(e);
    }

    // 2. We create the action array if it does not exist and we push the new action in it
    if (!data.get(`${type}Ticket.actions`)) {
      data.set(`${type}Ticket.actions`, []);
    }
    data.get(`${type}Ticket.actions`).push(args);

    // 3. We execute updates corresponding to the new action
    switch (args.name) {
      case TicketActionNames.TRANSFER:
        await _common.setManager(type, data, args);
        break;
      case TicketActionNames.REMINDER:
        await _common.addReminder(type, data, args);
        break;
      case TicketActionNames.POSTPONED_LEAD:
        await _common.postponeLead(data, args);
        break;
      case TicketActionNames[`${type.toUpperCase()}_CLOSED`]:
        await _common.closeTicket(type, data, args);
        break;
      case TicketActionNames[`${type.toUpperCase()}_REOPENED`]:
        await _common.reopenTicket(type, data, args);
        break;
      default:
        // 3.1 Set the ticket as touched if the action isn't about a followup being responded (treated when we add infos about the followup)
        if (
          ![
            TicketActionNames.LEAD_FOLLOWUP_RESPONDED,
            TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED,
            TicketActionNames.INCOMING_CALL,
            TicketActionNames.INCOMING_MISSED_CALL,
            TicketActionNames.INCOMING_EMAIL,
          ].includes(args.name)
        ) {
          data.set(`${type}Ticket.touched`, true);
        }
        await _common.performBasicAction(type, data, args);
        break;
    }

    // 4. There is a reaction if the action performed has been registered before the 24h threshold
    let becomesReactive = false;
    if (
      new Date() - new Date(data.get(`${type}Ticket.createdAt`)) < 1000 * 60 * 60 * 24 &&
      ![
        TicketActionNames.TRANSFER,
        TicketActionNames.INCOMING_CALL,
        TicketActionNames.INCOMING_MISSED_CALL,
        TicketActionNames.INCOMING_EMAIL,
      ].includes(args.name)
    ) {
      if (!data.get(`${type}Ticket.reactive`)) {
        becomesReactive = true;
      }
      data.set(`${type}Ticket.reactive`, true);
    }

    // 5. We update the ticket status
    const oldStatus = data.get(`${type}Ticket.status`);
    data.set(`${type}Ticket.status`, _common.determineTicketStatus(type, data));

    // 7 (variable needed), if the status changed, we need to know in the logs
    let newStatus = null;
    if (data.get(`${type}Ticket.status`) !== oldStatus) {
      newStatus = data.get(`${type}Ticket.status`);
    }

    // 7. We add an automation event if the data is from an automation campaign
    await app.models.AutomationCampaignsEvents.addEventsfromLeadTicketAction(
      data,
      args,
      type,
      newStatus,
      becomesReactive
    );
    // 8. We cancel escalade email notification when user make one of this action #3222
    if (
      [
        TicketActionNames.REMINDER,
        TicketActionNames[`${type.toUpperCase()}_CLOSED`],
        TicketActionNames.MEETING,
        TicketActionNames.CUSTOMER_CALL,
        TicketActionNames.PROPOSITION,
      ].includes(args.name)
    ) {
      await Scheduler.removeJob(JobTypes.ESCALATE, { dataId: data.getId().toString(), type, stage: 1 }, true);
      await Scheduler.removeJob(JobTypes.ESCALATE, { dataId: data.getId().toString(), type, stage: 2 }, true);
    }
    // 9. Send an email if it's a recontact
    const { recontact } = args;
    if (recontact) {
      await this.sendContactToSubscribers(data, ContactTypes.CROSS_LEADS_RECONTACT, AlertTypes.LEAD_VN, {
        args,
      });
    }
    return true;
  },

  /**
   * Close a given ticket, set some information in the ticket about it and notify contributors
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the said ticket
   * @param args Information about the closing
   * @returns {Promise<void>} An empty Promise
   */
  async closeTicket(type, data, args) {
    const actions = data.get(`${type}Ticket.actions`);

    // 1. Set general information about the closing
    data.set(`${type}Ticket.closedAt`, args.createdAt);
    data.set(`${type}Ticket.closedForInactivity`, args.closedForInactivity);
    data.set(`${type}Ticket.checkNotificationDay`, 0);
    if (!args.closedForInactivity) {
      // We keep the job in queue if it was closed by inactivity
      _common._updateCloseTicketJob(`${type}Ticket`, data, null);
      // We set the ticket as touched if it has been manually closed
      data.set(`${type}Ticket.touched`, true);
    }

    // 2. Specific information if it was a Lead
    if (type === 'lead') {
      data.set('leadTicket.wasTransformedToSale', args.wasTransformedToSale);
      data.set('leadTicket.missedSaleReason', args.missedSaleReason);
    }

    // 3. Specific information if it was an Unsatisfied
    if (type === 'unsatisfied') {
      data.set('unsatisfiedTicket.unsatisfactionResolved', args.unsatisfactionResolved);
      data.set('unsatisfiedTicket.providedSolutions', args.providedSolutions);
      data.set('unsatisfiedTicket.claimReasons', args.claimReasons);
    }

    // 4. Cancel potential remaining reminders & set referenceDate back to ticket.createdAt
    if (actions && actions.length > 0) {
      for (let i = 0; i < actions.length; i++) {
        if (
          actions[i].name === TicketActionNames.REMINDER &&
          actions[i].reminderStatus === ReminderStatuses.NOT_RESOLVED
        ) {
          actions[i].reminderStatus = ReminderStatuses.CANCELLED;
          actions[i].reminderNextDay = null;
        }
      }
    }
    data.set(`${type}Ticket.referenceDate`, data.get(`${type}Ticket.createdAt`));

    // 5. Alert potential contributors about the closing
    if (args.alertContributors) {
      await _common.notifyContributors(
        type,
        data,
        AlertType[`${type.toUpperCase()}_TICKET_CLOSE_ACTION`],
        args.assignerUserId,
        [args.assignerUserId]
      ); // eslint-disable-line
    }

    // 6. We schedule an event congratulate the contributor later if the ticket has been successfully handled
    if (await this.checkSuccessConditions(data, type)) {
      const inAnHour = new Date().setHours(new Date().getHours() + 1);
      log.debug(FED, 'Scheduler - new data success to check => add a POSSIBLE_SUCCESS_ALERT job');
      Scheduler.upsertJob(JobTypes.POSSIBLE_SUCCESS_ALERT, { dataId: data.getId(), type }, inAnHour);
    }
  },

  /**
   * Check if a ticket needs to alert contributors
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the said ticket
   * @returns {boolean} Allowing us to send the escalation
   */
  checkEscalationConditions(data, type) {
    const ticket = data.get(`${type}Ticket`);

    return (
      ticket &&
      !ticket.status.includes('Closed') &&
      (type === 'lead' || data.get('review.rating.value') <= 6) && // excluding tickets for sensitive customers
      (!this.hasMeaningfulAction(ticket) || this.hasOverdueReminder(ticket))
    );
  },

  async checkSuccessConditions(data, type) {
    const garage = await app.models.Garage.findById(data.get('garageId'));
    const mustLeave = [
      // In that case we don't fulfill the conditions for coach subscription
      GarageSubscriptionTypes.MAINTENANCE,
      GarageSubscriptionTypes.NEW_VEHICLE_SALE,
      GarageSubscriptionTypes.USED_VEHICLE_SALE,
    ].every((subscriptionType) => !garage.isSubscribed(subscriptionType));

    if (mustLeave) {
      return false;
    }
    if (type === 'lead' && data.get('leadTicket.wasTransformedToSale') && !data.get('leadTicket.alertSuccessSent')) {
      return (
        garage &&
        (garage.type === GarageTypes.DEALERSHIP ||
          garage.type === GarageTypes.MOTORBIKE_DEALERSHIP ||
          garage.type === GarageTypes.AGENT ||
          garage.type === GarageTypes.CAR_REPAIRER ||
          garage.type === GarageTypes.VEHICLE_INSPECTION ||
          garage.type === GarageTypes.UTILITY_CAR_DEALERSHIP)
      );
    }
    return (
      type === 'unsatisfied' &&
      data.get('unsatisfiedTicket.unsatisfactionResolved') &&
      !data.get('unsatisfiedTicket.alertSuccessSent')
    );
  },

  async sendToAlertSuccessList(data, type) {
    const users = await this.realTimeAlertUserList(data, type);
    const commonContact = { from: 'no-reply@custeed.com', sender: 'GarageScore' };

    // 3. We loop through our contributors object and send the notification
    for (const user of users) {
      const contact = {
        type: ContactTypes[`${type.toUpperCase()}_SUCCESS_ALERT`],
        to: user.email,
        recipient: user.fullName,
        ...commonContact,
        payload: {},
      };
      contact.payload.garageId = data.garageId;
      contact.payload.dataId = data.getId().toString();
      await new Promise((res, rej) => ContactService.prepareForSend(contact, (e, r) => (e ? rej(e) : res(r)))); // eslint-disable-line
    }
  },

  async sendToAlertEscalationList(data, type, stage, alertedUser) {
    const shortTypes = {
      Maintenance: 'Maintenance',
      NewVehicleSale: 'Vn',
      UsedVehicleSale: 'Vo',
      VehicleInspection: 'Vi',
    };
    const commonContact = { from: 'no-reply@custeed.com', sender: 'GarageScore' };

    let serviceType = 'Vn';
    if (type === 'lead') {
      serviceType = shortTypes[data.get('leadTicket.saleType')];
      serviceType = ['Vn', 'Vo', 'Maintenance'].includes(serviceType) ? serviceType : 'Vn'; // Set unknow to Vn
    } else {
      serviceType = shortTypes[data.get('unsatisfiedTicket.type')];
    }
    const formattedType = `${type[0].toUpperCase()}${type.slice(1)}`;
    const fields = { allGaragesAlerts: true, email: true, fullName: true };
    let users = await app.models.Garage.getUsersForGarageWithoutCusteedUsers(data.get('garageId'), fields);
    users = users.filter((u) => u.isSubscribedToRealTimeAlert(`Escalation${formattedType}${serviceType}`));

    // Sending the notification
    for (const user of users) {
      const contact = {
        type: ContactTypes[`ESCALATE_${type.toUpperCase()}_${stage}`],
        to: user.email,
        recipient: user.fullName,
        ...commonContact,
        payload: {},
      };
      contact.payload.dataId = data.getId().toString();
      contact.payload.alertedUser = alertedUser;
      const result = await new Promise((res, rej) =>
        ContactService.prepareForSend(contact, (e, r) => (e ? rej(e) : res(r)))
      ); // eslint-disable-line
    }
  },

  async realTimeAlertUserList(data, type) {
    const correspondance = {
      lead: {
        Maintenance: 'LeadApv',
        NewVehicleSale: 'LeadVn',
        UsedVehicleSale: 'LeadVo',
      },
      unsatisfied: {
        Maintenance: 'UnsatisfiedMaintenance',
        NewVehicleSale: 'UnsatisfiedVn',
        UsedVehicleSale: 'UnsatisfiedVo',
        VehicleInspection: 'UnsatisfiedVI',
      },
    };
    const fields = { id: true, allGaragesAlerts: true, email: true, fullName: true };
    let users = await app.models.Garage.getUsersForGarageWithoutCusteedUsers(data.get('garageId'), fields);
    const actions = data.get(`${type}Ticket.actions`) || [];
    const contributorIds = {};

    // 1. We loop through past actions and add each assigned user and manager to the contributors
    for (const action of actions) {
      if (action.assignerUserId) {
        contributorIds[action.assignerUserId] = true;
      }
      if (action.ticketManagerId) {
        contributorIds[action.ticketManagerId] = true;
      }
    }
    // 2. We filtrate our users list to include only contributors and those subscribed to the alert
    const field = type === 'lead' ? 'saleType' : 'type';
    users = users.filter(
      (u) =>
        contributorIds[u.getId().toString()] ||
        u.isSubscribedToRealTimeAlert(correspondance[type][data.get(`${type}ticket.${field}`)])
    );
    return users.map((u) => ({
      email: u.email,
      fullName: u.fullName,
    }));
  },

  /**
   * Reopen a closed ticket
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the given ticket
   * @param args Information about the reopening
   * @returns {Promise<void>} An empty Promise
   */
  async reopenTicket(type, data, args) {
    // 1. If it's a lead, we reset wasTransformedToSale to false
    if (type === 'lead' && data.get(`${type}Ticket.wasTransformedToSale`)) {
      data.set(`${type}Ticket.wasTransformedToSale`, false);
    }

    // 2. If it's an unsatisfied, we reset unsatisfactionResolved to false
    if (type === 'unsatisfied' && data.get(`${type}Ticket.unsatisfactionResolved`)) {
      data.set(`${type}Ticket.unsatisfactionResolved`, false);
    }

    // 3. We update the inactivity closing day for the ticket
    _common._updateCloseTicketJob(`${type}Ticket`, data, Date.now() + _common[`INACTIVE_${type.toUpperCase()}_DELAY`]);

    // 4. We notify the contributors if necessary
    if (args.alertContributors) {
      await _common.notifyContributors(
        type,
        data,
        AlertType[`${type.toUpperCase()}_TICKET_REOPEN`],
        args.assignerUserId,
        [args.assignerUserId]
      ); // eslint-disable-line
    }
  },

  cancelPreviousReminders(type, data, { excludeDate = new Date(0), assignerUserId, postponedLead = false } = {}) {
    const actions = data.get(`${type}Ticket.actions`) || [];

    for (const action of actions) {
      const actionCreationDate = action.createdAt && new Date(action.createdAt).toISOString();
      const isReminderLike = TicketActionNames.getPropertyFromValue(action.name, 'isReminderLike');
      if (isReminderLike && actionCreationDate !== excludeDate) {
        action.reminderStatus = ReminderStatuses.CANCELLED;
        action.reminderFirstDay = 0;
        action.reminderNextDay = 0;
        action.reminderTriggeredByUserId = assignerUserId;
        if (postponedLead) {
          action.cancelledByPostponedLead = true;
        }
      }
    }
  },

  /**
   * Update ticket information with new reminder
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the given ticket
   * @param args Information about the new reminder
   * @returns {Promise<void>} An empty Promise
   */
  async addReminder(type, data, { createdAt, reminderFirstDay, reminderNextDay, assignerUserId }) {
    // 1. We cancel every other reminder, as we must have, at most, only 1 reminder
    const newActionCreationDate = new Date(createdAt).toISOString();
    _common.cancelPreviousReminders(type, data, { excludeDate: newActionCreationDate, assignerUserId });

    // 2. We update the inactivity closing day if necessary
    const checkNotificationDay = data.get(`${type}Ticket.checkNotificationDay`);
    if (reminderFirstDay < checkNotificationDay || !checkNotificationDay) {
      const reminderFirstDayTime = timeHelper.dayNumberToDate(reminderFirstDay).getTime();
      const inactivityDelay = _common[`INACTIVE_${type.toUpperCase()}_DELAY`];
      _common._updateCloseTicketJob(`${type}Ticket`, data, reminderFirstDayTime + inactivityDelay);
    }

    // 3. We add a special process if the reminder is planed for today and we put it tomorrow
    if (reminderNextDay === timeHelper.dayNumber(new Date())) {
      reminderNextDay++; // eslint-disable-line no-param-reassign
    }

    // 4. We update the next reminder email notification day
    data.set(`${type}Ticket.checkNotificationDay`, _common.getNewNotificationDay(data.get(`${type}Ticket.actions`)));
  },

  /**
   * Postponing a lead
   * @param data The data that contains the given ticket
   * @param args Information about the new postponing
   * @returns {Promise<void>} An empty Promise
   */
  async postponeLead(data, { createdAt, reminderFirstDay, reminderNextDay, assignerUserId }) {
    // 1. We cancel every reminder
    const excludeDate = new Date(createdAt).toISOString();
    _common.cancelPreviousReminders('lead', data, { excludeDate, assignerUserId, postponedLead: true });

    // 2. We update the inactivity closing day
    const targetDay = timeHelper.dayNumberToDate(reminderFirstDay);
    const targetCloseTime = targetDay.getTime() + _common.INACTIVE_LEAD_DELAY;
    _common._updateCloseTicketJob('leadTicket', data, targetCloseTime);

    // 3. We add a special process if the reminder is planed for today and we put it tomorrow
    if (reminderNextDay === timeHelper.dayNumber(new Date())) {
      reminderNextDay++;
    }
    // 4. Set the appropriate status
    data.set('leadTicket.status', _common.determineTicketStatus('lead', data));

    // 4. We update the next reminder email notification day & reference date
    data.set('leadTicket.checkNotificationDay', reminderNextDay);
    _common.determineTicketReferenceDate('lead', data);
  },

  /**
   * Set a new manager to the ticket and notify him/her about it
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the given ticket
   * @param args Information about the transfer
   * @param sendNotification Whether or not you want to send an email notification to the new manager
   * @returns {Promise<void>} An empty Promise
   */
  async setManager(type, data, args, sendNotification = true) {
    const oldMangerId = data.get(`${type}Ticket.manager`);
    const newManagerId = args.ticketManagerId || args.assignerUserId || null;
    if (!newManagerId)
      throw new Error(`Can't setManager on data ${data.id.toString()}, ticketManagerId and assignerUserId are empty.`);

    // 1. We set the new managerId into the ticket
    if (newManagerId !== oldMangerId) data.set(`${type}Ticket.manager`, newManagerId.toString());

    // 2. If the new manager exists we notify him/her about the transfer
    if (sendNotification && !args.selfAssigned && newManagerId !== oldMangerId) {
      const contactCommon = { from: 'no-reply@custeed.com', sender: 'GarageScore', type: ContactTypes.ALERT_EMAIL };
      const user = await app.models.User.findById(newManagerId, { fields: { email: true, fullName: true } });

      const contact = {
        to: user.email,
        recipient: user.fullName,
        ...contactCommon,
        payload: {
          alertType: AlertType[`${type.toUpperCase()}_TICKET_TRANSFER`],
          actionIndex: data.get(`${type}Ticket.actions`).length - 1,
          garageId: data.garageId,
          addresseeId: newManagerId,
          assignerUserId: args.assignerUserId || oldMangerId,
          dataId: data.getId().toString(),
        },
      };
      await promisify((cb) => ContactService.prepareForSend(contact, cb))();
    }

    // 3. We add the manager to the cockpit top filters
    const garage = await app.models.Garage.findById(data.get('garageId'), { fields: { type: true } });
    const garageId = data.garageId;
    const garageType = (garage && garage.type) || undefined;
    const dataType = type === 'lead' ? undefined : data.get('type');
    const source = data.get('source.type');
    const frontDeskUserName = data.get('service.frontDeskUserName');
    const leadSaleType = type === 'lead' ? data.get('leadTicket.saleType') : undefined;
    const manager = data.get(`${type}Ticket.manager`);
    await addManager(app, type, {
      garageId,
      garageType,
      type: dataType,
      source,
      frontDeskUserName,
      leadSaleType,
      manager,
    });
  },

  /**
   * Update ticket information upon a basic new action like CUSTOMER_CALL or MEETING
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the given ticket
   * @param args Information about the new action
   * @returns {Promise<void>} An empty Promise
   */
  async performBasicAction(type, data, args) {
    const actions = data.get(`${type}Ticket.actions`) || [];

    // 1. We update the closing inactivity day
    _common._updateCloseTicketJob(`${type}Ticket`, data, Date.now() + _common[`INACTIVE_${type.toUpperCase()}_DELAY`]);

    // 2. We loop through every unresolved reminders corresponding to the new action and put them as resolved
    for (const action of actions) {
      const isReminder = action.name === TicketActionNames.REMINDER;
      const { reminderActionName, reminderStatus } = action;
      if (isReminder && reminderActionName === args.name && reminderStatus === ReminderStatuses.NOT_RESOLVED) {
        action.reminderStatus = ReminderStatuses.RESOLVED;
        action.reminderTriggeredByUserId = args.assignerUserId;
        // 2. (Bis) We update the next reminder emailing day if necessary
        if (data.get(`${type}Ticket.checkNotificationDay`) === action.reminderNextDay) {
          const newNotificationDay = _common.getNewNotificationDay(data.get(`${type}Ticket.actions`));
          data.set(`${type}Ticket.checkNotificationDay`, newNotificationDay);
        }
      }
    }

    // 3. Cancel potential previous reminders in the timeline
    const timeLineOrder = [
      TicketActionNames.CUSTOMER_CALL,
      TicketActionNames.MEETING,
      TicketActionNames.GARAGE_SECOND_VISIT,
      TicketActionNames.PROPOSITION,
    ];
    if (timeLineOrder.includes(args.name)) {
      for (const action of actions) {
        if (
          action.name === TicketActionNames.REMINDER &&
          action.reminderStatus === ReminderStatuses.NOT_RESOLVED &&
          timeLineOrder.indexOf(action.reminderActionName) < timeLineOrder.indexOf(args.name) &&
          timeLineOrder.includes(action.reminderActionName)
        ) {
          action.reminderStatus = ReminderStatuses.CANCELLED;
          action.reminderFirstDay = 0;
          action.reminderNextDay = 0;
          action.reminderTriggeredByUserId = args.assignerUserId;
        }
      }
    }

    // 4. Determine the correct referenceDate for the ticket
    _common.determineTicketReferenceDate(type, data);
  },

  /**
   * Cancel a given reminder
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the given ticket
   * @param args Information about the reminder you want to cancel
   * @returns {Promise<void>} An empty Promise
   */
  async cancelReminder(type, data, args) {
    // const dataSnapshot = await app.models.Kpi.createSnapshot(type, data);
    const actions = data.get(`${type}Ticket.actions`) || [];

    const reminderActions = actions.filter(
      ({ name, reminderStatus }) =>
        TicketActionNames.getPropertyFromValue(name, 'isReminderLike') === true &&
        reminderStatus !== ReminderStatuses.CANCELLED
    );
    if (!reminderActions || !reminderActions.length) {
      return;
    }
    // 1. We loop through every reminder and cancelled the matching ones
    for (const action of reminderActions) {
      const isSameDate = new Date(action.createdAt).toISOString() === new Date(args.createdAt).toISOString();
      const isReminderLike = TicketActionNames.getPropertyFromValue(action.name, 'isReminderLike');
      if (isSameDate && isReminderLike) {
        action.reminderStatus = ReminderStatuses.CANCELLED;
        action.reminderFirstDay = 0;
        action.reminderNextDay = 0;
        action.reminderTriggeredByUserId = args.userId;
        const newNotificationDay = _common.getNewNotificationDay(data.get(`${type}Ticket.actions`));
        data.set(`${type}Ticket.checkNotificationDay`, newNotificationDay);
        // 1.2 We update the ticket status
        data.set(`${type}Ticket.status`, _common.determineTicketStatus(type, data));
      }
    }

    // 2. Set the appropriate status
    data.set('leadTicket.status', _common.determineTicketStatus('lead', data));

    // 3. Determine the correct referenceDate for the ticket
    _common.determineTicketReferenceDate(type, data);
  },

  determineTicketReferenceDate(type, data) {
    const { REMINDER, POSTPONED_LEAD } = TicketActionNames;
    const { RESOLVED, NOT_RESOLVED } = ReminderStatuses;
    const actions = data.get(`${type}Ticket.actions`) || [];
    const isActive = ({ reminderStatus }) => [RESOLVED, NOT_RESOLVED].includes(reminderStatus);
    const isActiveReminder = ({ name, reminderStatus }) => name === REMINDER && isActive({ reminderStatus });
    const isActivePostpone = ({ name, reminderStatus }) => name === POSTPONED_LEAD && isActive({ reminderStatus });
    const [lastActiveReminder] = actions
      .filter((action) => isActiveReminder(action) || isActivePostpone(action))
      .sort((a, b) => b.reminderFirstDay - a.reminderFirstDay);

    // If there's at least 1 active reminder and its date is in the past
    const reminderDate = lastActiveReminder && timeHelper.dayNumberToDate(lastActiveReminder.reminderFirstDay);
    if (reminderDate && moment(reminderDate).isBefore(moment())) {
      data.set(`${type}Ticket.referenceDate`, reminderDate);
    } else {
      data.set(`${type}Ticket.referenceDate`, data.get(`${type}Ticket.createdAt`));
    }
  },

  /**
   * Update an unsatisfied ticket based on a followupUnsatisfied email response from a final client
   * @param data The data that contains the unsatisfied ticket
   * @returns {Promise<void>} An empty Promise
   */
  async updateUnsatisfiedTicketFromFollowup(data) {
    const followupStatus = data.get('unsatisfied.followupStatus') || null;
    const actions = data.get('unsatisfiedTicket.actions') || [];
    const lastFollowupResponseAction = actions.find(
      (action) => action.name === TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED
    );

    if (followupStatus && actions.length) {
      if (!lastFollowupResponseAction) {
        await _common.addAction('unsatisfied', data, {
          name: TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED,
          createdAt: data.get('unsatisfied.comment.updatedAt'),
          followupStatus: data.get('unsatisfied.followupStatus'),
          followupIsRecontacted: data.get('unsatisfied.isRecontacted'),
          followupUnsatisfiedCommentForManager: data.get('unsatisfied.comment.text'),
          followupUnsatisfiedRating: data.get('review.followupUnsatisfiedRating.value'),
          followupNewComment: data.get('review.followupUnsatisfiedComment.text'),
        });
      }
      if (
        !UnsatisfiedTicketStatuses.isClosed(data.get('unsatisfiedTicket.status')) &&
        followupStatus === UnsatisfiedFollowupStatuses.RESOLVED
      ) {
        // eslint-disable-line
        await _common.addAction('unsatisfied', data, {
          name: TicketActionNames.UNSATISFIED_CLOSED,
          createdAt: new Date(),
          unsatisfactionResolved: true,
          customerFollowupResolved: true,
        });
      }
    }

    // Set the ticket as touched if the followup shows a contact with the garage
    if (
      data.get('unsatisfied.isRecontacted') ||
      data.get('unsatisfied.followupStatus') === UnsatisfiedFollowupStatuses.RESOLVED
    ) {
      data.set('unsatisfiedTicket.touched', true);
    }
  },

  /**
   * Update an lead ticket based on a followupLead email response from a final client
   * @param data The data that contains the lead ticket
   * @param followupLeadData The data from the followup response
   * @returns {Promise<void>} An empty Promise
   */
  async updateLeadTicketFromFollowup(data, followupLeadData) {
    if (!followupLeadData) return;
    const actions = data.get('leadTicket.actions') || [];
    const lastFollowupResponseAction = actions.find(
      (action) => action.name === TicketActionNames.LEAD_FOLLOWUP_RESPONDED
    );

    if (actions.length && !lastFollowupResponseAction) {
      await _common.addAction('lead', data, {
        name: TicketActionNames.LEAD_FOLLOWUP_RESPONDED,
        createdAt: new Date(),
        ...Object.keys(followupLeadData).reduce((acc, key) => {
          acc[`followupLead${key.charAt(0).toUpperCase() + key.slice(1)}`] = data.get(`leadTicket.followup.${key}`); // eslint-disable-line
          return acc;
        }, {}),
      });
    }

    // Set the ticket as touched if the followup shows a contact with the garage
    if (data.get('leadTicket.followup.recontacted')) {
      data.set('leadTicket.touched', true);
    }
  },

  async resetManagerId(userId, garageIds = null) {
    const garageIdQuery = { garageId: { inq: garageIds } };
    const leadDatas = await app.models.Data.find({
      where: { 'leadTicket.manager': userId.toString(), ...(garageIds ? garageIdQuery : {}) },
    });
    const unsatisfiedDatas = await app.models.Data.find({
      where: { 'unsatisfiedTicket.manager': userId.toString(), ...(garageIds ? garageIdQuery : {}) },
    });
    // let dataSnapshot = null;

    for (const data of leadDatas) {
      data.set('leadTicket.manager', 'undefined');
      await data.save();
    }

    for (const data of unsatisfiedDatas) {
      data.set('unsatisfiedTicket.manager', 'undefined');
      await data.save();
    }
    await app.models.Kpi.destroyAllUserKpi(userId, garageIds);
  },

  //
  // ----------------------- EMAIL RELATED FUNCTIONS -----------------------
  //
  /**
   * Will notify via email all the contributors of a 'lead' or 'unsatisfied' ticket about the last action in said ticket
   * @param type 'lead' or 'unsatisfied'
   * @param data The data that contains the ticket
   * @param alertType The type of alert, see '/common/models/alert.types'
   * @param assignerUserId The userId who triggered the notification
   * @param excludedUsers An arrat of userId you want to exclude from the emailing list
   * @returns {Promise<void>} Returns an empty Promise
   */
  async notifyContributors(type, data, alertType, assignerUserId, excludedUsers = []) {
    const commonContact = { from: 'no-reply@custeed.com', sender: 'GarageScore', type: ContactTypes.ALERT_EMAIL };
    const actions = data.get(`${type}Ticket.actions`) || [];
    const contributorIds = {};
    let user = null;
    let contact = null;

    // 1. We loop through past actions and add each assigned user and manager to the contributors
    for (const action of actions) {
      if (action.assignerUserId) {
        contributorIds[action.assignerUserId] = true;
      }
      if (action.ticketManagerId) {
        contributorIds[action.ticketManagerId] = true;
      }
    }

    // 2. We loop through every excluded user and get them off the contributors
    for (const excludedUserId of excludedUsers) {
      contributorIds[excludedUserId] = false;
    }

    // 3. We loop through our contributors object and send the notification
    for (const contributorId of Object.keys(contributorIds)) {
      if (contributorIds[contributorId]) {
        user = await app.models.User.findById(contributorId);
        if (user) {
          contact = {
            to: user.email,
            recipient: user.fullName,
            ...commonContact,
            payload: {},
          };
          contact.payload.alertType = alertType;
          contact.payload.actionIndex = data.get(`${type}Ticket.actions`).length - 1;
          contact.payload.garageId = data.garageId;
          contact.payload.addresseeId = user.getId().toString();
          contact.payload.assignerUserId = assignerUserId;
          contact.payload.dataId = data.getId().toString();
          await new Promise((res, rej) => ContactService.prepareForSend(contact, (e, r) => (e ? rej(e) : res(r)))); // eslint-disable-line
        }
      }
    }
  },

  /**
   * Send an email to the users assigned to reminders that are planned for the given day
   * @param type 'lead' or 'unsatisfied'
   * @param dayNumber The day upon which you want to send the reminders
   * @returns {Promise<void>} Returns an empty Promise
   */
  async sendRemindersForGivenDay(type, dayNumber) {
    const getTicketManagerId = (data) => {
      const ticketManager = data.get(`${type}Ticket.manager`);
      if (ticketManager === 'undefined') return null;
      return ticketManager || null;
    };
    const actionIsValidReminder = ({ name, reminderNextDay, reminderStatus }) => {
      const isReminderLike = TicketActionNames.getPropertyFromValue(name, 'isReminderLike');
      const isForCurrentDay = reminderNextDay === dayNumber;
      const isActive = reminderStatus !== ReminderStatuses.CANCELLED;
      return isReminderLike && isForCurrentDay && isActive;
    };
    const commonContact = {
      from: 'no-reply@custeed.com',
      sender: 'GarageScore',
      type: ContactTypes.ALERT_EMAIL,
    };
    const query = {
      where: { [`${type}Ticket.checkNotificationDay`]: dayNumber },
      order: `${type}Ticket.checkNotificationDay DESC`,
    };
    const datas = await app.models.Data.find(query);
    const userToContact = {};

    // 1. We loop through every concerned ticket, we build our userToContact object and we update the next reminder day
    for (const data of datas) {
      const actions = data.get(`${type}Ticket.actions`) || [];
      const managerId = getTicketManagerId(data);
      for (const action of actions) {
        const assignedId = action.assignerUserId || managerId;
        if (actionIsValidReminder(action) && assignedId) {
          userToContact[assignedId] = userToContact[assignedId] || [];
          userToContact[assignedId].push({
            ...action.__data,
            garageId: data.garageId,
            dataId: data.getId().toString(),
            customerFullName: data.customer_getCustomerFullName(),
          });
          if (action.name === TicketActionNames.REMINDER) {
            action.reminderNextDay++;
          }
          data.set(
            `${type}Ticket.checkNotificationDay`,
            _common.getNewNotificationDay(data.get(`${type}Ticket.actions`))
          );
        }
      }
      // Let's see if we have to update the referenceDate
      _common.determineTicketReferenceDate(type, data);
      await data.save();
    }

    // 2. Get all relevant Users in one go for optimization purposes
    const userIdsList = Object.keys(userToContact).map((userId) => new ObjectID(userId));
    const projection = {
      _id: true,
      email: true,
      fullName: true,
      garageIds: true,
    };
    const users = await app.models.User.getMongoConnector()
      .find({ _id: { $in: userIdsList } }, { projection })
      .toArray();

    // 3. For each user to contact we are going to send one email, if it has not been sent before
    const alertType = type === 'lead' ? AlertType.LEAD_TICKET_REMINDER : AlertType.UNSATISFIED_TICKET_REMINDER;
    for (const { _id, email, fullName, garageIds } of users) {
      const userId = _id.toString();
      // We won't process reminders for datas on garages the user is not granted access to
      // But in the meantime we can't simply cancel the reminder in case the user has been removed access then granted access again
      // That's why we filter here instead of higher or instead of canceling the job
      const actionsToRemind =
        userToContact[userId] &&
        userToContact[userId].filter(({ garageId }) => hasAccessToGarage({ garageIds }, garageId));
      // Making sure we don't shoot emails about 0 actions...
      if (actionsToRemind.length) {
        const contact = {
          to: email,
          recipient: fullName,
          ...commonContact,
          payload: {
            alertType,
            dayNumber,
            actions: actionsToRemind,
            addresseeId: userId,
          },
        };
        await new Promise((res, rej) => ContactService.prepareForSend(contact, (e, r) => (e ? rej(e) : res(r))));
      }
    }
  },

  // create/modify/delete a job to close a ticket
  async _updateCloseTicketJob(type, data, date) {
    const jobType =
      type === 'leadTicket' ? JobTypes.CLOSE_EXPIRED_LEAD_TICKET : JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET;
    const payload = { dataId: data.getId().toString() };
    if (date === null) {
      await Scheduler.removeJob(jobType, payload);
      if (!data.get(type) && type === 'unsatisfiedTicket')
        await Scheduler.removeJob(JobTypes.SEND_UNSATISFIED_FOLLOWUP, payload);
      if (!data.get(type) && type === 'leadTicket') await Scheduler.removeJob(JobTypes.SEND_LEAD_FOLLOWUP, payload);
      return;
    }
    await Scheduler.upsertJob(jobType, payload, date);
  },

  /**
   * Create an Alert upon a ticket creation
   * @param type Either lead or unsatisfied
   * @param data The data which contain the ticket
   * @param garage The garage to which the data belongs
   * @returns {Promise<void>} An empty Promise
   */
  async sendTicketCreationAlert(type, data, garage, manualAlertType = null) {
    const alertSubscriber = new AlertSubscriber(app);
    const alert = {};
    const managerId = data.get(`${type}Ticket.manager`);
    let alertType = null;
    let alertUsers = [];
    // 0. Let's check the subscriptions first, we don't send alert if you don't pay
    if (!garage.subscriptions || !garage.subscriptions.active) return null;

    // 1. If we are dealing with a leadTicket creation
    if (type === 'lead') {
      if (!garage.subscriptions.Lead || !garage.subscriptions.Lead.enabled) return null;
      if (garage.type === GarageTypes.VEHICLE_INSPECTION) return null;
      if (data.get('lead.potentialSale') && data.get('lead.saleType') === LeadSaleTypes.MAINTENANCE) {
        alertType = AlertType.LEAD_APV;
      } else if (data.get('lead.potentialSale') && data.get('lead.saleType') !== LeadSaleTypes.USED_VEHICLE_SALE) {
        alertType = AlertType.LEAD_VN;
      } else if (data.get('lead.potentialSale') && data.get('lead.saleType') === LeadSaleTypes.USED_VEHICLE_SALE) {
        alertType = AlertType.LEAD_VO;
      }
      if (manualAlertType) alertType = manualAlertType;
    }

    // 2. If we are dealing with a unsatisfiedTicket creation
    if (type === 'unsatisfied') {
      switch (data.get('type')) {
        case DataTypes.MAINTENANCE:
          if (!garage.subscriptions.Maintenance || !garage.subscriptions.Maintenance.enabled) return null;
          alertType = app.models.Alert.getAlertType(data, garage);
          break;
        case DataTypes.NEW_VEHICLE_SALE:
          if (!garage.subscriptions.NewVehicleSale || !garage.subscriptions.NewVehicleSale.enabled) return null;
          alertType = app.models.Alert.getAlertType(data, garage);
          break;
        case DataTypes.USED_VEHICLE_SALE:
          if (!garage.subscriptions.UsedVehicleSale || !garage.subscriptions.UsedVehicleSale.enabled) return null;
          alertType = app.models.Alert.getAlertType(data, garage);
          break;
        case DataTypes.VEHICLE_INSPECTION:
          if (!garage.subscriptions.VehicleInspection || !garage.subscriptions.VehicleInspection.enabled) return null;
          alertType = app.models.Alert.getAlertType(data, garage);
          break;
        default:
          break;
      }
    }

    if (!alertType) {
      console.error(`[Ticket/Alert] Unable to determine AlertType ! TicketType : ${type}, dataId: ${data.getId()}`);
      return null;
    }

    // 3. We configure the alert document to be created, it will be send later by a CRON
    alertUsers = (await alertSubscriber.getSubscribedUsers(garage.id.toString(), alertType)) || [];
    alert.type = alertType;
    alert.dataId = data.getId().toString();
    alert.isDeferred = true;
    alert.executionDate = new Date(Date.now() + (parseInt(process.env.DEFERRED_ALERTS_DELAY, 10) || 3600) * 1000);
    alert.foreign = { userIds: alertUsers.map((u) => u.id.toString()) };
    alert.createdInRealTime = true;

    // 4. If the default manager was not subscribed to the alert, we force it. But only if it's not a VehicleInspection.
    if (garage.type !== GarageTypes.VEHICLE_INSPECTION) {
      if (!alert.foreign.userIds.find((id) => id === managerId) && managerId && managerId !== 'undefined') {
        alert.foreign.userIds.push(managerId);
      }
    }

    // 5. Create the damn thing
    return app.models.Alert.create(alert);
  },

  alertStillValid(data, garage, alertType) {
    switch (alertType) {
      case AlertType.AUTOMATION_LEAD_APV:
        return data.get('lead.potentialSale') && data.get('lead.saleType') === LeadSaleTypes.MAINTENANCE;
      case AlertType.AUTOMATION_LEAD_VN:
        return data.get('lead.potentialSale') && data.get('lead.saleType') === LeadSaleTypes.NEW_VEHICLE_SALE;
      case AlertType.AUTOMATION_LEAD_VO:
        return data.get('lead.potentialSale') && data.get('lead.saleType') === LeadSaleTypes.USED_VEHICLE_SALE;
      case AlertType.LEAD_VN:
        return data.get('lead.potentialSale') && data.get('lead.saleType') !== LeadSaleTypes.USED_VEHICLE_SALE;
      case AlertType.LEAD_VO:
        return data.get('lead.potentialSale') && data.get('lead.saleType') === LeadSaleTypes.USED_VEHICLE_SALE;
      case AlertType.UNSATISFIED_MAINTENANCE:
        return (
          data.get('type') === DataTypes.MAINTENANCE &&
          !(garage.isSubscribed('Lead') && data.get('lead.potentialSale')) &&
          data.review_isDetractor()
        ); // eslint-disable-line
      case AlertType.UNSATISFIED_VN:
        return data.get('type') === DataTypes.NEW_VEHICLE_SALE && data.review_isDetractor();
      case AlertType.UNSATISFIED_VO:
        return data.get('type') === DataTypes.USED_VEHICLE_SALE && data.review_isDetractor();
      case AlertType.UNSATISFIED_MAINTENANCE_WITH_LEAD:
        return (
          data.get('type') === DataTypes.MAINTENANCE &&
          garage.isSubscribed('Lead') &&
          data.get('lead.potentialSale') &&
          data.review_isDetractor()
        ); // eslint-disable-line
      case AlertType.UNSATISFIED_VI:
        return data.get('type') === DataTypes.VEHICLE_INSPECTION && data.review_isDetractor();
      case AlertType.SENSITIVE_MAINTENANCE:
        return (
          data.get('type') === DataTypes.MAINTENANCE &&
          !(garage.isSubscribed('Lead') && data.get('lead.potentialSale')) &&
          data.review_isSensitive(garage)
        ); // eslint-disable-line
      case AlertType.SENSITIVE_MAINTENANCE_WITH_LEAD:
        return (
          data.get('type') === DataTypes.MAINTENANCE &&
          garage.isSubscribed('Lead') &&
          data.get('lead.potentialSale') &&
          data.review_isSensitive(garage)
        ); // eslint-disable-line
      case AlertType.SENSITIVE_VN:
        return data.get('type') === DataTypes.NEW_VEHICLE_SALE && data.review_isSensitive(garage);
      case AlertType.SENSITIVE_VO:
        return data.get('type') === DataTypes.USED_VEHICLE_SALE && data.review_isSensitive(garage);
      case AlertType.SENSITIVE_VI:
        return data.get('type') === DataTypes.VEHICLE_INSPECTION && data.review_isSensitive(garage);
      default:
        return false;
    }
  },

  // Emitting events
  emitAddLeadTicketEvent(data, garage) {
    const eventsEmitterContext = leadTicketContext.create(garage.id, data.get('leadTicket.saleType'));
    const eventsEmitter = new EventsEmitter(eventsEmitterContext);

    // counter specs will be transformed into an Object using Object.fromEntries
    // [key, value] where key is counter's name and value is an Int >= 0
    // values === 0 => eliminated
    // if you wish to add a new counter, feel free to add a line
    const source = data.get('source.type');
    const escapedSource = source.replace('\\', '\\\\').replace('$', '\\u0024').replace('.', '\\u002e');
    const countersSpecs = [
      ['customSource', !SourceTypes.hasValue(source)], // #4010 counting manual leads with customSources
      ['manualLead', SourceTypes.hasValue(source) && !!SourceTypes.getPropertyFromValue(source, 'manualLeadSource')],
      [escapedSource, 1],
    ];
    const counters = Object.fromEntries(countersSpecs.filter(([k, v]) => v > 0));

    eventsEmitter.accumulatorAdd(leadTicketContext.EVENTS.ADD_LEAD_TICKET, counters);
    eventsEmitter.accumulatorEmit();
  },

  async sendLeadToApi(data, garage) {
    let externalApi = null;
    if (garage && garage.salesforce && garage.salesforce.enabled) {
      const sourceType = data.get('source.type');
      const allowedSourceTypes = garage.salesforce.allowedSourceTypes;
      if (!allowedSourceTypes.includes(sourceType)) {
        return;
      }
      externalApi = ExternalApi.SALESFORCE;
    }
    if (garage && garage.selectup && garage.selectup.enabled) {
      externalApi = ExternalApi.SELECTUP;
    }
    if (garage && garage.daimler && garage.daimler.enabled) {
      externalApi = ExternalApi.DAIMLER;
    }
    if (externalApi) {
      await Scheduler.upsertJob(
        JobTypes.EXTERNAL_API,
        {
          dataId: data.get('id'),
          garageId: data.get('garageId'),
          externalApi: externalApi,
        },
        new Date(),
        { immediate: true }
      );
    }
  },
};

module.exports = _common;
