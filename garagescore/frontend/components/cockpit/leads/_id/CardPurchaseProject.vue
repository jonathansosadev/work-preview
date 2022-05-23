<template>
  <CardDropdown class="card-content" :disabled="$mq === 'lg'">
    <template slot="header">
      <Title icon="icon-gs-folder-details">{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('title') }}</Title>
    </template>
    <template>
      <PlaceholderLoading absolute v-if="loading">{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('updating...') }}</PlaceholderLoading>
      <div class="card-content__part">
        <div class="card-content__info">
          <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('sourceType') }}</AppText>
          <AppText class="card-content__info-value" tag="span" type="muted">
            {{ formattedLeadTicketSourceType }}
          </AppText>
        </div>
        <div class="card-content__info">
          <template v-if="isAMaintenanceLead">
            <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('timing') }}</AppText>
            <AppText class="card-content__info-value" tag="span" :type="leadTicketTimingColor">
              {{ formattedLeadTicketTiming }}
            </AppText>
          </template>
          <template v-else-if="editing !== 'timing'">
            <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('timing') }}</AppText>
            <AppText class="card-content__info-value" tag="span" :type="leadTicketTimingColor">
              {{ formattedLeadTicketTiming }}
            </AppText>
            <button class="card-content__edit" @click="edit('timing')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('timing') }}</AppText>
              <SelectBasic
                size="sm"
                validateEvent
                @validate="updateTicket('timing')"
                v-model="fields.timing"
                :options="optionsTiming"
              />
            </FieldGroup>
          </template>
        </div>
      </div>
      <div class="card-content__part">
        <div class="card-content__info">
          <template v-if="editing !== 'saleType'">
            <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('trade') }}</AppText>
            <AppText
              class="card-content__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.saleType')) ? 'muted-light' : 'muted'"
            >
              {{ formatSaleType(deep('leadTicket.saleType')) }}
            </AppText>
            <button v-if="!isAMaintenanceLead" class="card-content__edit" @click="edit('saleType')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('trade') }}</AppText>
              <SelectBasic
                size="sm"
                validateEvent
                v-model="fields.saleType"
                @validate="updateTicket('saleType')"
                :options="optionsSaleType"
              />
            </FieldGroup>
          </template>
        </div>
        <div v-if="!isAMaintenanceLead">
          <div class="card-content__info" v-if="!isMotorbike">
            <template v-if="editing !== 'energyType'">
              <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('energy') }}</AppText>
              <AppText
                class="card-content__info-value"
                tag="span"
                :type="isEmpty(deep('leadTicket.energyType')) ? 'muted-light' : 'muted'"
              >
                {{ formatArray(deep('leadTicket.energyType')) }}
              </AppText>
              <button class="card-content__edit" @click="edit('energyType')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null, true)">
                <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('energy') }}</AppText>
                <SelectBasic
                  size="sm"
                  multi
                  validateEvent
                  v-model="fields.energyType"
                  @validate="updateTicket('energyType')"
                  :options="optionsEnergyType"
                />
              </FieldGroup>
            </template>
          </div>
          <div class="card-content__info" v-else>
            <template v-if="editing !== 'cylinder'">
              <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('cylinder') }}</AppText>
              <AppText
                class="card-content__info-value"
                tag="span"
                :type="isEmpty(deep('leadTicket.cylinder')) ? 'muted-light' : 'muted'"
              >
                {{ formatArray(deep('leadTicket.cylinder')) }}
              </AppText>
              <button class="card-content__edit" @click="edit('cylinder')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null, true)">
                <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('cylinder') }}</AppText>
                <SelectBasic
                  size="sm"
                  multi
                  validateEvent
                  v-model="fields.cylinder"
                  @validate="updateTicket('cylinder')"
                  :options="optionsCylinder"
                />
              </FieldGroup>
            </template>
          </div>
          <div class="card-content__info">
            <template v-if="editing !== 'brandModel'">
              <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('brandModel') }}</AppText>
              <AppText
                class="card-content__info-value"
                tag="span"
                :type="isEmpty(deep('leadTicket.brandModel')) ? 'muted-light' : 'muted'"
              >
                {{ deep('leadTicket.brandModel') || $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('undefined') }}
              </AppText>
              <button class="card-content__edit" @click="edit('brandModel')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null, true)">
                <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('brandModel') }}</AppText>
                <InputBasic
                  size="sm"
                  validateEvent
                  v-model="fields.brandModel"
                  @validate="updateTicket('brandModel')"
                  @keyup.enter="updateTicket('brandModel')"
                >
                  <template slot="right">
                    <i class="icon-gs-validation-check-circle" />
                  </template>
                </InputBasic>
              </FieldGroup>
            </template>
          </div>
          <div class="card-content__info">
            <template v-if="editing !== 'bodyType'">
              <AppText class="card-content__info-label" tag="span" bold>{{ bodyTypeTitle }}:</AppText>
              <AppText
                class="card-content__info-value"
                tag="span"
                :type="isEmpty(deep('leadTicket.bodyType')) ? 'muted-light' : 'muted'"
              >
                {{ formatArray(deep('leadTicket.bodyType')) }}
              </AppText>
              <button class="card-content__edit" @click="edit('bodyType')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null, true)">
                <AppText lass="card-content__info-label" tag="label" bold>{{ bodyTypeTitle }}:</AppText>
                <SelectBasic
                  size="sm"
                  multi
                  validateEvent
                  v-model="fields.bodyType"
                  @validate="updateTicket('bodyType')"
                  :options="optionsBodyType"
                />
              </FieldGroup>
            </template>
          </div>
        </div>
        <div v-if="isAMaintenanceLead">
          <div class="card-content__info">
            <template v-if="editing !== 'leadTicketRequestType'">
              <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('leadTicketRequestType') }}</AppText>
              <AppText class="card-content__info-value" tag="span" :type="leadTypeColor">
                {{ formattedLeadTicketRequestType }}
              </AppText>
              <button class="card-content__edit" @click="edit('leadTicketRequestType')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null, true)">
                <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('leadTicketRequestType') }}</AppText>
                <SelectBasic
                  size="sm"
                  validateEvent
                  v-model="fields.leadTicketRequestType"
                  @validate="updateTicket('leadTicketRequestType')"
                  :options="optionsLeadTicketRequestType"
                />
              </FieldGroup>
            </template>
          </div>

          <div class="card-content__info">
            <template v-if="editing !== 'leadTicketVehicle'">
              <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('leadTicketVehicle') }}</AppText>
              <AppText class="card-content__info-value" tag="span" :type="leadTicketVehicleColor">
                {{ leadTicketVehicle || $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('undefined') }}
              </AppText>
              <button class="card-content__edit" @click="edit('leadTicketVehicle')">
                <i class="icon-gs-edit" />
              </button>
            </template>
            <template v-else>
              <FieldGroup canBeClose @close="edit(null, true)">
                <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('leadTicketVehicle') }}</AppText>
                <InputBasic
                  size="sm"
                  validateEvent
                  v-model="fields.leadTicketVehicle"
                  @validate="updateTicket('leadTicketVehicle')"
                  @keyup.enter="updateTicket('leadTicketVehicle')"
                >
                  <template slot="right">
                    <i class="icon-gs-validation-check-circle" />
                  </template>
                </InputBasic>
              </FieldGroup>
            </template>
          </div>
        </div>
      </div>
      <div class="card-content__part" v-if="!isAMaintenanceLead">
        <div class="card-content__info">
          <template v-if="editing !== 'budget'">
            <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('budget') }}</AppText>
            <AppText
              class="card-content__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.budget')) ? 'muted-light' : 'muted'"
            >
              {{ deep('leadTicket.budget') || 'Non renseigné' }}
              <template v-if="deep('leadTicket.budget')">€</template>
            </AppText>
            <button class="card-content__edit" @click="edit('budget')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('budget') }}</AppText>
              <InputBasic
                size="sm"
                validateEvent
                type="number"
                v-model="fields.budget"
                @validate="updateTicket('budget')"
                @keyup.enter="updateTicket('budget')"
              >
                <template slot="right">
                  <i class="icon-gs-validation-check-circle" />
                </template>
              </InputBasic>
            </FieldGroup>
          </template>
        </div>
        <div class="card-content__info">
          <template v-if="editing !== 'financing'">
            <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('financing') }}</AppText>
            <AppText
              class="card-content__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.financing')) ? 'muted-light' : 'muted'"
            >
              {{ formatLeadFinancing(deep('leadTicket.financing')) }}
            </AppText>
            <button class="card-content__edit" @click="edit('financing')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('financing') }}</AppText>
              <SelectBasic
                size="sm"
                validateEvent
                v-model="fields.financing"
                @validate="updateTicket('financing')"
                :options="optionsFinancing"
              />
            </FieldGroup>
          </template>
        </div>
        <div class="card-content__info">
          <template v-if="editing !== 'tradeIn'">
            <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('buyBack') }}</AppText>
            <AppText
              class="card-content__info-value"
              tag="span"
              :type="isEmpty(deep('leadTicket.tradeIn')) ? 'muted-light' : 'muted'"
            >
              {{ formatLeadTradeIn(deep('leadTicket.tradeIn')) }}
            </AppText>
            <button class="card-content__edit" @click="edit('tradeIn')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('buyBack') }}</AppText>
              <SelectBasic
                size="sm"
                validateEvent
                @validate="updateTicket('tradeIn')"
                v-model="fields.tradeIn"
                :options="optionsTradeIn"
              />
            </FieldGroup>
          </template>
        </div>
        <div class="card-content__info">
          <template v-if="editing !== 'leadTicketVehicle'">
            <AppText class="card-content__info-label" tag="span" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('tradeInModel') }}</AppText>
            <AppText class="card-content__info-value" tag="span" :type="leadTicketVehicleColor">
              {{ leadTicketVehicle || $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('undefined') }}
            </AppText>
            <button class="card-content__edit" @click="edit('leadTicketVehicle')">
              <i class="icon-gs-edit" />
            </button>
          </template>
          <template v-else>
            <FieldGroup canBeClose @close="edit(null, true)">
              <AppText lass="card-content__info-label" tag="label" bold>{{ $t_locale('components/cockpit/leads/_id/CardPurchaseProject')('tradeInModel') }}</AppText>
              <InputBasic
                size="sm"
                validateEvent
                v-model="fields.leadTicketVehicle"
                @validate="updateTicket('leadTicketVehicle')"
                @keyup.enter="updateTicket('leadTicketVehicle')"
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
import BodyTypes from '~/utils/models/data/type/vehicle-bodytypes.js';
import GarageTypes from '~/utils/models/garage.type.js';
import { LeadTicketRequestTypes, SourceTypes } from '~/utils/enumV2';
import LeadTimings from '~/utils/models/data/type/lead-timings';
import CylinderTypes from '~/utils/models/data/type/cylinder-types.js';
import DataTypes from '~/utils/models/data/type/data-types';
import { getDeepFieldValue as deep } from '~/utils/object';

export default {
  name: 'CardPurchaseProject',
  props: {
    id: {type: String, required: true},
    updateTicketDispatch: Function,
    dataGetLeadTicket: Object
  },

  data() {
    const fieldToPath = {
      timing: { path: 'leadTicket.timing' },
      leadTicketRequestType: { path: 'leadTicket.requestType' },
      saleType: { path: 'leadTicket.saleType' },
      energyType: { path: 'leadTicket.energyType', defaultValue: [] },
      cylinder: { path: 'leadTicket.cylinder', defaultValue: [] },
      brandModel: { path: 'leadTicket.brandModel' },
      bodyType: { path: 'leadTicket.bodyType', defaultValue: [] },
      financing: { path: 'leadTicket.financing' },
      budget: { path: 'leadTicket.budget' },
      tradeIn: { path: 'leadTicket.tradeIn' },
      leadTicketVehicle: { path: 'leadTicket.vehicle.makeModel' },
    };
    const data = {
      fieldToPath,
      deep: (fieldName) => deep(this.dataGetLeadTicket, fieldName),
      editing: false,
      loading: false,
      fields: {},

      optionsTiming: [
        { value: 'Now', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('Now') },
        { value: 'ShortTerm', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('ShortTerm') },
        { value: 'MidTerm', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('MidTerm') },
        { value: 'LongTerm', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('LongTerm') },
      ],

      optionsFinancing: [
        { value: 'cash', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('cash') },
        { value: 'leasing', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('leasing') },
        { value: 'credit', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('credit') },
        { value: 'unknown', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('unknown') },
      ],

      optionsLeadTicketRequestType: LeadTicketRequestTypes.values().map((leadTicketRequestType) => ({
        value: leadTicketRequestType,
        text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(leadTicketRequestType),
      })),

      optionsSaleType: [
        {
          value: DataTypes.MAINTENANCE,
          text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(DataTypes.MAINTENANCE),
        },
        {
          value: DataTypes.NEW_VEHICLE_SALE,
          text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(DataTypes.NEW_VEHICLE_SALE),
        },
        {
          value: DataTypes.USED_VEHICLE_SALE,
          text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(DataTypes.USED_VEHICLE_SALE),
        },
        { value: DataTypes.UNKNOWN, text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('unknown') },
      ],

      optionsTradeIn: [
        { value: 'Yes', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('Yes') },
        { value: 'YesOther', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('YesOther') },
        { value: 'No', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('No') },
        { value: 'Unknown', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('Unknown') },
      ],

      optionsCylinder: Object.values(CylinderTypes.CylinderTypes).map((c) => ({
        value: c,
        text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(c),
      })),

      optionsEnergyType: [
        { value: 'fuel', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('fuel') },
        { value: 'diesel', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('diesel') },
        { value: 'electric', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('electric') },
        { value: 'hybrid', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('hybrid') },
        { value: 'pluginHybrid', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('pluginHybrid') },
        { value: 'hydrogen', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('hydrogen') },
        { value: 'gpl', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('gpl') },
        { value: 'unknown', text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('unknown'), exclusive: true },
      ],
    };
    for (const field in fieldToPath) {
      data.fields[field] = deep(this, fieldToPath[field].path);
      if (!data.fields[field] && typeof fieldToPath[field].defaultValue !== 'undefined') {
        data.fields[field] = fieldToPath[field].defaultValue;
      }
    }
    return data;
  },

  methods: {
    edit(field, reset = false) {
      if (reset) {
        this.resetFields();
      }
      this.editing = this.editing === field ? null : field;
    },

    isEmpty(val) {
      return Boolean(!val || val === 'Non défini');
    },

    formatSaleType(value) {
      switch (value) {
        case DataTypes.MAINTENANCE:
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(DataTypes.MAINTENANCE);
        case DataTypes.NEW_VEHICLE_SALE:
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(DataTypes.NEW_VEHICLE_SALE);
        case DataTypes.USED_VEHICLE_SALE:
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(DataTypes.USED_VEHICLE_SALE);
        default:
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('Unknown');
      }
    },

    formatLeadTradeIn(value) {
      switch (value) {
        case 'Yes':
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('Yes');
        case 'YesOther':
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('YesOther');
        case 'No':
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('No');
        case 'Unknown':
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('Unknown');
        default:
          return value || this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('undefined');
      }
    },
    formatLeadFinancing(value) {
      switch (value) {
        case 'cash':
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('cash');
        case 'leasing':
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('leasing');
        case 'credit':
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('credit');
        case 'unknown':
          return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('unknown');
        default:
          return value || this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('undefined');
      }
    },

    formatArray(value) {
      return value && value.length > 0 ? value.map((v) => this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(v)).join(', ') : this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('undefined');
    },

    resetFields() {
      this.fields = {};
      for (const field in this.fieldToPath) {
        this.fields[field] = deep(this, this.fieldToPath[field].path);
      }
    },

    async updateTicket(field) {
      this.loading = true;
      const success = await this.updateTicketDispatch({
        dataId: this.id,
        field: this.fieldToPath[field].path,
        value: this.fields[field],
      });

      this.edit(null, !success);
      this.loading = false;
    },
  },
  computed: {
    isAMaintenanceLead() {
      return this.deep('leadTicket.saleType') === DataTypes.MAINTENANCE;
    },
    isMotorbike() {
      return GarageTypes.getCockpitType(this.deep('garage.type')) === GarageTypes.MOTORBIKE_DEALERSHIP;
    },
    // Titles
    bodyTypeTitle() {
      if (this.isMotorbike) {
        return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('type');
      }
      return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('carType');
    },
    // Current values
    leadTicketSourceType() {
      return this.deep('source.type');
    },
    leadTicketTiming() {
      return this.deep('leadTicket.timing');
    },
    leadTicketRequestType() {
      return this.deep('leadTicket.requestType');
    },
    leadTicketVehicle() {
      return this.deep('leadTicket.vehicle.makeModel');
    },
    automationCampaignName() {
      return `${this.deep('leadTicket.automationCampaign.displayName')}`;
    },
    // Formatted values
    formattedLeadTicketSourceType() {
      if (SourceTypes.hasValue(this.leadTicketSourceType)) {
        if (this.leadTicketSourceType === SourceTypes.AUTOMATION) {
          return this.automationCampaignName;
        }
        return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(this.leadTicketSourceType);
      }
      return this.leadTicketSourceType;
    },
    formattedLeadTicketTiming() {
      if (LeadTimings.hasValue(this.leadTicketTiming)) {
        return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(this.leadTicketTiming);
      }
      return this.leadTicketTiming || this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('undefined');
    },
    formattedLeadTicketRequestType() {
      if (LeadTicketRequestTypes.hasValue(this.leadTicketRequestType)) {
        return this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(this.leadTicketRequestType);
      }
      return this.leadTicketRequestType || this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')('undefined');
    },
    // Coloring
    leadTicketTimingColor() {
      return this.isEmpty(this.leadTicketTiming) ? 'muted-light' : 'muted';
    },
    leadTypeColor() {
      return this.isEmpty(this.leadTicketRequestType) ? 'muted-light' : 'muted';
    },
    leadTicketVehicleColor() {
      return this.isEmpty(this.leadTicketVehicle) ? 'muted-light' : 'muted';
    },
    // Select options
    optionsBodyType() {
      if (this.isMotorbike) {
        return Object.values(BodyTypes.bodyTypesByGarageType(GarageTypes.MOTORBIKE_DEALERSHIP)).map((e) => ({
          value: e,
          text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(e),
        }));
      }
      return Object.values(BodyTypes.bodyTypesByGarageType()).map((e) => ({
        value: e,
        text: this.$t_locale('components/cockpit/leads/_id/CardPurchaseProject')(e),
      }));
    },
  },
};
</script>

<style lang="scss" scoped>
.card-content {
  position: relative;
  margin-bottom: 1.5rem;

  &__part {
    padding: 1rem;

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
