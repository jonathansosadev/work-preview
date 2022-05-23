<template>
  <CardDropdown class="customer-info" :disabled="$mq === 'lg'">
    <template slot="header">
      <Title icon="icon-gs-customer">
        {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('title') }}
      </Title>
    </template>
    <template>
      <PlaceholderLoading absolute v-if="loading">
        {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('loading') }}
      </PlaceholderLoading>
      <div class="customer-info__part">
        <!-- Customer Full Name  -->
        <div class="customer-info__info">
          <template v-if="editing !== 'customerFullName'">
            <AppText
              class="customer-info__info-label"
              tag="span"
              bold
            >
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('name') }}:
            </AppText>
            <FormattedValueWithMissingHandling
              class="customer-info__info-value"
              :type="isEmpty(deep('unsatisfiedTicket.customer.fullName')) ? 'muted-light' : 'muted'"
              tag="span"
              :value="deep('unsatisfiedTicket.customer.fullName')"
            />
            <button
              v-if="editable"
              class="customer-info__edit"
              @click="edit('customerFullName')"
            >
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText
                class="customer-info__info-label"
                tag="label"
                bold
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('name') }}:
              </AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeholder="$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('name')"
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
        <!-- Customer phone -->
        <div class="customer-info__info">
          <template v-if="editing !== 'phone'">
            <AppText
              class="customer-info__info-label"
              tag="span"
              bold
            >
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('phone') }}:
            </AppText>
            <AppText
              v-if="!deep('unsatisfiedTicket.customer.contact.mobilePhone')"
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('unsatisfiedTicket.customer.contact.mobilePhone')) ? 'muted-light' : 'muted'"
            >
              {{ deep('unsatisfiedTicket.customer.contact.mobilePhone') || $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined') | formatPhoneNumber }}
            </AppText>
            <AppText
              v-else
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('unsatisfiedTicket.customer.contact.mobilePhone')) ? 'muted-light' : 'muted'"
            >
              <a
                class="customer-info__info-link"
                :href="`tel:${deep('unsatisfiedTicket.customer.contact.mobilePhone')}`"
              >
                {{ deep('unsatisfiedTicket.customer.contact.mobilePhone') || $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined') | formatPhoneNumber }}
              </a>
            </AppText>
            <button
              v-if="editable"
              class="customer-info__edit"
              @click="edit('phone')"
            >
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText
                class="customer-info__info-label"
                tag="label"
                bold
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('phone') }}:
              </AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeholder="$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('phone')"
                v-model="fields.phone"
                @validate="updateTicket('phone')"
                @keyup.enter="updateTicket('phone')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
              <AppText
                tag="div"
                type="danger"
                size="sm"
                v-if="invalidPhone"
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('phoneWrong') }}
              </AppText>
            </FieldGroup>
          </template>
        </div>
        <!-- Customer email  -->
        <div class="customer-info__info">
          <template v-if="editing !== 'email'">
            <AppText
              class="customer-info__info-label"
              tag="span"
              bold
            >
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('email') }}:
            </AppText>
            <AppText
              v-if="!deep('unsatisfiedTicket.customer.contact.email')"
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('unsatisfiedTicket.customer.contact.email')) ? 'muted-light' : 'muted'"
            >
              {{ deep('unsatisfiedTicket.customer.contact.email') || $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined') }}
            </AppText>
            <AppText
              v-else
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('unsatisfiedTicket.customer.contact.email')) ? 'muted-light' : 'muted'"
            >
              <a class="customer-info__info-link" :href="`mailto:${deep('unsatisfiedTicket.customer.contact.email')}`">
                {{ deep('unsatisfiedTicket.customer.contact.email') || $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined') }}
              </a>
            </AppText>
            <button
              v-if="editable"
              class="customer-info__edit"
              @click="edit('email')"
            >
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText
                class="customer-info__info-label"
                tag="label"
                bold
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('email') }}:
              </AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeHolder="$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('email')"
                v-model="fields.email"
                @validate="updateTicket('email')"
                @keyup.enter="updateTicket('email')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
              <AppText
                tag="div"
                type="danger"
                size="sm"
                v-if="invalidEmail"
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('emailWrong') }}
              </AppText>
            </FieldGroup>
          </template>
        </div>
      </div>

      <div class="customer-info__part">
        <!-- Vehicle brand -->
        <div class="customer-info__info" v-if="deep('unsatisfiedTicket.vehicle.make')">
          <template v-if="editing !== 'vehicleBrand'">
            <AppText
              class="customer-info__info-label"
              tag="span"
              bold
            >
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('make') }}:
            </AppText>
            <AppText
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('unsatisfiedTicket.vehicle.make')) ? 'muted-light' : 'muted'"
            >
              {{ deep('unsatisfiedTicket.vehicle.make') || $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined') }}
            </AppText>
            <button
              v-if="editable"
              class="customer-info__edit"
              @click="edit('vehicleBrand')"
            >
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText
                class="customer-info__info-label"
                tag="label"
                bold
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('phone') }}make:
              </AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeholder="$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('make')"
                v-model="fields.vehicleBrand"
                @validate="updateTicket('vehicleBrand')"
                @keyup.enter="updateTicket('vehicleBrand')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
            </FieldGroup>
          </template>
        </div>
        <!-- Vehicle model -->
        <div class="customer-info__info" v-if="deep('unsatisfiedTicket.vehicle.model')">
          <!-- Duplication ??????, see next div -->
          <template v-if="editing !== 'vehicleModel'">
            <AppText
              class="customer-info__info-label"
              tag="span"
              bold
            >
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('model') }}:
            </AppText>
            <AppText
              class="customer-info__info-value"
              tag="span"
              type="muted"
            >
              {{ deep('unsatisfiedTicket.vehicle.model') }}
            </AppText>
            <button
              v-if="editable"
              class="customer-info__edit"
              @click="edit('vehicleModel')"
            >
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText
                class="customer-info__info-label"
                tag="label"
                bold
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('model') }}:
              </AppText>
              <InputBasic
                size="sm"
                validateEvent
                v-model="fields.vehicleModel"
                :placeholder="$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('model')"
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
        <div class="customer-info__info" v-if="deep('unsatisfiedTicket.vehicle.makeModel')">
          <template v-if="editing !== 'vehicleMakeModel'">
            <AppText
              class="customer-info__info-label"
              tag="span"
              bold
            >
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('model') }}:
            </AppText>
            <AppText
              class="customer-info__info-value"
              tag="span"
              type="muted"
            >
              {{
                isEmpty(deep('unsatisfiedTicket.vehicle.makeModel'))
                  ? $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined')
                  : deep('unsatisfiedTicket.vehicle.makeModel')
              }}
            </AppText>
            <button
              v-if="editable"
              class="customer-info__edit"
              @click="edit('vehicleMakeModel')"
            >
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText
                class="customer-info__info-label"
                tag="label"
                bold
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('model') }}:
              </AppText>
              <InputBasic
                size="sm"
                validateEvent
                v-model="fields.vehicleMakeModel"
                :placeholder="$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('model')"
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
            <AppText
              class="customer-info__info-label"
              tag="span"
              bold
            >
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('immat') }}:
            </AppText>
            <AppText
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('unsatisfiedTicket.vehicle.plate')) ? 'muted-light' : 'muted'"
            >
              {{ deep('unsatisfiedTicket.vehicle.plate') || $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined') }}
            </AppText>
            <button
              v-if="editable"
              class="customer-info__edit"
              @click="edit('vehiclePlate')"
            >
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText
                class="customer-info__info-label"
                tag="label"
                bold
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('immat') }}:
              </AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeholder="$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('immat')"
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

        <!-- Mileage -->
        <div class="customer-info__info">
          <template v-if="editing !== 'vehicleMileage'">
            <AppText
              class="customer-info__info-label"
              tag="span"
              bold
            >
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('mileage') }}:
            </AppText>
            <AppText
              class="customer-info__info-value"
              tag="span"
              :type="isEmpty(deep('unsatisfiedTicket.vehicle.mileage')) ? 'muted-light' : 'muted'"
            >
              {{ customerInfoValueVehicleMileage }}
            </AppText>
            <button
              v-if="editable"
              class="customer-info__edit"
              @click="edit('vehicleMileage')"
            >
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText
                class="customer-info__info-label"
                tag="label"
                bold
              >
                {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('mileage') }}:
              </AppText>
              <InputBasic
                size="sm"
                validateEvent
                :placeholder="$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('mileage')"
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

      <div
        class="customer-info__part"
        v-if="serviceProvidedAt || deep('unsatisfiedTicket.frontDeskUserName') || deep('unsatisfiedTicket.type')"
      >
        <!-- Service date -->
        <div class="customer-info__info" v-if="serviceProvidedAt">
          <AppText
            class="customer-info__info-label"
            tag="span"
            bold
          >
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('date') }}:
          </AppText>
          <AppText
            class="customer-info__info-value"
            tag="span"
            :type="isEmpty(serviceProvidedAt) ? 'muted-light' : 'muted'"
          >
            {{ formattedServiceProvidedAt }}
          </AppText>
        </div>
        <!-- Front desk user name -->
        <div class="customer-info__info" v-if="deep('unsatisfiedTicket.frontDeskUserName') ">
          <AppText
            class="customer-info__info-label"
            tag="span"
            bold
          >
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('manager') }}:
          </AppText>
          <AppText
            class="customer-info__info-value"
            tag="span"
            :type="isEmpty(deep('unsatisfiedTicket.frontDeskUserName') ) ? 'muted-light' : 'muted'"
          >
            {{ deep('unsatisfiedTicket.frontDeskUserName') || $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined') }}
          </AppText>
        </div>
        <!-- Type of service -->
        <div class="customer-info__info" v-if="deep('unsatisfiedTicket.type')">
          <AppText
            class="customer-info__info-label"
            tag="span"
            bold
          >
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('type') }}:
          </AppText>
          <AppText
            class="customer-info__info-value"
            tag="span"
            :type="isEmpty(deep('unsatisfiedTicket.type')) ? 'muted-light' : 'muted'"
          >
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')(deep('unsatisfiedTicket.type')) }}
          </AppText>
        </div>
      </div>
    </template>
  </CardDropdown>
</template>

<script>
import { getDeepFieldValue as deep } from '~/utils/object';
import {
  phoneNumberSpecs,
  parsePhoneNumber,
} from '~/utils/phone';

export default {
  props: {
    id: String,
    unsatisfiedTicket: Object,
    updateActionType: String,
    editable: { type: Boolean, default: false },
    updateTicketFunction: Function,
  },

  data() {
    const fieldToPath = {
      'customerFullName': { path: 'unsatisfiedTicket.customer.fullName', defaultValue: '' },
      'phone': { path: 'unsatisfiedTicket.customer.contact.mobilePhone', defaultValue: '' },
      'email': { path: 'unsatisfiedTicket.customer.contact.email', defaultValue: '' },
      'vehicleBrand': { path: 'unsatisfiedTicket.vehicle.make', defaultValue: '' },
      'serviceFrontDeskUserName': { path: 'unsatisfiedTicket.frontDeskUserName', defaultValue: '' },
      'vehicleModel': { path: 'unsatisfiedTicket.vehicle.model', defaultValue: '' },
      'vehiclePlate': { path: 'unsatisfiedTicket.vehicle.plate', defaultValue: '' },
      'vehicleMileage': { path: 'unsatisfiedTicket.vehicle.mileage', defaultValue: '' },
      'type': { path: 'unsatisfiedTicket.type', defaultValue: '' },
      'date': { path: 'service.providedAt', defaultValue: '' },
    };
    const data = {
      deep: (fieldName) => deep(this, fieldName),
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
    formatUser(val) {
      if (val.firstName && val.lastName) {
        return `${val.firstName} ${val.lastName}`.trim();
      } else if (val.email) {
        return val.email;
      } else {
        return '';
      }
    },
    formatPhoneNumber(val) {
      const phoneNumberInfo = parsePhoneNumber(val);
      if (phoneNumberInfo) {
        const countrySpec = phoneNumberSpecs[phoneNumberInfo.country];
        return countrySpec
          ? `${countrySpec.code} ${countrySpec.formatter(val)}`
          : val;
      }
      return val;
    },
  },

  computed: {
    customerInfoValueVehicleMileage() {
      return (this.isEmpty(this.deep('unsatisfiedTicket.vehicle.mileage')) ||
        !this.isValidMileage(this.deep('unsatisfiedTicket.vehicle.mileage'))) ? this.$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined') :
        this.$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('mileage_value', { value: this.deep('unsatisfiedTicket.vehicle.mileage') });
    },
    invalidPhone() {
      return (
        this.editing === 'phone' &&
        this.fields.phone &&
        // eslint-disable-next-line no-useless-escape
        !this.fields.phone.trim().replace(' ', '').match(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)
      );
    },

    invalidEmail() {
      return (
        this.editing === 'email' &&
        this.fields.email &&
        !this.fields.email.match(/\S+@\S+\.\S+/)
      );
    },

    invalidMileage() {
      return (
        this.editing === 'vehicleMileage' &&
        this.fields.vehicleMileage &&
        !this.isValidMileage(this.fields.vehicleMileage)
      );
    },
    formattedServiceProvidedAt() {
      var options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      const serviceProvidedAtDate = new Date(this.serviceProvidedAt);
      return serviceProvidedAtDate.toLocaleDateString('fr-FR', options);
    },
    serviceProvidedAt() {
      return this.deep('service.providedAt');
    }
  },

  methods: {
    edit(field, reset = false) {
      if (reset) {
        this.resetFields();
      }
      this.editing = this.editing === field ? null : field;
    },

    isEmpty(val) {
      if (Array.isArray(val) && !val.length) return true;
      return !val || val === this.$t_locale('components/cockpit/unsatisfied/_id/CardCustomerInfo')('undefined') || val === 'UNDEFINED';
    },

    isValidMileage(val) {
      return val.toString().match(/^[0-9]{1,6}$/);
    },

    resetFields() {
      this.fields = {
        customerFullName: this.customerFullName,
        phone: this.phone,
        email: this.email,
        vehicleBrand: this.vehicleBrand,
        vehicleModel: this.vehicleModel,
        vehicleMakeModel: this.vehicleMakeModel,
        vehiclePlate: this.vehiclePlate,
        vehicleMileage: this.vehicleMileage,
      };
    },

    async updateTicket(field) {
      const invalidEmail = field === 'email' && this.invalidEmail;
      const invalidPhone = field === 'phone' && this.invalidPhone;
      const invalidMileage = field === 'vehicleMileage' && this.invalidMileage
      if (invalidEmail || invalidPhone || invalidMileage) {
        return;
      }
      if (this[field] === this.fields[field]) {
        return;
      }
      this.loading = true;
      await this.updateTicketFunction({
        type: this.updateActionType,
        id: this.id,
        field,
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
  margin-bottom: 1.5rem;

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
    background-color: transparent;
    cursor: pointer;
    padding: 0 0.5rem;
    height: 1.3rem;
    outline: 0;

    &:hover {
      color: $blue;
    }
  }
}
</style>
