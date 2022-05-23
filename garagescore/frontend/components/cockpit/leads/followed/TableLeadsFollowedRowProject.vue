<template>
  <TableRow>
    <td class="row" :colspan="3">
      <div class="row__content">
        <CardGrey class="row__part">
          <template slot="title">{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('client') }}</template>
          <div class="row__group">
            <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Nom :') }}</AppText>
            <FormattedValueWithMissingHandling class="row__value" v-bind="customerFullName" />
          </div>
          <div class="row__group">
            <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Mobile :') }}</AppText>
            <FormattedValueWithMissingHandling class="row__value" v-bind="customerMobilePhone" />
          </div>
          <div class="row__group">
            <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Email :') }}</AppText>
            <FormattedValueWithMissingHandling class="row__value" v-bind="customerEmail" />
          </div>
          <div class="row__group">
            <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Ville :') }}</AppText>
            <FormattedValueWithMissingHandling class="row__value" v-bind="customerCity" />
          </div>
        </CardGrey>

        <CardGrey class="row__part row__part--right">
          <template slot="title">{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('project') }}</template>
          <div class="row__group-part">
            <div class="row__group-part-left">
              <div class="row__group">
                <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Etat du projet :', {}, 'Etat du projet :') }}</AppText>
                <AppText class="row__value" tag="span" :type="leadTypeColor">
                  {{ formattedLeadType }}
                </AppText>
              </div>
              <div class="row__group">
                <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Type de projet :', {} , 'Type de projet :') }}</AppText>
                <AppText class="row__value" tag="span" :type="leadTicketSaleTypeColor">
                  {{ formattedLeadTicketSaleType }}
                </AppText>
              </div>
              <div class="row__group">
                <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Echéance :', {}, 'Echéance :') }}</AppText>
                <AppText class="row__value" tag="span" :type="leadTicketTimingColor">
                  {{ formattedLeadTicketTiming }}
                </AppText>
              </div>
              <div class="row__group">
                <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Modèle :', {}, 'Modèle :') }}</AppText>
                <FormattedValueWithMissingHandling class="row__value" v-bind="leadTicketBrandModel" />
              </div>
            </div>
            <div class="row__group-part-right">
              <div class="row__group">
                <AppText tag="label" class="row__label" bold>{{ bodyTypeTitle }}</AppText>
                <AppText class="row__value" tag="span" :type="leadTicketBodyTypeColor">
                  {{ formatArray(leadTicketBodyType) }}
                </AppText>
              </div>
              <div class="row__group" v-if="!isMotorbike">
                <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Energie :') }}</AppText>
                <AppText class="row__value" tag="span" :type="leadTicketEnergyTypeColor">
                  {{ formatArray(leadTicketEnergyType) }}
                </AppText>
              </div>
              <div class="row__group" v-if="isMotorbike">
                <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Cylindrée :') }}</AppText>
                <AppText class="row__value" tag="span" :type="leadTicketCylinderColor">
                  {{ formatArray(leadTicketCylinder) }}
                </AppText>
              </div>
              <div class="row__group">
                <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Financement :') }}</AppText>
                <AppText class="row__value" tag="span" :type="leadTicketFinancingColor">
                  {{ formattedLeadTicketFinancing }}
                </AppText>
              </div>
              <div class="row__group">
                <AppText tag="label" class="row__label" bold>{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Reprise :') }}</AppText>
                <AppText class="row__value" tag="span" :type="leadTicketTradeInColor">
                  {{ formattedLeadTicketTradeIn }}
                </AppText>
              </div>
            </div>
          </div>
        </CardGrey>
      </div>
      <CardGrey v-if="reviewComment" class="row__part">
        <template slot="title">{{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('Dernier avis') }}</template>
        <div class="row__group">
          <AppText tag="span" type="primary" class="row__comment">{{ reviewComment }}</AppText>
        </div>
      </CardGrey>
    </td>
    <td class="row-bg" :colspan="2" />
  </TableRow>
</template>

<script>
import CardGrey from "~/components/global/CardGrey.vue";
import GarageTypes from "~/utils/models/garage.type";
import LeadTypes from "~/utils/models/data/type/lead-types";
import LeadSaleTypes from "~/utils/models/data/type/lead-sale-types";
import LeadTimings from "~/utils/models/data/type/lead-timings";
import LeadFinancing from "~/utils/models/data/type/lead-financing";
import LeadTradeInTypes from "~/utils/models/data/type/lead-trade-in-types";
import { getDeepFieldValue } from "~/utils/object";

export default {
  components: { CardGrey },

  props: {
    // eslint-disable-next-line vue/no-unused-properties
    review: Object, // use in deep
    // eslint-disable-next-line vue/no-unused-properties
    customer: Object, // use in deep
    // eslint-disable-next-line vue/no-unused-properties
    lead: Object, // use in deep
    // eslint-disable-next-line vue/no-unused-properties
    leadTicket: Object, // use in deep
    cockpitType: String,
  },

  data() {
    return {
      deep: (fieldName) => getDeepFieldValue(this, fieldName),
    };
  },

  methods: {
    isEmpty(val) {
      return Array.isArray(val) ? val.length === 0 : val === "" || !val;
    },
    formatArray(value) {
      return value && value.length > 0
        ? value.map((value) => this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')(value, {}, value)).join(", ")
        : this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')("undefined");
    },
  },

  computed: {
    isMotorbike() {
      return this.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP;
    },
    // Values, sometimes returning an object that is v-bound, sometimes not
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
      const cleanedPhone = mobilePhone && mobilePhone.replace(/ /g, '') || '';
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
        type: this.isEmpty(email) ? 'muted-light' : 'muted'
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
      return supportedLeadTypes.includes(this.leadType) ? this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')(this.leadType) : this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')("undefined");
    },
    formattedLeadTicketSaleType() {
      const supportedLeadTicketSaleTypes = [LeadSaleTypes.NEW_VEHICLE_SALE, LeadSaleTypes.USED_VEHICLE_SALE];
      if (supportedLeadTicketSaleTypes.includes(this.leadTicketSaleType)) {
        return this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')(this.leadTicketSaleType, {}, this.leadTicketSaleType);
      }
      return this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('unknown');
    },
    formattedLeadTicketTiming() {
      if (LeadTimings.hasValue(this.leadTicketTiming)) {
        return this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')(this.leadTicketTiming, {}, this.leadTicketTiming);
      }
      return this.leadTicketTiming || this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('undefined');
    },
    formattedLeadTicketFinancing() {
      if (LeadFinancing.hasValue(this.leadTicketFinancing)) {
        return this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')(this.leadTicketFinancing, {}, this.leadTicketFinancing);
      }
      return this.leadTicketFinancing || this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('undefined');
    },
    formattedLeadTicketTradeIn() {
      if (LeadTradeInTypes.hasValue(this.leadTicketTradeIn)) {
        return this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')(this.leadTicketTradeIn, {}, this.leadTicketFinancing);
      }
      return this.leadTicketTradeIn || this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')('undefined');
    },
    // The only computed title
    bodyTypeTitle() {
      // Translation labels are so weird here !
      return this.isMotorbike ? this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')("bodyTypeCarLabel") : this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedRowProject')("bodyTypeMotorbikeLabel");
    },
    // Colors (type in AppText)
    leadTypeColor() {
      return this.isEmpty(this.leadType) ? 'muted-light' : 'muted';
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
  }
};
</script>


<style lang="scss" scoped>
.row {
  padding: 0;

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
      flex: 1;
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

    & > .row__label {
      margin-right: 0.5rem;
    }
  }
}

.row-bg {
  background-color: $active-cell-color;
}

@media (min-width: $breakpoint-min-md) {
  .row {
    &__group {
      flex-flow: row;
    }
  }
}
</style>
