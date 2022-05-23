<template>
  <ModalBase class="modal-ticket" type="danger">
    <template #header-icon>
      <i :class="icon" />
    </template>
    <template #header-title>
      <span>{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('title') }}</span>
    </template>
    <template #header-subtitle>
      <span>{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('subtitle') }}</span>
    </template>
    <template #body>
      <div v-if="isNewSourceModalOpen" class="fake-modal-overlay" />
      <div class="modal-add-lead__content">
        <!-- Fake modal add source -->
        <div v-if="isNewSourceModalOpen" class="fake-modal">
          <div class="fake-modal__header">
            <button class="fake-modal__header__btn-close" @click="closeNewSourceModal()">
              <i class="icon-gs-close"/>
            </button>
          </div>
          <div class="fake-modal__content">
            <InputMaterial
              v-model="newSource.sourceName"
              :is-valid="dirtyCheckValidate.sourceName"
              :placeholder="$t_locale('components/cockpit/modals/leads/ModalAddLead')('sourceNamePlaceholder')"
              placedLabel
              required
            >
              <template #label>{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('sourceName') }}</template>
            </InputMaterial>
            <div class="fake-modal__content__footer">
              <div
                v-if="!isNewCustomSourceValid"
                class="fake-modal__content__footer__error"
              >
                {{ newCustomSourceErr }}
              </div>
              <div class="fake-modal__content__footer__count">
                {{ charCount }} / {{ newSource.maxLength }}
              </div>
            </div>
          </div>
          <div class="fake-modal__footer">
            <Button
              :disabled="!isNewCustomSourceValid"
              @click="createCustomSource()"
              type="orange"
              class="btn validate-closing-btn"
            >
              <span>{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('save') }}</span>
            </Button>
          </div>
        </div>

        <AppText
          size="sm"
          tag="span"
          type="danger"
          class="modal-add-lead__informations-required"
        >
          {{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('informationsRequired') }}
        </AppText>
        <Title
          type="black"
          class="modal-add-lead__first-title"
        >
          {{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('informations') }}
        </Title>

        <!-- Nom -->
        <div class="modal-add-lead__content__field">
          <InputMaterial
            v-model="newLead.fullName"
            :error="errorMessage('fullName')"
            :is-valid="dirtyCheckValidate.fullName"
            :placeholder="$t_locale('components/cockpit/modals/leads/ModalAddLead')('namePlaceholder')"
            @input="dirty.fullName = true"
            placedLabel
            required
          >
            <template #label>
              {{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('fullName') }}
            </template>
          </InputMaterial>
        </div>

        <!-- Email -->
        <div class="modal-add-lead__content__field">
          <InputMaterial
            v-model="newLead.email"
            :error="errorMessage('email')"
            :is-valid="dirtyCheckValidate.email"
            :placeholder="$t_locale('components/cockpit/modals/leads/ModalAddLead')('emailPlaceholder')"
            @input="dirty.email = true"
            placedLabel
          >
            <template #label>{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('email') }}</template>
          </InputMaterial>
        </div>

        <!-- Téléphone -->
        <div class="modal-add-lead__content__field">
          <InputMaterial
            v-model="newLead.phone"
            :error="errorMessage('phone')"
            :is-valid="dirtyCheckValidate.phone"
            :placeholder="$t_locale('components/cockpit/modals/leads/ModalAddLead')('phonePlaceholder')"
            @input="dirty.phone = true"
            placedLabel
          >
            <template #label>{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('phone') }}</template>
          </InputMaterial>
        </div>

        <Title type="black" class="modal-add-lead__second-title">
          {{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('details') }}
        </Title>

        <template @click.native="closeAllOtherDropdowns(null, $event)">
          <div class="modal-add-lead__content__field-group">
            <!-- Garage -->
            <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field garage-list">
              <MultiSelectMaterial
                :comparatorFunction="comparatorFunction"
                :label="$t_locale('components/cockpit/modals/leads/ModalAddLead')('Garages')"
                :multiple="false"
                :noResult="$t_locale('components/cockpit/modals/leads/ModalAddLead')('NoGarages')"
                :options="allGarages"
                :placeholder="$t_locale('components/cockpit/modals/leads/ModalAddLead')('garagePlaceholder')"
                :select-label="$t_locale('components/cockpit/modals/leads/ModalAddLead')('clickToConfirm')"
                :value="selectedGarage"
                @input="setSelectedGarage"
                required
              />
            </div>

            <!-- vn vo -->
            <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field job-padding">
              <DropdownSelector
                v-model="newLead.leadSaleType"
                :callback="dropdownSelectorLeadSaleType"
                :is-valid="dropdownValidate.leadSaleType"
                :items="optionsSaleType"
                :label="$t_locale('components/cockpit/modals/leads/ModalAddLead')('type')"
                :ref="dropdown.leadSaleType"
                :title="serviceTitle"
                :subtitle="$t_locale('components/cockpit/modals/leads/ModalAddLead')('typePlaceholder')"
                @click.native.stop="closeAllOtherDropdowns(dropdown.leadSaleType, $event)"
                required
                size="max-width"
                type="material"
              />
            </div>
          </div>

          <!-- Parkour APV -->
          <template v-if="displayApvSpecificFields">
            <div class="modal-add-lead__content__field-group">
              <!-- sourceType -->
              <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field">
                <DropdownSelector
                  v-model="newLead.sourceType"
                  :callback="dropdownSelectorSource"
                  :fixedFooter="optionsSourceTypeAddSource"
                  :is-valid="dropdownValidate.sourceType"
                  :items="optionsSourceType"
                  :label="$t_locale('components/cockpit/modals/leads/ModalAddLead')('sourceType')"
                  :ref="dropdown.sourceType"
                  :subtitle="$t_locale('components/cockpit/modals/leads/ModalAddLead')('sourcePlaceholder')"
                  :title="sourceTitle"
                  @click.native.stop="closeAllOtherDropdowns(dropdown.sourceType, $event)"
                  required
                  size="max-width"
                  type="material"
                />
              </div>
              <!-- requestType -->
              <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field">
                <DropdownSelector
                  v-model="newLead.requestType"
                  :callback="dropdownSelectorRequestType"
                  :is-valid="dropdownValidate.requestType"
                  :items="optionsRequestType"
                  :label="$t_locale('components/cockpit/modals/leads/ModalAddLead')('requestType')"
                  :ref="dropdown.requestType"
                  :subtitle="$t_locale('components/cockpit/modals/leads/ModalAddLead')('requestTypePlaceholder')"
                  :title="requestType"
                  @click.native.stop="closeAllOtherDropdowns(dropdown.requestType, $event)"
                  size="max-width"
                  type="material"
                />
              </div>
            </div>

            <div class="modal-add-lead__content__field-group">
              <!-- customer vehicle -->
              <div class="modal-add-lead__content__field">
                <InputMaterial
                  v-model="newLead.vehicleModel"
                  :error="errorMessage('vehicleModel')"
                  :is-valid="dirtyCheckValidate.vehicleModel"
                  :placeholder="modelPlaceHolder"
                  @input="dirty.vehicleModel = true"
                  placedLabel
                >
                  <template #label>{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('vehicleModel') }}</template>
                </InputMaterial>
              </div>
            </div>
          </template>

          <!-- Parkour Sales -->
          <template v-if="displaySalesSpecificFields">
            <div class="modal-add-lead__content__field-group">
              <!-- leadTiming -->
              <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field">
                <DropdownSelector
                  v-model="newLead.leadTiming"
                  :callback="dropdownSelectorTiming"
                  :is-valid="dropdownValidate.leadTiming"
                  :items="optionsTiming"
                  :label="$t_locale('components/cockpit/modals/leads/ModalAddLead')('timing')"
                  :ref="dropdown.timing"
                  :subtitle="$t_locale('components/cockpit/modals/leads/ModalAddLead')('timingPlaceholder')"
                  :title="timingTitle"
                  @click.native.stop="closeAllOtherDropdowns(dropdown.timing, $event)"
                  required
                  size="max-width"
                  type="material"
                />
              </div>
              <!-- sourceType -->
              <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field">
                <DropdownSelector
                  v-model="newLead.sourceType"
                  :callback="dropdownSelectorSource"
                  :fixedFooter="optionsSourceTypeAddSource"
                  :is-valid="dropdownValidate.sourceType"
                  :items="optionsSourceType"
                  :label="$t_locale('components/cockpit/modals/leads/ModalAddLead')('sourceType')"
                  :ref="dropdown.sourceType"
                  :subtitle="$t_locale('components/cockpit/modals/leads/ModalAddLead')('sourcePlaceholder')"
                  :title="sourceTitle"
                  @click.native.stop="closeAllOtherDropdowns(dropdown.sourceType, $event)"
                  required
                  size="max-width"
                  type="material"
                />
              </div>
            </div>

            <div class="modal-add-lead__content__field-group">
              <!-- brandModel -->
              <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field">
                <InputMaterial
                  v-model="newLead.brandModel"
                  :error="errorMessage('brandModel')"
                  :is-valid="dirtyCheckValidate.brandModel"
                  :placeholder="modelPlaceHolder"
                  @input="dirty.brandModel = true"
                  placedLabel
                >
                  <template slot="label">{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('brandModel') }}</template>
                </InputMaterial>
              </div>
              <!-- leadFinancing -->
              <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field">
                <DropdownSelector
                  v-model="newLead.leadFinancing"
                  :callback="dropdownSelectorFinancing"
                  :is-valid="dropdownValidate.leadFinancing"
                  :items="optionsFinancing"
                  :label="$t_locale('components/cockpit/modals/leads/ModalAddLead')('financing')"
                  :ref="dropdown.financing"
                  :title="financingTitle"
                  :subtitle="$t_locale('components/cockpit/modals/leads/ModalAddLead')('financingPlaceholder')"
                  @click.native.stop="closeAllOtherDropdowns(dropdown.financing, $event)"
                  type="material"
                />
              </div>
            </div>

            <div class="modal-add-lead__content__field-group">
              <!-- tradeIn -->
              <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field">
                <DropdownSelector
                  v-model="newLead.leadTradeIn"
                  :callback="dropdownSelectorTakeBack"
                  :is-valid="dropdownValidate.leadTradeIn"
                  :items="optionsTradeIn"
                  :label="$t_locale('components/cockpit/modals/leads/ModalAddLead')('takeBack')"
                  :ref="dropdown.takeBack"
                  :subtitle="$t_locale('components/cockpit/modals/leads/ModalAddLead')('takeBackPlaceholder')"
                  :title="takeBackTitle"
                  @click.native.stop="closeAllOtherDropdowns(dropdown.takeBack, $event)"
                  size="max-width"
                  type="material"
                />
              </div>
              <!-- tradeInVehicle -->
              <div class="modal-add-lead__content__field modal-add-lead__content__field-group__field">
                <InputMaterial
                  v-if="displayTradeInVehicle"
                  v-model="newLead.vehicleModel"
                  :error="errorMessage('tradeInModel')"
                  :is-valid="dirtyCheckValidate.vehicleModel"
                  :placeholder="modelPlaceHolder"
                  @input="dirty.vehicleModel = true"
                  placedLabel
                >
                  <template #label>{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('tradeInModel') }}</template>
                </InputMaterial>
              </div>
            </div>
          </template>
        </template>
      </div>
    </template>
    <template #footer>
      <div class="modal-add-lead__footer">
        <Button
          :disabled="!isAllValid"
          @click="sendManualLead()"
          type="orange"
          class="btn validate-closing-btn"
        >
          <span>{{ $t_locale('components/cockpit/modals/leads/ModalAddLead')('save') }}</span>
        </Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
import fieldsValidation from '~/util/fieldsValidation';
import { LeadTicketRequestTypes } from '~/utils/enumV2';
import DataTypes from '~/utils/models/data/type/data-types';
import GarageTypes from '~/utils/models/garage.type';
import LeadTimings from '~/utils/models/data/type/lead-timings';
import LeadFinancing from '~/utils/models/data/type/lead-financing';
import LeadSaleTypes from '~/utils/models/data/type/lead-sale-types';
import LeadTradeInTypes from '~/utils/models/data/type/lead-trade-in-types';

import DropdownSelector from '../../../global/DropdownSelector';

export default {
  components: { DropdownSelector },
  props: {
    addManualLead: { type: Function, required: true },
    fetchAvailableManualLeadSources: { type: Function, required: true },
    availableGarages: { type: Array, default: () => [] },
    cockpitType: String,
    currentGarageId: String,
  },
  data() {
    return {
      loading: false,
      icon: 'icon-gs-car-repair',
      newLead: {
        fullName: '',
        email: '',
        phone: '',
        garageId: [],
        leadSaleType: '',
        sourceType: '',
        requestType: '',
        vehicleModel: '',
        leadTiming: '',
        brandModel: '',
        leadFinancing: '',
        leadTradeIn: '',
      },
      dirty: {
        fullName: false,
        email: false,
        phone: false,
        garageId: false,
        leadSaleType: false,
        sourceType: false,
        requestType: false,
        vehicleModel: false,
        leadTiming: false,
        brandModel: false,
        leadFinancing: false,
        leadTradeIn: false,
        sourceName: '',
      },
      newSource: {
        sourceName: '',
        minLength: 5,
        maxLength: 30,
      },
      isAllValid: false,
      // Following the options for the dropdowns on Enums
      optionsRequestType: this.enumToInputOptions(LeadTicketRequestTypes, { useKey: true }),
      optionsTiming: this.enumToInputOptions(LeadTimings),
      optionsFinancing: this.enumToInputOptions(LeadFinancing),
      optionsSaleType: this.enumToInputOptions(LeadSaleTypes).filter(({ value }) => value !== LeadSaleTypes.UNKNOWN),
      optionsTradeIn: [
        { leadTradeIn: 'Yes', label: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('Yes') },
        { leadTradeIn: 'No', label: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('No') },
        { leadTradeIn: 'Unknown', label: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('Unknown') },
      ],
      garageTitle: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('garagePlaceholder'),
      serviceTitle: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('typePlaceholder'),
      sourceTitle: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('sourcePlaceholder'),
      requestType: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('requestTypePlaceholder'),
      timingTitle: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('timingPlaceholder'),
      financingTitle: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('financingPlaceholder'),
      takeBackTitle: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('takeBackPlaceholder'),
      isNewSourceModalOpen: false,
      newCustomSources: [],
      availableManualLeadSources: [],
      dropdown: {
        garage: 'dropdownGarage',
        leadSaleType: 'dropdownLeadSaleType',
        sourceType: 'dropdownSourceType',
        requestType: 'dropdownRequestType',
        timing: 'dropdownTiming',
        financing: 'dropdownFinancing',
        takeBack: 'dropdownTakeBack',
      },
      phoneCountryCode: null,
      selectedGarage: { value: null, label: null },
    };
  },
  methods: {
    closeAllOtherDropdowns(clickedRef) {
      const dropdownRefs = Object.values(this.dropdown);
      for (const currentRef in this.$refs) {
        if (this.$refs[currentRef] && dropdownRefs.includes(currentRef)) {
          if (clickedRef !== currentRef) {
            this.$refs[currentRef].$refs.dropdown.closeDropdown();
          }
        }
      }
      // Automatically scroll to bottom
      const container = this.$el.querySelector('.modal-base__body');
      container.scrollTop = container.scrollHeight;
    },
    enumToInputOptions(EnumClass, { useKey = false } = {}) {
      return Object.entries(EnumClass.toJSON()).map(([key, value]) => ({
        value: useKey ? key : value,
        label: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(useKey ? key : value),
      }));
    },
    //filter out the values specifics to VI // TODO show commented in data
    // optionsTimingFiltered() {
    //   return Object.entries(LeadTimings.toJSON())
    //     .filter(([key, value]) => !LeadTimings.isSpecificToVI(value))
    //     .map(([key, value]) => ({ value, label: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(value) }));
    // },
    sendManualLead() {
      const leadToCreate = {};
      this.leadDetailsFields.forEach(field=>leadToCreate[field]=this.newLead[field]);
      //console.log(Object.fromEntries(this.leadDetailsFields.map((field) => [field, this.newLead[field]])));
      this.addManualLead(leadToCreate);
      this.closeModal();
    },
    closeModal() {
      this.$store.dispatch('closeModal');
    },
    async fetchAvailableSources() {
      const leadSaleType = this.newLead.leadSaleType;
      const selectedGarageId = this.newLead.garageId;
      if (leadSaleType) {
        this.availableManualLeadSources = await this.fetchAvailableManualLeadSources({
          leadSaleType,
          selectedGarageId,
        });
      }
    },
    dropdownSelectorGarage(garageId) {
      this.newLead.garageId = garageId;
      if (garageId) {
        const selectedGarage = this.allGarages.find(({ value }) => value === garageId);
        const { label, locale } = selectedGarage;
        this.phoneCountryCode = (locale && locale.split('_').pop()) || 'FR';
        this.garageTitle = label;
        this.setSelectedGarage(selectedGarage);
        this.fetchAvailableSources();
      } else {
        this.garageTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('garage');
      }
    },
    dropdownSelectorLeadSaleType({ value }) {
      this.newLead.leadSaleType = value;
      if (value) {
        this.serviceTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(value);
        this.fetchAvailableSources();
      } else {
        this.serviceTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('type');
      }
    },
    dropdownSelectorSource({ sourceType, value }) {
      this.newLead.sourceType = sourceType;
      if (!sourceType && value === 'addSourceType') {
        this.isNewSourceModalOpen = true;
      } else if (sourceType) {
        this.sourceTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(sourceType, {}, sourceType);
      } else {
        this.sourceTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('sourceType');
      }
    },
    dropdownSelectorRequestType({ value }) {
      this.newLead.requestType = value;
      if (value) {
        this.requestType = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(value);
      } else {
        this.requestType = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('requestType');
      }
    },
    dropdownSelectorTiming({ value }) {
      this.newLead.leadTiming = value;
      if (value) {
        this.timingTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(value);
      } else {
        this.timingTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('timing');
      }
    },
    dropdownSelectorFinancing({ value }) {
      this.newLead.leadFinancing = value;
      if (value) {
        this.financingTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(value);
      } else {
        this.financingTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('financing');
      }
    },
    dropdownSelectorTakeBack({ leadTradeIn }) {
      this.newLead.leadTradeIn = leadTradeIn;
      if (leadTradeIn) {
        this.takeBackTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(leadTradeIn);
      } else {
        this.takeBackTitle = this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('takeBack');
      }
    },
    closeNewSourceModal() {
      this.isNewSourceModalOpen = false;
    },
    createCustomSource() {
      this.newCustomSources.push(this.newSource.sourceName);
      this.dropdownSelectorSource({ sourceType: this.newSource.sourceName });
      this.newSource.sourceName = '';
      this.closeNewSourceModal();
    },
    setSelectedGarage(selectedGarage = {}) {
      this.newLead.garageId = selectedGarage.value;
      this.selectedGarage = selectedGarage;
    },
  },

  computed: {
    existingSources() {
      return [...this.availableManualLeadSources, ...this.newCustomSources];
    },
    optionsSourceType() {
      return this.existingSources.map((source) => ({ id: source, sourceType: source, label: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(source, {}, source) }));
    },
    optionsSourceTypeAddSource() {
      return {
        id: 'addSourceType',
        value: 'addSourceType',
        label: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('addSourceType'),
        icon: 'icon-gs-add',
        buttonType: 'dropdown-btn',
      };
    },
    charCount() {
      return this.newSource.sourceName.length;
    },
    isNewCustomSourceValid() {
      const { sourceName, minLength, maxLength } = this.newSource;
      const lengthCond = sourceName.length >= minLength && sourceName.length <= maxLength;
      const uniqueCond = !this.existingSources.includes(sourceName);
      return lengthCond && uniqueCond;
    },
    newCustomSourceErr() {
      const { sourceName, minLength, maxLength } = this.newSource;
      const lengthCond = sourceName.length >= minLength && sourceName.length <= maxLength;
      const uniqueCond = !this.existingSources.map((n) => n.toLowerCase()).includes(sourceName.toLowerCase());

      if (!lengthCond) {
        return this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('minimumCharacters', { minLength: this.newSource.minLength });
      }
      if (!uniqueCond) {
        return this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('sourceAlreadyExists', { sourceName });
      }
      return lengthCond && uniqueCond;
    },
    modelPlaceHolder() {
      if (this.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP) return 'Honda CBR';
      return 'Renault Clio III';
    },
    allGarages() {
      return this.availableGarages
        .map((garage) => ({ label: garage.publicDisplayName, value: garage.id, locale: garage.locale }))
        .sort((item1, item2) => item1.label - item2.label);
    },

    validate() {
      const fieldsValidationBool = (...args) => {
        const rawFieldsValidation = fieldsValidation(...args);
        return rawFieldsValidation && rawFieldsValidation.status === 'Valid';
      };
      const emailValidation = () => {
        if (this.newLead.email) {
          return fieldsValidationBool(this.newLead.email, 'email', { required: true });
        } else if (this.newLead.phone) {
          return fieldsValidationBool(this.newLead.phone, 'allPhoneTypes', {
            required: true,
            country: this.phoneCountryCode,
          });
        }
        return fieldsValidationBool(this.newLead.email, 'email', { required: true });
      };
      const phoneValidation = () => {
        if (this.newLead.phone) {
          return fieldsValidationBool(this.newLead.phone, 'allPhoneTypes', {
            required: true,
            country: this.phoneCountryCode,
          });
        } else if (this.newLead.email) {
          return fieldsValidationBool(this.newLead.email, 'email', { required: true });
        }
        return fieldsValidationBool(this.newLead.phone, 'allPhoneTypes', {
          required: true,
          country: this.phoneCountryCode,
        });
      };
      return {
        // Base fields
        fullName: fieldsValidationBool(this.newLead.fullName, 'text', { required: true }),
        email: emailValidation(),
        phone: phoneValidation(),
        garageId: fieldsValidationBool(this.newLead.garageId, '', { required: true }),
        leadSaleType: fieldsValidationBool(this.newLead.leadSaleType, 'enum', {
          required: true,
          enumValues: LeadSaleTypes.values(),
        }),
        // Shared field
        sourceType: fieldsValidationBool(this.newLead.sourceType, 'text', { required: true }),
        vehicleModel: fieldsValidationBool(this.newLead.vehicleModel, '', {}),
        // APV specific fields
        requestType: fieldsValidationBool(this.newLead.requestType, 'enum', {
          enumValues: LeadTicketRequestTypes.values(),
        }),
        // Sales specific fields
        leadTiming: fieldsValidationBool(this.newLead.leadTiming, 'enum', {
          required: true,
          enumValues: LeadTimings.values(),
        }),
        brandModel: fieldsValidationBool(this.newLead.brandModel, '', {}),
        leadFinancing: fieldsValidationBool(this.newLead.leadFinancing, 'enum', { enumValues: LeadFinancing.values() }),
        leadTradeIn: fieldsValidationBool(this.newLead.leadTradeIn, 'enum', { enumValues: LeadTradeInTypes.values() }),
        sourceName: fieldsValidationBool(this.newSource.sourceName, 'text', { required: true }),
      };
    },

    dirtyCheckValidate() {
      let validateTemp = {};
      Object.keys(this.validate).forEach(field=>{
        validateTemp[field] = (!this.dirty[field] || this.validate[field]) ? 'Valid' : 'Invalid';
      })
      return validateTemp;
    },

    dropdownValidate() {
      let validateTemp = {};
      Object.keys(this.validate).forEach(field=>{
        validateTemp[field] = (this.newLead[field] && this.validate[field]) ? 'Valid' : 'Empty';
      })
      return validateTemp;
    },

    errorMessage() {
      const isValid = (key) => this.dirtyCheckValidate[key] === 'Valid';
      return (key) => (isValid(key) ? '' : this.$t_locale('components/cockpit/modals/leads/ModalAddLead')('required', { prop: this.$t_locale('components/cockpit/modals/leads/ModalAddLead')(`prop_${key}`) }));
    },

    displayApvSpecificFields() {
      if (!this.validate.garageId || !this.validate.leadSaleType) {
        return false;
      }
      return this.newLead.leadSaleType === DataTypes.MAINTENANCE;
    },
    displaySalesSpecificFields() {
      if (!this.validate.garageId || !this.validate.leadSaleType) {
        return false;
      }
      return this.newLead.leadSaleType !== DataTypes.MAINTENANCE;
    },

    leadDetailsFields() {
      const sharedFields = ['fullName', 'email', 'phone', 'garageId', 'leadSaleType', 'sourceType'];
      if (this.displayApvSpecificFields) {
        return [...sharedFields, 'requestType', 'vehicleModel'];
      } else if (this.displaySalesSpecificFields) {
        const returnedFields = [...sharedFields, 'leadTiming', 'brandModel', 'leadFinancing', 'leadTradeIn'];
        if (this.displayTradeInVehicle) {
          returnedFields.push('vehicleModel');
        }
        return returnedFields;
      }
      return [];
    },

    displayTradeInVehicle() {
      return this.newLead.leadTradeIn === 'Yes';
    },
    comparatorFunction() {
      return ({ options, key, value }) => options.find((option) => option[key] === value[key]);
    },
  },

  watch: {
    'validate': {
      deep: true,
      handler(value) {
        if (this.leadDetailsFields.length === 0) return false;
        this.isAllValid = this.leadDetailsFields.map((key) => value[key]).every((status) => status);
      },
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-ticket {
  overflow: auto;
  height: 100%;
}

.modal-add-lead {
  &__informations-required {
    display: flex;
    justify-content: flex-end;
    position: relative;
    top: 1.5rem;
  }

  &__content {
    display: flex;
    flex-direction: column;

    &__field {
      margin-bottom: 1rem;
      flex-grow: 1;

      &__label {
        margin-bottom: 0rem;
        font-weight: bold;
      }
    }

    &__field-group {
      display: flex;
      flex-direction: row;

      &__field {
        flex-basis: 0;

        &:first-child {
          padding-right: 0.5rem;
        }

        &:last-child {
          padding-left: 0.5rem;
        }
      }
    }
  }

  &__first-title {
    margin-bottom: 1rem;
  }

  &__second-title {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}

.fake-modal-overlay {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: rgba($black, 0.75);
  top: 0;
  left: 0;
  z-index: 95;
}

.fake-modal {
  position: absolute;
  width: 28rem;
  height: 13rem;
  background: $white;
  border-radius: 3px;
  box-shadow: 0 25px 35px 0 rgba($black, 0.16);
  z-index: 96;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: auto;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    padding-bottom: 0.5rem;
    flex-shrink: 0;

    &__btn-close {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      padding: 0;
      color: $dark-grey;
      background-color: transparent;
      border: none;
      cursor: pointer;
      outline: none;
      margin-left: 1rem;
      font-size: 1rem;

      &:hover {
        color: $greyish-brown;
      }
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    width: calc(100% - 3rem);
    margin-top: 1rem;

    ::v-deep .input-material {
      width: 100% !important;
      margin: auto;

      &__label {
        text-align: left;
      }

      &__error {
        text-align: left;
        margin: 0;
      }
    }

    &__footer {
      display: flex;
      width: 100%;
      margin-top: 0.4rem;

      &__error {
        display: flex;
        flex-grow: 1;
        color: $red;
      }

      &__count {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  &__footer {
    display: flex;
    width: calc(100% - 3rem);
    justify-content: flex-end;
    margin-top: 1rem;
  }
}

.garage-list {
  margin-top: 0.85rem;
}

.job-padding {
  padding-top: 1.9rem;
}

::v-deep .multiselect__single {
  color: $dark-grey !important;
  padding-left: 0 !important;
}
</style>
