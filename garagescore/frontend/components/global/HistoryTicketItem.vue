<template>
  <HistoryItem>
    <template slot="icon">
      <i :class="actionIcon"/>
    </template>
    <div class="history-ticket__part">
      <template v-if="action.name === TicketActionNames.UNSATISFIED_STARTED">
        <AppText v-if="!action.isManual" tag="span" bold>{{ $t_locale('components/global/HistoryTicketItem')('unsatisfiedAlert')  }} </AppText>
        <AppText v-else tag="span" bold>{{ formatUser(action.assigner) !== $t_locale('components/global/HistoryTicketItem')('deletedUser') ? formatUser(action.assigner) : formatUser(action.ticketManager) }} {{ $t_locale('components/global/HistoryTicketItem')('manualUnsatisfied') }}</AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.LEAD_STARTED">
        <AppText v-if="automationCampaign && automationCampaign.id" tag="span">
          <strong>{{ $t_locale('components/global/HistoryTicketItem')('leadAlertAutomation', leadAlertAutomationProps) }}</strong>
        </AppText>
        <AppText v-else-if="!action.isManual" tag="span" bold>{{ $t_locale('components/global/HistoryTicketItem')('leadAlert') }} {{ agentName }}</AppText>
        <AppText v-else tag="span" bold>{{ $t_locale('components/global/HistoryTicketItem')('manualLead', {source: $t_locale('components/global/HistoryTicketItem')(sourceType, {}, sourceType), user: formatUser(action.assigner) !== $t_locale('components/global/HistoryTicketItem')('deletedUser')  ? formatUser(action.assigner) : formatUser(action.ticketManager)}) }}</AppText>
      </template>

      <template v-else-if="[TicketActionNames.INCOMING_CALL, TicketActionNames.INCOMING_MISSED_CALL].includes(action.name)">
        <AppText tag="span" class="history-ticket__text" v-if="action.name === TicketActionNames.INCOMING_MISSED_CALL">
          <strong>{{ $t_locale('components/global/HistoryTicketItem')('theCustomer') }} </strong> {{ $t_locale('components/global/HistoryTicketItem')('missedCall') }} <strong> {{ $t_locale('components/global/HistoryTicketItem')(action.sourceType, {}, action.sourceType) }}</strong>
        </AppText>
        <AppText tag="span" class="history-ticket__text" v-else>
          {{ $t_locale('components/global/HistoryTicketItem')('called') }} <strong> {{ $t_locale('components/global/HistoryTicketItem')(action.sourceType, {}, action.sourceType) }}</strong>
        </AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.INCOMING_EMAIL">
        <AppText tag="span" class="history-ticket__text">
          <strong>{{ $t_locale('components/global/HistoryTicketItem')('theCustomer') }} </strong> {{ $t_locale('components/global/HistoryTicketItem')('incomingEmail') }} <strong> {{ $t_locale('components/global/HistoryTicketItem')(action.sourceType, {}, action.sourceType) }} </strong> <a target="_blank" class="history-ticket__link" v-if="action.adUrl" :href="action.adUrl">- {{ $t_locale('components/global/HistoryTicketItem')('seeAd') }}&nbsp;&nbsp;<i class="icon-gs-link"></i></a>
        </AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.UNSATISFIED_CLOSED">
        <AppText tag="span" class="history-ticket__text" v-if="!isGarageScoreScript"><strong>{{ formatUser(action.assigner) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('closedByUser') }} </AppText>
        <AppText tag="span" class="history-ticket__text" v-if="isGarageScoreScript && !action.unsatisfactionResolved">
          <strong>Custeed</strong> {{ $t_locale('components/global/HistoryTicketItem')('closedForInactivity') }}
        </AppText>
        <AppText tag="span" class="history-ticket__text" v-if="isGarageScoreScript && action.unsatisfactionResolved">
          <strong>Custeed</strong> {{ $t_locale('components/global/HistoryTicketItem')('closedByFollowupResolution') }}
        </AppText>
        <AppText tag="span" class="history-ticket__text" v-if="isSolved">
          <strong>{{ $t_locale('components/global/HistoryTicketItem')('providedSolution') }}</strong> {{ displayProvidedSolutions(action.providedSolutions) }}
        </AppText>
        <AppText tag="span" class="history-ticket__text" v-if="isUnsolved">
          <strong>{{ $t_locale('components/global/HistoryTicketItem')('unresolvedReason') }}</strong> {{ displayArrayClaimReasons(action.claimReasons) }}
        </AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.LEAD_CLOSED">
        <AppText tag="span" class="history-ticket__text" v-if="action.crossLeadConverted">
          <strong>Custeed</strong> {{ $t_locale('components/global/HistoryTicketItem')(isAMaintenanceLead ? 'APV_ClosedByCrossSale' : 'closedByCrossSale') }}.
        </AppText>
        <AppText tag="span" class="history-ticket__text" v-if="!isGarageScoreScript && !action.crossLeadConverted">
          <strong>{{ formatUser(action.assigner) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('leadClosedByUser') }}
          <AppText tag="span" class="history-ticket__text" bold  v-if="action.wasTransformedToSale">
            {{ $t_locale('components/global/HistoryTicketItem')(isAMaintenanceLead ? 'APV_LeadSold' : 'leadSold') }}
          </AppText>
          <AppText tag="span" class="history-ticket__text" bold v-if="action.missedSaleReason">
            {{ $t_locale('components/global/HistoryTicketItem')(isAMaintenanceLead ? 'APV_LeadNotSold' : 'leadNotSold') }} 
            <template v-if="displayMissedSaleReasons(action.missedSaleReason).trim().toLowerCase() !== TicketActionNames.POSTPONED_LEAD.toLowerCase()">
            {{ displayMissedSaleReasons(action.missedSaleReason) }}
            </template>
            <span v-else>{{ $t_locale('components/global/HistoryTicketItem')('postponedLead') }}</span>
          </AppText>
        </AppText>
        <AppText tag="span" class="history-ticket__text" v-if="isGarageScoreScript && !action.crossLeadConverted">
          <strong>Custeed</strong> {{ $t_locale('components/global/HistoryTicketItem')('closedForInactivity') }}
        </AppText>
      </template>

      <template v-else-if="ticketReopenedActions.includes(action.name)">
        <template v-if="action.automaticReopen">
          <AppText tag="span"><strong>Custeed</strong> {{ $t_locale('components/global/HistoryTicketItem')('automaticTicketReopen') }}</AppText>
        </template>
        <template v-else>
          <AppText tag="span"><strong>{{ formatUser(action.assigner)}}</strong> {{ $t_locale('components/global/HistoryTicketItem')('ticketReopen') }}</AppText>
        </template>
      </template>

      <template v-else-if="action.name === TicketActionNames.TRANSFER">
        <AppText tag="span" v-if="action.selfAssigned">
          <strong>{{ formatUser(action.ticketManager) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('selfAssigned') }} <strong> {{ $t_locale('components/global/HistoryTicketItem')(action.sourceType) }} </strong>
        </AppText>
        <AppText tag="span" v-else>
          <strong>{{ action.selfAssigned || formatUser(action.assigner) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('transfered') }} {{ $t_locale('components/global/HistoryTicketItem')('to') }} {{ formatUser(action.ticketManager) }}.
        </AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.DATA_MODIFICATION">
        <AppText tag="span" v-if="!action.newArrayValue">
          <strong>{{ formatUser(action.assigner) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('updatedField') }} <strong>{{ displayFieldName(action.field) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('from') }}  "{{ displayFieldValue(action.previousValue, action.field) }}" {{ $t_locale('components/global/HistoryTicketItem')('to') }} <strong>"{{ displayFieldValue(action.newValue, action.field) }}"</strong>
        </AppText>
        <AppText tag="span" v-else>
          <strong>{{ formatUser(action.assigner) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('updatedField') }} <strong>{{ displayFieldName(action.field) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('from') }}  "{{ displayFieldValue(action.previousArrayValue || [], action.field) }}" {{ $t_locale('components/global/HistoryTicketItem')('to') }} <strong>"{{ displayFieldValue(action.newArrayValue, action.field) }}"</strong>
        </AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.REMINDER">
        <AppText tag="span">
          <strong>{{ formatUser(action.assigner) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('plannedReminder', { date: $dd(action.reminderDate, 'DD MMMM YYYY'), reminderActionName }) }} {{ $t_locale('components/global/HistoryTicketItem')('emailNotification') }}
        </AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.POSTPONED_LEAD">
        <AppText tag="span">
          <strong>{{ formatUser(action.assigner) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('plannedPostpone', { date: $dd(action.reminderDate, 'DD MMMM YYYY') }) }} {{ $t_locale('components/global/HistoryTicketItem')('emailNotification') }}
        </AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED">
        <AppText tag="span"><strong>{{ $t_locale('components/global/HistoryTicketItem')('theCustomer') }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('theCustomerResponded') }} <strong>{{ action.followupIsRecontacted ? $t_locale('components/global/HistoryTicketItem')('beingCalled') : $t_locale('components/global/HistoryTicketItem')('notBeingCalled')}}</strong> {{ $t_locale('components/global/HistoryTicketItem')('and') }} <strong>{{ followupStatus }}</strong>.</AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.LEAD_FOLLOWUP_RESPONDED">
        <AppText tag="span"><strong>{{ $t_locale('components/global/HistoryTicketItem')('theCustomer') }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('followupLeadResponse') }} <strong v-if="!action.followupLeadRecontacted">{{ getNotRecontactedSentence }}</strong> <strong v-else>{{ getRecontactedSentence }}</strong>.</AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.SEND_API_SALESFORCE">
        <AppText tag="span">
          {{ $t_locale('components/global/HistoryTicketItem')('sendToSaleforceApi', { leadId: action.comment }) }} 
        </AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.SEND_API_SELECTUP">
        <AppText tag="span">
          {{ $t_locale('components/global/HistoryTicketItem')('sendToSelectupApi', { leadId: action.comment }) }} 
        </AppText>
      </template>

      <template v-else-if="action.name === TicketActionNames.SEND_LEAD_BY_EMAIL">
        <AppText tag="span">
          {{ $t_locale('components/global/HistoryTicketItem')('sendLeadByEmail', { name: action.comment }) }} 
        </AppText>
      </template>

      <template v-else>
        <AppText tag="span"><strong>{{ formatUser(action.assigner) }}</strong> {{ $t_locale('components/global/HistoryTicketItem')('realisedAction') }} "{{ actionName }}"</AppText>
      </template>
    </div>
    <div class="history-ticket__part" v-if="action.name === TicketActionNames.UNSATISFIED_FOLLOWUP_RESPONDED && action.followupUnsatisfiedCommentForManager">
      <template>
        <AppText tag="span"><strong>{{ $t_locale('components/global/HistoryTicketItem')('directorComment') }} </strong><i>{{ action.followupUnsatisfiedCommentForManager }}</i></AppText>
      </template>
    </div>
    <div class="history-ticket__part history-ticket__infos">
      <AppText tag="span" class="history-ticket__created-at history-ticket__info" italic type="muted">{{ action.createdAt | formatDate }}</AppText>
      <AppText tag="span" class="history-ticket__assigned-to history-ticket__info" italic type="muted" v-if="ticketStartedActions.includes(action.name) && manager && manager.email">
        {{ $t_locale('components/global/HistoryTicketItem')('assignedTo', { name: managerName } ) }}
        <template v-if="managerJob">
          , {{managerJob}}
        </template>
      </AppText>
      <AppText tag="span" class="history-ticket__alert history-ticket__info" italic type="muted" v-if="ticketStartedActions.includes(action.name)">{{ $t_locale('components/global/HistoryTicketItem')('garageScoreAlert') }}</AppText>
      <Button v-if="actionIsReminderNotResolved" class="history-ticket__button" type="link" size="xs" @click="cancelReminder">
        <span class="history-ticket__underline">{{ $t_locale('components/global/HistoryTicketItem')('cancel') }}</span>
      </Button>
      <AppText tag="span" class="history-ticket__cancelled " bold v-if="action.reminderStatus === 'Cancelled'">
        {{ $t_locale('components/global/HistoryTicketItem')('cancelledBy') }} {{ formatUser(action.reminderTriggeredBy) }}
      </AppText>
    </div>
    <div class="history-ticket__part" v-if="action.comment || action.message">
      <div class="history-ticket__comment">
        <!-- Please don't prettify in any way the next line, it has white-space: pre-line so it will have consequences on the display -->
        <AppText tag="span" type="primary">{{ (action.comment || action.message).trim() }}</AppText>
      </div>
    </div>
  </HistoryItem>
</template>

<script>
import { TicketActionNames } from "../../utils/enumV2";
import DataTypes from "~/utils/models/data/type/data-types";
import LeadSaleTypes from "~/utils/models/data/type/lead-sale-types"
import LeadTradeInTypes from "~/utils/models/data/type/lead-trade-in-types";
import ReminderStatuses from '~/utils/models/data/type/reminder-status';
import { getDeepFieldValue as deep } from "~/utils/object";

export default {
  props: {
    ticketId: String,
    type: String,
    agentGarageName: String,
    action: Object,
    sourceType: String,
    automationCampaign: Object,
    leadTicketSaleType: String,
    leadTicketTradeIn: String,
    cockpitType: String,
    cancelReminderDispatch: Function
  },

  created() {
      this.deep = (fieldName) => deep(this, fieldName);
      this.TicketActionNames = TicketActionNames;
      this.ticketStartedActions = [TicketActionNames.UNSATISFIED_STARTED, TicketActionNames.LEAD_STARTED];
      this.ticketReopenedActions = [TicketActionNames.UNSATISFIED_REOPENED, TicketActionNames.LEAD_REOPENED];
  },

  methods: {
    formatUser(val) {
      if (!val) {
        return this.$t_locale('components/global/HistoryTicketItem')('deletedUser');
      }
      else if (val.firstName && val.lastName) {
        return `${val.firstName[0].toUpperCase() + val.firstName.slice(1)} ${val.lastName.toUpperCase()}`.trim()
      } else if (val.email) {
        return val.email
      } else {
        return this.$t_locale('components/global/HistoryTicketItem')('deletedUser');
      }
    },
    displayProvidedSolutions(values) {
      if (!values || !values.length) return '';
      return values.map((v) => this.$t_locale('components/global/HistoryTicketItem')(`solution${v}`, { label: this.$t_locale('components/global/HistoryTicketItem')(this.cockpitType || 'Dealership') })).join(', ');
    },
    displayArrayClaimReasons(values) {
      if (!values || !values.length) return '';
      return values.map(val => this.$t_locale('components/global/HistoryTicketItem')(val)).join(', ');
    },
    displayMissedSaleReasons(values) {
      if (!values || !values.length) return '';
      return values.map(val => this.$t_locale('components/global/HistoryTicketItem')(val)).join(', ');
    },
    displayFieldName(value) {
      if (value.includes('leadTicket.vehicle.makeModel')) {
        if (this.isAMaintenanceLead) return this.$t_locale('components/global/HistoryTicketItem')('_customerVehicle');
        if (this.leadTicketTradeIn === LeadTradeInTypes.YES) return this.$t_locale('components/global/HistoryTicketItem')('_tradeInModel');
      }
      if (value.includes('vehicle.make')) return this.$t_locale('components/global/HistoryTicketItem')('_make');
      if (value.includes('brandModel')) return this.$t_locale('components/global/HistoryTicketItem')('_model');
      if (value.includes('vehicle.makeModel')) return this.$t_locale('components/global/HistoryTicketItem')('_model');
      if (value.includes('vehicle.model')) return this.$t_locale('components/global/HistoryTicketItem')('_model');
      if (value.includes('vehicle.brand')) return this.$t_locale('components/global/HistoryTicketItem')('_make');
      if (value.includes('customer.fullName')) return this.$t_locale('components/global/HistoryTicketItem')('_name');
      if (value.includes('customer.contact.mobilePhone')) return this.$t_locale('components/global/HistoryTicketItem')('_phone');
      if (value.includes('customer.contact.email')) return this.$t_locale('components/global/HistoryTicketItem')('_email');
      if (value.includes('vehicle.plate')) return this.$t_locale('components/global/HistoryTicketItem')('_immat');
      if (value.includes('timing')) return this.$t_locale('components/global/HistoryTicketItem')('_timing');
      if (value.includes('saleType')) return this.$t_locale('components/global/HistoryTicketItem')('_type');
      if (value.includes('bodyType')) return this.$t_locale('components/global/HistoryTicketItem')('_body');
      if (value.includes('budget')) return this.$t_locale('components/global/HistoryTicketItem')('_budget');
      if (value.includes('energyType')) return this.$t_locale('components/global/HistoryTicketItem')('_energy');
      if (value.includes('tradeIn')) return this.$t_locale('components/global/HistoryTicketItem')('_sale');
      if (value.includes('financing')) return this.$t_locale('components/global/HistoryTicketItem')('_financing');
      if (value.includes('leadTicket.cylinder')) return this.$t_locale('components/global/HistoryTicketItem')('_size');
      if (value.includes('leadTicket.requestType')) return this.$t_locale('components/global/HistoryTicketItem')('_leadType');
      return value;
    },
    displayFieldValue(value, field) {
      switch (field) {
        case 'leadTicket.budget': return this.displayBudget(value);
        case 'leadTicket.timing': return this.displayTiming(value);
        case 'leadTicket.saleType': return this.displaySaleType(value);
        case 'leadTicket.bodyType': return this.displayBodyType(value);
        case 'leadTicket.energyType': return this.displayEnergyType(value);
        case 'leadTicket.tradeIn': return this.displayTradeIn(value);
        case 'leadTicket.financing': return this.displayFinancing(value);
        case 'leadTicket.cylinder': return this.displayCylinder(value);
        case 'leadTicket.requestType': return this.$t_locale('components/global/HistoryTicketItem')(value, {}, value);
        default: return (value === 'NaN') ? '' : value; //@Database trick...
      }
    },
    displayBudget(value) {
      return value && !isNaN(value) ? value + ' ' + this.$t_locale('components/global/HistoryTicketItem')('currency') : '';
    },
    displayTiming(value) {
      return value ? this.$t_locale('components/global/HistoryTicketItem')(`leadTiming_${value}`, {}, value) : this.$t_locale('components/global/HistoryTicketItem')('notSpecified');
    },
    displaySaleType(value) {
      return value ? this.$t_locale('components/global/HistoryTicketItem')(`leadSaleType_${value}`, {}, value) : this.$t_locale('components/global/HistoryTicketItem')('leadSaleType_Unknown');
    },

    displayBodyType(value) {
      return value && value.length > 0 ? value.map(v => this.$t_locale('components/global/HistoryTicketItem')(`leadBodyType_${v}`)).join(", ") : this.$t_locale('components/global/HistoryTicketItem')('leadBodyType_Unknown');
    },
    displayEnergyType(value) {
      return value && value.length > 0 ? value.map(v => this.$t_locale('components/global/HistoryTicketItem')(`leadEnergyType_${v}`)).join(", ") : this.$t_locale('components/global/HistoryTicketItem')('leadEnergyType_unknown');
    },
    displayTradeIn(value) {
      return value ? this.$t_locale('components/global/HistoryTicketItem')(`leadTradeIn_${value}`, {}, value) : this.$t_locale('components/global/HistoryTicketItem')('leadTradeIn_Unknown');
    },
    displayFinancing(value) {
      return value ? this.$t_locale('components/global/HistoryTicketItem')(`leadFinancing_${value}`, {}, value) : this.$t_locale('components/global/HistoryTicketItem')('leadFinancing_unknown');
    },
    displayCylinder(value) {
      return Array.isArray(value) ? value.map((v) => this.$t_locale('components/global/HistoryTicketItem')(`leadCylinder_${v}`, {}, v)).join(', ') : this.$t_locale('components/global/HistoryTicketItem')('leadCylinder_Unknown');
    },
    cancelReminder() {
      this.cancelReminderDispatch({
        id: this.ticketId,
        type: this.type,
        actionCreatedAt: this.action.createdAt,
      });
    }
  },

  computed: {
    reminderActionName() {
      const isReminder = this.action.name === TicketActionNames.REMINDER;
      const isMeetingReminded = this.action.reminderActionName === TicketActionNames.MEETING;
      if (this.isAMaintenanceLead && isReminder && isMeetingReminded) {
        return this.$t_locale('components/global/HistoryTicketItem')('APV_Meeting');
      }
      return this.$t_locale('components/global/HistoryTicketItem')(this.action.reminderActionName);
    },
    actionName() {
      if (this.isAMaintenanceLead && this.action.name === TicketActionNames.MEETING) {
        return this.$t_locale('components/global/HistoryTicketItem')('APV_Meeting');
      }
      return this.$t_locale('components/global/HistoryTicketItem')(this.action.name);
    },
    isAMaintenanceLead() {
      return this.leadTicketSaleType === DataTypes.MAINTENANCE;
    },
    isGarageScoreScript() {
      return (!this.action.claimReasons || !this.action.claimReasons.length) && (!this.action.assigner || !this.action.assigner.email);
    },

    isSolved() {
      return (this.action.unsatisfactionResolved && this.action.providedSolutions && this.action.providedSolutions.length > 0) || this.action.wasTransformedToSale;
    },

    isUnsolved() {
      return !this.action.unsatisfactionResolved && this.action.claimReasons && this.action.claimReasons.length > 0;
    },

    actionIcon() {
      const actionIcon = TicketActionNames.getPropertyFromValue(this.action.name, 'ticketHistoryIcon');
      if (actionIcon === -1) { // Little hack because there's more than just the action name when closing a ticket
        return this.isSolved ? 'icon-gs-folder-check' : 'icon-gs-folder-remove';
      }
      return actionIcon || 'icon-icon-gs-help-question-circle';
    },

    followupStatus() {
      switch(this.action.followupStatus) {
        case 'Resolved': return this.$t_locale('components/global/HistoryTicketItem')('followupResolved');
        case 'NotResolved': return this.$t_locale('components/global/HistoryTicketItem')('followupNotResolved');
        case 'InProgress': return this.$t_locale('components/global/HistoryTicketItem')('followupInProgress');
        default: return this.$t_locale('components/global/HistoryTicketItem')('followupUnknown');
      }
    },

    reasons() {
      return this.action.followupLeadSatisfied ? this.action.followupLeadSatisfiedReasons : this.action.followupLeadNotSatisfiedReasons;
    },

    followupLeadDetails() {
      return {
        satisfied: this.$t_locale('components/global/HistoryTicketItem')(this.action.followupLeadSatisfied ? 'Satisfied' : 'NotSatisfied'),
        reasons: (this.reasons || []).map(r => this.$t_locale('components/global/HistoryTicketItem')(r).toLowerCase()).join(', '),
        appointment: this.$t_locale('components/global/HistoryTicketItem')(this.action.followupLeadAppointment)
      };
    },
    manager() {
      return this.action.ticketManager;
    },
    managerName() {
      if (this.manager) {
        if (this.manager.firstName && this.manager.lastName) {
          return `${(this.manager.firstName).toUpperCase()[0]}. ${this.manager.lastName}`;
        }
        return this.manager.email;
      }
      return '';
    },
    agentName() {
      if (this.agentGarageName) {
        return `${this.$t_locale('components/global/HistoryTicketItem')('leadAgentGarageName')} ${this.agentGarageName}`;
      }
      return '';
    },
    managerJob() {
      return this.manager ? this.manager.job : '';
    },
    leadAlertAutomationProps() {
      return {
        displayName: this.deep('automationCampaign.displayName'),
        contactType: this.$t_locale('components/global/HistoryTicketItem')(this.deep('automationCampaign.contactType'))
      };
    },

    actionIsReminderNotResolved() {
      const { name, reminderStatus } = this.action;
      const isReminderLike = TicketActionNames.getPropertyFromValue(name, 'isReminderLike');
      return isReminderLike && reminderStatus === ReminderStatuses.NOT_RESOLVED;
    },

    manualLeadStartedLabel() {
      const displayedUser = this.action.assigner && this.formatUser(this.action.assigner) || this.formatUser(this.action.ticketManager);
      return this.$t_locale('components/global/HistoryTicketItem')('manualLead', { user: displayedUser, source: this.$t_locale('components/global/HistoryTicketItem')(this.sourceType) });
    },

    getNotRecontactedSentence() {
      return this.$t_locale('components/global/HistoryTicketItem')('NotRecontacted') + ' ' + this.$t_locale('components/global/HistoryTicketItem')(this.leadTicketSaleType === LeadSaleTypes.MAINTENANCE ? 'NotRecontactedMaintenance' : 'NotRecontactedSales')
    },

    getRecontactedSentence() {
      return this.$t_locale('components/global/HistoryTicketItem')(this.reasons ? 'followupLeadDetails' : 'followupLeadDetailsWithoutReasons', this.followupLeadDetails)
    }
  }
}
</script>

<style lang="scss" scoped>
.history-ticket {
  &__link {
    text-decoration: none;
    font-family: Lato;
    color: $link-blue;
    margin-left: 0.3rem;
    font-size: 0.9rem;
  }
  &__part {
    display: flex;
    align-items: center;
    &:not(:last-child) {
      margin-bottom: 0.25rem;
    }
  }

  &__text + &__text {
    margin-left: 0.5rem;
  }
  &__infos {
    flex-direction: column;
    align-items: flex-start;
    font-size: .9rem;
    
    @media (min-width: $breakpoint-min-md) {
      flex-direction: row;
    }
  }
  &__info {
    @media (min-width: $breakpoint-min-md) {
      padding-right: 0.5rem;
      margin-right: 0.5rem;
      border-right: 1px solid $black-grey;
      &:last-child {
        border-right: none;
      }
    }
  }

  &__button {
    height: unset;
    margin-left: 0;
    padding: 0;

    ::v-deep .button__content {
      padding-top: 0 !important;
    }
  }

  &__cancelled {
    padding-left: 0.25rem;
    margin-left: 0.25rem;
    border-left: 1px solid $grey;
  }

  &__comment {
    word-break: break-word;
    margin-top: 0.5rem;
    background-color: $white;
    padding: 0.5rem;
    width: 100%;
    border-left: 3px solid $grey;
    box-shadow: 0 1px 3px 0 rgba($black, .16);
    border-radius: 5px;

    ::v-deep span {
      white-space: pre-wrap;
    }
  }

  &__underline {
    position: relative;

    &:after {
      position: absolute;
      content: '';
      background-color: $blue;
      width: 100%;
      height: 1px;
      bottom: -2px;
      right: 0;
      left: 0;
    }
  }
}
</style>
