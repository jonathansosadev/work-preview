<template>
  <div class="review">
    <div class="review__part review__part--header">
      <span class="review__garage" v-if="showGarageName" @click="filterByGarage(garageId)">
        {{ garagePublicDisplayName }}
      </span>
      <span v-if="isdisplayDash">&nbsp;-&nbsp;</span>
      <span class="review__team" v-if="isDisplayFrontDeskUserName" @click="filterByFrontDeskUserName(serviceFrontDeskUserName, garageId)">
        {{ serviceFrontDeskUserName }}
      </span>
    </div>

    <div class="review__part review__part--margin">
      <AppText class="review__customer" tag="span" bold @click.native="$emit('customer-click')">
        {{ customerFullName || $t_locale('components/global/Review')('anonymous') }}
      </AppText>
      <AppText class="review__city" tag="span" type="muted" v-if="customerCity">
        {{ $t_locale('components/global/Review')("at", { city:customerCity }) }}
      </AppText>
    </div>

    <div class="review__part review__part--small-margin">
      <AppText class="review__date" tag="span" type="muted" v-if="date">
        {{ formattedDate }}
      </AppText>
      <RatingStar class="review__rating" :maxValue="5" :value="rating / 2" v-if="rating === 0 || rating"/>
    </div>

    <div v-if="isTicketNew" class="review__part review__part--small-margin">
      <Tag
        :content="newUnsatisfiedTag"
        background='primary-default'
      />
    </div>
    <div v-if="hasRecentReminder" class="review__part review__part--small-margin">
      <Tag
        :content="reminderTag"
        background='warning-default'
      />
    </div>

    <div class="review__part review__part--paragraph review__part--margin-2" v-if="comment">
      <TextEmphasis class="review__comment" :class="classBindingComment" :text="comment" align="justify"/>
    </div>
    <div class="review__part review__part--paragraph review__part--margin" v-if="isShowNoComment">
      <AppText v-if="!publicReviewFromCockpitContact" tag="span" type="muted" italic>{{ $t_locale('components/global/Review')("noReview") }}...</AppText>
      <AppText v-if="publicReviewFromCockpitContact" tag="span" type="muted" italic>{{ $t_locale('components/global/Review')("publicReviewFromCockpitContact") }}</AppText>
    </div>

    <div class="review__part review__part--customer review__part--margin">
      <button role="button" class="review__button" :class="reviewButtonClass" @click="$emit('customer-click')">
        <AppText tag="span" class="review__details-trigger" type="muted" bold>
          {{ $t_locale('components/global/Review')("showDetails") }}
        </AppText>
        <i class="icon-gs-down review__details-trigger-icon" />
      </button>
    </div>
  </div>
</template>

<script>
import Gauge from "~/components/ui/Gauge";
import Tag from "~/components/ui/Tag";
import TextEmphasis from "~/components/global/TextEmphasis";

export default {
  components: { Gauge, Tag, TextEmphasis },

  props: {
    customerFullName: String,
    customerCity: String,
    comment: {
      type: String,
      default: ''
    },
    rating: Number,
    vehicleBrand: String,
    vehicleModel: String,
    date: String,
    garagePublicDisplayName: String,
    serviceFrontDeskUserName: String,
    garageId: String,
    publicReviewFromCockpitContact:  Boolean,

    customerActive: Boolean,

    // Special case for Unsatified/review page
    showFrontDeskUser: {
      type: Boolean,
      default: true,
    },
    unsatisfiedTicketCreatedAt: String,
    unsatisfiedTicketReferenceDate: String,

    // Special case for contacts/review page
    showNoComment: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    formattedDate() {
      try {
        return this.$d(new Date(this.date), 'cockpit');
      } catch(e) {
        console.error(e);
        console.error({ date: this.date, format: 'cockpit' });
        return '';
      }
    },
    showGarageName() {
      const garageIds = this.$store.state.cockpit.current.garageIds;
      return !garageIds || !garageIds.length || garageIds?.length > 1;
    },
    isShowAllUser() {
      return this.$store.state.cockpit.current.dms.frontDeskUserName === 'ALL_USERS';
    },

    isDisplayFrontDeskUserName() {
      return this.isShowAllUser && this.serviceFrontDeskUserName && this.serviceFrontDeskUserName !== 'UNDEFINED' && this.showFrontDeskUser;
    },

    isdisplayDash() {
      return this.showGarageName && this.isDisplayFrontDeskUserName;
    },

    classBindingComment() {
      return {
        'review__comment--success': this.rating >= 9,
        'review__comment--warning': this.rating > 6 && this.rating <= 8,
        'review__comment--danger': this.rating <= 6
      };
    },
    reviewButtonClass() {
      return { 'review__button--active': this.customerActive };
    },
    isTicketNew() {
      const ONE_HOUR = 60 * 60 * 1000;
      const unsatisfiedTicketCreationDate = new Date(this.unsatisfiedTicketCreatedAt);
      // Created during the last hour
      return (Date.now() - unsatisfiedTicketCreationDate.getTime()) < ONE_HOUR;
    },
    hasRecentReminder() {
      return this.unsatisfiedTicketCreatedAt !== this.unsatisfiedTicketReferenceDate;
    },

    // Texts
    newUnsatisfiedTag() {
      return this.$t_locale('components/global/Review')('newUnsatisfied');
    },
    reminderTag() {
      const momentReferenceDate = this.$moment(this.leadTicketReferenceDate);
      if (momentReferenceDate.isSame(this.$moment(), 'day')) {
        return this.$t_locale('components/global/Review')('plannedToday');
      } else {
        const nDays = this.$moment().diff(momentReferenceDate, 'days');
        return this.$tc_locale('components/global/Review')('plannedOn', nDays, { nDays });
      }
    },
    isShowNoComment() {
      return !this.comment && this.showNoComment
    }
  },

  methods: {
    filterByGarage(garageId) {
      this.$store.dispatch("cockpit/changeCurrentGarage", garageId);
      this.$store.dispatch("cockpit/refreshRouteParameters");
    },
    // set the garage ID for the filter establishment
    filterByFrontDeskUserName(username, garageId) {
      this.$store.dispatch("cockpit/changeCurrentGarage", garageId);
      this.$store.dispatch("cockpit/changeCurrentFrontDeskUserName", username);
      this.$store.dispatch("cockpit/refreshRouteParameters");
    }
  }
};
</script>


<style lang="scss" scoped>
.review {
  font-size: 1rem;

  &__customer {
    cursor: pointer;
    user-select: none;
    font-size: 1rem;
    font-weight: 700;
    position: relative;
    top: -0.1rem;
    margin-right: .5rem;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    ::v-deep.text {
      margin-right: 0.5rem;
    }

    &:hover {
      text-decoration: underline;
      color: $greyish-brown;
    }
  }

  &__comment {
    font-weight: bold;

    &--success {
      color: $green;
    }

    &--warning {
      color: $erep-gold;
    }

    &--danger {
      color: $red;
    }
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
      font-weight: normal;
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

  &__details-trigger-icon {
    transition: transform 0.3s;
    font-size: 10px;
    display: inline-block;
    margin-left: 4px;
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

@media (min-width: $breakpoint-min-md) {
  .review {
    &__customer {
      max-width: 55%;
    }
  }
}
</style>
