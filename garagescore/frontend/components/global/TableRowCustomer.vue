<template>
  <TableRow>
    <div class="row-customer" :style="{ flex: colspan }">
      <div class="row-customer__content">
        <CardGrey class="row-customer__part">
          <template slot="title">{{ $t_locale('components/global/TableRowCustomer')('Customer') }}</template>

          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('Name') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyFullname ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ format(fullname) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('Phone') }} :</AppText>
            <AppText
                :tag="!isEmptyMobile ? 'a' : 'span'"
                :href="
                `tel:${isEmptyMobile ? '' : mobile.replace(/ /g, '')}`
              "
                :type="isEmptyMobile ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ format(mobile) | formatPhoneNumber }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('Email') }} :</AppText>
            <AppText
                :tag="!isEmptyEmail ? 'a' : 'span'"
                :href="`mailto:${email}`"
                :type="isEmptyEmail ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ format(email) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('InternalId') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyInternalId ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ format(internalId) }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-customer__part">
          <template slot="title">{{ vehicleName }}</template>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('Make') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyVehicleBrand ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ format(vehicleBrand) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('Model') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyVehicleModel ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ format(vehicleModel) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('Plate') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyVehicleImmat ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ format(vehicleImmat) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('Vin') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyVin ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ format(vin) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('firstRegisteredAt') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyRegistrationDate ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ formattedFirstRegisteredAt }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('mileage') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyMileage ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ formattedMileage }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-customer__part">
          <template slot="title">{{ $t_locale('components/global/TableRowCustomer')('Service') }}</template>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('Type') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyType ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{ $t_locale('components/global/TableRowCustomer')(type) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('Date') }} :</AppText>
            <AppText
                tag="span"
                :type="isEmptyDate ? 'muted-light' : 'muted'"
                class="row-customer__value"
            >
              {{
                $t_locale('components/global/TableRowCustomer')('atDate', { date: $d(new Date(date), 'cockpit') })
              }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText tag="label" class="row-customer__label" bold>{{ $t_locale('components/global/TableRowCustomer')('FrontDeskUser') }} :</AppText>
            <AppText
                tag="span"
                :type="
                isEmptyServiceFrontDeskUserName ? 'muted-light' : 'muted'
              "
                class="row-customer__value"
            >
              {{ format(serviceFrontDeskUserName) }}
            </AppText>
          </div>
          <div class="row-customer__group">&nbsp;</div>
        </CardGrey>
      </div>
    </div>
  </TableRow>
</template>

<script>
import CardGrey from '~/components/global/CardGrey.vue';
import GarageTypes from '~/utils/models/garage.type.js';
import {
  phoneNumberSpecs,
  parsePhoneNumber,
} from '~/utils/phone';

export default {
  components: { CardGrey },

  props: {
    fullname: String,
    mobile: String,
    email: String,
    internalId: String,
    vehicleBrand: String,
    vehicleModel: String,
    vehicleImmat: String,
    vin: String,
    registrationDate: String,
    mileage: [Number, String],
    type: String,
    date: String,
    serviceFrontDeskUserName: String,
    unsatisfiedTicketCreatedAt: String,
    unsatisfiedTicketReferenceDate: String,

    colspan: Number,
    colspanBg: { type: Number, default: 2 },
    colspanEnd: { type: Number, default: 1 },
    cockpitType: String,
  },

  methods: {
    isEmpty(val) {
      return (
          val === '' ||
          !val ||
          val === this.$t_locale('components/global/TableRowCustomer')('Undefined') ||
          val === 'UNDEFINED' ||
          (Array.isArray(val) && !val.length)
      );
    },
    isValidMileage(val) {
      return val.toString().match(/^[0-9]{1,6}$/);
    },
    format(value) {
      return value === '' || !value ? this.$t_locale('components/global/TableRowCustomer')('Undefined') : value;
    },
  },

  filters: {
    formatPhoneNumber(val) {
      const phoneNumberInfo = parsePhoneNumber(val);
      if (phoneNumberInfo) {
        const countrySpec = phoneNumberSpecs[phoneNumberInfo.country];
        return countrySpec ? `${countrySpec.code} ${countrySpec.formatter(val)}` : val;
      }
      return val;
    },
  },

  computed: {
    isEmptyFullname() {
      return this.isEmpty(this.fullname);
    },
    isEmptyMobile() {
      return this.isEmpty(this.mobile);
    },
    isEmptyEmail() {
      return this.isEmpty(this.email);
    },
    isEmptyInternalId() {
      return this.isEmpty(this.internalId);
    },
    isEmptyVehicleBrand() {
      return this.isEmpty(this.vehicleBrand);
    },
    isEmptyVehicleModel() {
      return this.isEmpty(this.vehicleModel);
    },
    isEmptyVehicleImmat() {
      return this.isEmpty(this.vehicleImmat);
    },
    isEmptyVin() {
      return this.isEmpty(this.vin);
    },
    isEmptyMileage() {
      return this.isEmpty(this.mileage);
    },
    isEmptyRegistrationDate() {
      return this.isEmpty(this.registrationDate);
    },
    isEmptyType() {
      return this.isEmpty(this.type);
    },
    isEmptyDate() {
      return this.isEmpty(this.date);
    },
    isEmptyServiceFrontDeskUserName() {
      return this.isEmpty(this.serviceFrontDeskUserName);
    },
    rowClasses() {
      return {
        'row-customer--new': this.isTicketNew,
        'row-customer--reminder': this.hasRecentReminder,
      };
    },
    isTicketNew() {
      const ONE_HOUR = 60 * 60 * 1000;
      const leadTicketCreationDate = new Date(this.unsatisfiedTicketCreatedAt);
      // Created during the last hour
      return (Date.now() - leadTicketCreationDate.getTime()) < ONE_HOUR;
    },
    hasRecentReminder() {
      return this.unsatisfiedTicketCreatedAt !== this.unsatisfiedTicketReferenceDate;
    },
    mightBeAGreyBackground() {
      // No grey background for new tickets and recent reminders
      if (this.isTicketNew || this.hasRecentReminder) {
        return 'grey';
      }
      // Other cases, grey background
      return 'grey';
    },
    vehicleName() {
      if (this.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP)
        return this.$t_locale('components/global/TableRowCustomer')('Motorbike');
      return this.$t_locale('components/global/TableRowCustomer')('Vehicle');
    },
    formattedFirstRegisteredAt() {
      return this.isEmptyRegistrationDate ? this.format(this.registrationDate) : this.$t_locale('components/global/TableRowCustomer')('atDate',
                    { date: this.$d(new Date(parseInt(this.registrationDate)), 'cockpit') })
    },
    formattedMileage() {
      return (this.isEmptyMileage || !this.isValidMileage(this.mileage)) ?
                    this.$t_locale('components/global/TableRowCustomer')('Undefined') : this.$t_locale('components/global/TableRowCustomer')('mileage_value',
                        { value: this.mileage })
    }
  },
};
</script>

<style lang="scss" scoped>
.row-customer {
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

    .row-bg, .row-end {
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

    .row-bg, .row-end {
      background-color: rgba($mac-n-cheese, 0.05);
    }
  }

  &__content {
    display: flex;
    flex-flow: row;
    position: relative;
    left: -1.4rem;
    width: calc(100% + 2.4rem);
  }

  &__part {
    flex: 1;
    max-width: 34%;

    &:not(:last-child) {
      border-right: 1px solid white;
    }

    &--unsatisfaction-criterias {
      max-width: 100%;
    }
  }

  &__label {
    white-space: nowrap;
  }

  &__value {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    &--unsatisfied {
      white-space: normal;
    }
  }

  &__group {
    padding: 0.5rem 0;

    display: flex;
    flex-flow: column;

    & > & {
      margin-bottom: 1rem;
    }

    & > .row-customer__label {
      margin-right: 0.5rem;
    }
  }
}

.row-bg {
  background-color: $active-cell-color;
  border-bottom: 1px solid $white;
  display: none;
}

.row-end {
  display: none;
}

@media (min-width: $breakpoint-min-md) {
  .row-customer {
    &__group {
      flex-flow: row;
    }
  }

  .row-end,
  .row-bg {
    display: unset;
  }
}
</style>
