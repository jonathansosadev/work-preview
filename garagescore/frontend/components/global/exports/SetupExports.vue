<template>
  <div class="setup-exports">
    <template>

      <!-- EXPORT NAME -->
      <SetupExportsName v-if="customExportToUpdate"
        :isOpen="activeStep === 'exportName'"
        :loading="loading"
        :existingExportsNames="existingExportsNames"
        :selectedExportName="selectedExportName"
        :selectedExportNameIsValid="selectedExportNameIsValid"
        :setSelectedExportName="setSelectedExportName"
        :setActiveStep="setActiveStep"
      />
      <!-- EXPORT TYPE -->
      <SetupStep v-bind="exportTypeStepProps">
        <template slot="input">
          <TagSelector
            class="setup-exports__tag-selector"
            :tags="exportTypeStepTags"
            :savedTag="temporarySelectedExportType"
            :onTagSelected="setTemporaryExportTypeStepTag"
          />
        </template>
      </SetupStep>
      <!-- DATA TYPES AND GARAGES AND FRONT-DESK -->
      <SetupExportsDatatypesGaragesFrontDeskUsers
        :isOpen="activeStep === 'dataTypesAndGaragesAndFrontDeskUsersStep'"
        :selectedExportType="selectedExportType"
        :loading="loading"
        :availableGarages="availableGarages"
        :availableFrontDeskUsers="availableFrontDeskUsers"
        :setSelectedDataTypesAndGaragesAndFrontDeskUsers="setSelectedDataTypesAndGaragesAndFrontDeskUsers"
        :setActiveStep="setActiveStep"
        :isVehicleInspection="isVehicleInspection"
        :selectedDataTypes="selectedDataTypes"
        :selectedGarages="selectedGarages"
        :selectedFrontDeskUsers="selectedFrontDeskUsers"
        :exportGetAvailableFrontDeskUsers="exportGetAvailableFrontDeskUsers"
        :selectedAreValid="selectedDataTypesAndGaragesAndFrontDeskUsersAreValid"
        :queryWrapper="queryWrapper"
        :garageIds="garageIds"
        :selectedTags="selectedTags"
        :optionSelected="optionSelected"
      />
      <!-- AUTOMATION CAMPAIGNS -->
      <SetupExportsAutomationCampaigns 
        v-if="isExportAutomation"
        :isOpen="['automationRgpdStep', 'automationCampaignStep'].includes(activeStep)"
        :selectedExportType="selectedExportType"
        :loading="loading"
        :setActiveStep="setActiveStep"
        :selectedAutomationCampaigns="selectedAutomationCampaigns"
        :setSelectedAutomationCampaigns="setSelectedAutomationCampaigns"
        :availableAutomationCampaigns="availableAutomationCampaigns"
        :onValidateSelectedAutomationCampaigns="onValidateSelectedAutomationCampaigns"
        :onCancelSelectedAutomationCampaigns="onCancelSelectedAutomationCampaigns"
        :target="target"
      />
      <!-- PERIOD -->
      <SetupExportsPeriod
        :selectedPeriod="selectedPeriod"
        :selectedStartPeriod="selectedStartPeriod"
        :selectedEndPeriod="selectedEndPeriod"
        :availablePeriods="availablePeriods"
        :isOpen="this.activeStep === 'periodStep'"
        :loading="loading"
        :setActiveStep="setActiveStep"
        :setSelectedPeriodAndFrequency="setSelectedPeriodAndFrequency"
        :setSelectedCustomPeriod="setSelectedCustomPeriod"
        :availableFrequencies="availableFrequencies"
        :selectedFrequency="selectedFrequency"
      />

      <!-- FIELDS -->
      <SetupStep v-bind="fieldsStepProps">
        <template slot="input">
          <AddFields
            class="setup-exports__add-fields"
            :fieldsByCategories="fieldsStepFieldsByCategories"
            :onSelectedFieldsChange="setTemporaryFieldsSelected"
            :savedFields="temporarySelectedFields"
          />
        </template>
      </SetupStep>

      <!-- RECIPIENTS -->
      <SetupStep v-bind="recipientsStepProps">
        <template slot="input">
          <InputMaterial
            class="setup-exports__recipients"
            :error="recipientsStepErrorDescription"
            v-model="temporarySelectedRecipients"
            :isValid="temporarySelectedRecipientsIsValid"
          >
            <template slot="label">{{ $t_locale('components/global/exports/SetupExports')('RecipientsStepLabel') }}</template>
          </InputMaterial>
          <AppText class="setup-exports__recipients__sublabel" tag="div" type="muted" bold size="sm">
            {{ $t_locale('components/global/exports/SetupExports')('RecipientsStepSubLabel') }}
          </AppText>
        </template>
      </SetupStep>

    </template>
  </div>
</template>

<script>
  import TagSelector from '~/components/global/TagSelector';
  import AddFields from '~/components/global/AddFields';
  import SetupExportsPeriod from './SetupExportsPeriod.vue';
  import SetupExportsDatatypesGaragesFrontDeskUsers from '../../cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers.vue';
  import SetupExportsAutomationCampaigns from '../../cockpit/automation/SetupExportsAutomationCampaigns.vue';
  import SetupExportsName from './SetupExportsName.vue';
  import { AutomationCampaignTargets } from '../../../utils/enumV2'
  import { validateEmail } from '~/util/email';
  import ExportHelper from '../../../utils/exports/helper';
  import fieldsHandler from '../../../../common/lib/garagescore/cockpit-exports/fields/fields-handler';

  import { ExportTypes, DataTypes, GarageTypes, ExportCategories, ExportPeriods, ExportFrequencies } from '~/utils/enumV2';
  import { garagesValidator } from '~/utils/components/validators';

  export default {
    components: {
      AddFields,
      TagSelector,
      SetupExportsPeriod,
      SetupExportsDatatypesGaragesFrontDeskUsers,
      SetupExportsName,
      SetupExportsAutomationCampaigns
    },

    async mounted() {
      const updateOrShortcutExport = this.customExportToUpdate || this.shortcutExport;
      if (updateOrShortcutExport) {
        if(ExportHelper.exportTypeIsFrontDeskUsers(updateOrShortcutExport.exportType)) {
            this.loading = true;
            await this.exportGetAvailableFrontDeskUsers({ garageIds: updateOrShortcutExport.garageIds, dataTypes: updateOrShortcutExport.dataTypes, frontDeskUsersType: updateOrShortcutExport.exportType });
            this.loading = false;
        }
        this.preFillRequester(updateOrShortcutExport);
        this.trySetFormIsValid(false);
        this.setActiveStep(null);
        return;
      } 

      this.temporarySelectedRecipients = this.currentUser && this.currentUser.email;
      this.selectedRecipients = this.currentUser && this.currentUser.email;
      this.setActiveStep('exportType');

    },

    data() {
      return  {
        activeStep: null,
        temporarySelectedExportType: null,
        temporarySelectedFields: [],
        temporarySelectedRecipients: '',
        selectedExportName: '',
        selectedExportType: null,
        selectedDataTypes: [],
        selectedGarages: [],
        selectedFrontDeskUsers: [],
        selectedAutomationCampaigns: [],
        temporarySelectedCampaigns: [],
        selectedPeriod: null,
        selectedStartPeriod: null,
        selectedEndPeriod: null,
        selectedFields: [],
        selectedRecipients: '',
        customExportHasChanges: false,
        loading: false,
        nameMinSize: 5,
        nameMaxSize: 100,
        availablePeriods: ExportPeriods.values(),
        availableFrequencies: ExportFrequencies.values(),
        selectedFrequency: ExportFrequencies.NONE
      };
    },

    props: {
      setFormIsValid: Function,
      shortcutExport: {
        type: Object,
        default: () => null,
      },
      customExportToUpdate: {
        type: Object,
        default: () => null,
      },
      availableGarages: {
        type: Array,
        default: () => [],
      },
      availableAutomationCampaigns: {
        type: Array,
        default: () => [],
      },
      target: {
        type: String,
        default: '',
      },
      availableFrontDeskUsers: {
        type: Array,
        default: () => [],
      },
      currentUser: {
        type: Object,
        default: () => ({}),
      },
      exportGetAvailableFrontDeskUsers: {
        type: Function,
        default: () => console.error('SetupExports.vue :: exportGetAvailableFrontDeskUsers not set'),
      },
      existingExportsNames: {
        type: Array,
        default: [],
      },
      queryWrapper: {
        type: Function,
        default: () => console.error('SetupExports.vue :: queryWrapper not set'),
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

    computed: {
      isCustomExport() {
        return !!this.customExportToUpdate;
      },
      exportTypeStepProps() {
        return {
          stepName: 'exportType',
          label: this.$t_locale('components/global/exports/SetupExports')(`exportTypeStepLabel`),
          subLabel: this.selectedExportTypeIsValid ? this.exportTypeStepValidSubLabel : this.$t_locale('components/global/exports/SetupExports')('exportTypeStepSubLabel'),
          isOpen: this.activeStep === 'exportType',
          filled: this.selectedExportTypeIsValid,
          isValid: this.temporarySelectedExportTypeIsValid,
          onSetActive: this.setActiveStep,
          onValidate: this.setSelectedExportType,
          onCancel: this.cancelExportType,
          ref: 'exportType',
          isModification: false,
          loading: this.loading
        }
      },
      fieldsStepProps() {
        return {
          stepName: 'fieldsStep',
          label: this.$t_locale('components/global/exports/SetupExports')(`fieldsStepLabel`),
          subLabel: this.selectedFieldsIsValid ? this.fieldsStepValidSubLabel : this.$t_locale('components/global/exports/SetupExports')('fieldsStepSubLabel'),
          isOpen: this.activeStep === 'fieldsStep',
          filled: this.selectedFieldsIsValid,
          isValid: this.temporarySelectedFieldsIsValid,
          onSetActive: this.setActiveStep,
          onValidate: this.setSelectedFields,
          onCancel: this.cancelFields,
          ref: 'fieldsStep',
          isModification: false,
          disabled: !this.selectedExportTypeIsValid,
          disabledTooltip: !this.selectedExportTypeIsValid ? this.$t_locale('components/global/exports/SetupExports')('FinishExportTypeStepFirst') : '',
          loading: this.loading
        };
      },
      recipientsStepProps() {
        return {
          stepName: 'recipientsStep',
          label: this.$t_locale('components/global/exports/SetupExports')(`recipientsStepLabel`),
          subLabel: this.selectedRecipientsIsValid ? this.recipientsStepValidSubLabel : this.$t_locale('components/global/exports/SetupExports')('recipientsStepSubLabel'),
          isOpen: this.activeStep === 'recipientsStep',
          filled: this.selectedRecipientsIsValid,
          isValid: this.temporarySelectedRecipientsIsValid === 'Valid',
          onSetActive: this.setActiveStep,
          onValidate: this.setSelectedRecipients,
          onCancel: this.cancelRecipients,
          ref: 'recipientsStep',
          isModification: false,
          loading: this.loading
        };
      },
      exportTypeStepTags() {
        const stepTags = [
          ...this.availableGarages.length > 0 ? [{
            id: ExportTypes.GARAGES,
            label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.GARAGES}`),
            icon: 'icon-gs-garage',
            tooltip: this.$t_locale('components/global/exports/SetupExports')('ExportGaragesTooltip')
          }] : [],
          // Only need this parent category for UX reasons
          ...this.currentUser.hasAccessToTeam ? [{
            id: "FrontDeskUsersCategory",
            label: this.$t_locale('components/global/exports/SetupExports')('ExportType_FRONT_DESK_USERS'),
            icon: 'icon-gs-group',
            tooltip: this.$t_locale('components/global/exports/SetupExports')('ExportFrontDeskUsersTooltip'),
            subTags: [
              {
                id: ExportTypes.FRONT_DESK_USERS_DMS,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.FRONT_DESK_USERS_DMS}`),
                icon: 'icon-gs-group',
                tooltip: this.$t_locale('components/global/exports/SetupExports')('ExportFrontDeskUsersDMSTooltip')
              },
              {
                id: ExportTypes.FRONT_DESK_USERS_CUSTEED,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.FRONT_DESK_USERS_CUSTEED}`),
                icon: 'icon-gs-group',
                tooltip: this.$t_locale('components/global/exports/SetupExports')('ExportFrontDeskUsersCusteedTooltip'),
              }
            ]
          }] : [],
          // Only need this parent category for UX reasons
          {
            id: 'ReviewsCategory',
            label: this.$t_locale('components/global/exports/SetupExports')('ExportType_BY_DATA'),
            icon: 'icon-gs-customer',
            tooltip: this.$t_locale('components/global/exports/SetupExports')('ExportCustomerTooltip'),
            subTags: [
              {
                id: ExportTypes.SATISFACTION,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.SATISFACTION}`),
                icon: 'icon-gs-chat-bubble',
                disabled: !this.currentUser.hasAccessToSatisfaction,
                tooltip: !this.currentUser.hasAccessToSatisfaction ? this.$t_locale('components/global/exports/SetupExports')('ExportTypeNotAllowedTooltip') : this.$t_locale('components/global/exports/SetupExports')('ExportSatisfactionTooltip')
              },
              {
                id: ExportTypes.UNSATISFIED,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.UNSATISFIED}`),
                icon: 'icon-gs-sad',
                disabled: !this.currentUser.hasAccessToUnsatisfied,
                tooltip: !this.currentUser.hasAccessToUnsatisfied ? this.$t_locale('components/global/exports/SetupExports')('ExportTypeNotAllowedTooltip') : this.$t_locale('components/global/exports/SetupExports')('ExportUnsatisfiedTooltip')
              },
              {
                id: ExportTypes.CONTACTS,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.CONTACTS}`),
                icon: 'icon-gs-database',
                disabled: !this.currentUser.hasAccessToContacts,
                tooltip: !this.currentUser.hasAccessToContacts ? this.$t_locale('components/global/exports/SetupExports')('ExportTypeNotAllowedTooltip') : this.$t_locale('components/global/exports/SetupExports')('ExportContactsTooltip')
              },
              {
                id: ExportTypes.CONTACTS_MODIFIED,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.CONTACTS_MODIFIED}`),
                icon: 'icon-gs-database',
                disabled: !this.currentUser.hasAccessToContacts,
                tooltip: !this.currentUser.hasAccessToContacts ? this.$t_locale('components/global/exports/SetupExports')('ExportTypeNotAllowedTooltip') : this.$t_locale('components/global/exports/SetupExports')('ExportContactsModifiedTooltip')
              },
              {
                id: ExportTypes.EREPUTATION,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.EREPUTATION}`),
                icon: 'icon-gs-desktop-star',
                disabled: !this.currentUser.hasAccessToEreputation,
                tooltip: !this.currentUser.hasAccessToEreputation ? this.$t_locale('components/global/exports/SetupExports')('ExportTypeNotAllowedTooltip') : this.$t_locale('components/global/exports/SetupExports')('ExportEreputationTooltip')
              },
              {
                id: ExportTypes.AUTOMATION_RGPD,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.AUTOMATION_RGPD}`),
                icon: 'icon-gs-sendBold',
                disabled: !this.currentUser.hasAccessToAutomation,
                tooltip: !this.currentUser.hasAccessToAutomation ? this.$t_locale('components/global/exports/SetupExports')('ExportTypeNotAllowedTooltip') : this.$t_locale('components/global/exports/SetupExports')('ExportAutomationRgpdTooltip')
              },
              {
                id: ExportTypes.AUTOMATION_CAMPAIGN,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.AUTOMATION_CAMPAIGN}`),
                icon: 'icon-gs-sendBold',
                disabled: !this.currentUser.hasAccessToAutomation,
                tooltip: !this.currentUser.hasAccessToAutomation ? this.$t_locale('components/global/exports/SetupExports')('ExportTypeNotAllowedTooltip') : this.$t_locale('components/global/exports/SetupExports')('ExportAutomationCampaignTooltip')
              },
              //conditionnal
              ...!this.isAvailableGaragesShareAllTickets ? [{
                id: ExportTypes.LEADS,
                label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.LEADS}`),
                icon: 'icon-gs-car-repair',
                disabled: !this.currentUser.hasAccessToLeads,
                tooltip: !this.currentUser.hasAccessToLeads ? this.$t_locale('components/global/exports/SetupExports')('ExportTypeNotAllowedTooltip') : this.$t_locale('components/global/exports/SetupExports')('ExportLeadsTooltip')
              }] : [],
              ...this.haveAnAgentInMyGarages && this.isAvailableGaragesSharingTickets ? [
                  {
                    id: ExportTypes.FORWARDED_LEADS,
                    label: this.$t_locale('components/global/exports/SetupExports')(`ExportType_${ExportTypes.FORWARDED_LEADS}`),
                    icon: 'icon-gs-car-repair',
                    disabled: !this.currentUser.hasAccessToLeads,
                    tooltip: !this.currentUser.hasAccessToLeads ? this.$t_locale('components/global/exports/SetupExports')('ExportTypeNotAllowedTooltip') : this.$t_locale('components/global/exports/SetupExports')('ExportForwardedLeadsTooltip')
                  }
              ] : [],
            ],
          },
        ];

        return stepTags;
      },
      fieldsStepFieldsByCategories() {
        if (this.selectedExportType === ExportTypes.AUTOMATION_CAMPAIGN) {
          let isShowLeadField = false;
          if (this.target) {
            isShowLeadField = AutomationCampaignTargets.getProperty(this.target, 'leadDataType') === 'AUTOMATION_VEHICLE_SALE';
          }
          const isAll = this.selectedAutomationCampaigns.find((e) => e.value === 'All');
          const isMaintenance = !!this.selectedAutomationCampaigns.find(({ value }) => {
            return !isAll && AutomationCampaignTargets.getProperty(value, 'leadDataType') === 'AUTOMATION_MAINTENANCE';
          });
          const isVehicleSale = !!this.selectedAutomationCampaigns.find(({ value }) => {
            return !isAll && AutomationCampaignTargets.getProperty(value, 'leadDataType') === 'AUTOMATION_VEHICLE_SALE';
          });
          // hide fields lead if maintenance
          if (isMaintenance) {
            isShowLeadField = false;
          }
          // show lead fields in excel if user choose all campaign or if the lead SaleType is AUTOMATION_VEHICLE_SALE
          if (isAll || isVehicleSale) {
            isShowLeadField = true;
          }
          return Object.keys(fieldsHandler[ExportCategories.BY_DATA]['AUTOMATION']).filter(e => !/RGPD/.test(e)).map((e) => {
            return {
              title: this.$t_locale('components/global/exports/SetupExports')(`FieldsCategory_${e}`),
              fields: fieldsHandler[ExportCategories.BY_DATA]['AUTOMATION'][e].filter((e) => isShowLeadField ? true : !/LEAD/.test(e)).map((f) => {
                return {
                  title: this.$t_locale('components/global/exports/SetupExports')(f),
                  id: f,
                }
              })
            }
          })
        }
        
        if (this.selectedExportType === ExportTypes.AUTOMATION_RGPD) {
          return Object.keys(fieldsHandler[ExportCategories.BY_DATA]['AUTOMATION']).filter(e => !/CAMPAIGN/.test(e)).map((e) => {
            return {
              title: this.$t_locale('components/global/exports/SetupExports')(`FieldsCategory_${e}`),
              fields: fieldsHandler[ExportCategories.BY_DATA]['AUTOMATION'][e].map((f) => {
                return {
                  title: this.$t_locale('components/global/exports/SetupExports')(f),
                  id: f,
                }
              })
            }
          })
        }

        if (this.selectedExportType === ExportTypes.GARAGES) {
          return Object.keys(fieldsHandler[ExportCategories.BY_GARAGES]).map((e) => {
            return {
              title: this.$t_locale('components/global/exports/SetupExports')(`FieldsCategory_${e}`),
              fields: fieldsHandler[ExportCategories.BY_GARAGES][e].map((f) => {
                return {
                  title: this.$t_locale('components/global/exports/SetupExports')(f),
                  id: f,
                }
              }),
            };
          });
        }

        if (ExportHelper.exportTypeIsFrontDeskUsers(this.selectedExportType)) {
          return Object.keys(fieldsHandler[ExportCategories.BY_FRONT_DESK_USERS][this.selectedExportType]).map((e) => {
            return {
              title: this.$t_locale('components/global/exports/SetupExports')(`FieldsCategory_${e}`),
              fields: fieldsHandler[ExportCategories.BY_FRONT_DESK_USERS][this.selectedExportType][e].map((f) => {
                return {
                  title: this.$t_locale('components/global/exports/SetupExports')(f),
                  id: f,
                }
              }),
            };
          });
        }

        // We take a list { foo: ['bar', { field: 'baz', subfields: ['toto', 'tata'] }] }
        // And we transform it into { title: MyFoo, fields: [{ title: MyBar }, { title: MyBaz, subfields: [{ title: MyToto }, { title: MyTata }] }] }
        // With a filter and a sub map on the fields []
        return Object.keys(fieldsHandler[ExportCategories.BY_DATA]).filter(e => !/AUTOMATION/.test(e)).map((e) => {
          return {
            title: this.$t_locale('components/global/exports/SetupExports')(`FieldsCategory_${e}`),
            fields: fieldsHandler[ExportCategories.BY_DATA][e].filter((f) => {
              if (this.isVehicleInspection) {
                return typeof f === 'string'
              } else if (typeof f === 'string' && f.includes('VEHICLE_INSPECTION')) {
                return false
              }

              let ok = false;

              if (!this.selectedDataTypes.length) {
                ok = true;
              }

              const formatedDataTypes = typeof this.selectedDataTypes[0] === 'string' ? this.selectedDataTypes.map(e => {
                return { value : e }
              }) : this.selectedDataTypes;

              if (formatedDataTypes.find((e) => e.value === 'All')) {
                ok = ok || ((typeof f === 'string' && !f.includes('VEHICLE_INSPECTION')) || typeof f === 'object');
              }
              if (formatedDataTypes.find((e) => e.value === DataTypes.MAINTENANCE) || formatedDataTypes.find((e) => e.value === 'All')) {
                ok = ok || ((typeof f === 'string' && !f.includes('VEHICLE_INSPECTION')) || (typeof f === 'object' && f.id.includes('MAINTENANCE')));
              }
              if (formatedDataTypes.find((e) => e.value === DataTypes.NEW_VEHICLE_SALE) || formatedDataTypes.find((e) => e.value === 'All')) {
                ok = ok || ((typeof f === 'string' && !f.includes('VEHICLE_INSPECTION')) || (typeof f === 'object' && f.id.includes('SALE_NEW')));
              }
              if (formatedDataTypes.find((e) => e.value === DataTypes.USED_VEHICLE_SALE) || formatedDataTypes.find((e) => e.value === 'All')) {
                ok = ok || ((typeof f === 'string' && !f.includes('VEHICLE_INSPECTION')) || (typeof f === 'object' && f.id.includes('SALE_USED')));
              }
              return ok;
            }).map((f) => {
              const title = typeof f == 'string' ? f : f.id;
              return {
                title: this.$t_locale('components/global/exports/SetupExports')(title),
                id: typeof f == 'string' ? f : f.id,
                subfields: typeof f === 'string' ? null : f.subfields.map((sf) => {
                  return {
                    title: this.$t_locale('components/global/exports/SetupExports')(sf),
                    id: sf,
                  }
                }),
              }
            }),
          };
        });

      },
      selectedExportNameIsValid() {
        return !!(this.selectedExportName && this.selectedExportName.length >= this.nameMinSize && this.selectedExportName.length <= this.nameMaxSize);
      },
      selectedExportTypeIsValid() {
        return ExportTypes.hasValue(this.selectedExportType);
      },
      temporarySelectedExportTypeIsValid() {
        return ExportTypes.hasValue(this.temporarySelectedExportType);
      },
      temporarySelectedRecipientsIsValid() {
        return this.temporarySelectedRecipients.replace(/\s/g, '').split(';').every((e) => validateEmail(e) === 'OK') ? 'Valid' : 'Invalid';
      },
      selectedRecipientsIsValid() {
        return this.selectedRecipients.replace(/\s/g, '').split(';').every((e) => validateEmail(e) === 'OK');
      },
      recipientsStepErrorDescription() {
        return this.temporarySelectedRecipientsIsValid === 'Valid' ? '' : this.$t_locale('components/global/exports/SetupExports')('RecipientsStepErrorDescription');
      },
      selectedDataTypesAndGaragesAreValid() {
        return (this.disableDataTypesSelector || this.selectedDataTypes.length > 0) && this.selectedGarages.length > 0;
      },
      selectedFrontDeskUsersAreValid() {
        if(ExportHelper.exportTypeIsFrontDeskUsers(this.selectedExportType)) {
          return this.selectedFrontDeskUsers.length > 0;
        }
        return true;
      },
      
      selectedDataTypesAndGaragesAndFrontDeskUsersAreValid() {
        // For Automation, only check if selectedGarages is valid
        return (
          (this.selectedDataTypesAndGaragesAreValid && this.selectedFrontDeskUsersAreValid) ||
          (this.isExportAutomation && this.selectedGarages.length > 0)
        );
      },
      selectedPeriodIsValid() {
        if (this.selectedPeriod && this.selectedPeriod !== 'CustomPeriod') {
          return this.availablePeriods.includes(this.selectedPeriod);
        }
        const startPeriodValid = this.selectedStartPeriod && /^\d\d\d\d-month\d\d$/.test(this.selectedStartPeriod);
        const endPeriodValid = this.selectedEndPeriod && /^\d\d\d\d-month\d\d$/.test(this.selectedEndPeriod);
        return startPeriodValid && endPeriodValid;
      },
      selectedFrequencyIsValid() {
        return this.availableFrequencies.includes(this.selectedFrequency);
      },
      exportTypeStepValidSubLabel() {
        if ([ExportTypes.GARAGES, ExportTypes.FRONT_DESK_USERS_DMS, ExportTypes.FRONT_DESK_USERS_CUSTEED].includes(this.selectedExportType)) {
          return this.$t_locale('components/global/exports/SetupExports')(`ExportType_${this.selectedExportType}`);
        }
        return `${this.$t_locale('components/global/exports/SetupExports')('ExportType_BY_DATA')} / ${this.$t_locale('components/global/exports/SetupExports')(`ExportType_${this.selectedExportType}`)}`;
      },
      fieldsStepValidSubLabel() {
        return this.selectedFields.map((f) => this.$t_locale('components/global/exports/SetupExports')(f.id)).join(', ');
      },
      recipientsStepValidSubLabel() {
        return this.selectedRecipients.split(';').join(', ');
      },
      isAvailableGaragesShareAllTickets() {
        return this.availableGarages.every(g => g.isAgentSharingAllTickets === true);
      },
      haveAnAgentInMyGarages() {
        return this.availableGarages.some(g => g.type === 'Agent');
      },
      isAvailableGaragesSharingTickets() {
        return this.availableGarages.some(g => g.isAAgentSharingHisLeads === true);
      },
      isVehicleInspection() {
        return this.availableGarages.every((g) => g.type === GarageTypes.VEHICLE_INSPECTION);
      },
      disableDataTypesSelector() {
        return this.isVehicleInspection || [ExportTypes.EREPUTATION].includes(this.selectedExportType);
      },
      selectedFieldsIsValid() {
        return this.selectedFields.length > 0;
      },
      formIsValid() {
        return this.selectedExportTypeIsValid && this.selectedDataTypesAndGaragesAndFrontDeskUsersAreValid && this.selectedPeriodIsValid && this.selectedFieldsIsValid && this.selectedRecipientsIsValid;
      },
      temporarySelectedFieldsIsValid() {
        return this.temporarySelectedFields.length > 0;
      },
      isExportAutomation() {
        return [ExportTypes.AUTOMATION_RGPD,ExportTypes.AUTOMATION_CAMPAIGN].includes(this.selectedExportType);
      }
    },

    methods: {
      setActiveStep(step) {
        this.activeStep = step;
      },
      setTemporaryExportTypeStepTag(value) {
        this.temporarySelectedExportType = value;
      },
      setTemporaryFieldsSelected(value) {
        this.temporarySelectedFields = value;
      },
      setSelectedExportName(temporarySelectedExportName = "") {
        this.selectedExportName = `${temporarySelectedExportName}`;
        this.activeStep = null;
        this.trySetFormIsValid(true);
      },
      setSelectedExportType() {
        const hasChanges = this.selectedExportType !== this.temporarySelectedExportType

        this.selectedExportType = `${this.temporarySelectedExportType}`;
        if (hasChanges) {
          this.selectedDataTypes = [];
          this.selectedGarages = [];
          this.selectedFrontDeskUsers = [];
          this.selectedFields = [];
          this.temporarySelectedFields = [];
          this.setDefaultFields();
        }

        if (this.selectedDataTypesAndGaragesAndFrontDeskUsersAreValid) {
          this.setActiveStep(null);
        } else {
          this.setActiveStep("dataTypesAndGaragesAndFrontDeskUsersStep");
        }

        this.trySetFormIsValid(hasChanges);
      },
      flatArray(arr) {
        const res = [];

        for (const elem of arr) {
          res.push(...elem);
        }
        return res;
      },
      setDefaultFields() {
        const source = ExportHelper.getDefaultFields(this.selectedExportType);

        this.temporarySelectedFields = this.flatArray(this.fieldsStepFieldsByCategories.map((c) => {
          const fields = [];
          for (const field of c.fields) {
            if (source.includes(field.id)) {
              fields.push(field);
            }
            if (field.subfields) {
              for (const subfield of field.subfields) {
                if (source.includes(subfield.id)) {
                  fields.push(subfield);
                }
              }
            }
          }
          return fields;
        }));
        this.selectedFields = [...this.temporarySelectedFields];
      },
      cancelExportType() {
        this.temporarySelectedExportType = `${this.selectedExportType}`;
        this.setActiveStep(null);
      },
      setSelectedRecipients() {
        this.selectedRecipients = `${this.temporarySelectedRecipients}`;
        this.setActiveStep(null);
        this.trySetFormIsValid(true);
      },
      cancelRecipients() {
        this.temporarySelectedRecipients = `${this.selectedRecipients}`;
        this.setActiveStep(null);
      },
      setSelectedDataTypesAndGaragesAndFrontDeskUsers(temporarySelectedDataTypes = [], temporarySelectedGarages = [], temporarySelectedFrontDeskUsers = []) {
        this.selectedDataTypes = [...temporarySelectedDataTypes];
        this.selectedGarages = [...temporarySelectedGarages];
        this.selectedFrontDeskUsers = [...temporarySelectedFrontDeskUsers];
        this.setDefaultFields();
        if (this.selectedPeriodIsValid) {
          this.setActiveStep(null);
        } else {
          this.setActiveStep('periodStep');
        }

        this.trySetFormIsValid(true);
      },
      setSelectedPeriodAndFrequency(newSelectedPeriod, newSelectedFrequency = ExportFrequencies.NONE) {
        this.selectedPeriod = `${newSelectedPeriod}`;
        this.selectedFrequency = `${newSelectedFrequency}`;

        if (this.selectedFieldsIsValid) {
          this.setActiveStep(null);
        } else {
          this.setActiveStep('fieldsStep');
        }

        this.trySetFormIsValid(true);
      },
      setSelectedCustomPeriod(newSelectedStart, newSelectedEnd) {
        this.selectedStartPeriod = `${newSelectedStart}`;
        this.selectedEndPeriod = `${newSelectedEnd}`;

        if (this.selectedPeriodIsValid) {
          this.setActiveStep(null);
        } else {
          this.setActiveStep('fieldsStep');
        }

        this.trySetFormIsValid(true);
      },
      setSelectedFields() {
        this.selectedFields = [...this.temporarySelectedFields];

        if (this.selectedRecipientsIsValid) {
          this.setActiveStep(null);
        } else {
          this.setActiveStep('recipientsStep');
        }

        this.trySetFormIsValid(true);
      },
      setSelectedAutomationCampaigns(automationCampaigns = []) {
        const isAll = automationCampaigns.find((e) => e.value === 'All');
        this.selectedAutomationCampaigns = [...automationCampaigns];
        if (isAll) {
          this.selectedAutomationCampaigns = [isAll];
        }
        // keep the last selected if the user cancel
        if (this.selectedAutomationCampaigns.length) {
          this.temporarySelectedCampaigns = [...this.selectedAutomationCampaigns];
        }
        this.trySetFormIsValid(true);
      },
      onValidateSelectedAutomationCampaigns() {
        const isValid = this.selectedAutomationCampaigns.length > 0;
        if (isValid) {
          this.setActiveStep(null);
          this.trySetFormIsValid(true);
        }
      },
      onCancelSelectedAutomationCampaigns() {
        this.selectedAutomationCampaigns = [...this.temporarySelectedCampaigns];
        this.setActiveStep(null);
      },
      cancelFields() {
        this.temporarySelectedFields = [...this.selectedFields];
        this.setActiveStep(null);
      },
      trySetFormIsValid(hasChanges = false) {
        /* simplify the customExport Process, if the user has opened a step, we allow the save without checking if there is a change*/
        if(this.isCustomExport && hasChanges) {
          this.customExportHasChanges = true;
        }
        if (this.setFormIsValid) {
          this.setFormIsValid(this.formIsValid, {
            customExportHasChanges : this.customExportHasChanges,
            selectedExportName: this.selectedExportName,
            selectedExportType: this.selectedExportType,
            selectedDataTypes: this.selectedDataTypes,
            selectedGarages: this.selectedGarages,
            selectedFrontDeskUsers: this.selectedFrontDeskUsers,
            selectedPeriod: this.selectedPeriod,
            selectedFrequency: this.selectedFrequency,
            selectedStartPeriod: this.selectedStartPeriod,
            selectedEndPeriod: this.selectedEndPeriod,
            selectedFields: this.selectedFields,
            selectedRecipients: this.selectedRecipients,
            selectedAutomationCampaigns: this.selectedAutomationCampaigns,
          });
        }
      },
      preFillRequester(source) {
        // Fill final fields
        this.selectedExportName = source.name;
        this.selectedExportType = source.exportType;
        this.selectedDataTypes = [...source.dataTypes];
        this.selectedGarages = [...source.garageIds];
        if (source.frontDeskUsers && source.frontDeskUsers.length) {
          this.selectedFrontDeskUsers = [...source.frontDeskUsers];
        }
        if (source.periodId === 'CustomPeriod' || !source.periodId) {
          this.selectedPeriod = 'CustomPeriod';
          this.selectedStartPeriod = source.startPeriodId;
          this.selectedEndPeriod = source.endPeriodId;
        } else {
          this.selectedPeriod = source.periodId;
          this.selectedStartPeriod = null;
          this.selectedEndPeriod = null;
        }

        this.selectedFrequency = source.frequency || ExportFrequencies.NONE;
        this.selectedFields = this.flatArray(this.fieldsStepFieldsByCategories.map((c) => {
          const fields = [];
          for (const field of c.fields) {
            if (source.fields.includes(field.id)) {
              fields.push(field);
            }
            if (field.subfields) {
              for (const subfield of field.subfields) {
                if (source.fields.includes(subfield.id)) {
                  fields.push(subfield);
                }
              }
            }
          }
          return fields;
        }));

        this.selectedRecipients = source.recipients ? source.recipients.join(';') : (this.currentUser && this.currentUser.email);
          // Fill temporary fields
        this.temporarySelectedExportType = this.selectedExportType;
        this.temporarySelectedFields = this.selectedFields;
        this.temporarySelectedRecipients = this.selectedRecipients;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .setup-exports {
    &__multiselect {
      max-width: 560px;
      margin-top: 2rem;

      &:first-child {
        margin-bottom: 2rem;
      }
    }
    &__centered-button-container {
      display:flex;
      justify-content: center;
      flex-direction: row;
    }
    &__active-period-date-container {
      display:flex;
      flex-direction: row;

      &__start-input {
        margin-right: 1.5rem;
      }
      &__checkbox {
        margin-top: 1rem;
        padding-left: 1.5rem;
        font-weight: 700;
        font-size: 1rem!important;
      }
    }
    &__body-container {
      display: flex;
      flex-direction: row;
      width: 100%;
      max-height: 65vh;
    }
  }
</style>
