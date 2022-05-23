<template>
  <div class="table-leads-row">
    <TableRow :border="isBordered" class="table-leads-row__row" :class="rowClasses">
      <TableRowCell>
        <ReviewLeads
          :currentGarageIds="currentGarageIds"
          :changeCurrentGarage="changeCurrentGarage"
          v-bind="row"
          @project-click="onProjectClick"
        />
      </TableRowCell>

      <TableRowCell center flow="column" class="table-leads-row__row__sale-type__label">
        <IconLabel :title="saleTypeData.label" v-if="saleTypeData">
          <template slot="icon">
            <i :class="saleTypeData.icon" />
          </template>
        </IconLabel>
      </TableRowCell>

      <TableRowCell center>
        <AppText class="table-leads-row__row__text" tag="span">{{ formattedTiming }}</AppText>
      </TableRowCell>

      <TableRowCell center class="table-leads-row__row__active-cell">
        <AppText class="table-leads-row__row__text" tag="span" :type="manager.type" bold align="center">
          {{ manager.value }}
        </AppText>
      </TableRowCell>

      <TableRowCell center flow="column" class="table-leads-row__row__active-cell">
        <div
          class="
            table-leads-row__row__row-part table-leads-row__row__row-part--column table-leads-row__row__row-part--center
          "
        >
          <AppText tag="span" :type="ticketStatusData.type" bold>
            <i :class="ticketStatusData.icon" />
            &nbsp;&nbsp;
            {{ ticketStatusData.label }}
          </AppText>
        </div>
        <div
          class="
            table-leads-row__row__row-part
            table-leads-row__row__row-part--column
            table-leads-row__row__row-part--center
            table-leads-row__row__row-part--hide-mobile
          "
          v-if="ticketLastAction"
        >
          <AppText tag="span" :type="ticketLastAction.type" size="sm" align="center">
            {{ ticketLastAction.text }}
          </AppText>
          <span
            v-if="ticketLastAction.tooltip"
            class="table-leads-row__row__message__help"
            v-tooltip="{ content: ticketLastAction.tooltip }"
          >
            <i class="icon-gs-help" />
          </span>
          <AppText tag="span" :type="ticketLastAction.type" size="sm" align="center">
            {{ ticketLastAction.subtext }}
          </AppText>
        </div>
      </TableRowCell>
    </TableRow>
  </div>
</template>


<script>
import { findLast } from 'lodash';
import IconLabel from '~/components/global/IconLabel';
import { TicketActionNames } from '~/utils/enumV2';
import LeadSaleTypes from '~/utils/models/data/type/lead-sale-types';
import LeadTimings from '~/utils/models/data/type/lead-timings';
import LeadTicketStatuses from '~/utils/models/data/type/lead-ticket-status';
import { getDeepFieldValue } from '~/utils/object';
import ReviewLeads from '~/components/cockpit/leads/ReviewLeads';
import { IconsTypes } from '~/utils/enumV2';

export default {
  components: {
    IconLabel,
    ReviewLeads,
  },

  props: {
    row: Object,
    changeRowSubview: { type: Function, required: true },
    getRowSubview: { type: Function },
    currentGarageIds: Array,
    changeCurrentGarage: { type: Function, required: true },
  },

  data() {
    return {
      deep: (fieldName) => getDeepFieldValue(this.row, fieldName),
    };
  },

  methods: {
    setRowSubview(view) {
      this.changeRowSubview({
        id: this.row.id,
        view,
      });
    },
    onProjectClick() {
      this.setRowSubview('project');
    },
  },

  computed: {
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
    leadTicketStatus() {
      return this.deep('leadTicket.status');
    },
    // Col 1
    saleTypeData() {
      const icons = {
        Maintenance: IconsTypes.MAINTENANCE,
        NewVehicleSale: IconsTypes.NEWVEHICLESALE,
        UsedVehicleSale: IconsTypes.USEDVEHICLESALE,
      };
      const leadSaleType = this.deep('leadTicket.saleType');
      const supportedLeadSaleTypes = [LeadSaleTypes.NEW_VEHICLE_SALE, LeadSaleTypes.USED_VEHICLE_SALE];
      if (supportedLeadSaleTypes.includes(leadSaleType)) {
        return {
          icon: icons[leadSaleType],
          label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')(leadSaleType),
        };
      }
      return { icon: 'icon-gs-help-question-circle', label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')('unknown') };
    },
    // Col 2
    formattedTiming() {
      const leadTiming = this.deep('leadTicket.timing');
      if (LeadTimings.hasValue(leadTiming)) {
        return this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')(leadTiming);
      }
      return leadTiming || this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')('undefined');
    },
    // Col 3
    manager() {
      if (this.deep('leadTicket.manager')) {
        const firstName = this.deep('leadTicket.manager.firstName');
        const lastName = this.deep('leadTicket.manager.lastName');
        if (firstName && lastName) {
          return { value: `${firstName[0]}. ${lastName}`.trim(), type: 'default' };
        }
        return { value: `${this.deep('leadTicket.manager.email')}`.trim(), type: 'default' };
      }
      if (this.leadTicketStatus && LeadTicketStatuses.isClosed(this.leadTicketStatus)) {
        return { value: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')('unassigned'), type: 'muted' };
      }
      return { value: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')('toAssign'), type: '' };
    },
    // Col 4
    ticketStatusData() {
      switch (this.leadTicketStatus) {
        case LeadTicketStatuses.WAITING_FOR_CONTACT:
          return {
            icon: "icon-gs-help-customer-support",
            label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')("toRecontact"),
            type: "danger"
          };
        case LeadTicketStatuses.CONTACT_PLANNED:
          return {
            icon: "icon-gs-help-customer-support",
            label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')("planifiedContact"),
            type: "warning"
          };
        case LeadTicketStatuses.WAITING_FOR_MEETING:
          return {
            icon: "icon-gs-calendar-warning",
            label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')("toMeet"),
            type: "warning"
          };
        case LeadTicketStatuses.MEETING_PLANNED:
          return {
            icon: "icon-gs-calendar-check",
            type: "warning",
            label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')("meetingPlanned")
          };
        case LeadTicketStatuses.WAITING_FOR_PROPOSITION:
          return {
            icon: "icon-gs-cash-bag-euro",
            label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')("propositionToBeSent"),
            type: "warning"
          };
        case LeadTicketStatuses.PROPOSITION_PLANNED:
          return {
            icon: "icon-gs-cash-bag-euro",
            type: "warning",
            label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')("propositionToPlan")
          };
        case LeadTicketStatuses.WAITING_FOR_CLOSING:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')("toClose"),
            type: "warning"
          };
        case LeadTicketStatuses.CLOSED_WITHOUT_SALE:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')("closed"),
            type: "muted"
          };
        case LeadTicketStatuses.CLOSED_WITH_SALE:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')("sold"),
            type: "success"
          };
        default:
          return { icon: '', label: '' };
      }
    },
    ticketLastAction() {
      const findAction = ({ name }, actionName) => name === actionName;
      const findReminder = ({ reminderActionName, reminderStatus }, actionName) =>
        reminderActionName === actionName && reminderStatus !== 'Cancelled';

      if (this.leadTicketStatus === LeadTicketStatuses.CLOSED_WITH_SALE) {
        return { type: 'default', text: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')('finalizedTransaction') };
      } else if (this.leadTicketStatus === LeadTicketStatuses.CLOSED_WITHOUT_SALE) {
        if (this.wasClosedForInactivity) {
          return { type: 'default', text: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')('closedForInactivity'), tooltip: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')('inactivityTooltip') };
        }
        return { type: 'default', text: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')('notFinalizedTransaction') };
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
            text: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')(action.name),
            subtext: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRow')('realizedOn', { date }),
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
  },
};
</script>

<style lang="scss" scoped>
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
      margin-top: 5px;
      margin-bottom: 5px;
    }
    &--reminder {
      border-left-color: $mac-n-cheese;
      background-color: rgba($mac-n-cheese, 0.05);
      margin-top: 5px;
      margin-bottom: 5px;
    }
    &__review {
      &--no-mobile {
        display: none;
      }
    }

    &__sale-type {
      &__label {
        display: flex;
        flex-direction: column;
      }
    }

    &__text {
      overflow: hidden;
      width: 100%;
      font-size: 0.9rem;
      text-align: center;

      &--hidden-mobile {
        display: none;
      }
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
        display: none;
      }
      font-size: 1.8rem;
    }

    &__text + &__text {
      padding-top: 0.25rem;
    }

    &__button {
      overflow: unset !important;
      margin-bottom: -7px;
      height: unset;
      .button__content {
        display: flex;
        align-items: center;
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

@media (min-width: $breakpoint-min-md) {
  .table-leads-row {
    &__icon--chevron {
      display: initial;
    }
    &--mobile-only {
      display: none;
    }
    &__review {
      &--no-mobile {
        display: table-cell;
      }
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

    &__active-cell {
      background-color: $active-cell-color;
      border-bottom: 1px solid $white;
    }

    &__row-part {
      &--hide-mobile {
        display: inherit;
      }
    }
  }
}
</style>
