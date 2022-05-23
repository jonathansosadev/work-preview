<template>
  <ModalBase :overrideCloseCross="closeModal" class="modal-ticket" type="danger">
    <template slot="header-icon">
      <i :class="icon"></i>
    </template>
    <template slot="header-title">
      <span>{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('title') }}</span>
    </template>
    <template slot="header-subtitle">
      <span>{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('subtitle') }}</span>
    </template>
    <template slot="body">
      <div class="modal-add-unsatisfied__content">
        <AppText tag="span" type="danger" size="sm" class="modal-add-unsatisfied__informations-required">{{
          $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('informationsRequired')
        }}</AppText>
        <Title type="black" class="modal-add-unsatisfied__first-title">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('customerInformation') }}</Title>
        <!-- Nom -->

        <div class="modal-add-unsatisfied__content__field">
          <InputMaterial
            v-model="newUnsatisfied.fullName"
            :placeholder="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('namePlaceholder')"
            :is-valid="dirtyCheckValidate.fullName"
            :error="errorMessage('fullName')"
            @input="dirty.fullName = true"
            placedLabel
            required
          >
            <template slot="label">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('fullName') }}</template>
          </InputMaterial>
        </div>

        <!-- Email -->

        <div class="modal-add-unsatisfied__content__field">
          <InputMaterial
            :placeholder="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('emailPlaceholder')"
            v-model="newUnsatisfied.email"
            :is-valid="dirtyCheckValidate.email"
            :error="errorMessage('email')"
            @input="dirty.email = true"
            placedLabel
            required
          >
            <template slot="label">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('customerEmail') }}</template>
          </InputMaterial>
        </div>

        <!-- Téléphone -->

        <div class="modal-add-unsatisfied__content__field">
          <InputMaterial
            :placeholder="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('phonePlaceholder')"
            v-model="newUnsatisfied.phone"
            :is-valid="dirtyCheckValidate.phone"
            :error="errorMessage('phone')"
            @input="dirty.phone = true"
            placedLabel
          >
            <template slot="label">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('customerPhone') }}</template>
          </InputMaterial>
        </div>

        <Title type="black" class="modal-add-unsatisfied__second-title">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('details') }}</Title>

        <template @click.native="closeAllOtherDropdowns(null, $event)">
          <div class="modal-add-unsatisfied__content__field-group">
            <!-- Garage -->
            <div
              class="
                modal-add-unsatisfied__content__field modal-add-unsatisfied__content__field-group__field
                garage-list
              "
            >
              <MultiSelectMaterial
                :placeholder="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('garagePlaceholder')"
                :value="selectedGarage"
                @input="setSelectedGarage"
                :comparatorFunction="comparatorFunction"
                :multiple="false"
                :options="allGarages"
                :noResult="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('NoGarages')"
                :label="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('Garages')"
                :select-label="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('clickToConfirm')"
                required
              />
            </div>

            <!-- Type -->
            <div
              class="
                modal-add-unsatisfied__content__field modal-add-unsatisfied__content__field-group__field
                job-padding
              "
            >
              <DropdownSelector
                :label="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('serviceTitle')"
                :title="serviceTitle"
                :subtitle="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('servicePlaceholder')"
                :items="optionsType"
                v-model="newUnsatisfied.type"
                :callback="dropdownSelectorType"
                :is-valid="dropdownValidate.type"
                :ref="dropdown.newUnsatisfiedType"
                @click.native.stop="closeAllOtherDropdowns(dropdown.newUnsatisfiedType, $event)"
                type="material"
                size="max-width"
                required
              />
            </div>
          </div>
          <!-- criteres d'insatisfaction -->

          <div class="modal-add-unsatisfied__content__field" v-if="newUnsatisfied.type">
            <!--
            <selectMaterial :placeholder="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('unsatisfiedPlaceholder')"  placedLabel v-model="newUnsatisfied.unsatisfiedCriterias" :options="optionsUnsatisfactionCriterias" :is-valid="validate.unsatisfiedCriterias.status">
              <template slot="label">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('unsatisfiedTitle') }}</template>
            </selectMaterial>
            -->
            <DropdownSelector
              :label="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('unsatisfiedTitle')"
              :title="unsatisfiedTitle"
              :subtitle="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('unsatisfiedPlaceholder')"
              :items="optionsUnsatisfactionCriterias"
              v-model="newUnsatisfied.unsatisfiedCriterias"
              :callback="dropdownSelectorUnsatisfiedCriterias"
              :is-valid="dropdownValidate.unsatisfiedCriterias"
              :ref="dropdown.optionsUnsatisfactionCriterias"
              @click.native.stop="closeAllOtherDropdowns(dropdown.optionsUnsatisfactionCriterias, $event)"
              type="material"
              size="max-width"
            />
          </div>

          <div class="modal-add-unsatisfied__content__field-group">
            <!-- Brand -->

            <div class="modal-add-unsatisfied__content__field modal-add-unsatisfied__content__field-group__field">
              <DropdownSelector
                :label="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('makeTitle')"
                :title="makeTitle"
                :subtitle="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('makePlaceholder')"
                :items="allMakes"
                v-model="newUnsatisfied.make"
                :callback="dropdownSelectorMake"
                :is-valid="dropdownValidate.make"
                :ref="dropdown.newUnsatisfiedMake"
                @click.native.stop="closeAllOtherDropdowns(dropdown.newUnsatisfiedMake, $event)"
                type="material"
                size="max-width"
              />
            </div>
            <!-- Model -->

            <div class="modal-add-unsatisfied__content__field modal-add-unsatisfied__content__field-group__field">
              <InputMaterial
                :placeholder="modelPlaceHolder"
                placedLabel
                v-model="newUnsatisfied.model"
                :is-valid="dropdownValidate.model"
                @input="dirty.model = true"
              >
                <template slot="label">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('modelTitle') }}</template>
              </InputMaterial>
            </div>
          </div>

          <div class="modal-add-unsatisfied__content__field-group">
            <!-- Manager -->
            <div class="modal-add-unsatisfied__content__field modal-add-unsatisfied__content__field-group__field">
              <InputMaterial
                :placeholder="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('managerPlaceholder')"
                placedLabel
                v-model="newUnsatisfied.frontDeskUserName"
                :is-valid="dropdownValidate.frontDeskUserName"
                @input="dirty.frontDeskUserName = true"
              >
                <template slot="label">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('managerTitle') }}</template>
              </InputMaterial>
            </div>

            <!-- Immat -->
            <div class="modal-add-unsatisfied__content__field modal-add-unsatisfied__content__field-group__field">
              <InputMaterial
                :placeholder="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('immatPlaceholder')"
                placedLabel
                v-model="newUnsatisfied.immat"
                :is-valid="dropdownValidate.immat"
                @input="dirty.immat = true"
              >
                <template slot="label">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('immatTitle') }}</template>
              </InputMaterial>
            </div>
          </div>

          <!-- Comment -->

          <div class="modal-add-unsatisfied__content__field">
            <InputMaterial
              placedLabel
              :placeholder="$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('commentPlaceholder')"
              v-model="newUnsatisfied.comment"
              :is-valid="dropdownValidate.comment"
              @input="dirty.comment = true"
            >
              <template slot="label">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('commentTitle') }}</template>
            </InputMaterial>
          </div>
        </template>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-add-unsatisfied__footer">
        <Button @click="sendManualUnsatisfied()" type="orange" class="btn validate-closing-btn" :disabled="!isAllValid">
          <span>{{ $t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('save') }}</span>
        </Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>
import fieldsValidation from '~/util/fieldsValidation';
import ReviewDetailedSubCriterias from '~/utils/models/data/type/review-detailed-subcriterias';
import { AutoBrands, MotoBrands, CaravanBrands } from '~/utils/enumV2';
import DataTypes from '~/utils/models/data/type/data-types.js';
import GarageTypes from '~/utils/models/garage.type.js';
import DropdownSelector from '~/components/global/DropdownSelector';

export default {
  components: { DropdownSelector },
  props: {
    cockpitType: { type: String, required: true },
    availableGarages: { type: Array, default: () => [] },
    addManualUnsatisfied: { type: Function, required: true },
    closeModal: { type: Function, required: true },
    currentGarageId: () => [],
  },

  data() {
    return {
      loading: false,
      icon: 'icon-gs-sad',
      newUnsatisfied: {
        fullName: '',
        email: '',
        phone: '',
        type: '',
        make: '',
        model: '',
        immat: '',
        frontDeskUserName: '',
        unsatisfiedCriterias: '',
        comment: '',
        garageId: '',
      },
      dirty: {
        fullName: false,
        email: false,
        phone: false,
        garageId: false,
        type: false,
        unsatisfiedCriterias: false,
        make: false,
        model: false,
        frontDeskUserName: false,
        immat: false,
        comment: false,
      },
      isAllValid: false,
      serviceTitle: this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('servicePlaceholder'),
      makeTitle: this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('makePlaceholder'),
      garageTitle: this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('garagePlaceholder'),
      unsatisfiedTitle: this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('unsatisfiedPlaceholder'),
      dropdown: {
        garage: 'dropdownGarage',
        newUnsatisfiedType: 'newUnsatisfiedType',
        optionsUnsatisfactionCriterias: 'optionsUnsatisfactionCriterias',
        newUnsatisfiedMake: 'newUnsatisfiedMake',
      },
      phoneCountryCode: null,
      selectedGarage: { value: null, label: null },
    };
  },

  methods: {
    closeAllOtherDropdowns(clickedRef, event) {
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
    sendManualUnsatisfied() {
      if (this.newUnsatisfied.unsatisfiedCriterias) {
        this.newUnsatisfied.unsatisfiedCriterias = {
          label: ReviewDetailedSubCriterias.getParentCriteria(this.newUnsatisfied.unsatisfiedCriterias),
          values: [this.newUnsatisfied.unsatisfiedCriterias],
        };
      }
      this.addManualUnsatisfied(this.newUnsatisfied);
      this.closeModal();
    },

    dropdownSelectorType({ type }) {
      console.log({ type });
      this.newUnsatisfied.type = type;
      if (type) {
        this.serviceTitle = this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(type);
      } else {
        this.serviceTitle = this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('serviceTitle');
      }
    },
    dropdownSelectorMake({ make }) {
      this.newUnsatisfied.make = make;
      if (make) {
        this.makeTitle = this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(make);
      } else {
        this.makeTitle = this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('makeTitle');
      }
    },
    dropdownSelectorUnsatisfiedCriterias({ fullCriteria }) {
      const [criteria, subCriteria] = fullCriteria.split('_');
      this.newUnsatisfied.unsatisfiedCriterias = subCriteria;
      if (fullCriteria) {
        this.unsatisfiedTitle = `${this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(criteria)} - ${this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(`_${subCriteria}`)}`;
      } else {
        this.unsatisfiedTitle = this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('unsatisfiedTitle');
      }
    },
    setSelectedGarage(selectedGarage = {}) {
      this.newUnsatisfied.garageId = selectedGarage.value;
      this.selectedGarage = selectedGarage;
    },
  },

  computed: {
    modelPlaceHolder() {
      if (this.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP) return this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('modelPlaceholderMotorbike');
      return this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('modelPlaceholder');
    },
    allGarages() {
      return this.availableGarages
        .map((garage) => ({ label: garage.publicDisplayName, value: garage.id }))
        .sort((item1, item2) => item1.label - item2.label);
    },

    allMakes() {
      if (this.cockpitType) {
        const brands =
          this.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP
            ? MotoBrands
            : this.cockpitType === GarageTypes.CARAVANNING
            ? CaravanBrands
            : AutoBrands;
        return brands.values().map((item) => ({ label: item, make: item }));
      }
    },

    optionsUnsatisfactionCriterias() {
      /** Filter by DataType the Sub Criteria values. The replaces are here to normalized **/
      return ReviewDetailedSubCriterias.values()
        .filter((subCriteria) =>
          subCriteria
            .replace('SaleNew', DataTypes.NEW_VEHICLE_SALE)
            .replace('SaleUsed', DataTypes.USED_VEHICLE_SALE)
            .toLowerCase()
            .includes(this.newUnsatisfied.type.toLowerCase())
        )
        .map((subCriteria) => {
          const criteria = ReviewDetailedSubCriterias.getParentCriteria(subCriteria);
          return {
            label: `${this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(criteria)} - ${this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(`_${subCriteria}`)}`,
            fullCriteria: `${criteria}_${subCriteria}`,
          };
        });
    },

    validate() {
      const fieldsValidationBool = (...args) => {
        const rawFieldsValidation = fieldsValidation(...args);
        return rawFieldsValidation && rawFieldsValidation.status === 'Valid';
      };
      const emailValidation = () => {
        if (this.newUnsatisfied.email) {
          return fieldsValidationBool(this.newUnsatisfied.email, 'email', { required: true });
        } else if (this.newUnsatisfied.phone) {
          return fieldsValidationBool(this.newUnsatisfied.phone, 'allPhoneTypes', {
            required: true,
            country: this.phoneCountryCode,
          });
        }
        return fieldsValidationBool(this.newUnsatisfied.email, 'email', { required: true });
      };
      const phoneValidation = () => {
        if (this.newUnsatisfied.phone) {
          return fieldsValidationBool(this.newUnsatisfied.phone, 'allPhoneTypes', {
            required: true,
            country: this.phoneCountryCode,
          });
        } else if (this.newUnsatisfied.email) {
          return fieldsValidationBool(this.newUnsatisfied.email, 'email', { required: true });
        }
        return fieldsValidationBool(this.newUnsatisfied.phone, 'allPhoneTypes', {
          required: true,
          country: this.phoneCountryCode,
        });
      };
      return {
        fullName: fieldsValidationBool(this.newUnsatisfied.fullName, 'text', { required: true }),
        email: emailValidation(),
        phone: phoneValidation(),
        type: fieldsValidationBool(this.newUnsatisfied.type, '', { required: true }),
        make: fieldsValidationBool(this.newUnsatisfied.make, ''),
        model: fieldsValidationBool(this.newUnsatisfied.model, ''),
        immat: fieldsValidationBool(this.newUnsatisfied.immat, ''),
        frontDeskUserName: fieldsValidationBool(this.newUnsatisfied.frontDeskUserName, ''),
        unsatisfiedCriterias: fieldsValidationBool(this.newUnsatisfied.unsatisfiedCriterias, '', { required: false }),
        comment: fieldsValidationBool(this.newUnsatisfied.comment, ''),
        garageId: fieldsValidationBool(this.newUnsatisfied.garageId, '', { required: true }),
      };
    },
    optionsType() {
      return this.cockpitType === GarageTypes.VEHICLE_INSPECTION
        ? [{ type: DataTypes.VEHICLE_INSPECTION, label: this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(DataTypes.VEHICLE_INSPECTION) }]
        : [
            { type: DataTypes.MAINTENANCE, label: this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(DataTypes.MAINTENANCE) },
            { type: DataTypes.NEW_VEHICLE_SALE, label: this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(DataTypes.NEW_VEHICLE_SALE) },
            { type: DataTypes.USED_VEHICLE_SALE, label: this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(DataTypes.USED_VEHICLE_SALE) },
          ];
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
        validateTemp[field] = (this.newUnsatisfied[field] && this.validate[field]) ? 'Valid' : 'Empty';
      })
      return validateTemp;
    },

    errorMessage() {
      const isValid = (key) => this.dirtyCheckValidate[key] === 'Valid';
      return (key) => (isValid(key) ? '' : this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')('required', { prop: this.$t_locale('components/cockpit/modals/unsatisfied/ModalAddUnsatisfied')(`prop_${key}`) }));
    },

    unsatisfiedDetailsFields() {
      const fields = ['fullName', 'email', 'phone', 'garageId', 'type'];
      return fields;
    },

    comparatorFunction() {
      return ({ options, key, value }) => options.find((option) => option[key] === value[key]);
    },
  },

  watch: {
   'validate': {
      deep: true,
      handler(value) {
        if (this.unsatisfiedDetailsFields.length === 0) return false;
        this.isAllValid = this.unsatisfiedDetailsFields.map((key) => value[key]).every((status) => status);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-ticket {
  overflow: auto;
  height: 100%;
}
.modal-add-unsatisfied {
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
