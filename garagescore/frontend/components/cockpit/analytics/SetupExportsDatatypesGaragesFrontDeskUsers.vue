<template>
  <SetupStep v-bind="stepProps">
    <template slot="input">
      <Skeleton v-if="componentLoading" class="setup-exports__skeleton" />
      <MultiSelectMaterial
        v-else-if="!disableDataTypesSelector && !isAutomationExport"
        class="setup-exports__multiselect"
        placeholder=""
        @input="updateTemporarySelectedDataTypes"
        :value="temporarySelectedDataTypes"
        :multiple="true"
        :options="dataTypesOptions"
        :noResult="$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('multiselectDataTypesNoResult')"
        :label="$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('dataTypes')"
      />
      <Skeleton v-if="componentLoading" class="setup-exports__skeleton" />
      <DropdownGarageFilter
        v-else
        class="setup-exports__multiselect"
        :availableGarages="availableGarages"
        :garages="garagesOptions"
        :applyItemsSelected="updateTemporarySelectedGarages"
        :selectedGarageIds="temporarySelectedGarages"
        :setGarageFilterMode="setGarageFilterMode"
        :optionSelected="temporaryOptionSelected"
        :selectedTags="temporarySelectedTags"
        :setSelectedTags="setSelectedTags"
        :saveOption="false"
        type="new-design-flat"
        width="max-width"
        height="md"
      />
      <Skeleton v-if="componentLoading" class="setup-exports__skeleton" />
      <MultiSelectMaterial
        v-else-if="exportTypeIsFrontDeskUsers && !isAutomationExport"
        class="setup-exports__multiselect"
        :placeholder="placeholder"
        @input="updateTemporarySelectedFrontDeskUsers"
        :value="temporarySelectedFrontDeskUsers"
        :multiple="true"
        :options="frontDeskUsersOptions"
        :noResult="$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('multiselectFrontDeskUsersNoResult')"
        :label="$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('frontDeskUsers')"
        :disabled="!this.temporarySelectedDataTypesAreValid || !this.temporarySelectedGaragesAreValid"
        trackBy="trackId"
      >
      </MultiSelectMaterial>
    </template>
  </SetupStep>
</template>

<script>
import { ExportTypes, LeadSaleTypes, GarageTypes } from '~/utils/enumV2';
import ExportHelper from '~/utils/exports/helper';
import { garagesValidator } from '~/utils/components/validators';
import DropdownGarageFilter from '../../global/DropdownGarageFilter.vue';
import { sortArrayObject } from '~/util/arrayTools.js';
export default {
  name: 'SetupExportsDatatypesGaragesFrontDeskUsers',
  components:{
    DropdownGarageFilter
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    selectedExportType: {
      type: String,
      default: ExportTypes.Garages,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    availableGarages: {
      type: Array,
      default: () => [],
    },
    availableFrontDeskUsers: {
      type: Array,
      default: () => [],
    },
    setSelectedDataTypesAndGaragesAndFrontDeskUsers: {
      type: Function,
      required: true,
    },
    setActiveStep: {
      type: Function,
      required: true,
    },
    isVehicleInspection: {
      type: Boolean,
      default: false,
    },
    selectedDataTypes: {
      type: Array,
      default: () => [],
    },
    selectedGarages: {
      type: Array,
      default: () => [],
    },
    selectedFrontDeskUsers: {
      type: Array,
      default: () => [],
    },
    exportGetAvailableFrontDeskUsers: {
      type: Function,
      default: () =>
        console.error(
          'SetupExportsDatatypesGaragesFrontDeskUsers.vue :: exportGetAvailableFrontDeskUsers not set'
        ),
    },
    selectedAreValid: {
      type: Boolean,
      default: false,
    },
    isAutomation: {
      type: Boolean,
      default: false,
    },
    garageIds: {
      required: true,
      validator: garagesValidator
    },
    optionSelected: {
      type: String,
      default: 'garages'
    },
    selectedTags:{
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      componentLoading: false,
      temporarySelectedDataTypes: [],
      temporarySelectedGarages: [],
      temporarySelectedFrontDeskUsers: [],
      temporaryOptionSelected: this.optionSelected,
      temporarySelectedTags: this.selectedTags
    };
  },
  mounted() {
    this.setGarageIds();
  },
  computed: {
    isAutomationExport() {
      return [ExportTypes.AUTOMATION_RGPD, ExportTypes.AUTOMATION_CAMPAIGN].includes(this.selectedExportType);
    },
    /**
     * This step requires to select Datatypes and Garages
     * However, if the exportType is FrontDeskUsers, it also requires to select FrontDeskUsers
     * Therefore, props are conditionnally set based on the exportType
     */
    stepProps() {
      return {
        stepName: 'dataTypesAndGaragesAndFrontDeskUsersStep',
        label: this.label,
        subLabel: this.subLabel,
        isOpen: this.isOpen,
        filled: this.selectedAreValid,
        isValid: this.temporarySelectedAreValid,
        onSetActive: this.setActiveStep,
        onValidate: this.setSelected,
        onCancel: this.cancel,
        ref: 'dataTypesAndGaragesAndFrontDeskUsersStep',
        isModification: false,
        disabled: !this.selectedExportTypeIsValid,
        ...(!this.selectedExportTypeIsValid && {
          disabledTooltip: this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('finishExportTypeStepFirst'),
        }),
        loading: this.loading,
      };
    },
    /**
     * if it's a FRONT_DESK_USERS export , we need to display the frontDeskUsers multiselect
     */
    exportTypeIsFrontDeskUsers() {
      return ExportHelper.exportTypeIsFrontDeskUsers(this.selectedExportType);
    },

    //--------------------------------------------------------------------------------------//
    //                              TemporarySelected fields Validation                     //
    //--------------------------------------------------------------------------------------//

    temporarySelectedDataTypesAreValid() {
      return this.disableDataTypesSelector || this.temporarySelectedDataTypes.length > 0;
    },
    temporarySelectedGaragesAreValid() {
      return this.temporarySelectedGarages?.length > 0;
    },
    temporarySelectedFrontDeskUsersAreValid() {
      if (!ExportHelper.exportTypeIsFrontDeskUsers(this.temporarySelectedExportType)) {
        return true;
      }
      return this.temporarySelectedFrontDeskUsers.length > 0;
    },
    temporarySelectedAreValid() {
      // For Automation, only check if selectedGarages is valid
      return (
        this.temporarySelectedDataTypesAreValid &&
        this.temporarySelectedGaragesAreValid &&
        this.temporarySelectedFrontDeskUsersAreValid
      ) || (
        this.isAutomationExport &&
        this.temporarySelectedGaragesAreValid
      );
    },

    selectedExportTypeIsValid() {
      return ExportTypes.hasValue(this.selectedExportType);
    },
    disableDataTypesSelector() {
      return this.isVehicleInspection || [ExportTypes.EREPUTATION].includes(this.selectedExportType);
    },
    //--------------------------------------------------------------------------------------//
    //                                       Options                                        //
    //--------------------------------------------------------------------------------------//

    /**
     * Return the datatypes options for the multiselect
     * it depends on the ExportTypes : if it's a LEADS exports we need to use leadSaleTypes otherwise dataTypes
     */
    dataTypesOptions() {
      // the choice is disabled if the 'All' options is selected
      const isDisabled = this.temporarySelectedDataTypes.find((e) => e.value === 'All');

      const options = [
        {
          label: this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('All'),
          value: 'All',
          $isDisabled: false,
        },
        ...ExportHelper.eligibleDataTypes
          .filter((e) => this.availableGarages.some((g) => g.subscriptions[e]))
          .map((e) => {
            return {
              label: this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')(`dataType_${e}`),
              value: e,
              $isDisabled: isDisabled,
            };
          }),
      ];

      if (ExportHelper.exportTypeIsUsingLeadSaleTypes(this.selectedExportType)) {
        options.push({
          label: this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')(`leadSaleType_${LeadSaleTypes.UNKNOWN}`),
          value: LeadSaleTypes.UNKNOWN,
          $isDisabled: isDisabled,
        });
      }

      return [...options];
    },
    /**
     * Return the garages options for the multiselect
     */

    garagesOptions() {
      if (!this.availableGarages) {
        return [];
      }
      const arrayOptions = [
        ...this.availableGarages
          .filter((g) => {
            if (!g.subscriptions.active) {
              return false;
            }

            if (!this.notVehicleInspection) {
              return g.subscriptions.VehicleInspection;
            }

            if (
              this.selectedExportType === ExportTypes.SATISFACTION ||
              this.selectedExportType === ExportTypes.UNSATISFIED ||
              this.selectedExportType === ExportTypes.CONTACTS
            ) {
              return g.subscriptions.Maintenance || g.subscriptions.NewVehicleSale || g.subscriptions.UsedVehicleSale;
            }

            if (
              this.selectedExportType === ExportTypes.LEADS ||
              this.selectedExportType === ExportTypes.FORWARDED_LEADS
            ) {
              return g.subscriptions.Lead;
            }

            if (this.selectedExportType === ExportTypes.EREPUTATION) {
              return g.subscriptions.EReputation;
            }

            return true;
          })
          .map(({id, publicDisplayName})=> {
            return {
              key: id,
              value: publicDisplayName
            };
          }),
      ];
      return sortArrayObject(arrayOptions, 'value');
    },
    frontDeskUsersOptions() {
      if (!this.temporarySelectedDataTypesAreValid || !this.temporarySelectedGaragesAreValid) {
        return [];
      }
      const areAllOptionsSelected = !!this.temporarySelectedFrontDeskUsers.find(
        frontDeskUser => (
          frontDeskUser?.value?.id === 'All'
        )
      );
      return [
        this.optionAllFrontDeskUsers,
        ...this.availableFrontDeskUsers.map(
          f => {
            return {
              ...f,
              $isDisabled : areAllOptionsSelected
            };
          },
        ),
      ];
    },
    //--------------------------------------------------------------------------------------//
    //                                       Label                                          //
    //--------------------------------------------------------------------------------------//
    label() {
      return this.isAutomationExport ? this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('garagesSelected') : this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('stepLabel');
    },
    //--------------------------------------------------------------------------------------//
    //                                      Sub Label                                       //
    //--------------------------------------------------------------------------------------//
    subLabel() {
      /* the user did not validate the fields */
      if (!this.selectedAreValid) {
        return this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('stepSubLabel');
      }

      let result = '';

      /* DataTypes And Garages Sub Label (always displayed) */
      const countGarages = this.temporarySelectedGarages?.length;
      const allGarages = this.temporarySelectedGarages?.find((g) => g === 'All') || !this.temporarySelectedGarages;
      const countDataTypes = this.selectedDataTypes.length;
      const labelTranslation = 'components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers';
      const dataTypes = this.selectedDataTypes.length
        ? this.selectedDataTypes.map((e) => this.$t_locale(labelTranslation)(`dataType_${e}`)).join(', ')
        : this.$t_locale(labelTranslation)(`exportType_${this.selectedExportType}`);
      
      const part1 = `${countGarages > 1 || allGarages ? this.$t_locale(labelTranslation)('garages') : this.$t_locale(labelTranslation)('garage')} : ${ allGarages ? this.$t_locale(labelTranslation)('All') : countGarages} `;
      const part2 = this.isVehicleInspection ? '' : `| ${countDataTypes > 1 ? this.$t_locale(labelTranslation)('dataTypes') : this.$t_locale(labelTranslation)('dataType')} : ${dataTypes}`;
      result = `${part1}${part2}`;

      /* FrontDeskUsers : displayed if export type is FrontDeskUser */
      if (this.exportTypeIsFrontDeskUsers) {
        const countFrontDeskUsers = this.selectedFrontDeskUsers.length;
        const allFrontDeskUsers = !!this.selectedFrontDeskUsers.find((f) => f.id === 'All');
        result += ` | ${this.$t_locale(labelTranslation)('frontDeskUsers')} : ${allFrontDeskUsers ? this.$t_locale(labelTranslation)('All') : countFrontDeskUsers}`;
      }
      /* Only display garages choices for Automation */
      if (this.isAutomationExport) {
        const i18n = countGarages > 1 ? 'garages' : 'garage';
        return allGarages ? this.$t_locale(labelTranslation)('allGarages'): `${this.$t_locale(labelTranslation)(i18n)} : ${countGarages}`;
      }
      return result;
    },
    notVehicleInspection() {
      return this.availableGarages.some((g) => g.type !== GarageTypes.VEHICLE_INSPECTION);
    },
    placeholder() {
      return this.temporarySelectedDataTypesAreValid && this.temporarySelectedGaragesAreValid
        ? ''
        : this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('selectDataTypeAndGarageFirst');
    },
    optionAllFrontDeskUsers() {
      return {
          label: this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('All'),
          value: { id: 'All', frontDeskUserName: 'All', garageId: null, garagePublicDisplayName: null },
          $isDisabled: false,
          trackId: ExportHelper.buildTrackId('All', null)
        };
    }
  },

//--------------------------------------------------------------------------------------//
//                                       Methods                                        //
//--------------------------------------------------------------------------------------//

  methods: {
    setSelected() {
      this.setSelectedDataTypesAndGaragesAndFrontDeskUsers(
        this.temporarySelectedDataTypes.map((el) => el.value),
        this.temporarySelectedGarages,
        this.temporarySelectedFrontDeskUsers.map((el) => el.value)
      );
    },
    async updateTemporarySelectedDataTypes(dataTypes) {
      /* add the new dataTypes */
      this.temporarySelectedDataTypes = [...dataTypes];

      /* if the 'All' options is selected, deselect all others options
      or if every options is selected, select the 'All' option only */
      const allOptionSelected = !!dataTypes.find((e) => e.value === 'All');
      const everyOptionsIsSelected = this.temporarySelectedDataTypes.length === this.dataTypesOptions.length - 1;

      if (allOptionSelected || everyOptionsIsSelected) {
        this.temporarySelectedDataTypes = [
          {
            label: this.$t_locale('components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers')('All'),
            value: 'All',
            $isDisabled: false,
          },
        ];
      }

      if (this.exportTypeIsFrontDeskUsers) {
          await this.refreshAvailableFrontDeskUsers();
      }
    },
    async updateTemporarySelectedGarages(garages) {
      /* add the new garages */
      this.temporarySelectedGarages = garages;

      if (this.exportTypeIsFrontDeskUsers) {
          await this.refreshAvailableFrontDeskUsers();
      }
    },
    updateTemporarySelectedFrontDeskUsers(frontDeskUsers) {
      /* add the new FrontDeskUsers */
      this.temporarySelectedFrontDeskUsers = [...frontDeskUsers];
      /* if the 'All' options is selected, deselect all others options
      or if every options is selected, select the 'All' option only */
      const allOptionSelected = !!frontDeskUsers.find((e) => e.value.id === 'All');
      const everyOptionsIsSelected =
        this.temporarySelectedFrontDeskUsers.length === this.frontDeskUsersOptions.length - 1;

      if (allOptionSelected || everyOptionsIsSelected) {
        this.temporarySelectedFrontDeskUsers = [
          this.optionAllFrontDeskUsers
        ];
      }
    },
    /*  if the user click on the cancel button, we need to keep the last selected and validated options */
    cancel() {
      this.temporarySelectedDataTypes = [...this.selectedDataTypes];
      this.temporarySelectedGarages = [...this.selectedGarages];
      this.temporarySelectedFrontDeskUsers = [...this.selectedFrontDeskUsers];

      this.setActiveStep(null);
    },
    /**
     * transform selectedFrontDeskUsers : format => [{"id" : <string>, "frontDeskUserName" : <string> , "garageId" : <string>}]
     * to temporarySelectedFrontDeskUsers : format => [{"label" : <string> , value: {"id" : <string>, "frontDeskUserName" : <string> , "garageId" : <string>}, $isDisabled : <boolean>}]
     */
    formatSelectedFrontDeskUsers(selectedFrontDeskUsers = []) {
      const withTrackId = selectedFrontDeskUsers.map(f => {
        return {...f, trackId : ExportHelper.buildTrackId(f.id, f.garageId) };
      });
      return this.frontDeskUsersOptions.filter((e) => !!withTrackId.find(f => f.trackId === e.trackId));

    },
    /**
     * transform selectedDataTypes : format => [<string>]
     * to temporarySelectedDataTypes : format => [{"label" : <string> , value: <string>}]
     */
    formatSelectedDataTypes(selectedDataTypes = []) {
      return this.dataTypesOptions.filter((g) => selectedDataTypes.includes(g.value));
    },
    /* Filter out non available frontDeskUsers (already selected) */
    removeUnavailableFrontDeskUsers(temporarySelectedFrontDeskUsers = [], frontDeskUsersOptions = []) {
      return temporarySelectedFrontDeskUsers.filter(
        (temporarySelected) =>
            !!frontDeskUsersOptions.find((option) => option.value.id === temporarySelected.value.id && option.value.garageId === temporarySelected.value.garageId)
        );
    },
    async refreshAvailableFrontDeskUsers() {
            /**
       * Since the list of AvailableFrontDeskUsers are linked to the selected dataTypes
       * If a change is made to the temporarySelectedDataTypes, we need to display only the frontDeskUsers available for the new temporarySelectedDataTypes
       **/
      if (this.exportTypeIsFrontDeskUsers) {
        if(this.temporarySelectedGarages?.length && this.temporarySelectedDataTypes.length) {
          this.componentLoading = true;
          await this.exportGetAvailableFrontDeskUsers({
            garageIds: this.temporarySelectedGarages,
            dataTypes: this.temporarySelectedDataTypes.map((el) => el.value),
            frontDeskUsersType: this.selectedExportType
          });
          this.temporarySelectedFrontDeskUsers = this.removeUnavailableFrontDeskUsers(
            this.temporarySelectedFrontDeskUsers,
            this.frontDeskUsersOptions
          );
          this.componentLoading = false;
        }
        else {
          this.temporarySelectedFrontDeskUsers = [];
        }
      }
    },
    setGarageFilterMode(optionSelected) {
      this.temporaryOptionSelected = optionSelected;
    },
    setSelectedTags(tags){
      this.temporarySelectedTags = tags;
    },
    setGarageIds(){
      if(this.garageIds?.length){
        this.temporarySelectedGarages = this.garagesOptions?.filter(garage=>this.garageIds?.includes(garage.key)).map(garage=>garage.key);
      } else{
        this.temporarySelectedGarages = this.garageIds;
      }
    } 
  },
  watch: {
    isOpen: {
      immediate: false,
      handler(newVal) {
        if (newVal === true) {
          this.temporarySelectedFrontDeskUsers = this.formatSelectedFrontDeskUsers(this.selectedFrontDeskUsers);
          this.temporarySelectedDataTypes = this.formatSelectedDataTypes(this.selectedDataTypes);
        }
      },
    },
    selectedDataTypes: {
      immediate: true,
      handler(newVal) {
        this.temporarySelectedDataTypes = this.formatSelectedDataTypes(newVal);
      },
    },
    selectedFrontDeskUsers: {
      immediate: true,
      handler(newVal) {
        if (this.exportTypeIsFrontDeskUsers) {
          this.temporarySelectedFrontDeskUsers = this.formatSelectedFrontDeskUsers(newVal);
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.setup-exports {
  &__skeleton {
    height : 35px !important;
    margin-top: 10px;
  }
  &__multiselect {
    max-width: 560px;
    margin-top: 2rem;

    &:first-child {
      margin-bottom: 2rem;
    }
  }
}
</style>
