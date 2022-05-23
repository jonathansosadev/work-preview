<template>
  <div class="button-export__wrapper" v-tooltip="{ content: tooltipContent }">
    <Button
      type="contained-dark-grey"
      @click="openModal"
      :disabled="disabled"
    >
      <template v-if="!tiny">
        <template slot="left">
          <i class="icon-gs-cloud-download" v-if="!loading" />
          <i class="icon-gs-cog" v-else />
        </template>
        <AppText v-if="label" tag="span" bold>{{ label }}</AppText>
      </template>
      <template v-else>
          <i class="icon-gs-cloud-download" v-if="!loading" />
      </template>
    </Button>
  </div>
</template>

<script>
  import { ExportTypes } from '../../../utils/enumV2';
  import { isGarageScoreUserByEmail } from '../../../../common/lib/garagescore/custeed-users';
  import { garagesValidator } from '~/utils/components/validators';

  export default {
    name: 'ButtonExport',
    props: {
      fetchCustomExports: {
        type: Function,
        default: () => {}
      },
      shortcutExportPayload: {
        type: Object,
        default: () => null,
      },
      availableGarages: {
        type: Array,
        default: () => [],
      },
      availableFrontDeskUsers: {
        type: Array,
        default: () => [],
      },
      exportGetAvailableFrontDeskUsers: {
        type: Function,
        default: () => console.error('ModalExports.vue :: exportGetAvailableFrontDeskUsers not set')
      },
      currentUser: {
        type: Object,
        default: () => ({}),
      },
      customExports: {
        type: Array,
        default: () => [],
      },
      availableAutomationCampaigns: {
        type: Array,
        default: () => [],
      },
      openModalFunction: {
        type: Function,
        default: () => console.error('ButtonExport.vue :: openModalFunction not set')
      },
      openCustomExportModalFunction: {
        type: Function,
        default:() => console.error('ButtonExport:vue :: openCustomExportModalFunction not set')
      },
      closeModalFunction: {
        type: Function,
        default: () => console.error('ButtonExport.vue ::closeModalFunction not set')
      },
      startExportFunction: {
        type: Function,
        default: () => console.error('ButtonExport.vue :: startExportFunction not set')
      },
      saveCustomExportFunction: {
        type: Function,
        default: () => console.error('ButtonExport.vue :: saveCustomExportFunction not set')
      },
      updateCustomExportFunction: {
        type: Function,
        default: () => console.error('ButtonExport.vue :: updateCustomExportFunction not set')
      },
      deleteCustomExportFunction: {
        type: Function,
        default: () => console.error('ButtonExport.vue :: updateCustomExportFunction not set')
      },
      selectedExportType: {
        type: String,
        default: ''
      },
      isAutomation: {
        type: Boolean,
        default: false
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
      return  {
        loading: false
      }
    },

    computed: {
      label() {
        return this.isAutomation ? this.$t_locale('components/global/exports/ButtonExport')('ExportLabelRgpd') : this.$t_locale('components/global/exports/ButtonExport')('ExportLabel');
      },
      availableSoon() {
        return this.shortcutExportPayload && this.shortcutExportPayload.availableSoon;
      },
      tiny() {
        return this.$store.getters["sidebarTiny"];
      },
      disabled() {
        if (this.selectedExportType === ExportTypes.ADMIN_USERS) {
          return !this.$store.getters["cockpit/admin/users/users"].length || !!isGarageScoreUserByEmail(this.currentUser.email);
        }
        return this.availableSoon;
      },
      tooltipContent() {
        if (this.availableSoon) {
          return this.$t_locale('components/global/exports/ButtonExport')('AvailableSoon');
        } else if (this.disabled && !!isGarageScoreUserByEmail(this.currentUser.email)) {
          return this.$t_locale('components/global/exports/ButtonExport')('ConnectAs');
        }
        return '';
      },
    },

    methods: {
      openModalExports() {
        this.openModalFunction({
          component: 'ModalExports',
          adaptive: true,
          props: {
            shortcutExportPayload: this.shortcutExportPayload,
            availableGarages: this.availableGarages,
            availableFrontDeskUsers: this.availableFrontDeskUsers,
            exportGetAvailableFrontDeskUsers: this.exportGetAvailableFrontDeskUsers,
            currentUser: this.currentUser,
            customExports: this.customExports,
            openModalFunction: this.openModalFunction,
            openCustomExportModalFunction: this.openCustomExportModalFunction,
            closeModalFunction: this.closeModalFunction,
            startExportFunction: this.startExportFunction,
            saveCustomExportFunction: this.saveCustomExportFunction,
            updateCustomExportFunction: this.updateCustomExportFunction,
            deleteCustomExportFunction: this.deleteCustomExportFunction,
            availableAutomationCampaigns: this.availableAutomationCampaigns,
            fetchCustomExports: this.fetchCustomExports,
            garageIds: this.garageIds,
            selectedTags: this.selectedTags,
            optionSelected: this.optionSelected
          }
        });
      },
      openModalAdminExports() {
        this.openModalFunction({
          component: 'ModalConfirmEmail',
          adaptive: true,
          props: {
            currentUser: this.currentUser,
            openModalFunction: this.openModalFunction,
            closeModalFunction: this.closeModalFunction,
            startExportFunction: this.startExportFunction,
            selectedExportType: this.selectedExportType,
          }
        });
      },
      openModal() {
        [ExportTypes.ADMIN_USERS, ExportTypes.ADMIN_GARAGES].includes(this.selectedExportType) ? this.openModalAdminExports() : this.openModalExports();
      }
    },

  }
</script>

<style lang="scss" scoped>

.button-export {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  background-color: $dark-grey;
  padding: .7rem;
  color: $white;
  border: none;
  font-size: 1rem;
  outline: 0px;
  cursor: pointer;

}

.position-relative {
  position: relative;
  top: 1px;
}
</style>


