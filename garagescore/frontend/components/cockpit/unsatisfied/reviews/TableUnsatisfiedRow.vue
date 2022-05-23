<template>
  <div class="table-unsatisfied-row">
    <TableRow :border="false">
      <TableRowCell :display="['sm']">
        <Review
          v-bind="reviewProps"
          @customer-click="onCustomerClick"
          :customerActive="customerActive"
        />
      </TableRowCell>
    </TableRow>

    <TableRow
      :border="isBordered"
      class="table-unsatisfied-row__row"
      :class="rowClasses"
    >
      <TableRowCell :style="{ flex: 2 }" :display="['md', 'lg']">
        <Review
          v-bind="reviewProps"
          @customer-click="onCustomerClick"
          :customerActive="customerActive"
        />
      </TableRowCell>

      <TableRowCell class="table-unsatisfied-row__row__data-type" center>
        <IconLabel :title="dataTypeData.label" v-if="dataTypeData">
          <template #icon>
            <i :class="dataTypeData.icon" />
          </template>
        </IconLabel>
      </TableRowCell>

      <TableRowCell class="table-unsatisfied-row__row__data-type" center>
        <IconLabel :type="colorReviewRatingValue" bold>
          {{ surveyScore }}
        </IconLabel>
        <div
          v-if="surveyScore == null" 
          v-tooltip="{ content: $t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('scoreNotAvailable') }"
        >
          <Icon
            name="block"
            color="warning"
            size="m"
          />
        </div>
      </TableRowCell>

      <TableRowCell class="table-unsatisfied-row__row--9" center>
        <IconLabel :type="delayStatusType">
          <ElapsedTime
            v-if="isClosed"
            tag="span"
            :type="delayStatusType"
            :startDate="unsatisfiedTicketCreatedAt"
            :endDate="unsatisfiedTicketClosedAt"
          />
          <ElapsedTime
            v-else
            tag="span"
            :type="delayStatusType"
            :startDate="unsatisfiedTicketCreatedAt"
          />
        </IconLabel>
      </TableRowCell>

      <TableRowCell
        :background="mightBeAGreyBackground"
        class="table-unsatisfied-row__row__manager"
        center
      >
        <AppText
          tag="span"
          center
          :type="manager.type"
          bold
          class="table-unsatisfied-row__row__text"
        >
          {{ manager.value }}
        </AppText>
      </TableRowCell>

      <TableRowCell
        :background="mightBeAGreyBackground"
        class
        center
        flow="column"
      >
        <ButtonStatus
          :type="ticketStatusData.type"
          :to="ticketDetailsLink"
          link
          :messageType="ticketLastAction && ticketLastAction.type"
        >
          <template v-if="ticketStatusData.icon" #icon>
            <i :class="ticketStatusData.icon" />
          </template>
          <template>{{ ticketStatusData.label }}</template>
          <template #message>
            <template v-if="ticketLastAction">
              {{ ticketLastAction.text }}
              <span
                v-if="ticketLastAction.tooltip"
                class="table-unsatisfied-row__row__message__help"
                v-tooltip="{ content: ticketLastAction.tooltip }"
              >
                <i class="icon-gs-help" />
              </span>
              <br>
              {{ ticketLastAction.subtext }}
            </template>
          </template>
        </ButtonStatus>
      </TableRowCell>

      <TableRowCell center>
        <Button
          v-if="surveyFollowupUnsatisfiedSendAt"
          class="table-unsatisfied-row__row__button table-unsatisfied-row__row__button__followdata"
          type="phantom"
          :size="this.$mq === 'sm' ? 'xs' : undefined"
          @click.native="setRowSubview('followupUnsatisfied')"
          :active="getRowSubview(row.id) === 'followupUnsatisfied'"
        >
          <AppText
            tag="span"
            class="table-unsatisfied-row__row__button-text"
            align="center"
            :type="followUpData.type"
          >
            {{ followUpData.label }}
            <i
              :class="followupIconClass"
              class="icon-gs-down table-unsatisfied-row__row__icon--chevron"
            />
          </AppText>
        </Button>
        <AppText
          v-else
          tag="span"
          align="center"
          :type="followUpData.type"
          class="table-unsatisfied-row__row__button-text"
        >
          {{ followUpData.label }}
        </AppText>
      </TableRowCell>
    </TableRow>
  </div>
</template>

<script>
import { findLast } from 'lodash';

import ButtonStatus from '~/components/global/ButtonStatus';
import IconLabel from '~/components/global/IconLabel';
import Review from '~/components/global/Review';
import Icon from '~/components/ui/Icon';
import { scoreToColor } from '~/util/scoreToColor';
import { TicketActionNames } from '~/utils/enumV2';
import TicketStatus from '~/utils/models/data/type/unsatisfied-ticket-status';
import GarageTypes from '~/utils/models/garage.type.js';
import { getDeepFieldValue } from '~/utils/object';
import UnsatisfiedFollowupStatus from '~/utils/models/data/type/unsatisfied-followup-status.js';

export default {
  name: "TableUnsatisfiedRow",
  components: {
    Review,
    IconLabel,
    ButtonStatus,
    Icon
  },
  props: {
    row: Object,
    icons: Object,
    getRowSubview: { type: Function, required: true },
    changeRowSubview: { type: Function, required: true },
  },

  data() {
    return {
      deep: (fieldName) => getDeepFieldValue(this.row, fieldName),
    };
  },

  computed: {
    // Entire row
    rowClasses() {
      return {
        'table-unsatisfied-row__row--new': this.isTicketNew,
        'table-unsatisfied-row__row--reminder': this.hasRecentReminder,
      };
    },
    isTicketNew() {
      const ONE_HOUR = 60 * 60 * 1000;
      const leadTicketCreationDate = new Date(this.row.unsatisfiedTicket.createdAt);
      // Created during the last hour
      return (Date.now() - leadTicketCreationDate.getTime()) < ONE_HOUR;
    },
    hasRecentReminder() {
      return this.row.unsatisfiedTicket.createdAt !== this.row.unsatisfiedTicket.referenceDate;
    },
    isBordered() {
      return !this.getRowSubview(this.row.id) && !this.isTicketNew && !this.hasRecentReminder;
    },
    customerActive() {
      return this.getRowSubview(this.row.id) === 'customer';
    },

    // 1st column: Review info
    reviewProps() {
      return {
        customerFullName: this.deep('customer.fullName'),
        customerCity: this.deep('customer.city'),
        date: this.deep('unsatisfiedTicket.createdAt'),
        rating: this.rating,
        vehicleModel: this.deep('unsatisfiedTicket.vehicle.model'),
        vehicleBrand: this.deep('unsatisfiedTicket.vehicle.make'),
        comment: this.deep('review.comment.text') || this.deep('unsatisfiedTicket.comment'),
        garageId: this.deep('garage.id'),
        garagePublicDisplayName: this.deep('garage.publicDisplayName'),
        serviceFrontDeskUserName: this.deep('unsatisfiedTicket.frontDeskUserName'),
        showFrontDeskUser: false,
        unsatisfiedTicketCreatedAt: this.deep('unsatisfiedTicket.createdAt'),
        unsatisfiedTicketReferenceDate: this.deep('unsatisfiedTicket.referenceDate'),
      };
    },

    // 2nd column: Data type icon
    dataTypeData() {
      switch (this.deep('unsatisfiedTicket.type')) {
        case 'Maintenance':
          return {
            icon: this.icons.Maintenance,
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('Maintenance'),
          };
        case 'NewVehicleSale':
          return {
            icon: this.icons.NewVehicleSale,
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('NewVehicleSale'),
          };
        case 'UsedVehicleSale':
          return {
            icon: this.icons.UsedVehicleSale,
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('UsedVehicleSale'),
          };
        default:
          return { icon: '', label: '' };
      }
    },

    // 3rd column: Rating
    rating() {
      const rating = this.deep('review.rating.value');
      if (typeof rating === 'string') {
        return parseInt(rating, 10);
      }
      return rating;
    },
    surveyScore() {
      // [SGS] display surveyScore /5
      if (Number.isFinite(this.rating) && this.rating >= 0) {
        return this.row.garage.type === GarageTypes.VEHICLE_INSPECTION && this.row.garage.ratingType === 'stars'
          ? this.rating / 2
          : this.rating;
      }
      return null;
    },

    colorReviewRatingValue() {
      return scoreToColor(this.rating);
    },

    // 4th column: Elapsed time
    isClosed() {
      return this.deep('unsatisfiedTicket.status').includes('Closed');
    },
    delayStatusType() {
      switch (this.deep('unsatisfiedTicket.delayStatus')) {
        case 'New':
          return 'success';
        case 'Imminent':
          return 'warning';
        case 'Exceeded':
          return 'danger';
      }
      return undefined;
    },
    unsatisfiedTicketCreatedAt() {
      return this.deep('unsatisfiedTicket.createdAt');
    },
    unsatisfiedTicketClosedAt() {
      return this.deep('unsatisfiedTicket.closedAt');
    },

    // 5th column: Manager
    manager() {
      if (this.row.unsatisfiedTicket.manager) {
        if (this.row.unsatisfiedTicket.manager.firstName && this.row.unsatisfiedTicket.manager.lastName) {
          return {
            value: `${this.row.unsatisfiedTicket.manager.firstName[0]}. ${
              this.row.unsatisfiedTicket.manager.lastName
            }`.trim(),
            type: 'default',
          };
        }
        return { value: `${this.row.unsatisfiedTicket.manager.email}`.trim(), type: 'default' };
      }
      if (this.row.unsatisfiedTicket.status && this.row.unsatisfiedTicket.status.includes('Closed')) {
        return { value: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('nonAssigned'), type: 'muted' };
      }
      return { value: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('toAssign'), type: '' };
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

    // 6th column: Status
    wasClosedForInactivity() {
      const ticketActions = this.deep('unsatisfiedTicket.actions') || [{}];
      return ticketActions.slice(-1).pop().closedForInactivity;
    },
    ticketLastAction() {
      const findAction = (action, actionName) => action.name === actionName;
      const findReminder = (action, actionName) =>
        action.reminderActionName === actionName &&
        action.reminderStatus !== 'Cancelled';

      if (this.deep('unsatisfiedTicket.status') === TicketStatus.CLOSED_WITH_RESOLUTION) {
        return { type: 'default', text: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('_ClosedWithResolution') };
      } else if (this.deep('unsatisfiedTicket.status') === TicketStatus.CLOSED_WITHOUT_RESOLUTION) {
        if (this.wasClosedForInactivity) {
          return { type: 'default', text: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('closedForInactivity'), tooltip: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('inactivityTooltip') };
        }
        return { type: 'default', text: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('_ClosedWithoutResolution') };
      }

      const unsatisfiedTicketActions = this.deep('unsatisfiedTicket.actions');
      const { CUSTOMER_CALL, GARAGE_SECOND_VISIT, REMINDER } = TicketActionNames;
      const customerCall =
        findLast(unsatisfiedTicketActions, t => findAction(t, CUSTOMER_CALL))
        || findLast(unsatisfiedTicketActions, t => findReminder(t, CUSTOMER_CALL));
      const garageSecondVisit =
        findLast(unsatisfiedTicketActions, t => findAction(t, GARAGE_SECOND_VISIT))
        || findLast(unsatisfiedTicketActions, t => findReminder(t, GARAGE_SECOND_VISIT));

      for (let action of [garageSecondVisit, customerCall]) {
        if (action && action.name === REMINDER) {
          return null;
        } else if (action) {
          const date = this.$moment(action.createdAt).format('DD/MM/YYYY HH:mm');
          return {
            text: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')(action.name),
            subtext: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')('realised', { date }),
            type: 'default',
            isReminder: false,
          };
        }
      }

      return null;
    },
    ticketStatusData() {
      // TODO unused ???
      // const isLate =
      //   this.ticketLastAction &&
      //   this.ticketLastAction.isReminder &&
      //   this.ticketLastAction.isLate;

      switch (this.deep('unsatisfiedTicket.status')) {
        case TicketStatus.WAITING_FOR_CONTACT:
          return {
            icon: "icon-gs-help-customer-support",
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')("WaitingForContact"),
            type: "danger"
          };
        case TicketStatus.CONTACT_PLANNED:
          return {
            icon: "icon-gs-help-customer-support",
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')("ContactPlanned"),
            type: "warning"
          };
        case TicketStatus.WAITING_FOR_VISIT:
          return {
            icon: "icon-gs-calendar-warning",
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')("WaitingForVisit"),
            type: "warning"
          };
        case TicketStatus.VISIT_PLANNED:
          return {
            icon: "icon-gs-calendar-check",
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')("VisitPlanned"),
            type: "warning"
          };
        case TicketStatus.WAITING_FOR_CLOSING:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')("WaitingForClosing"),
            type: "warning"
          };
        case TicketStatus.CLOSED_WITHOUT_RESOLUTION:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')("ClosedWithoutResolution"),
            type: "muted"
          };
        case TicketStatus.CLOSED_WITH_RESOLUTION:
          return {
            icon: "icon-gs-validation-check-circle",
            label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')("ClosedWithResolution"),
            type: "success"
          };
        default:
          return { icon: '', label: '' };
      }
    },
    ticketDetailsLink() {
      return `/cockpit/unsatisfied/${this.row.id}`;
    },

    // 7th column: Followup
    surveyFollowupUnsatisfiedSendAt() {
      return this.deep('surveyFollowupUnsatisfied.sendAt');
    },
    followUpData() {
      if ([
        UnsatisfiedFollowupStatus.RESOLVED
      ].includes(this.row.followupUnsatisfiedStatus)) {
         return { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')(this.row.followupUnsatisfiedStatus, {}, this.row.followupUnsatisfiedStatus), type: 'success' };
      }

      if ([
        UnsatisfiedFollowupStatus.IN_PROGRESS
      ].includes(this.row.followupUnsatisfiedStatus)) {
         return { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')(this.row.followupUnsatisfiedStatus, {}, this.row.followupUnsatisfiedStatus), type: 'warning' };
      }

      if ([
        UnsatisfiedFollowupStatus.NOT_RESOLVED
      ].includes(this.row.followupUnsatisfiedStatus)) {
         return { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')(this.row.followupUnsatisfiedStatus, {}, this.row.followupUnsatisfiedStatus), type: 'danger' };
      }

      if ([
        UnsatisfiedFollowupStatus.NOT_CONFIGURED,
        UnsatisfiedFollowupStatus.NEW_UNSATISFIED,
        UnsatisfiedFollowupStatus.FOLLOWUP_SENSIBLE,
        UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER
      ].includes(this.row.followupUnsatisfiedStatus)) {
         return { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')(this.row.followupUnsatisfiedStatus), type: 'muted' };
      }

      if ([
        UnsatisfiedFollowupStatus.FOLLOWUP_MANUAL
      ].includes(this.row.followupUnsatisfiedStatus)) {
         return { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow')(this.row.followupUnsatisfiedStatus) };
      }
    },
    followupIconClass() {
      return { 'fa-rotate-180': this.getRowSubview(this.row.id) === 'followupUnsatisfied' };
    },
  },

  methods: {
    onCustomerClick() {
      this.setRowSubview('customer');
    },
    setRowSubview(view) {
      this.changeRowSubview({ id: this.row.id, view });
    },
  },
};
</script>

<style lang="scss" scoped>
.table-unsatisfied-row {
  background-color: $white;

  &__row {
    &--new, &--reminder {
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

    &__data-type {
      &__label {
        display: none !important;
      }
    }

    &__icon {
      display: none;
      transition: all 0.3s;
      margin-left: 0.2rem;

      &--chevron {
        margin-left: 0.25rem;
      }
    }

    &__text {
      font-size: 0.9rem;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      width: 100%;
    }

    &__button {
      overflow: unset !important;

      .button__content {
        display: flex;
        align-items: center;
      }

      &__followdata {
        margin-bottom: -7px;
        height: unset;
      }

      &:hover {
        border: none;
      }
    }

    &__button-text {
      font-size: 0.9rem;
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

    &__follow-by-title {
      margin-right: 0.5rem;
    }

    &__manager {
      text-align: center;
      font-size: 0.9rem;
    }

    ::v-deep .review {
      .review__part--paragraph {
        display: none;
      }
    }
  }
}

// Scss rules for chevron display management
.table-unsatisfied-row__icon--chevron {
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  opacity: 0;
}

.table-unsatisfied-row__button {
  &:hover {
    .table-unsatisfied-row__icon--chevron {
      opacity: 1;
    }
  }

  &.button--active {
    .table-unsatisfied-row__icon--chevron {
      opacity: 1;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .table-unsatisfied-row {
    &--mobile-only {
      display: none;
    }

    &__review {
      &--no-mobile {
        display: block;
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
      display: initial;
    }

    &__data-type {
      &__icon {
        display: none !important;
      }

      &__label {
        display: flex !important;
      }
    }

    &__button-text {
      display: inherit;
    }

    ::v-deep .review {
      .review__part--paragraph {
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
