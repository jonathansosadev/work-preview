<template>
  <CardDropdown class="customer-info" :disabled="$mq === 'lg'">
    <template slot="header">
      <Title icon="icon-gs-customer">{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('title') }}</Title>
    </template>
    <template>
      <PlaceholderLoading absolute v-if="loading">{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('loading') }}</PlaceholderLoading>
      <div class="customer-info__part">
        <!-- Customer Full Name  -->
        <div class="customer-info__info">
          <template v-if="editing !== 'customerFullName'">
            <AppText class="customer-info__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerFullName') }}:</AppText>
            <FormattedValueWithMissingHandling
              class="customer-info__info-value"
              :type="isEmpty(deep('leadTicket.customer.fullName')) ? 'muted-light' : 'muted'"
              tag="span"
              :value="deep('leadTicket.customer.fullName')"
            />
            <button class="customer-info__edit" @click="edit('customerFullName')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="customer-info__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerFullName') }}:</AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeholder="$t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerFullName')"
                v-model="fields.customerFullName"
                @keyup.enter="updateTicket('customerFullName')"
                @validate="updateTicket('customerFullName')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
            </FieldGroup>
          </template>
        </div>
        <!-- Customer mobilePhone -->
        <div class="customer-info__info">
          <template v-if="editing !== 'customerContactMobilePhone'">
            <AppText class="customer-info__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerContactMobilePhone') }}:</AppText>
            <AppText
              v-if="!deep('leadTicket.customer.contact.mobilePhone')"
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.customer.contact.mobilePhone')) ? 'muted-light' : 'muted'"
            >
              {{ deep('leadTicket.customer.contact.mobilePhone') || $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('undefined') | formatPhoneNumber }}
            </AppText>
            <AppText
              v-else
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.customer.contact.mobilePhone')) ? 'muted-light' : 'muted'"
            >
              <a class="customer-info__info-link" :href="`tel:${deep('leadTicket.customer.contact.mobilePhone')}`">
                {{ deep('leadTicket.customer.contact.mobilePhone') || $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('undefined') | formatPhoneNumber }}
              </a>
            </AppText>
            <button class="customer-info__edit" @click="edit('customerContactMobilePhone')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="customer-info__info-label" tag="label" bold>
                {{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerContactMobilePhone') }}:
              </AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeholder="$t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerContactMobilePhone')"
                v-model="fields.customerContactMobilePhone"
                @validate="updateTicket('customerContactMobilePhone')"
                @keyup.enter="updateTicket('customerContactMobilePhone')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
              <AppText tag="div" type="danger" size="sm" v-if="invalidPhone">
                {{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerContactMobilePhoneWrong') }}
              </AppText>
            </FieldGroup>
          </template>
        </div>
        <!-- Customer customerContactEmail  -->
        <div class="customer-info__info">
          <template v-if="editing !== 'customerContactEmail'">
            <AppText class="customer-info__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerContactEmail') }}:</AppText>
            <AppText
              v-if="!deep('leadTicket.customer.contact.email')"
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.customer.contact.email')) ? 'muted-light' : 'muted'"
            >
              {{ deep('leadTicket.customer.contact.email') || $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('undefined') }}
            </AppText>
            <AppText
              v-else
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.customer.contact.email')) ? 'muted-light' : 'muted'"
            >
              <a class="customer-info__info-link" :href="`mailto:${deep('leadTicket.customer.contact.email')}`">
                {{ deep('leadTicket.customer.contact.email') || $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('undefined') }}
              </a>
            </AppText>
            <button class="customer-info__edit" @click="edit('customerContactEmail')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="customer-info__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerContactEmail') }}:</AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeHolder="$t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerContactEmail')"
                v-model="fields.customerContactEmail"
                @validate="updateTicket('customerContactEmail')"
                @keyup.enter="updateTicket('customerContactEmail')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
              <AppText tag="div" type="danger" size="sm" v-if="invalidEmail">
                {{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('customerContactEmailWrong') }}
              </AppText>
            </FieldGroup>
          </template>
        </div>
      </div>

      <div class="customer-info__part">
        <!-- Vehicle model -->
        <div class="customer-info__info" v-if="deep('leadTicket.vehicle.model')">
          <template v-if="editing !== 'vehicleModel'">
            <AppText class="customer-info__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('vehicleModel') }}:</AppText>
            <AppText class="customer-info__info-value" tag="span" type="muted">
              {{ deep('leadTicket.vehicle.model') }}
            </AppText>
            <button class="customer-info__edit" @click="edit('vehicleModel')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="customer-info__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('vehicleModel') }}:</AppText>
              <InputBasic
                size="sm"
                validateEvent
                v-model="fields.vehicleModel"
                :placeholder="$t_locale('components/cockpit/leads/_id/CardCustomerInfo')('vehicleModel')"
                @validate="updateTicket('vehicleModel')"
                @keyup.enter="updateTicket('vehicleModel')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
            </FieldGroup>
          </template>
        </div>
        <!-- Vehicle make model -->
        <div class="customer-info__info" v-if="deep('leadTicket.vehicle.makeModel')">
          <template v-if="editing !== 'vehicleMakeModel'">
            <AppText class="customer-info__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('vehicleMakeModel') }}:</AppText>
            <AppText class="customer-info__info-value" tag="span" type="muted">
              {{
                isEmpty(deep('leadTicket.vehicle.makeModel')) ? $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('undefined') : deep('leadTicket.vehicle.makeModel')
              }}
            </AppText>
            <button class="customer-info__edit" @click="edit('vehicleMakeModel')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="customer-info__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('vehicleMakeModel') }}:</AppText>
              <InputBasic
                size="sm"
                validateEvent
                v-model="fields.vehicleMakeModel"
                :placeholder="$t_locale('components/cockpit/leads/_id/CardCustomerInfo')('vehicleModel')"
                @validate="updateTicket('vehicleMakeModel')"
                @keyup.enter="updateTicket('vehicleMakeModel')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
            </FieldGroup>
          </template>
        </div>
        <!-- Vehicle Plate -->
        <div class="customer-info__info">
          <template v-if="editing !== 'vehiclePlate'">
            <AppText class="customer-info__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('vehiclePlate') }}:</AppText>
            <AppText
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.vehicle.plate')) ? 'muted-light' : 'muted'"
            >
              {{ deep('leadTicket.vehicle.plate') || $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('undefined') }}
            </AppText>
            <button class="customer-info__edit" @click="edit('vehiclePlate')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="customer-info__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('vehiclePlate') }}:</AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeholder="$t_locale('components/cockpit/leads/_id/CardCustomerInfo')('vehiclePlate')"
                v-model="fields.vehiclePlate"
                @validate="updateTicket('vehiclePlate')"
                @keyup.enter="updateTicket('vehiclePlate')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
            </FieldGroup>
          </template>
        </div>

        <!-- Vehicle Plate -->
        <div class="customer-info__info">
          <template v-if="editing !== 'vehicleMileage'">
            <AppText class="customer-info__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('mileage') }}:</AppText>
            <AppText
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.vehicle.mileage')) ? 'muted-light' : 'muted'"
            >
              {{
                isEmpty(deep('leadTicket.vehicle.mileage')) || !isValidMileage(deep('leadTicket.vehicle.mileage'))
                  ? $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('undefined')
                  : $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('mileage_value', { value: deep('leadTicket.vehicle.mileage') })
              }}
            </AppText>
            <button class="customer-info__edit" @click="edit('vehicleMileage')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="customer-info__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardCustomerInfo')('mileage') }}:</AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeholder="$t_locale('components/cockpit/leads/_id/CardCustomerInfo')('mileage')"
                v-model="fields.vehicleMileage"
                @validate="updateTicket('vehicleMileage')"
                @keyup.enter="updateTicket('vehicleMileage')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
            </FieldGroup>
          </template>
        </div>
      </div>
    </template>
  </CardDropdown>
</template>

<script>
import { phoneNumberSpecs, parsePhoneNumber } from '~/utils/phone';
import { getDeepFieldValue as deep } from '~/utils/object';
import fieldsValidation from '~/util/fieldsValidation';

export default {
  props: {
    id: {type: String, required: true},
    updateTicketDispatch: Function,
    dataGetLeadTicket: Object
  },

  data() {
    const fieldToPath = {
      customerFullName: { path: 'leadTicket.customer.fullName', defaultValue: '' },
      customerContactMobilePhone: { path: 'leadTicket.customer.contact.mobilePhone', defaultValue: '' },
      customerContactEmail: { path: 'leadTicket.customer.contact.email', defaultValue: '' },
      vehicleMake: { path: 'leadTicket.vehicle.make', defaultValue: '' },
      vehicleMakeModel: { path: 'leadTicket.vehicle.makeModel', defaultValue: '' },
      vehicleModel: { path: 'leadTicket.vehicle.model', defaultValue: '' },
      vehiclePlate: { path: 'leadTicket.vehicle.plate', defaultValue: '' },
      vehicleMileage: { path: 'leadTicket.vehicle.mileage', defaultValue: '' },
    };
    const data = {
      deep: (fieldName) => deep(this.dataGetLeadTicket, fieldName),
      editing: null,
      loading: false,
      fieldToPath,
      fields: {},
    };
    for (const field in fieldToPath) {
      data.fields[field] = deep(this, fieldToPath[field].path) || fieldToPath[field].defaultValue;
    }
    return data;
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
    invalidPhone() {
      if (this.editing !== 'customerContactMobilePhone') {
        return;
      }
      return (
        fieldsValidation(this.fields.customerContactMobilePhone, 'allPhoneTypes', { required: true }).status ===
        'Invalid'
      );
    },

    invalidEmail() {
      if (this.editing !== 'customerContactEmail') {
        return;
      }
      return fieldsValidation(this.fields.customerContactEmail, 'email', { required: true }).status === 'Invalid';
    },

    invalidMileage() {
      if (this.editing !== 'vehicleMileage') {
        return;
      }
      return fieldsValidation(this.fields.vehicleMileage, 'mileage', { required: true }).status === 'Invalid';
    },
  },

  methods: {
    edit(field, reset = false) {
      if (reset) {
        this.resetFields();
      }
      this.editing = this.editing === field ? null : field;
    },

    isEmpty(val) {
      if (Array.isArray(val) && !val.length) {
        return true;
      }
      return !val || val === this.$t_locale('components/cockpit/leads/_id/CardCustomerInfo')('undefined') || val === 'UNDEFINED';
    },

    isValidMileage(val) {
      return val.toString().match(/^[0-9]{1,6}$/);
    },

    resetFields() {
      for (const field in this.fieldToPath) {
        this.$set(this.fields, field, deep(this, this.fieldToPath[field].path) || this.fieldToPath[field].defaultValue);
      }
    },

    async updateTicket(field) {
      if (
        (field === 'customerContactEmail' && this.invalidEmail) ||
        (field === 'customerContactMobilePhone' && this.invalidPhone) ||
        (field === 'vehicleMileage' && this.invalidMileage)
      ) {
        return;
      }
      if (deep(this, this.fieldToPath[field].path) === this.fields[field]) {
        return;
      }
      this.loading = true;
      await this.updateTicketDispatch({
        dataId: this.id,
        field: this.fieldToPath[field].path,
        value: this.fields[field],
      });
      this.edit(null, true);
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.customer-info {
  position: relative;

  &__part {
    padding: 1rem;

    &--title {
      padding: 0 0 1rem 1rem;
    }

    &:not(:last-child) {
      border-bottom: 1px solid rgba($grey, .5);
    }
    &:last-child {
      padding-bottom: 0;
    }
  }

  &__info {
    display: flex;
    flex-flow: row;
    align-items: center;

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  &__info-link {
    color: inherit;

    &--primary {
      text-decoration-color: $blue;
      color: $blue;
    }
  }

  &__info-value {
    flex: 1;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__info-label {
    margin-right: 0.5rem;
  }

  &__edit {
    border: none;
    background-color: rgba($grey, .15);
    cursor: pointer;
    padding: 0.3rem 0.4rem;
    outline: 0;
    font-size: .85rem;
    color: $dark-grey;

    & i {
      position: relative;
      top: 2px;
    }

    &:hover {
      color: $greyish-brown;
      box-shadow: 0 1px 3px 0 rgba($black, .16);
    }
  }
}
</style>
