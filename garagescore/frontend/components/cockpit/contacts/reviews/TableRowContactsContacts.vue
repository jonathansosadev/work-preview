<template>
  <TableRow>
    <div class="row-customer" :style="{ flex: 7 }">
      <div class="row-customer__content">
        <CardGrey class="row-customer__part">
          <template slot="title">
            {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Customer") }}
          </template>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Title") }} :
            </AppText>
            <AppText
              tag="span"
              type="muted"
              class="row-customer__value"
            >
              {{ title ? $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')(formattedValue(title)) : formattedValue(title) }}
            </AppText>
            <!--<AppText tag="span" v-if="hasBeenReplaced(title, oldTitle)" type="muted" line-through>{{ formattedValue(oldTitle) }}</AppText>-->
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Name") }} :
            </AppText>
            <AppText
              tag="span"
              :type="getType(fullName, oldFullName)"
              class="row-customer__value"
            >
              {{ formattedValue(fullName) }}
            </AppText>
            <AppText
              tag="span"
              v-if="hasBeenReplaced(fullName, oldFullName)"
              type="muted"
              line-through
            >
              {{ formattedValue(oldFullName) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Phone") }} :
            </AppText>
            <AppText
              :tag="isEmpty(phone) ? 'span' : 'a'"
              :href="`tel:${phone ? phone.replace(/ /g, '') : ''}`"
              :type="getType(phone, oldPhone, customerPhoneStatus)"
              class="row-customer__value"
              :lineThrough="isDropped(phone, customerPhoneStatus)"
            >
              {{
                formattedValue(phone, customerPhoneStatus) | formatPhoneNumber
              }}
            </AppText>
            <AppText tag="span" class="row-customer__value text--primary">
              {{
                showIsDropped(phone, customerPhoneStatus,customerUnsubscribedByPhone)
              }}
            </AppText>
            <AppText
              tag="span"
              v-if="hasBeenReplaced(phone, oldPhone)"
              type="muted"
              line-through
            >
              &nbsp;&nbsp;{{
                formattedValue(oldPhone) | formatPhoneNumber
              }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Email") }} :
            </AppText>
            <AppText
              :tag="isEmpty(email) || emailIsNc ? 'span' : 'a'"
              :href="`mailto:${email}`"
              :type="getType(email, oldEmail, customerEmailStatus)"
              class="row-customer__value"
              :lineThrough="isDropped(email, customerEmailStatus)"
            >
              {{ formattedValue(email, customerEmailStatus) }}
            </AppText>
            <AppText tag="span" class="row-customer__value text--primary">
              {{
                showIsDropped(email, customerEmailStatus, customerUnsubscribedByEmail)
              }}
            </AppText>
            <AppText
              tag="span"
              v-if="emailIsNc"
              type="muted"
              italic
            >
              - {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("nc") }}
            </AppText>
            <AppText
              tag="span"
              v-if="hasBeenReplaced(email, oldEmail)"
              type="muted"
              line-through
            >
              {{ formattedValue(oldEmail) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Street") }} :
            </AppText>
            <AppText
              tag="span"
              :type="getType(street, oldStreet)"
              class="row-customer__value"
            >
              {{ formattedValue(street) }}
            </AppText>
            <AppText
              tag="span"
              v-if="hasBeenReplaced(street, oldStreet)"
              type="muted"
              line-through
            >
              {{ formattedValue(oldStreet) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("City") }} :
            </AppText>
            <AppText
              tag="span"
              :type="getType(city, oldCity)"
              class="row-customer__value"
            >
              {{ formattedValue(city) }}
            </AppText>
            <AppText
              tag="span"
              v-if="hasBeenReplaced(city, oldCity)"
              type="muted"
              line-through
            >
              {{ formattedValue(oldCity) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("PostalCode") }} :
            </AppText>
            <AppText
              tag="span"
              :type="getType(postalCode, oldPostalCode)"
              class="row-customer__value"
            >
              {{ formattedValue(postalCode) }}
            </AppText>
            <AppText
              tag="span"
              v-if="hasBeenReplaced(postalCode, oldPostalCode)"
              type="muted"
              line-through
            >
              {{ formattedValue(oldPostalCode) }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-customer__part">
          <template slot="title">
            {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Vehicule") }}
          </template>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Make") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(vehicleBrand) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(vehicleBrand) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Model") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(vehicleModel) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(vehicleModel) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Plaque") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(vehicleImmat) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(vehicleImmat) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Vin") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(vin) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(vin) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("firstRegisteredAt") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(registrationDate) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{
                isEmpty(registrationDate) ? formattedValue(registrationDate) : $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("atDate", { date: $d(new Date(registrationDate), "cockpit") })
              }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("mileage") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(mileage) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{ (isEmpty(mileage) || !isValidMileage(mileage)) ? $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Undefined") : $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("mileage_value", { value: mileage }) }}
            </AppText>
          </div>
        </CardGrey>

        <CardGrey class="row-customer__part">
          <template slot="title">
            {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Service") }}
          </template>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Garage") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(garageName) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(garageName) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Type") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(type) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue($t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')(type)) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Date") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(date) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{
                $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("atDate", { date: $d(new Date(date), "cockpit") })
              }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("FrontDeskUser") }} :
            </AppText>
            <AppText
              tag="span"
              :type="
                isEmpty(serviceFrontDeskUserName) ? 'muted-light' : 'muted'
              "
              class="row-customer__value"
            >
              {{ formattedValue(serviceFrontDeskUserName) }}
            </AppText>
          </div>
          <div class="row-customer__group">
            <AppText
              tag="label"
              class="row-customer__label"
              bold
            >
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("InternalId") }} :
            </AppText>
            <AppText
              tag="span"
              :type="isEmpty(internalId) ? 'muted-light' : 'muted'"
              class="row-customer__value"
            >
              {{ formattedValue(internalId) }}
            </AppText>
          </div>
        </CardGrey>
      </div>
      <div class="row-customer__status">
        <div v-if="isSendCampaign() && isReceivedCampaign() && !isBlockedCampaign()">
          <div class="green" style="display: inline-block">
            <span>{{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("SuccessVia") }}</span>
            <span v-if="isCampaignContactedByEmail && oldEmail">
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("email") }}
            </span>
            <span v-if="isCampaignContactedByPhone && isCampaignContactedByEmail && oldEmail">+</span>
            <span v-if="isCampaignContactedByPhone">{{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("sms") }}</span>
          </div>
        </div>
        <div v-if="isCampaignContactScheduled()">
          <div class="green" style="display: inline-block">
            <span v-if="isToday($dd(campaignFirstSendAt || new Date()), 'short')"> {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')('SendToday') }}</span>
            <span v-else>
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')('SendAt', { date: $dd(campaignFirstSendAt, 'DD MMM YYYY') }) }}
            </span>
            <span v-if="validStatus(customerEmailStatus)">
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')('email') }}
            </span>
            <span v-if="validStatus(customerEmailStatus) && validStatus(customerPhoneStatus)">+</span>
            <span v-if="validStatus(customerPhoneStatus)">{{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')('sms') }}</span>
          </div>
        </div>
        <div v-if="isSendCampaign() && !isReceivedCampaign() && !isBlockedCampaign()">
          <div class="red" style="display: inline-block">
            {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("NotReceived") }}
            <span v-if="explainCampaignContactStatus">
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("explain", { status: $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')(explainCampaignContactStatus) }) }}
            </span>
          </div>
        </div>
        <div v-if="isBlockedCampaign() || customerUnsubscribedByEmail || customerUnsubscribedByPhone">
          <div class="yellow" style="display: inline-block">
            {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Blocked") }}
            <span v-if="explainCampaignContactStatus">
              {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("explain", { status: $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')(explainCampaignContactStatus) }) }}
            </span>
          </div>
        </div>
        <div v-if="!isSendCampaign() && !isBlockedCampaign() && !isCampaignContactScheduled()">
          <div class="yellow border-grey-gs-4" style="display: inline-block">
            {{ $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("NotSent") }}
            <span v-if="explainCampaignContactStatus">
              {{
                $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("explain", { status: $t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')(explainCampaignContactStatus) })
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </TableRow>
</template>

<script>
import CardGrey from "~/components/global/CardGrey.vue";
import CampaignContactStatus from "~/utils/models/data/type/campaign-contact-status.js";
import {
  phoneNumberSpecs,
  parsePhoneNumber
} from "~/utils/phone";

export default {
  components: { CardGrey },

  props: {
    title: String,
    fullName: String,
    phone: String,
    email: String,
    emailIsNc: Boolean,
    street: String,
    city: String,
    postalCode: String,

    //---------
    // oldTitle: String,
    oldFullName: String,
    oldPhone: String,
    oldEmail: String,
    oldStreet: String,
    oldCity: String,
    oldPostalCode: String,
    //-----------

    internalId: String,
    vehicleBrand: String,
    vehicleModel: String,
    vehicleImmat: String,
    vin: String,
    registrationDate: String,
    mileage: Number,
    date: String,
    // manager: String,
    garageName: String,
    type: String,
    customerCampaignContactStatus: String,
    explainCampaignContactStatus: String,
    customerEmailStatus: String,
    customerPhoneStatus: String,
    customerUnsubscribedByEmail: Boolean,
    customerUnsubscribedByPhone: Boolean,
    // explainEmailStatus: String,
    // explainPhoneStatus: String,
    isCampaignContactedByEmail: Boolean,
    isCampaignContactedByPhone: Boolean,
    campaignFirstSendAt: String,
    serviceFrontDeskUserName: String
  },
  methods: {
    isEmpty(val) {
      const valUndefinedOrEmptyString = !val || val === '';
      const valTranslateUndefined = val === this.$t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')('Undefined');
      const valUndefinedString = val === 'UNDEFINED';
      return valUndefinedOrEmptyString || valTranslateUndefined || valUndefinedString;
    },
    isValidMileage(val) {
      return val.toString().match(/^[0-9]{1,6}$/);
    },
    formattedValue(value, status) {
      if (value) {
        return value;
      }
      if (status && status === "Wrong") {
        return this.$t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Wrong");
      }
      return this.$t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Undefined");
    },
    isDropped(value, status) {
      return value && status === "Wrong";
    },
    showIsDropped(value, status, unsubscribedStatus) {
      if (value && unsubscribedStatus) {
        return ` (${this.$t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("unsubscribed")})`;
      } else  if (value && status === "Wrong") {
        return ` (${this.$t_locale('components/cockpit/contacts/reviews/TableRowContactsContacts')("Dropped")})`;
      }
    },
    getType(val, oldVal, status) {
      if (this.hasBeenReplaced(val, oldVal)) {
        return "success";
      } else if (this.isEmpty(val)) {
        return "muted-light";
      } else if (status === "Wrong") {
        return "danger";
      }
      return "muted";
    },

    isSendCampaign() {
      return (
        this.customerCampaignContactStatus === CampaignContactStatus.RECEIVED ||
        this.customerCampaignContactStatus ===
          CampaignContactStatus.NOT_RECEIVED
      );
    },

    isReceivedCampaign() {
      return (
        this.customerCampaignContactStatus === CampaignContactStatus.RECEIVED
      );
    },

    // isNotReceivedCampaign() {
    //   return (
    //     this.customerCampaignContactStatus ===
    //     CampaignContactStatus.NOT_RECEIVED
    //   );
    // },
    //
    // isImpossibleCampaign() {
    //   return (
    //     this.customerCampaignContactStatus === CampaignContactStatus.IMPOSSIBLE
    //   );
    // },

    isBlockedCampaign() {
      return (
        this.customerCampaignContactStatus === CampaignContactStatus.BLOCKED
      );
    },

    isCampaignContactScheduled() {
      return (
        this.customerCampaignContactStatus === CampaignContactStatus.SCHEDULED
      );
    },

    hasBeenReplaced(newValue, oldValue) {
      if (!oldValue && !newValue) {
        return false;
      }
      return newValue !== oldValue;
    },

    validStatus(status) {
      return status === "Valid";
    },

    isToday(date) {
      const momentDate = this.$moment(date);
      return this.$moment().isSame(momentDate, 'day');
    },
  },

  filters: {
    formatPhoneNumber(val) {
      const phoneNumberInfo = parsePhoneNumber(val);
      if (phoneNumberInfo) {
        const countrySpec = phoneNumberSpecs[phoneNumberInfo.country];
        return countrySpec
          ? `${countrySpec.code} ${countrySpec.formatter(val)}`
          : val;
      }
      return val;
    }
  }
};
</script>

<style lang="scss" scoped>
.row-bg {
  background-color: $active-cell-color;
  border-bottom: 1px solid $white;
}

.row-customer {
  background-color: $very-light-grey;
  &__content {
    display: flex;
    flex-flow: row;
  }

  &__status {
    text-align: center;
    padding: 1rem 0;
    .status-icon {
      font-size: 2rem;
    }
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

  &__part {
    flex: 1;

    &:not(:last-child) {
      border-right: 1px solid white;
    }
  }

  &__group {
    padding: 0.5rem 0;

    & > & {
      margin-bottom: 1rem;
    }

    & > .row-customer__label {
      margin-right: 0.5rem;
    }
  }
}
</style>
