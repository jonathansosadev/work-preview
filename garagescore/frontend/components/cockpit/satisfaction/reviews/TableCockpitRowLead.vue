<template>
  <TableRow>
    <div class="row-project" :style="{ flex: 7 }">
      <!-- Section 1: Details du projet d'achat -->
      <div class="row-project__header">
        {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('detailsTitle') }}
      </div>

      <div class="row-project__content">
        <CardGrey class="row-project__part">
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('statusTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('type')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayType(deep('type')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('typeTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('saleType')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displaySaleType(deep('saleType')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('timingTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('timing')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayTiming(deep('timing')) }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-project__part">
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
              v-if="deep('knowVehicle')"
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('modelTitle') }}
            </AppText>
            <AppText
              tag="label"
              class="row-project__label"
              bold
              v-else
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('modelTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('knowVehicle')) ? 'muted-light' : 'muted'"
              class="row-project__value"
              v-if="deep('knowVehicle')"
            >
              {{ displayVehicle(deep('knowVehicle')) }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('brands')) ? 'muted-light' : 'muted'"
              class="row-project__value"
              v-else
            >
              {{ displayBrands(deep('brands')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ bodyTypeTitle }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('bodyType')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayBodyType(deep('bodyType')) }}
            </AppText>
          </div>
          <div class="row-project__group" v-if="!isMotorbike">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('energyTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('energyType')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayEnergyType(deep('energyType')) }}
            </AppText>
          </div>
          <div class="row-project__group" v-if="isMotorbike">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('cylinderTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('cylinder')) ? 'muted-light' : 'muted'"
              class="row__value"
            >
              {{ displayCylinder(deep('cylinder')) }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-project__part">
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('financingTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('financing')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayFinancing(deep('financing')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('tradeInTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('tradeIn')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayTradeIn(deep('tradeIn')) }}
            </AppText>
          </div>
        </CardGrey>
      </div>

      <!-- Section 2: Details de la vente -->
      <div class="row-project__header" v-if="deep('conversion.sale.service.providedAt')">
        {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('saleTitle') }}
      </div>

      <div class="row-project__content" v-if="deep('conversion.sale.service.providedAt')">
        <CardGrey class="row-project__part">
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('makeTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.sale.vehicle.make.value')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.sale.vehicle.make.value')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('type2Title') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.sale.vehicle.model.value')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.sale.vehicle.model.value')) }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-project__part">
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('immatTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.sale.vehicle.plate.value')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.sale.vehicle.plate.value')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('reasonTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.sale.type')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displaySaleType(deep('conversion.sale.type')) }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-project__part">
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('dateTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.sale.service.providedAt')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{
                deep('conversion.sale.service.providedAt') ? $moment(getSaleDate).format('DD/MM/YYYY') : $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('undefined')
              }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('managerTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.sale.service.frontDeskUserName')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.sale.service.frontDeskUserName')) }}
            </AppText>
          </div>
        </CardGrey>
      </div>

      <!-- Section 2: Details de la reprise -->
      <div class="row-project__header" v-if="deep('conversion.tradeIn.service.providedAt')">
        {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('tradeTitle') }}
      </div>

      <div class="row-project__content" v-if="deep('conversion.tradeIn.service.providedAt')">
        <CardGrey class="row-project__part">
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('makeTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.tradeIn.vehicle.make.value')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.tradeIn.vehicle.make.value')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('type2Title') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.tradeIn.vehicle.model.value')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.tradeIn.vehicle.model.value')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('immatTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.tradeIn.vehicle.plate.value')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.tradeIn.vehicle.plate.value')) }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-project__part">
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('customerNameTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.tradeIn.customer.fullName.value')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.tradeIn.customer.fullName.value')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('customerPhoneTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.tradeIn.customer.contact.mobilePhone.value')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.tradeIn.customer.contact.mobilePhone.value')) }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('customerEmailTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.tradeIn.customer.contact.email.value')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.tradeIn.customer.contact.email.value')) }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-project__part">
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('reasonTitle') }}
            </AppText>
            <AppText
              tag="span"
              type="primary"
              class="row-project__value"
            >
              {{ displaySaleType('UsedVehicleSale') }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('dateTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(deep('conversion.tradeIn.service.providedAt')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{
                deep('conversion.tradeIn.service.providedAt') ? $moment(getTradeInDate).format('DD/MM/YYYY') : $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(
                  'undefined')
              }}
            </AppText>
          </div>
          <div class="row-project__group">
            <AppText
              tag="label"
              class="row-project__label"
              bold
            >
              {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('managerTitle') }}
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty( deep('conversion.sale.service.frontDeskUserName')) ? 'muted-light' : 'muted'"
              class="row-project__value"
            >
              {{ displayValue(deep('conversion.sale.service.frontDeskUserName')) }}
            </AppText>
          </div>
        </CardGrey>
      </div>
    </div>
  </TableRow>
</template>

<script>
import CardGrey from '~/components/global/CardGrey.vue';
import GarageTypes from '~/utils/models/garage.type.js';
import { getDeepFieldValue as deep } from '~/utils/object';

export default {
  components: { CardGrey },

  props: {
    lead: Object,
    cockpitType: String,
  },

  created() {
    this.deep = (fieldName) => deep(this.lead, fieldName);
  },

  computed: {
    bodyTypeTitle() {
      if (this.isMotorbike) {
        return this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('bodyTypeTitleMotorbikes');
      }
      return this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('bodyTypeTitleCars');
    },
    isMotorbike() {
      return (this.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP);
    },
    getTradeInDate() {
      return new Date(this.deep('conversion.tradeIn.service.providedAt'));
    },
    getSaleDate() {
      return new Date(this.deep('conversion.sale.service.providedAt'));
    },
  },

  methods: {
    isEmpty(value) {
      if (typeof value === 'string') {
        value = value.replace(/\0/g, '');
      }
      if (value && Array.isArray(value)) {
        return value.length === 0;
      }
      return !value || value === '' || value === 'UNDEFINED';
    },
    displayValue(value) {
      return this.isEmpty(value) ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('undefined') : this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(value, {}, value);
    },
    displayType(value) {
      return this.isEmpty(value) ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('undefined') : this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(value, {}, value);
    },
    displayTiming(value) {
      return this.isEmpty(value) ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('undefined') : this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(`leadTiming_${value}`, {}, value);
    },
    displaySaleType(value) {
      return this.isEmpty(value) ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('leadSaleType_Unknown') : this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(`leadSaleType_${value}`, {}, value);
    },
    displayBodyType(value) {
      return this.isEmpty(value)
        ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('leadBodyType_Unknown')
        : value.map(v => this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(`leadBodyType_${v}`, {}, v)).join(', ');
    },
    displayEnergyType(value) {
      return this.isEmpty(value)
        ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('leadEnergyType_unknown')
        : value.map(v => this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(`leadEnergyType_${v}`, {}, v)).join(', ');
    },
    displayTradeIn(value) {
      return this.isEmpty(value) ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('leadTradeIn_Unknown') : this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(`leadTradeIn_${value}`, {}, value);
    },
    displayFinancing(value) {
      return this.isEmpty(value) ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('leadFinancing_unknown') : this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(`leadFinancing_${value}`, {}, value);
    },
    displayCylinder(value) {
      return this.isEmpty(value)
        ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('leadCylinder_Unknown')
        : value.map(v => this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')(`leadCylinder_${v}`, {}, v)).join(', ');
    },
    displayVehicle(value) {
      return this.isEmpty(value) ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('undefined') : value;
    },
    displayBrands(value) {
      return this.isEmpty(value) ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowLead')('undefined') : value.join(', ');
    },
  },
};
</script>


<style lang="scss" scoped>
.row-project {
  &__content {
    display: flex;
    flex-flow: row;
  }

  &__part {
    flex: 1;

    &:not(:last-child) {
      border-right: 1px solid white;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    background-color: $light-grey;
    padding: 0.5rem 1rem;
    font-weight: bold;
  }

  &__group {
    padding: 0.5rem 0;

    & > & {
      margin-bottom: 1rem;
    }

    & > .row-project__label {
      margin-right: 0.5rem;
    }
  }
}
</style>
