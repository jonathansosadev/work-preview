<template>
  <div class="survey-table">
    <!-- HEADER -->
    <div class="survey-table__block survey-table__line survey-table__search-mobile dark no-tablet no-desktop">
      <TableSearch class="survey-table__search__input" v-on:submit="loadMore()" v-model="search"></TableSearch>
    </div>

    <div class="survey-table__sub-header survey-table__line no-mobile">
      <div class="survey-table__block survey-table__search void no-mobile">
        <TableSearch class="survey-table__search__input" v-on:submit="loadMore()" v-model="search"></TableSearch>
      </div>
      <template v-for="column in columns">
        <div class="survey-table__block survey-table__block dark no-tablet no-mobile" :key="column.key + '1'">
          <AppText tag="p">{{ column.label }}</AppText>
        </div>
        <div class="survey-table__block survey-table__block dark no-desktop no-mobile" :key="column.key + '2'">
          <AppText tag="p">{{ column.label }}</AppText>
        </div>
      </template>
    </div>

    <!-- TABLE BODY -->
    <div v-for="(garage, index) in garagesSubscribedToAny" :key="index" class="survey-table__line no-mobile">
      <!-- col 1 garage name -->
      <div class="survey-table__block light-grey">
        <SurveyGarage
          v-bind="surveyGarageProps(garage)"
          :closeModal="closeModal"
          :openModal="openModal"
          :currentUser="currentUser"
          :updateSignature="updateSignature(garage)"
        />
      </div>
      <!-- col 2 APV -->
      <template >
        <div class="survey-table__block survey-table__block light-grey">
          <template v-if="garage.firstContactDelay && garage.firstContactDelay.Maintenance">
            <SurveyInput
              class="survey-table__survey-input"
              v-bind="surveyInputProps(garage, 'Maintenance')"
              :openModal="openModal"
              :updateSignature="updateSignature(garage, 'Maintenance')"
            />
          </template>
        </div>
      </template>
      <!-- col 3 VN -->
      <template >
        <div class="survey-table__block survey-table__block light-grey">
          <template v-if="garage.firstContactDelay && garage.firstContactDelay.NewVehicleSale">
            <SurveyInput
              class="survey-table__survey-input"
              v-bind="surveyInputProps(garage, 'NewVehicleSale')"
              :openModal="openModal"
              :updateSignature="updateSignature(garage, 'NewVehicleSale')"
            />
          </template>
        </div>
      </template>
      <!-- col 4 VO -->
      <template>
        <div class="survey-table__block survey-table__block light-grey">
          <template v-if="garage.firstContactDelay && garage.firstContactDelay.UsedVehicleSale">
            <SurveyInput
              class="survey-table__survey-input"
              v-bind="surveyInputProps(garage, 'UsedVehicleSale')"
              :openModal="openModal"
              :updateSignature="updateSignature(garage, 'UsedVehicleSale')"
            />
          </template>
        </div>
      </template>
    </div>

    <!-- TABLE BODY on mobile -->
    <div v-for="(garage, index) in garagesSubscribedToAny" :key="-(index + 1)" class="survey-table__mobile-line no-tablet no-desktop">
      <!-- col 1 garage name -->
      <div class="survey-table__block light-grey">
        <SurveyGarage
          v-bind="surveyGarageProps(garage)"
          :currentUser="currentUser"
          :closeModal="closeModal"
          :openModal="openModal"
          :updateSignature="updateSignature(garage)"
        />
      </div>
      <div class="survey-table__block survey-table__block--toggle dark">
        <AppText tag="p">{{ $tc_locale('components/cockpit/admin/surveys/SurveyTable')('surveyTypeHeader', 1) }} GarageScore&nbsp;&nbsp;<i class="survey-table__block--toggle-icon icon-gs-up"/></AppText>
      </div>
      <div class="survey-table__mobile-line__toggle-line">
        <template >
          <div class="survey-table__block light-grey">
            <SurveyInput
              class="survey-table__survey-input"
              v-if="garage.firstContactDelay && garage.firstContactDelay.Maintenance"
              v-bind="surveyInputProps(garage, 'Maintenance')"
              :openModal="openModal"
              :updateSignature="updateSignature(garage, 'Maintenance')"
            />
          </div>
        </template>
        <template >
          <div class="survey-table__block light-grey">
            <SurveyInput
              class="survey-table__survey-input"
              v-if="garage.firstContactDelay && garage.firstContactDelay.NewVehicleSale"
              v-bind="surveyInputProps(garage, 'NewVehicleSale')"
              :openModal="openModal"
              :updateSignature="updateSignature(garage, 'NewVehicleSale')"
            />
          </div>
        </template>
        <template>
          <div class="survey-table__block light-grey">
            <SurveyInput
              class="survey-table__survey-input"
              v-if="garage.firstContactDelay && garage.firstContactDelay.UsedVehicleSale"
              v-bind="surveyInputProps(garage, 'UsedVehicleSale')"
              :openModal="openModal"
              :updateSignature="updateSignature(garage, 'UsedVehicleSale')"
            />
          </div>
        </template>
      </div>
    </div>
    <Button
      v-if="hasMoreSurveys"
      class="survey-table__display-more"
      type="orange-border"
      :disabled="areSurveysLoading"
      fullSizedNoPadding
      @click="loadMore"
    >
      <template v-if="!areSurveysLoading">
        {{ $t_locale('components/cockpit/admin/surveys/SurveyTable')('displayMore') }}
      </template>
      <template v-else>
        <i class="icon-gs-loading" />
        {{ $t_locale('components/cockpit/admin/surveys/SurveyTable')('loading...') }}
      </template>
    </Button>
  </div>
</template>


<script>
import SurveyGarage from '~/components/cockpit/admin/surveys/SurveyGarage';
import SurveyInput from '~/components/cockpit/admin/surveys/SurveyInput';
import TableSearch from '~/components/global/TableSearch';


export default {
  components: {
    SurveyGarage,
    SurveyInput,
    TableSearch
  },
  props: {
    closeModal: {
      type: Function,
      required: true,
    },
    openModal: {
      type: Function,
      required: true,
    },
    currentUser: Object,
    garages: {
      type: Array,
      default: () => [],
    },
    serviceTypes: {
      type: Object,
      required: true,
    },
    areSurveysLoading: Boolean,
    hasMoreSurveys: Boolean,
    fetchMakeSurveysGarages: {
      type: Function,
      required: true,
    },
    updateSurveySignature: {
      type: Function,
      required: true,
    },
    surveyHandlers: {
      type: Object,
      validator(value) {
        const expectedProps = [
          'updateMakeSurvey',
          'removeMakeSurvey',
        ];
        const hasAllExpectedProps = expectedProps.every(
          propName => propName in value
        );
        if (hasAllExpectedProps) {
          return true;
        }
        console.error('Properties are missing in surveyHandlers');
        return false;
      }
    }
  },
  data() {
    return {
      search: '',
      surveySignatureModifications: {}
    }
  },
  computed: {
    columns() {
      return [
        { key: 'Maintenance', label: this.$t_locale('components/cockpit/admin/surveys/SurveyTable')('surveyTypeHeader', { type: this.$t_locale('components/cockpit/admin/surveys/SurveyTable')('apvHeader') }) },
        { key: 'NewVehicleSale', label: this.$t_locale('components/cockpit/admin/surveys/SurveyTable')('surveyTypeHeader', { type: this.$t_locale('components/cockpit/admin/surveys/SurveyTable')('vnHeader') }) },
        { key: 'UsedVehicleSale', label: this.$t_locale('components/cockpit/admin/surveys/SurveyTable')('surveyTypeHeader', { type: this.$t_locale('components/cockpit/admin/surveys/SurveyTable')('voHeader') }) },
      ];
    },
    isMirror() {
      return ({ brands }) => brands && brands.length > 1;
    },
    garagesSubscribedToAny() {
      return this.garages.filter(({ firstContactDelay }) => {
        if (!firstContactDelay) return false;
        return firstContactDelay.Maintenance
          || firstContactDelay.NewVehicleSale
          || firstContactDelay.UsedVehicleSale;
      });
    },
    getSurveySignature() {
      return (garage, type) => {
        const emptySignature = {
          signatureLastName: '',
          signatureFirstName: '',
          signatureJob: '',
          signatureUseDefault: true
        };
        if (!garage.surveySignature) {
          return emptySignature;
        }
        if (garage.surveySignature.useDefault || type === 'defaultSignature') {
          if (!garage.surveySignature.defaultSignature) {
            return emptySignature;
          }
          return {
            signatureLastName: garage.surveySignature.defaultSignature.lastName,
            signatureFirstName: garage.surveySignature.defaultSignature.firstName,
            signatureJob: garage.surveySignature.defaultSignature.job,
            signatureUseDefault: garage.surveySignature.useDefault,
          };
        }

        if (!garage.surveySignature[type] && !garage.surveySignature.defaultSignature) {
          return emptySignature;
        }
        if (!garage.surveySignature[type]) {
          return {
            signatureLastName: garage.surveySignature.defaultSignature.lastName,
            signatureFirstName: garage.surveySignature.defaultSignature.firstName,
            signatureJob: garage.surveySignature.defaultSignature.job,
            signatureUseDefault: garage.surveySignature.useDefault,
          };
        }
        return {
          signatureLastName: garage.surveySignature[type].lastName,
          signatureFirstName: garage.surveySignature[type].firstName,
          signatureJob: garage.surveySignature[type].job,
          signatureUseDefault: garage.surveySignature.useDefault,
        };
      };
    },
    surveyGarageProps() {
      return (garage) => ({
        garageName: garage.publicDisplayName,
        isMirror: this.isMirror(garage),
        ...this.getSurveySignature(garage, 'defaultSignature'),
      });
    },
    surveyInputProps() {
      return (garage, type) => ({
        garage,
        type,
        label: this.getGarageScoreSurveyLabel(garage),
        multi: this.isMultiBrand(garage),
        ...this.getSurveySignature(garage, type),
        ...this.surveyHandlers,
      });
    },
    garageSurveySignaturesModificationsArray() {
      return Object
        .entries(this.surveySignatureModifications)
        .map(([garageId, surveySignature]) => ({ garageId, surveySignature }));
    },
  },
  methods: {
    async loadMore() {
      await this.fetchMakeSurveysGarages(this.search);
    },
    getGarageScoreSurveyLabel(garage) {
      if (garage.brands && garage.brands.length > 1) {
        return `${this.$t_locale('components/cockpit/admin/surveys/SurveyTable')('brands')}`;
      } else if (garage.brands && garage.brands.length === 1) {
        return garage.brands[0];
      }
      return this.$t_locale('components/cockpit/admin/surveys/SurveyTable')('noBrandErrorMsg');
    },
    isMultiBrand(garage) {
      return garage.brands && garage.brands.length > 1;
    },
    updateSignature(garage, surveyType = 'defaultSignature') {
      return ({ key, value }) => {
        if (!this.surveySignatureModifications[garage.id]) {
          this.surveySignatureModifications[garage.id] = {};
        }

        if (key === 'useDefault') {
          this.surveySignatureModifications[garage.id].useDefault = value;
          if (value) {
            delete this.surveySignatureModifications[garage.id].Maintenance
            delete this.surveySignatureModifications[garage.id].NewVehicleSale
            delete this.surveySignatureModifications[garage.id].UsedVehicleSale
          }
          garage.surveySignature.useDefault = value;
        } else {
          this.surveySignatureModifications[garage.id][surveyType] = {
            ...garage.surveySignature[surveyType],
            ...(this.surveySignatureModifications[garage.id][surveyType] || {}),
            ...({ [key]: value }),
          };
          garage.surveySignature[surveyType] = {
            ...garage.surveySignature[surveyType],
            ...({ [key]: value }),
          };
        }
        this.updateSurveySignature(this.garageSurveySignaturesModificationsArray);
      }
    }
  },
}
</script>

<style lang="scss">
.survey-table {
  display:flex;
  flex-direction: column;
  width:100%;
  > *:last-child {
    margin-bottom:0;
  }
  &__standard-font-size {
    font-size: 14px!important;
  }
  &__search {
    padding-left:1rem;
    padding-right:1rem;
    box-sizing: border-box;
    align-items: flex-start!important;
    &__input {
      max-width: none!important;
    }
  }
  &__block {
    display:flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    flex-basis: 15rem;
    min-width: 15rem;
    margin-left: 1rem;
    text-align: center;
    &:first-child {
      flex-basis: 22rem;
      min-width: 22rem;
      margin-left: 0;
    }
    &--halfling {
      flex-basis: 7rem;
      min-width: 7rem;
      flex-grow: 0.5;

    }
    &.void {
      background-color: rgba($grey, .1);
    }
    &.dark {
      background-color: $dark-grey;
      color: $white;
    }
    &.blue {
      background-color: $blue;
      color: $white;
    }
    &.grey {
      background-color: $grey;
      color: $white;
    }
    &.light-blue {
      background-color: rgba($blue, .1);
      color: $black;
      font-size: 0.9rem;
      justify-content: flex-start;
      align-items: flex-start;
    }
    &.light-grey {
      border-bottom: 1px solid rgba($grey, .5);
      color: $black;
      font-size: 0.9rem;
      justify-content: flex-start;
      align-items: flex-start;
    }
    &--icon {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
    }
  }
  &__line {
    display:flex;
    flex-direction: row;
    margin-top:1rem;
    &:first-child {
      margin-top: 0;
    }
  }
  &__header {
    > * {
      height: 60px;
    }
  }
  &__sub-header {
    > * {
      height: 3.5rem;
    }
  }
  /*
  &__survey-input{
    padding-left: 1rem;
    padding-right: 1rem;
    &:first-child {
      padding-top: 0.5rem;
    }
    &:last-child {
      padding-bottom: 1rem;
    }
  }*/
  &__display-more {
    margin-top: 1rem;
  }
}

@media screen and (max-width: calc(#{$breakpoint-max-md})) {
  .survey-table {
    &__block {
      flex-basis: 8rem;
      min-width: 8rem;
      margin-left: 0.5rem;
      &:first-child {
        flex-basis: 12rem;
        min-width: 12rem;
      }
      &--halfling {
        flex-basis: 3.75rem;
        min-width: 3.75rem;
      }
    }
    &__line {
      margin-bottom:0.5rem;
      margin-top:0;
    }
    &__survey-input {
      padding-left:0.5rem;
      padding-right:0.5rem;
      &:first-child {
        padding-top: 0;
      }
      &:last-child {
        padding-bottom: 0;
      }
    }
  }
}

@media screen and (max-width: calc(#{$breakpoint-max-sm})) {
  .survey-table {
    &__survey-input {
      margin-bottom:0.5rem;
    }
    &__block {
      min-width: 0;
      flex-basis: 0;
      &:first-child {
        flex-basis: auto;
        min-width: 0;
      }
      &--mobile-no-margin-left {
        margin-left: 0;
      }
      &--toggle {
        width:100%;
        height: 2.2rem;
        flex-basis: 2.2rem;
        margin-left: 0;
        margin-top: 0.5rem;
      }
      &--toggle-icon {
        font-size:9px;
      }
    }
    &__header {
      font-size:12px;
      > * {
        height: 2.2rem;
      }
    }
    &__mobile-line {
      display:flex;
      flex-direction: column;
      margin-bottom:1rem;
      &__toggle-line {
        margin-top: 0.5rem;
        display:flex;
        flex-direction: row;
        > div {
          flex-basis: 0!important;
        }
      }
    }
    &__search-mobile {
      height: 4rem;
      box-sizing: border-box;
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }
}

</style>
