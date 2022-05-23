<template>
  <TableRow>
    <div class="table-leads-row-project">
      <div class="table-leads-row-project__content">
        <CardGrey class="table-leads-row-project__part">
          <template #title>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('client') }}</template>
          <div class="table-leads-row-project__group">
            <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Nom :') }}</AppText>
            <FormattedValueWithMissingHandling class="table-leads-row-project__value" v-bind="customerFullName" />
          </div>
          <div class="table-leads-row-project__group">
            <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Mobile :') }}</AppText>
            <FormattedValueWithMissingHandling class="table-leads-row-project__value" v-bind="customerMobilePhone" />
          </div>
          <div class="table-leads-row-project__group">
            <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Email :') }}</AppText>
            <FormattedValueWithMissingHandling class="table-leads-row-project__value" v-bind="customerEmail" />
          </div>
          <div class="table-leads-row-project__group">
            <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Ville :') }}</AppText>
            <FormattedValueWithMissingHandling class="table-leads-row-project__value" v-bind="customerCity" />
          </div>
        </CardGrey>

        <CardGrey class="table-leads-row-project__part table-leads-row-project__part--right">
          <template #title>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('project') }}</template>
          <div class="table-leads-row-project__group-part">
            <div class="table-leads-row-project__group-part-left">
              <div class="table-leads-row-project__group">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('trade') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTicketSaleTypeColor">
                  {{ formattedLeadTicketSaleType }}
                </AppText>
              </div>
              <div v-if="!isAMaintenanceLead" class="table-leads-row-project__group">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('leadType') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTypeColor">
                  {{ formattedLeadType }}
                </AppText>
              </div>
              <div v-else class="table-leads-row-project__group">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('leadType') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadRequestTypeColor">
                  {{ formattedLeadRequestType }}
                </AppText>
              </div>
              <div class="table-leads-row-project__group">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('sourceType') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="sourceTypeColor">
                  {{ formattedSourceType }}
                </AppText>
              </div>
              <div class="table-leads-row-project__group" v-if="isAMaintenanceLead">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('customerVehicle') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTicketVehicleMakeModelColor">
                  {{ formattedLeadTicketVehicleMakeModel }}
                </AppText>
              </div>
              <div class="table-leads-row-project__group" v-if="!isAMaintenanceLead">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Echéance :') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTicketTimingColor">
                  {{ formattedLeadTicketTiming }}
                </AppText>
              </div>
              <div class="table-leads-row-project__group" v-if="!isAMaintenanceLead">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Modèle :') }}</AppText>
                <FormattedValueWithMissingHandling
                  class="table-leads-row-project__value"
                  v-bind="leadTicketBrandModel"
                />
              </div>
            </div>
            <div class="table-leads-row-project__group-part-right" v-if="!isAMaintenanceLead">
              <div class="table-leads-row-project__group">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ bodyTypeTitle }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTicketBodyTypeColor">
                  {{ formatArray(leadTicketBodyType) }}
                </AppText>
              </div>
              <div class="table-leads-row-project__group" v-if="!isMotorbike">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Energie :') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTicketEnergyTypeColor">
                  {{ formatArray(leadTicketEnergyType) }}
                </AppText>
              </div>
              <div class="table-leads-row-project__group" v-if="isMotorbike">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Cylindrée :') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTicketCylinderColor">
                  {{ formatArray(leadTicketCylinder) }}
                </AppText>
              </div>
              <div class="table-leads-row-project__group">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Financement :') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTicketFinancingColor">
                  {{ formattedLeadTicketFinancing }}
                </AppText>
              </div>
              <div class="table-leads-row-project__group">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Reprise :') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTicketTradeInColor">
                  {{ formattedLeadTicketTradeIn }}
                </AppText>
              </div>
              <div class="table-leads-row-project__group">
                <AppText tag="label" class="table-leads-row-project__label" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Budget :') }}</AppText>
                <AppText class="table-leads-row-project__value" tag="span" :type="leadTicketTradeInColor">
                  {{ leadTicketVehiclePrice }}
                </AppText>
              </div>
            </div>
          </div>
        </CardGrey>
      </div>
      <CardGrey v-if="reviewComment" class="table-leads-row-project__part">
        <template #title>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('Dernier avis') }}</template>
        <div class="table-leads-row-project__group">
          <AppText tag="span" :type="reviewCommentColor" class="table-leads-row-project__comment">
            {{ reviewComment }}
          </AppText>
        </div>
      </CardGrey>
    </div>
  </TableRow>
</template>

<script>
import CardGrey from '~/components/global/CardGrey.vue';
import GarageTypes from '~/utils/models/garage.type';
import SourceTypes from '~/utils/models/source-types';
import LeadTypes from '~/utils/models/data/type/lead-types';
import LeadSaleTypes from '~/utils/models/data/type/lead-sale-types';
import LeadTimings from '~/utils/models/data/type/lead-timings';
import LeadFinancing from '~/utils/models/data/type/lead-financing';
import LeadTradeInTypes from '~/utils/models/data/type/lead-trade-in-types';
import { LeadTicketRequestTypes } from '~/utils/enumV2';
import { getDeepFieldValue } from '~/utils/object';

export default {
  components: { CardGrey },

  props: {
    // eslint-disable-next-line vue/no-unused-properties
    cockpitType: { type: String },
    customer: { type: Object, default: () => ({}) },
    lead: { type: Object, default: () => ({}) },
    leadTicket: { type: Object, default: () => ({}) },
    review: { type: Object, default: () => ({}) },
    source: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      deep: (fieldName) => getDeepFieldValue(this, fieldName),
    };
  },

  methods: {
    isEmpty(val) {
      return Array.isArray(val) ? val.length === 0 : val === '' || !val;
    },
    formatArray(value) {
      return value && value.length > 0 ? value.map((value) => this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')(value)).join(', ') : this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('undefined');
    },
  },

  computed: {
    isAMaintenanceLead() {
      return this.deep('leadTicket.saleType') === LeadSaleTypes.MAINTENANCE;
    },
    isMotorbike() {
      return this.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP;
    },
    // Values, sometimes returning an object that is v-bound, sometimes not
    reviewRating() {
      return this.deep('review.rating.value');
    },
    reviewComment() {
      return this.deep('review.comment.text');
    },
    customerFullName() {
      const fullName = this.deep('customer.fullName.value');
      return {
        value: fullName,
        tag: 'span',
        type: this.isEmpty(fullName) ? 'muted-light' : 'muted',
      };
    },
    customerMobilePhone() {
      const mobilePhone = this.deep('customer.contact.mobilePhone.value');
      const cleanedPhone = (mobilePhone && mobilePhone.replace(/ /g, '')) || '';
      return {
        value: mobilePhone,
        tag: this.isEmpty(mobilePhone) ? 'span' : 'a',
        href: `tel:${cleanedPhone}`,
        type: this.isEmpty(mobilePhone) ? 'muted-light' : 'muted',
      };
    },
    customerEmail() {
      const email = this.deep('customer.contact.email.value');
      return {
        value: email,
        tag: this.isEmpty(email) ? 'span' : 'a',
        href: `mailto:${email}`,
        type: this.isEmpty(email) ? 'muted-light' : 'muted',
      };
    },
    customerCity() {
      const city = this.deep('customer.city.value');
      return {
        value: city,
        tag: 'span',
        type: this.isEmpty(city) ? 'muted-light' : 'muted',
      };
    },
    leadType() {
      return this.deep('lead.type');
    },
    leadTicketRequestType() {
      return this.deep('leadTicket.requestType');
    },
    sourceType() {
      if (this.deep('source.type') === SourceTypes.AUTOMATION) {
        return this.deep('source.campaign');
      }
      return this.deep('source.type');
    },
    leadTicketSaleType() {
      return this.deep('leadTicket.saleType');
    },
    leadTicketBodyType() {
      return this.deep('leadTicket.bodyType');
    },
    leadTicketEnergyType() {
      return this.deep('leadTicket.energyType');
    },
    leadTicketCylinder() {
      return this.deep('leadTicket.cylinder');
    },
    leadTicketFinancing() {
      return this.deep('leadTicket.financing');
    },
    leadTicketTradeIn() {
      return this.deep('leadTicket.tradeIn');
    },
    leadTicketVehicleMakeModel() {
      return this.deep('leadTicket.vehicle.makeModel');
    },
    leadTicketTiming() {
      return this.deep('leadTicket.timing');
    },
    leadTicketBrandModel() {
      const brands = this.deep('leadTicket.brandModel');
      return {
        value: brands,
        tag: 'span',
        type: this.isEmpty(brands) ? 'muted-light' : 'muted',
      };
    },
    // Some formatted values, basically making a $t on the value if it's a proper value
    formattedLeadType() {
      if (this.isAMaintenanceLead) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('ApvInterested');
      }
      if (this.sourceType === SourceTypes.AUTOMATION) {
        return this.formattedLeadRequestType;
      }
      const supportedLeadTypes = [
        LeadTypes.INTERESTED,
        LeadTypes.NOT_INTERESTED,
        LeadTypes.ALREADY_ORDERED,
        LeadTypes.ALREADY_ORDERED_OTHER_BUSINESS,
        LeadTypes.ALREADY_PLANNED,
        LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS,
        LeadTypes.ALREADY_ORDERED_UNSPECIFIED,
        LeadTypes.IN_CONTACT_WITH_VENDOR,
      ];
      return supportedLeadTypes.includes(this.leadType) ? this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')(this.leadType) : this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('undefined');
    },
    formattedLeadRequestType() {
      if (LeadTicketRequestTypes.hasValue(this.leadTicketRequestType)) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')(this.leadTicketRequestType);
      }
      return this.leadTicketRequestType || this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('undefined');
    },
    formattedSourceType() {
      return SourceTypes.hasValue(this.sourceType) ? this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')(this.sourceType, {}, this.sourceType) : this.sourceType;
    },
    formattedLeadTicketSaleType() {
      const supportedLeadTicketSaleTypes = [
        LeadSaleTypes.MAINTENANCE,
        LeadSaleTypes.NEW_VEHICLE_SALE,
        LeadSaleTypes.USED_VEHICLE_SALE,
      ];
      if (supportedLeadTicketSaleTypes.includes(this.leadTicketSaleType)) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')(this.leadTicketSaleType, {}, this.leadTicketSaleType );
      }
      return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('unknown');
    },
    formattedLeadTicketTiming() {
      if (LeadTimings.hasValue(this.leadTicketTiming)) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')(this.leadTicketTiming, {}, this.leadTicketTiming);
      }
      return this.leadTicketTiming || this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('undefined');
    },
    formattedLeadTicketFinancing() {
      if (LeadFinancing.hasValue(this.leadTicketFinancing)) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')(this.leadTicketFinancing, {}, this.leadTicketFinancing);
      }
      return this.leadTicketFinancing || this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('undefined');
    },
    formattedLeadTicketVehicleMakeModel() {
      return this.deep('leadTicket.vehicle.makeModel') || this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('undefined');
    },
    formattedLeadTicketTradeIn() {
      if (this.leadTicketTradeIn === LeadTradeInTypes.YES && this.leadTicketVehicleMakeModel) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('YesVehicle', { vehicle: this.leadTicketVehicleMakeModel });
      }
      if (LeadTradeInTypes.hasValue(this.leadTicketTradeIn)) {
        return this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')(this.leadTicketTradeIn, {}, this.leadTicketTradeIn);
      }
      return this.leadTicketTradeIn || this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('undefined');
    },
    // The only computed title
    bodyTypeTitle() {
      // Translation labels are so weird here !
      return this.isMotorbike ? this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('bodyTypeCarLabel') : this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('bodyTypeMotorbikeLabel');
    },
    // Colors (type in AppText)
    leadTypeColor() {
      return !this.isEmpty(this.leadType) || this.isAMaintenanceLead ? 'muted' : 'muted-light';
    },
    leadRequestTypeColor() {
      return !this.isEmpty(this.leadType) || this.isAMaintenanceLead ? 'muted' : 'muted-light';
    },
    sourceTypeColor() {
      return this.isEmpty(this.sourceType) ? 'muted-light' : 'muted';
    },
    leadTicketSaleTypeColor() {
      return this.isEmpty(this.leadTicketSaleType) ? 'muted-light' : 'muted';
    },
    leadTicketTimingColor() {
      return this.isEmpty(this.leadTicketTiming) ? 'muted-light' : 'muted';
    },
    leadTicketBodyTypeColor() {
      return this.isEmpty(this.leadTicketBodyType) ? 'muted-light' : 'muted';
    },
    leadTicketEnergyTypeColor() {
      return this.isEmpty(this.leadTicketEnergyType) ? 'muted-light' : 'muted';
    },
    leadTicketCylinderColor() {
      return this.isEmpty(this.leadTicketCylinder) ? 'muted-light' : 'muted';
    },
    leadTicketFinancingColor() {
      return this.isEmpty(this.leadTicketFinancing) ? 'muted-light' : 'muted';
    },
    leadTicketTradeInColor() {
      return this.isEmpty(this.leadTicketTradeIn) ? 'muted-light' : 'muted';
    },
    leadTicketVehicleMakeModelColor() {
      return this.isEmpty(this.leadTicketVehicleMakeModel) ? 'muted-light' : 'muted';
    },
    reviewCommentColor() {
      if (this.reviewRating >= 9) {
        return 'success';
      } else if (this.reviewRating >= 6 && this.reviewRating <= 8) {
        return 'warning';
      } else {
        return 'danger';
      }
    },
    leadTicketVehiclePrice() {
      return this.deep('leadTicket.budget') ? this.deep('leadTicket.budget') + ' €' : this.$t_locale('components/cockpit/leads/reviews/TableLeadsRowProject')('undefined');
    },
  },
};
</script>

<style lang="scss" scoped>
.table-leads-row-project {
  flex: 5;
  padding: 0;

  &--new {
    border-left: solid 0.357rem $blue;

    ::v-deep .card {
      background-color: unset;
    }

    ::v-deep .card__header {
      background-color: rgba($blue, 0.15);
    }

    ::v-deep .card__body {
      background-color: rgba($blue, 0.05);
    }

    .padding-cell {
      background-color: rgba($blue, 0.05);
    }
  }

  &--reminder {
    border-left: solid 0.357rem $mac-n-cheese;

    ::v-deep .card {
      background-color: unset;
    }

    ::v-deep .card__header {
      background-color: rgba($mac-n-cheese, 0.15);
    }

    ::v-deep .card__body {
      background-color: rgba($mac-n-cheese, 0.05);
    }

    .padding-cell {
      background-color: rgba($mac-n-cheese, 0.05);
    }
  }

  &__label {
    white-space: nowrap;
  }

  &__value {
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__content {
    display: flex;
    flex-flow: row;
  }

  &__review {
    display: flex;
    flex-flow: column;
    padding: 1rem;
    background-color: $white;
  }

  &__comment {
    font-weight: 300;
  }

  &__status {
    text-align: center;
    padding: 1rem 0;

    .status-icon {
      font-size: 2rem;
    }

    // WRONG
    .green {
      color: $green;
      border: 1px solid $green;
      border-radius: 4px;
      padding: 1rem;
    }

    .red {
      color: $red;
      border: 1px solid $red;
      border-radius: 4px;
      padding: 1rem;
    }

    .yellow {
      color: $yellow;
      border: 1px solid $yellow;
      border-radius: 4px;
      padding: 1rem;
    }
  }

  &__group-part {
    display: flex;
  }

  &__group-part-right {
    flex: 1;
  }

  &__group-part-left {
    flex: 1;
    margin-right: 0.5rem;
  }

  &__part {
    flex: 1;

    &--right {
      flex: 2;
    }

    &:not(:last-child) {
      border-right: 1px solid white;
    }
  }

  &__group {
    padding: 0.5rem 0;

    display: flex;
    flex-flow: column;

    & > & {
      margin-bottom: 1rem;
    }

    & > .table-leads-row-project__label {
      margin-right: 0.5rem;
    }
  }
}

.row-bg {
  // useless this one. No ?
  background-color: $active-cell-color;
}

@media (min-width: $breakpoint-min-md) {
  .table-leads-row-project {
    &__group {
      flex-flow: row;
    }
  }
}
</style>
