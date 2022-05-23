<template>
  <div class="review">
    <div class="review__part review__part--header">
      <span
        v-if="areAllGaragesSelected"
        @click="filterByGarage(garageId)"
        class="review__garage"
      >
        {{ garagePublicDisplayName }}
      </span>
    </div>

    <div class="review__part review__part--margin">
      <AppText
        @click.native="$emit('customer-click')"
        bold
        tag="span"
        class="review__customer"
      >
        <FormattedValueWithMissingHandling
          :type="isEmpty(customerNaming) ? 'muted-light' : 'muted'"
          :value="customerNaming || $t_locale('components/cockpit/leads/ReviewLeads')('anonymous')"
          tag="span"
          class="customer-info__info-value"
        />
      </AppText>
      <AppText
        v-if="customerCity"
        tag="span"
        type="muted"
        class="review__city"
      >
        {{ $t_locale('components/cockpit/leads/ReviewLeads')('city', { customerCity }) }}
      </AppText>
    </div>

    <div class="review__part review__part--small-margin">
      <AppText
        v-if="leadTicketCreatedAt"
        tag="span"
        type="muted"
        class="review__date"
      >
        {{ leadTicketCreationDate }}
      </AppText>
      <RatingStar
        v-if="mustDisplayRating"
        :maxValue="5"
        :value="displayedRating"
        class="review__rating"
      />
    </div>

    <div v-if="isNewTicket" class="review__part review__part--small-margin">
      <Tag
        :content="newLeadTag"
        background="primary-default"
      />
    </div>
    <div v-if="hasRecentReminder" class="review__part review__part--small-margin">
      <Tag
        :content="reminderTag"
        background="warning-default"
      />
    </div>

    <div class="review__part review__part--customer review__part--margin">
      <button
        @click="$emit('project-click')"
        :class="reviewBtnClass"
        role="button"
        class="review__button"
      >
        <AppText
          bold
          tag="span"
          type="muted"
          class="review__details-trigger"
        >
          {{ $t_locale('components/cockpit/leads/ReviewLeads')('projectDetails') }}&nbsp;
        </AppText>
        <i class="icon-gs-down review__details-trigger-icon" />
      </button>
    </div>
  </div>
</template>

<script>
import Tag from '~/components/ui/Tag.vue';
import SourceTypes from '~/utils/models/source-types';
import SourceByEnum from '~/utils/models/data/type/source-by';
import { getDeepFieldValue } from '~/utils/object';
import { phoneNumberSpecs, parsePhoneNumber } from '~/utils/phone';

export default {
  name: "ReviewLead",
  components: { Tag },
  props: {
    changeCurrentGarage: {
      type: Function,
      required: true,
    },
    currentGarageIds: Array,
    projectActive: Boolean,
    row: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      deep: (fieldName) => getDeepFieldValue(this.row, fieldName),
    };
  },

  computed: {
    // Lead infos
    garageId() {
      return this.deep('garage.id');
    },
    garagePublicDisplayName() {
      return this.deep('garage.publicDisplayName');
    },
    sourceBy() {
      return this.deep('source.by');
    },
    reviewRating() {
      return this.deep('review.rating.value');
    },
    customerFullName() {
      return this.deep('customer.fullName.value');
    },
    customerEmail() {
      return this.deep('customer.contact.email.value');
    },
    customerMobilePhone() {
      return this.deep('customer.contact.mobilePhone.value');
    },
    customerCity() {
      return this.deep('customer.city.value');
    },
    leadTicketCreatedAt() {
      return this.deep('leadTicket.createdAt');
    },
    leadTicketReferenceDate() {
      return this.deep('leadTicket.referenceDate');
    },
    // Conditions & CSS classes
    isNewTicket() {
      const ONE_HOUR = 60 * 60 * 1000;
      const leadTicketCreationDate = new Date(this.leadTicketCreatedAt);
      // Created during the last hour
      return Date.now() - leadTicketCreationDate.getTime() < ONE_HOUR;
    },
    hasRecentReminder() {
      return this.leadTicketCreatedAt !== this.leadTicketReferenceDate;
    },
    areAllGaragesSelected() {
      return this.currentGarageIds === null;
    },
    mustDisplayRating() {
      return Number.isFinite(this.reviewRating) && this.reviewRating > 0;
    },
    reviewBtnClass() {
      return { 'review__button--active': this.projectActive };
    },
    // Formatting
    formattedPhoneNumber() {
      const parsedPhone = parsePhoneNumber(this.customerMobilePhone);
      if (parsedPhone && parsedPhone.country) {
        const { code: countryCode, formatter } = phoneNumberSpecs[parsedPhone.country];
        const formattedNationalPhoneNumber = formatter(parsedPhone.nationalPhoneNumber);
        return `${countryCode} ${formattedNationalPhoneNumber}`;
      }
      return this.customerMobilePhone;
    },
    customerNaming() {
      const anonymousCall = this.sourceBy === SourceByEnum.PHONE && this.$t_locale('components/cockpit/leads/ReviewLeads')('anonymousCall');
      return this.customerFullName || this.customerEmail || this.formattedPhoneNumber || anonymousCall || '';
    },
    leadTicketCreationDate() {
      try {
        return this.$d(new Date(this.leadTicketCreatedAt), 'cockpit');
      } catch (e) {
        console.error('ReviewLeads.vue, formattedDate : ', e);
        console.error({ date: this.leadTicketCreatedAt, format: 'cockpit' });
        return '';
      }
    },
    displayedRating() {
      return this.reviewRating / 2;
    },

    // Texts
    newLeadTag() {
      return this.$t_locale('components/cockpit/leads/ReviewLeads')('newLead');
    },
    reminderTag() {
      const momentReferenceDate = this.$moment(this.leadTicketReferenceDate);
      if (momentReferenceDate.isSame(this.$moment(), 'day')) {
        return this.$t_locale('components/cockpit/leads/ReviewLeads')('plannedToday');
      } else {
        const nDays = this.$moment().diff(momentReferenceDate, 'days');
        return this.$tc_locale('components/cockpit/leads/ReviewLeads')('plannedOn', nDays, { nDays });
      }
    },
  },

  methods: {
    isEmpty(val) {
      if (Array.isArray(val) && !val.length) {
        return true;
      }
      return !val || val === this.$t_locale('components/cockpit/leads/ReviewLeads')('undefined') || val === 'UNDEFINED';
    },
    filterByGarage(garageId) {
      if (this.row.sourceType !== SourceTypes.AGENT) {
        this.changeCurrentGarage(garageId);
      }
    },
  },
};

</script>

<style lang="scss" scoped>
.review {
  font-size: 1rem;

  &__customer {
    user-select: none;
    font-size: 0.9rem;
    font-weight: 700;

    max-width: 55%;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    ::v-deep .text {
      margin-right: 0.5rem;
    }

    /*&:hover {*/
    /*text-decoration: underline;*/
    /*}*/
  }

  &__date {
    font-size: 0.9rem;
    font-weight: 300;
    margin-right: 0.5rem;
  }

  &__city {
    font-size: 0.9rem;
    font-weight: 300;
    max-width: 40%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__details-trigger {
    font-weight: bold;
    font-size: 0.9rem;
  }

  &__details-trigger-icon {
    transition: transform 0.3s;
    font-size: 10px;
    display: inline-block;
    margin-left: 4px;
  }

  &__garage {
    max-width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__garage,
  &__team {

    &:hover {
      text-decoration: underline;
      color: $greyish-brown;
    }
  }

  &__part {
    display: flex;
    align-items: center;

    &--small-margin {
      margin-top: 0.3rem;
    }

    &--margin {
      margin-top: 0.5rem;
    }

    &--margin-2 {
      margin: 0.7rem 0;
    }

    &--header {
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 300;

      max-width: 100%;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      display: flex;
      flex-direction: row;
      color: $dark-grey;
    }

    &--paragraph {
      margin-top: 0.5rem;
      max-width: 35rem;
      font-weight: 700;
    }

    &--vehicule {
      margin-top: 0.5rem;
    }

    &--customer {
      margin-top: 0.5rem;
    }
  }

  &__button {
    display: inline-block;
    border: none;
    background-color: transparent;
    color: $black-grey;
    outline: 0;
    font-weight: bold;
    padding: 0;
    margin: 0;
    cursor: pointer;

    &--active {
      .review__details-trigger-icon {
        transform: rotate(180deg);
      }
    }

    &:hover {
      text-decoration: underline;
      color: $greyish-brown;
    }
  }
}
</style>
