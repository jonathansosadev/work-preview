<template>
  <Card class="card-folder-resume">
    <div class="card-folder-resume__part card-folder-resume__part--header">
      <div class="card-folder-resume__header-left">
        <div class="card-folder-resume__header-left-part">
          <i
            v-if="sourceIcon"
            class="card-folder-resume__header-left-part__icon"
            :class="sourceIcon"
            :title="sourceTitle"
          >
            <span class="path1" /><span class="path2" /><span class="path3" />
          </i>
          <img
            v-else
            class="card-folder-resume__header-left-part__text__source-img"
            :src="sourceSrc"
            :alt="deep('source.type')"
          />
          <!-- <AppText tag="span" class="card-folder-resume__header-left-part__text">{{ sourceLabel }}</AppText> -->
        </div>
        <div class="card-folder-resume__header-left-part">
          <Title type="primary" direction="column">
            <FormattedValueWithMissingHandling
              class="customer-info__info-value"
              :type="isEmpty(customerNaming) ? 'muted-light' : 'muted'"
              tag="span"
              :value="customerNaming"
            />
            - {{ formattedLeadSaleType }} - {{ formattedSourceType }}
            <template slot="subtitle">
              <i class="icon-gs-garage"></i> {{ deep('garage.publicDisplayName') }}
              <span class="card-folder-resume__header-left-part__subtitle-2" v-if="deep('automationCampaign.id')">
                <i class="icon-gs-send"></i>
                {{ deep('automationCampaign.displayName') }}
              </span>
            </template>
          </Title>
        </div>
      </div>
      <div class="card-folder-resume__header-right">
        <div v-if="!isClose" class="card-folder-resume__header-right-part">
          <AppText tag="span" class="card-folder-resume__header-text" bold>{{ $t_locale('components/cockpit/leads/_id/CardFolderResume')('openSince') }}</AppText>
          <ElapsedTime
            tag="span"
            class="card-folder-resume__header-text"
            type="muted"
            :startDate="deep('leadTicket.createdAt')"
          />
        </div>
        <div v-else class="card-folder-resume__header-right-part">
          <AppText tag="span" class="card-folder-resume__header-text" bold>
            {{ $t_locale('components/cockpit/leads/_id/CardFolderResume')('processedSince') }}
          </AppText>
          <ElapsedTime
            tag="span"
            class="card-folder-resume__header-text"
            type="muted"
            :startDate="deep('leadTicket.createdAt')"
            :endDate="deep('leadTicket.closedAt')"
          />
        </div>
        <div v-if="isClose" class="card-folder-resume__header-right-part">
          <Button type="orange" size="sm" @click="showReopenModal">
            <template slot="left">
              <i class="icon-gs-unlock" />
            </template>
            {{ $t_locale('components/cockpit/leads/_id/CardFolderResume')('reopen') }}
          </Button>
        </div>
      </div>
    </div>
    <div v-if="!deep('automationCampaign.id')" class="card-folder-resume__part">
      <div class="card-folder-resume__review">
        <div class="card-folder-resume__review__gauge">
          <Gauge
            :value="reviewRatingValue"
            v-if="reviewRatingValue || reviewRatingValue === 0"
            inFolder
            :baseRating="getBaseRating"
          />
        </div>
        <div class="card-folder-resume__review__thought">
          <div v-if="deep('leadTicket.adUrl')" class="card-folder-resume__review__thought-url">
            <a target="_blank" :href="deep('leadTicket.adUrl')">
              {{ $t_locale('components/cockpit/leads/_id/CardFolderResume')('seeAd') }}&nbsp;&nbsp;<i class="icon-gs-link" />
            </a>
          </div>
          <div class="card-folder-resume__review__thought-header">
            <AppText bold tag="h3" class="card-folder-resume__review__thought-title">
              {{ titleMessage }}
            </AppText>
          </div>
          <div class="card-folder-resume__review__thought-body">
            <TextEmphasis
              v-if="displayComment"
              class="card-folder-resume__comment"
              :classComment="classBindingComment"
              :limit="800"
              :text="displayComment"
            />
            <AppText v-else tag="span" type="muted">{{ $t_locale('components/cockpit/leads/_id/CardFolderResume')('notSpecified') }}</AppText>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
import TextEmphasis from '~/components/global/TextEmphasis.vue';
import GarageTypes from '~/utils/models/garage.type.js';
import SourceTypes from '~/utils/models/source-types';
import LeadSaleTypes from '~/utils/models/data/type/lead-sale-types';
import { getDeepFieldValue } from '~/utils/object.js';

export default {
  components: { TextEmphasis },

  data() {
    return {
      deep: (fieldName) => getDeepFieldValue(this.dataGetLeadTicket, fieldName),
    };
  },

  props: {
    openModalDispatch: Function,
    addTicketAction: { type: Function, required: true },
    dataGetLeadTicket: Object,
  },

  computed: {
    id() {
      return this.deep('id');
    },
    garage() {
      return this.deep('garage');
    },
    sourceSubtype() {
      const sourceSubtype = this.deep('leadTicket.sourceSubtype');
      if (typeof sourceSubtype === 'string') {
        return sourceSubtype.split('/')[1] || sourceSubtype;
      }
      return null;
    },
    sourceTitle() {
      return this.deep('source.type') === SourceTypes.AGENT ? this.$t_locale('components/cockpit/leads/_id/CardFolderResume')('comesFromAgent') : this.$t_locale('components/cockpit/leads/_id/CardFolderResume')('comesFromGarage');
    },
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
    sourceSrc() {
      const sourceType = this.deep('source.type');
      if (sourceType === SourceTypes.AUTOMATION) {
        return '/logo/logo-custeed-automation-picto.svg';
      }
      if (this.sourceSubtype) {
        return `/cross-leads/${this.sourceSubtype}.svg`;
      }
      if (SourceTypes.hasValue(sourceType)) {
        return `/cross-leads/${sourceType}.svg`;
      }
      return `/cross-leads/ManualLead.svg`;
    },
    formattedLeadSaleType() {
      const leadSaleType = this.deep('leadTicket.saleType');
      if (LeadSaleTypes.hasValue(leadSaleType)) {
        return this.$t_locale('components/cockpit/leads/_id/CardFolderResume')('lead', { leadSaleType: this.$t_locale('components/cockpit/leads/_id/CardFolderResume')(leadSaleType) });
      }
      return this.$t_locale('components/cockpit/leads/_id/CardFolderResume')('lead', { leadSaleType: '' });
    },
    formattedSourceType() {
      const sourceType = this.deep('source.type');
      if (SourceTypes.hasValue(sourceType)) {
        return this.$t_locale('components/cockpit/leads/_id/CardFolderResume')(sourceType);
      }
      return sourceType;
    },
    isClose() {
      return (this.deep('leadTicket.status') || '').includes('Closed');
    },
    reviewRatingValue() {
      return this.deep('review.rating.value');
    },
    displayComment() {
      return (
        this.deep('leadTicket.comment') || this.deep('leadTicket.message') || this.deep('review.comment.text') || ''
      );
    },
    titleMessage() {
      if (this.deep('leadTicket.comment')) {
        return this.$t_locale('components/cockpit/leads/_id/CardFolderResume')('comment');
      } else {
        if (this.deep('leadTicket.message')) {
          return this.$t_locale('components/cockpit/leads/_id/CardFolderResume')('message');
        }
      }
      return this.$t_locale('components/cockpit/leads/_id/CardFolderResume')('review');
    },

    classBindingComment() {
      if (typeof this.reviewRatingValue !== 'number' || this.reviewRatingValue >= 9) {
        return 'success';
      }
      if (this.reviewRatingValue >= 7 && this.reviewRatingValue <= 8) {
        return 'erep-gold';
      }
      if (this.reviewRatingValue <= 6) {
        return 'danger';
      }
      return undefined;
    },
    customerNaming() {
      return (
        this.deep('leadTicket.customer.fullName') ||
        this.deep('leadTicket.customer.contact.mobilePhone') ||
        this.deep('leadTicket.customer.contact.email') ||
        (this.deep('source.by') === 'Phone' && this.$t_locale('components/cockpit/leads/_id/CardFolderResume')('anonymousCall')) ||
        ''
      );
    },
    // [SGS] show rating /5
    getBaseRating() {
      return this.garage && this.garage.type === GarageTypes.VEHICLE_INSPECTION && this.garage.ratingType === 'stars'
        ? 5
        : 10;
    },
  },

  methods: {
    isEmpty(val) {
      if (Array.isArray(val) && !val.length) {
        return true;
      }
      return !val || val === this.$t_locale('components/cockpit/leads/_id/CardFolderResume')('undefined') || val === 'UNDEFINED';
    },

    showReopenModal() {
      this.openModalDispatch({
        component: 'ModalLeadsTicketReopen',
        props: { id: this.id, addTicketAction: this.addTicketAction },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.card-folder-resume {
  padding: 1rem;

  &__part {
    &--header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-direction: column;
      overflow: hidden;
    }
  }

  &__header-left {
    display: flex;
    overflow: hidden;
  }

  &__header-left-part {
    display: flex;
    flex-flow: column;

    &__icon {
      font-size: 2rem;
      color: $blue;
      margin-bottom: 5px;
    }

    &__text {
      overflow: hidden;
      width: 100%;
      font-size: 0.9rem;
      text-align: center;
      
      &__source-img {
        max-height: 2rem;
        margin-bottom: 5px;
      }
    }

    &__help {
      margin-left: 5px;
      font-size: 9px;
      color: $grey;
    }

    &__subtitle-2 {
      display: block;
      margin-top: 5px;
    }

    & + & {
      margin-left: 1rem;
      overflow: hidden;
    }

    img {
      max-height: 26px;
    }
  }

  &__header-right {
    display: none;
    flex-flow: column;
    margin-top: 0.5rem;
    margin-left: 52px;
  }

  &__header-right-part {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }

  &__header-text {
    ::v-deep .text:not(:last-child) {
      padding-right: 0.5rem;
    }
  }

  &__review {
    display: flex;
    flex-flow: row;
    margin-top: 1rem;

    &__gauge {
      margin-right: 0.5rem;
      align-self: center;
    }

    &__thought {
      &-url {
        margin-bottom: 0.5rem;

        a {
          color: $link-blue;
          font-weight: bold;
          text-decoration: none;
          font-size: 0.9rem;
        }
      }
    }

    &__thought-header {
      display: flex;
      flex-flow: row;
      align-items: center;
      margin: 0.5rem 0;
    }

    &__thought-link-answer {
      color: $black-grey;
      text-decoration: none;
      margin-left: 0.5rem;
    }
  }

  &__comment {
    font-weight: bold !important;

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
}

@media (min-width: $breakpoint-min-md) {
  .card-folder-resume {
    &__part {
      &--header {
        flex-direction: unset;
      }
    }

    &__header-right {
      display: flex;
      margin-top: 0;
      margin-left: 0;
    }
  }
}

// Below fixes a bug where IE11 fails to take the media query into account
_:-ms-fullscreen,
:root .card-folder-resume__part--header {
  flex-direction: row;
}
</style>
