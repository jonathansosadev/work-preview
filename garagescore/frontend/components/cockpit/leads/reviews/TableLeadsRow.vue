<template>
  <div class="table-leads-row">
    <TableRow :border="false">
      <TableRowCell :display="['sm']">
        <ReviewLeads
          :currentGarageIds="currentGarageIds"
          :changeCurrentGarage="changeCurrentGarage"
          v-bind="{ row }"
          :projectActive="rowSubview === 'project'"
          @project-click="onProjectClick"
        />
      </TableRowCell>
    </TableRow>
    <TableRow :border="isBordered" :class="rowClasses" class="table-leads-row__row">
      <TableRowCell :display="['md', 'lg']" :style="{ flex: 2 }" class="table-leads-row__row__review--no-mobile">
        <ReviewLeads
          :currentGarageIds="currentGarageIds"
          :changeCurrentGarage="changeCurrentGarage"
          v-bind="{ row }"
          :projectActive="rowSubview === 'project'"
          @project-click="onProjectClick"
        />
      </TableRowCell>

      <TableRowCell center class="table-leads-row__row__data-type">
        <IconLabel v-if="saleTypeData" :title="saleTypeData.label">
          <template #icon>
            <i :class="saleTypeData.icon" />
          </template>
        </IconLabel>
      </TableRowCell>

      <TableRowCell center>
        <AppText tag="span" class="table-leads-row__row__text">
          {{ formattedTiming }}
        </AppText>
      </TableRowCell>

      <TableRowCell center flow="column">

        <AppText align="center" tag="span" class="table-leads-row__row__text">
          <i v-if="sourceIcon" class="table-leads-row__row__icon" :class="sourceIcon" :title="sourceTitle">
            <span class="path1" /><span class="path2" /><span class="path3" />
            <!--    keep span on one line if not break css inline-block -->
          </i>
          <img v-else :alt="deep('source.type')" :src="sourceSrc" class="table-leads-row__row__text__source-img">
        </AppText>
        <AppText tag="span" class="table-leads-row__row__text">
          {{ sourceLabel }}
        </AppText>
        <AppText v-if="displayAgent" tag="span" class="table-leads-row__row__text">
          {{ deep('source.agent.publicDisplayName') }}
        </AppText>
        <AppText v-if="displaySourceBy" tag="span" class="table-leads-row__row__small-text">
          {{ $t_locale('components/cockpit/leads/reviews/TableLeadsRow')((deep('source.by') || 'Email'), {}, (deep('source.by') || 'Email') ) }}
        </AppText>
      </TableRowCell>

      <TableRowCell :background="mightBeAGreyBackground" center>
        <AppText :type="manager.type" align="center" bold tag="span" class="table-leads-row__row__text">
          {{ manager.value }}
        </AppText>
      </TableRowCell>

      <TableRowCell :background="mightBeAGreyBackground" center flow="column">
        <ButtonStatus :messageType="buttonStatusType" :to="leadTicketDetailsLink" :type="ticketStatusData.type" link>
          <template slot="icon" v-if="ticketStatusData.icon">
            <i :class="ticketStatusData.icon" />
          </template>
          <template>{{ ticketStatusData.label }}</template>
          <template slot="message">
            <template v-if="ticketLastAction">
              {{ ticketLastAction.text }}
              <span
                v-if="ticketLastAction.tooltip"
                v-tooltip="{ content: ticketLastAction.tooltip }"
                class="table-leads-row__row__message__help"
              >
                <i class="icon-gs-help" />
              </span>
              <br>
              {{ ticketLastAction.subtext }}
            </template>
          </template>
        </ButtonStatus>
      </TableRowCell>

      <TableRowCell center class="table-leads-row__row__text">
        <Button
          v-if="displayFollowupButton"
          class="table-leads-row__row__button"
          type="phantom"
          :active="getRowSubview === 'followupLead'"
          @click.native="changeRowSubview('followupLead')"
        >
          <AppText :type="followupLeadStatus.type" tag="span" class="table-leads-row__row__button-text">
            {{ followupLeadStatus.label }}
            <i
              class="icon-gs-down table-leads-row__row__icon--chevron"
              :class="{ 'icon-gs-up': getRowSubview === 'followupLead' }"
            />
          </AppText>
        </Button>
        <AppText v-else :type="followupLeadStatus.type" tag="span" class="table-leads-row__row__button-text">
          {{ followupLeadStatus.label }}
        </AppText>
      </TableRowCell>
    </TableRow>
  </div>
</template>

<script>
import { findLast } from 'lodash';

import ButtonStatus from '~/components/global/ButtonStatus';
import IconLabel from '~/components/global/IconLabel';
import { TicketActionNames, IconsTypes } from '~/utils/enumV2';
import SourceTypes from '~/utils/models/source-types';
import DataTypes from '~/utils/models/data/type/data-types.js';
import LeadSaleTypes from '~/utils/models/data/type/lead-sale-types';
import LeadTicketStatuses from '~/utils/models/data/type/lead-ticket-status';
import ReminderStatuses from '~/utils/models/data/type/reminder-status';
import { getDeepFieldValue } from '~/utils/object';
import LeadTimings from '~/utils/models/data/type/lead-timings';
import ReviewLeads from '~/components/cockpit/leads/ReviewLeads';
import LeadFollowupStatus from '~/utils/models/data/type/lead-followup-status.js';

export default {
  name: 'TableLeadsRow',
  components: {
    ButtonStatus,
    IconLabel,
    ReviewLeads,
  },

  props: {
    row: Object,
    setRowSubview: { type: Function, required: true },
    getRowSubviewFunction: { type: Function },
    currentGarageIds: Array,
    changeCurrentGarage: { type: Function, required: true },
    selectedCockpitType: {
      type: String,
      required: true,
    }
  },

  data() {
    return {
      deep: (fieldName) => getDeepFieldValue(this.row, fieldName),
    };
  },

  methods: {
    changeRowSubview(view) {
      this.setRowSubview({ id: this.row.id, view });
    },
    onProjectClick() {
      this.changeRowSubview('project');
    },
  },

  computed: {
    isAMaintenanceLead() {
      return this.deep('leadTicket.saleType') === LeadSaleTypes.MAINTENANCE;
    },
    rowSubview() {
      return this.getRowSubviewFunction(this.row.id);
    },
    // Entire row
    rowClasses() {
      return {
        'table-leads-row__row--new': this.isTicketNew,
        'table-leads-row__row--reminder': this.hasRecentReminder,
      };
    },
    isTicketNew() {
      const ONE_HOUR = 60 * 60 * 1000;
      const leadTicketCreationDate = new Date(this.deep('leadTicket.createdAt'));
      // Created during the last hour
      return Date.now() - leadTicketCreationDate.getTime() < ONE_HOUR;
    },
    hasRecentReminder() {
      return this.deep('leadTicket.createdAt') !== this.deep('leadTicket.referenceDate');
    },
    isBordered() {
      return !this.getRowSubview && !this.isTicketNew && !this.hasRecentReminder;
    },
    getRowSubview() {
      return this.getRowSubviewFunction(this.row.id);
    },
    leadTicketStatus() {
      return this.deep('leadTicket.status');
    },
    mightBeAGreyBackground() {
      // No grey background on mobile
      if (this.$mq === 'sm') {
        return undefined;
      }
      // No grey background for new tickets and recent reminders
      if (this.isTicketNew || this.hasRecentReminder) {
        return undefined;
      }
      // Other cases, grey background
      return 'grey';
    },
    // Col 1
    saleTypeData() {
      const icons = {
        [LeadSaleTypes.MAINTENANCE]: IconsTypes.getPropertyOrValue(
          'MAINTENANCE',
          this.selectedCockpitType,
        ),
        [LeadSaleTypes.NEW_VEHICLE_SALE]: IconsTypes.getPropertyOrValue(
          'NEWVEHICLESALE',
          this.selectedCockpitType,
        ),
        [LeadSaleTypes.USED_VEHICLE_SALE]: IconsTypes.getPropertyOrValue(
          'USEDVEHICLESALE',
          this.selectedCockpitType,
        ),
      };
      const leadSaleType = this.deep('leadTicket.saleType');
      const supportedLeadSaleTypes = [
        LeadSaleTypes.MAINTENANCE,
        LeadSaleTypes.NEW_VEHICLE_SALE,
        LeadSaleTypes.USED_VEHICLE_SALE,
      ];
      if (supportedLeadSaleTypes.includes(leadSaleType)) {
        return {
          icon: icons[leadSaleType],
          label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')(leadSaleType),
        };
      }
      return {
        icon: 'icon-gs-help-question-circle',
        label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('unknown'),
      };
    },
    // Col 2
    formattedTiming() {
      const leadTiming = this.deep('leadTicket.timing');
      if (LeadTimings.hasValue(leadTiming)) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')(leadTiming);
      }
      return leadTiming || this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('undefined');
    },
    // Col 3
    sourceIcon() {
      const sourceType = this.deep('source.type');
      switch (sourceType) {
        case SourceTypes.AGENT:
          return 'icon-gs-GS-R2';
        case SourceTypes.DATAFILE:
        case SourceTypes.MANUAL_LEAD:
          return 'icon-gs-GS-R1';
        default:
          return null;
      }
    },
    sourceTitle() {
      return this.deep('source.type') === SourceTypes.AGENT ? this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('comesFromAgent') : this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('comesFromGarage');
    },
    leadTicketSubtype() {
      let leadTicketSubtype = this.deep('leadTicket.sourceSubtype');
      if (typeof leadTicketSubtype === 'string') {
        return leadTicketSubtype.split('/')[1] || leadTicketSubtype;
      }
      return null;
    },
    sourceSrc() {
      const sourceType = this.deep('source.type');
      if (sourceType === SourceTypes.AUTOMATION) {
        return '/logo/logo-custeed-automation-picto.svg';
      }
      if (this.leadTicketSubtype) {
        return `/cross-leads/${this.leadTicketSubtype}.svg`;
      }
      if (SourceTypes.hasValue(sourceType)) {
        return `/cross-leads/${sourceType}.svg`;
      }
      return `/cross-leads/ManualLead.svg`;
    },
    sourceLabel() {
      const sourceType = this.deep('source.type');
      if (sourceType === SourceTypes.AUTOMATION) {
        return this.automationSourceLabel;
      }
      if (this.leadTicketSubtype) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')(this.leadTicketSubtype, {}, this.leadTicketSubtype);
      }
      return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')(sourceType, {}, sourceType);
    },
    automationSourceLabel() {
      // Temporary if to avoid displaying Automation_<customerId>
      const sourceBy = this.deep('source.by');
      const apvVnVo = [DataTypes.MAINTENANCE, DataTypes.NEW_VEHICLE_SALE, DataTypes.USED_VEHICLE_SALE];
      if (apvVnVo.includes(sourceBy)) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')(`Automation_${sourceBy}`);
      }
      return 'Automation';
    },
    displayAgent() {
      return this.deep('source.type') === SourceTypes.AGENT && this.deep('source.agent.publicDisplayName');
    },
    displaySourceBy() {
      return this.deep('source.by') && this.deep('source.type') !== SourceTypes.AUTOMATION;
    },
    // Col 4
    manager() {
      if (this.deep('leadTicket.manager')) {
        const firstName = this.deep('leadTicket.manager.firstName');
        const lastName = this.deep('leadTicket.manager.lastName');
        if (firstName && lastName) {
          return {
            value: `${firstName[0]}. ${lastName}`.trim(),
            type: 'default',
          };
        }
        return {
          value: `${this.deep('leadTicket.manager.email')}`.trim(),
          type: 'default',
        };
      }
      if (this.leadTicketStatus && LeadTicketStatuses.isClosed(this.leadTicketStatus)) {
        return { value: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('unassigned'), type: 'muted' };
      }
      return { value: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('toAssign'), type: '' };
    },
    // Col 5
    ticketStatusData() {
      switch (this.leadTicketStatus) {
        case LeadTicketStatuses.WAITING_FOR_CONTACT:
          return {
            icon: 'icon-gs-help-customer-support',
            label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('toRecontact'),
            type: 'danger',
          };
        case LeadTicketStatuses.CONTACT_PLANNED:
          return {
            icon: 'icon-gs-help-customer-support',
            label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('planifiedContact'),
            type: 'warning',
          };
        case LeadTicketStatuses.WAITING_FOR_MEETING:
          return {
            icon: 'icon-gs-calendar-warning',
            label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('toMeet'),
            type: 'warning',
          };
        case LeadTicketStatuses.MEETING_PLANNED:
          return {
            icon: 'icon-gs-calendar-check',
            type: 'warning',
            label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('meetingPlanned'),
          };
        case LeadTicketStatuses.WAITING_FOR_PROPOSITION:
          return {
            icon: 'icon-gs-cash-bag-euro',
            label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('propositionToBeSent'),
            type: 'warning',
          };
        case LeadTicketStatuses.PROPOSITION_PLANNED:
          return {
            icon: 'icon-gs-cash-bag-euro',
            type: 'warning',
            label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('propositionToPlan'),
          };
        case LeadTicketStatuses.WAITING_FOR_CLOSING:
          return {
            icon: 'icon-gs-validation-check-circle',
            label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('toClose'),
            type: 'warning',
          };
        case LeadTicketStatuses.CLOSED_WITHOUT_SALE:
          return {
            icon: 'icon-gs-validation-check-circle',
            label: this.isAMaintenanceLead ? this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('APV_closed') : this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('closed'),
            type: 'muted',
          };
        case LeadTicketStatuses.CLOSED_WITH_SALE:
          return {
            icon: 'icon-gs-validation-check-circle',
            label: this.isAMaintenanceLead ? this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('APV_sold') : this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('sold'),
            type: 'success',
          };
        default:
          return { icon: '', label: '' };
      }
    },
    ticketLastAction() {
      const findAction = ({ name }, actionName) => name === actionName;
      const findReminder = ({ reminderActionName, reminderStatus }, actionName) =>
        reminderActionName === actionName && reminderStatus !== ReminderStatuses.CANCELLED;

      if (this.row.ticketStatus === LeadTicketStatuses.CLOSED_WITH_SALE) {
        if (this.isAMaintenanceLead) {
          return {
            type: 'default',
            text: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('ClosedWithSaleApv'),
          };
        }
        return {
          type: 'default',
          text: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('finalizedTransaction'),
        };
      } else if (this.row.ticketStatus === LeadTicketStatuses.CLOSED_WITHOUT_SALE) {
        if (this.wasClosedForInactivity) {
          return {
            type: 'default',
            text: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('closedForInactivity'),
            tooltip: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('inactivityTooltip'),
          };
        }
        if (this.isAMaintenanceLead) {
          return {
            type: 'default',
            text: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('ClosedWithoutSaleApv'),
          };
        }
        return {
          type: 'default',
          text: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('notFinalizedTransaction'),
        };
      }

      const leadTicketActions = this.deep('leadTicket.actions');
      const { CUSTOMER_CALL, MEETING, PROPOSITION, REMINDER } = TicketActionNames;
      const customerCall =
        findLast(leadTicketActions, (action) => findAction(action, CUSTOMER_CALL)) ||
        findLast(leadTicketActions, (action) => findReminder(action, CUSTOMER_CALL));
      const meeting =
        findLast(leadTicketActions, (action) => findAction(action, MEETING)) ||
        findLast(leadTicketActions, (action) => findReminder(action, MEETING));
      const proposition =
        findLast(leadTicketActions, (action) => findAction(action, PROPOSITION)) ||
        findLast(leadTicketActions, (action) => findReminder(action, PROPOSITION));

      for (let action of [proposition, meeting, customerCall]) {
        if (action && action.name === REMINDER) {
          return null;
        } else if (action) {
          const date = this.$moment(action.createdAt).format('DD/MM/YYYY HH:mm');
          return {
            text: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')(this.isAMaintenanceLead ? `apv_${action.name}` : action.name, {}, action.name),
            subtext: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')('realizedOn', { date }),
            type: 'default',
            isReminder: false,
          };
        }
      }

      return null;
    },
    wasClosedForInactivity() {
      const ticketActions = this.deep('leadTicket.actions') || [{}];
      return ticketActions.slice(-1).pop().closedForInactivity;
    },
    leadTicketDetailsLink() {
      return `/cockpit/leads/${this.row.id}`;
    },
    buttonStatusType() {
      return this.ticketLastAction && this.ticketLastAction.type;
    },
    // Col 6
    displayFollowupButton() {
      return this.deep('surveyFollowupLead.sendAt');
    },
    followupLeadStatus() {
      if ([
        LeadFollowupStatus.LEAD_CONVERTED,
        LeadFollowupStatus.YES_PLANNED,
        LeadFollowupStatus.YES_DONE
      ].includes(this.row.followupLeadStatus)) {
         return { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus), type: 'success' };
      }

      if ([
        LeadFollowupStatus.NOT_PROPOSED,
        LeadFollowupStatus.NOT_RECONTACTED
      ].includes(this.row.followupLeadStatus)) {
         return { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus), type: 'danger' };
      }

      if ([
        LeadFollowupStatus.NOT_CONFIGURED,
        LeadFollowupStatus.NEW_LEAD,
        LeadFollowupStatus.NOT_WANTED,
        LeadFollowupStatus.LEAD_WITHOUT_ANSWER
      ].includes(this.row.followupLeadStatus)) {
         return { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsRow')(this.row.followupLeadStatus, {}, this.row.followupLeadStatus), type: 'muted' };
      }
    },
  },
};
</script>

<style lang='scss' scoped>
.table-leads-row {
  background-color: $white;

  &__row {
    &--new,
    &--reminder {
      margin-bottom: 0.357rem;
    }

    &--new {
      border-left-color: $blue;
      background-color: rgba($blue, 0.05);
      margin-top: .5rem;
      margin-bottom: .5rem;
      border-radius: 20px;
    }

    &--reminder {
      border-left-color: $mac-n-cheese;
      background-color: rgba($mac-n-cheese, 0.05);
      margin-top: 5px;
      margin-bottom: 5px;
    }

    &__sale-type {
      &__label {
        display: none;
      }
    }

    &__text {
      overflow: hidden;
      width: 100%;
      font-size: 0.9rem;
      text-align: center;
      color: $dark-grey;

      &--hidden-mobile {
        display: none;
      }

      &__source-img {
        max-height: 26px;
      }
    }

    &__small-text {
      margin-top: 0.2rem;
      font-size: 0.75rem;
      width: 100%;
      text-align: center;
      color: $dark-grey;
    }

    &__message__help {
      color: $grey;
      margin-left: 6px;
      font-size: 9px;
      cursor: pointer;
    }

    &__button-text {
      font-size: 0.9rem;
    }

    &__icon {
      &--chevron {
        margin-left: 0.25rem;
      }

      font-size: 1.8rem;
    }

    &__text + &__text {
      padding-top: 0.5rem;
    }

    &__button {
      overflow: unset !important;
      margin-bottom: .5rem;
      height: unset;

      .button__content {
        display: flex;
        align-items: center;
      }

      &:hover {
        border: none;
      }
    }

    &__row-part {
      &:not(:first-child) {
        margin-top: 1rem;
      }

      &--column {
        flex-flow: column;
      }

      &--center {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }

      &--hide-mobile {
        display: none;
      }
    }
  }
}

// Scss rules for chevron display management
.table-leads-row__icon--chevron {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  opacity: 0;
}

.table-leads-row__button {
  &:hover {
    .table-leads-row__icon--chevron {
      opacity: 1;
    }
  }

  &.button--active {
    .table-leads-row__icon--chevron {
      opacity: 1;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .table-leads-row {
    &__data-type {
      &__icon {
        display: none !important;
      }

      &__label {
        display: flex !important;
      }
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .table-leads-row {
    &__icon--chevron {
      display: initial;
    }

    &__sale-type {
      &__icon {
        display: none;
      }

      &__label {
        display: flex;
        flex-direction: column;
      }
    }

    &__text {
      &--hidden-mobile {
        display: block;
      }
    }

    &__row-part {
      &--hide-mobile {
        display: inherit;
      }
    }
  }
}
</style>
