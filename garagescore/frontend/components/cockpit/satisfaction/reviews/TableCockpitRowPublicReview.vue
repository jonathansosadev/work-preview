<template>
  <TableRow>
    <div class="row-public-review__cell" :style="{ flex: 7 }">
      <div class="row-public-review__card">
        <div class="row-public-review__header">
          <AppText
            tag="span"
            type="statusData.type"
            bold
          >
            {{ statusData.label }}
          </AppText>
        </div>
        <div class="row-public-review__part">
          <div class="row-public-review__item" v-if="status === 'Rejected' || !status">
            <AppText tag="span" class="row-public-review__item-text">
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')('Cause') }}:
            </AppText>
            <AppText
              tag="span"
              class="row-public-review__item-text"
              type="danger"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')(status && rejectionReason ? rejectionReason : 'NotPublished') }}
            </AppText>
          </div>
          <AppText
            tag="p"
            size="sm"
            type="muted"
            class="row-public-review__warning"
          >
            <strong class="row-public-review__text row-public-review__text--blue">{{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')('IMPORTANT') }}</strong> :
            {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')('ImportantText') }}
          </AppText>
        </div>
        <div class="row-public-review__part row-public-review__part--right">
          <button
            v-if="status"
            class="row-public-review__button"
            @click="toggleReviewMod"
          >
            <AppText
              class="row-public-review__button-text"
              tag="span"
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')("warn1") }}
            </AppText>
            <i class="icon-gs-map-flag row-public-review__button-icon"></i>
          </button>
        </div>
      </div>
      <div class="row-public-review__card" v-if="showReviewMod">
        <div class="row-public-review__header">
          <AppText tag="span" bold>
            {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')('warn2') }}
          </AppText>
        </div>
        <div class="row-public-review__part">
          <PublicReviewMod
            :id="id"
            :submitPublicReviewReport="submitPublicReviewReport"
          />
        </div>
      </div>
    </div>
  </TableRow>
</template>

<script>
import PublicReviewMod from './PublicReviewMod.vue';

export default {
  components: { PublicReviewMod },
  props: {
    status: String,
    rejectionReason: String,
    submitPublicReviewReport: { type: Function, required: true },
    id: { type: String, required: true },
  },

  data() {
    return {
      showReviewMod: false,
    };
  },

  methods: {
    toggleReviewMod() {
      this.showReviewMod = !this.showReviewMod;
    },
  },

  computed: {
    statusData() {
      switch (this.status) {
        case 'Approved':
          return { type: 'success', label: this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')('statusOK') };
        case 'Rejected':
          return { type: 'danger', label: this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')('statusKO') };
        case 'Pending':
          return { type: 'warning', label: this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')('statusRunning') };
        default:
          return { type: 'muted', label: this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReview')('statusKO') };
      }
    },
  },
};
</script>


<style lang="scss" scoped>
.row-public-review {

  &__card {
    background-color: $very-light-grey;
  }

  &__button {
    border: none;
    background-color: transparent;
    cursor: pointer;
    outline: none;
    color: $dark-grey;
  }

  &__button-text {
    margin-right: 0.25rem;

    &:hover {
      text-decoration: underline;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    background-color: $light-grey;
    padding: 0.5rem 1rem;
    font-weight: bold;
  }

  &__text {
    &--blue {
      color: $blue;
    }
  }

  &__warning {
    max-width: 100vw; // IE11 hack
  }

  &__part {
    // IE11 flex issue
    // display: flex;
    // flex-direction: column;
    // justify-content: space-between;
    padding: 1rem 1rem 0.5rem 1rem;

    &--right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
    }
  }


  &__item {
    margin-bottom: 0.5rem;
  }

  &__item-text {
    &:not(:last-child) {
      margin-right: 0.5rem;
    }
  }
}
</style>
