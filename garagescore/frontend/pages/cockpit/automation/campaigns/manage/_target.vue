<template>
  <div class="page-automation-manage-campaigns">
      <HeaderNavFolder
        class="page-automation-manage-campaigns__nav"
        routeList="cockpit-automation-campaigns"
      />

      <div class="page-automation-manage-campaigns__header">
        <div class="page-automation-manage-campaigns__title">
          <AppText tag="span" bold size="lg">{{ $t_locale('pages/cockpit/automation/campaigns/manage/_target')('Title') }}</AppText>
          <DropdownAutomationCampaignsTarget
            class="page-automation-manage-campaigns__title__dropdown"
            :availableTargets="availableTargets"
            :currentTargetName="currentTargetName"
            :tagType="tagType"
          />
        </div>

        <div class="page-automation-manage-campaigns__subtitle">
          <AppText tag="div" type="muted" bold>{{ $t_locale('pages/cockpit/automation/campaigns/manage/_target')('Subtitle') }}</AppText>
        </div>

        <div>
            <Button type="contained-white" v-on:click="openModalCustomContent()" :disabled="loading" track-id="customContentManagement" >
            <template>
              <template slot="left">
                <i track-id="customContentManagement" class="icon-gs-edit" />
              </template>
              <AppText tag="span" track-id="customContentManagement" bold>{{ $t_locale('pages/cockpit/automation/campaigns/manage/_target')('CustomContentManagement') }}</AppText>
            </template>
            </Button>
        </div>
      </div>

      <div class="page-automation-manage-campaigns__table">
        <AutomationCampaignManagementTable
          :garagesSubscriptionStatus="garagesSubscriptionStatus"
          :campaignList="campaignList"
          :customContentList="customContents"
          :dropdownSelectorStatusCallback="dropdownSelectorStatusCallback"
          :dropdownSelectorContactCallback="dropdownSelectorContactCallback"
          :dropdownSelectorCustomContentCallback="dropdownSelectorCustomContentCallback"
          :addCustomContentCallback="addCustomContentCallback"
          :loading="loading"
          :displayPreview="displayPreview"
        />
      </div>
  </div>
</template>

<script>
  import { makeApolloQueries, makeApolloMutations } from "~/util/graphql";
  import HeaderNavFolder from "~/components/global/HeaderNavFolder";
  import { AutomationCampaignStatuses } from '~/utils/enumV2';
  import AutomationCampaignManagementTable from "~/components/cockpit/automation/AutomationCampaignManagementTable";
  import DropdownAutomationCampaignsTarget from '~/components/cockpit/automation/DropdownAutomationCampaignsTarget';
  import { isOnMobileDevice } from '~/utils/is-on-mobile-device.js';
  import { setupHotJar } from '../../../../../util/externalScripts/hotjar'

  export default {
    name: "AutomationTargetPage",
    components: {
      HeaderNavFolder,
      AutomationCampaignManagementTable,
      DropdownAutomationCampaignsTarget,
    },
    inheritAttrs: false,
    middleware: ['hasAccessToAutomation'],

    async mounted() {
      setupHotJar(this.$store.getters["locale"], 'automation');
      const allowAMCampaignManagement = window && window.allowAMCampaignManagement
      if (isOnMobileDevice() || (this.isCusteedUser && !allowAMCampaignManagement)) {
        if (isOnMobileDevice()) alert(this.$t_locale('pages/cockpit/automation/campaigns/manage/_target')('unavailableForMobile'))
        if (this.isCusteedUser) {
          alert("Cette interface est désactivée pour les utilisateurs custeed (allowAMCampaignManagement)")
        }
        await this.$router.push({ name: 'cockpit-automation' });
        return;
      }
      this.refreshView()
    },

    data() {
      return {
        availableTargets: [],
        campaignList: [],
        customContents: [],
        loading: true,
        customContentId: null,
      };
    },

    computed: {
      target() {
        return this.$route.params.target;
      },
      garagesSubscriptionStatus() {
        const availableGarages = this.$store.getters["cockpit/availableGarages"] || [];
        return availableGarages.map((garage) => ({
          id: garage.id.toString(),
          isSubscribedToAutomation: garage.subscriptions && garage.subscriptions.Automation
        }))
      },
      isCusteedUser() {
        return this.$store.getters['auth/currentUserEmail'].includes('@garagescore')
           || this.$store.getters['auth/currentUserEmail'].includes('@custeed');

      },
      currentTargetName() {
        const tag = this.tagType(this.target);
        return `${this.$t_locale('pages/cockpit/automation/campaigns/manage/_target')(this.target)} - ${this.$t_locale('pages/cockpit/automation/campaigns/manage/_target')(tag)}`;
      },
      selectedCampaignType() { return this.$store.getters['cockpit/selectedAutomationCampaignType']; },
    },
    methods: {
      async refreshView () {
        this.setLoading(true);
          await Promise.all([
            this.fetchCampaignListForSpecificTarget(this.target, []),
            this.fetchAvailableTargets(),
          ]);
        this.setLoading(false);
      },
      displayPreview(customContentId) {
        const garageList = this.campaignList.filter((e) => e.contactType === 'EMAIL' && !(e.hidden)).map((e) => ({
            label: e.garageName,
            value: e.garageId,
            customContentId: e.customContentId && e.customContentId.toString(),
            garageLogo: e.garageLogo,
            garageBrand: e.garageBrand,
            disabled : !(e.status === AutomationCampaignStatuses.IDLE || e.status === AutomationCampaignStatuses.RUNNING)
        }));
        this.$store.dispatch("openModal", {
          component: "ModalCustomContent",
          adaptive: true,
          props: {
            availableGarages: garageList,
            availableCustomContents: this.customContents,
            previewCustomContentId: customContentId,
            target: this.target,
            onSave: this.saveCustomContent,
            onDelete: this.deleteCustomContent,
            isLoading: this.isLoading
          },
        });
      },
      setLoading(value) {
        this.loading = value;
        this.$store.dispatch('cockpit/setLoadingForAutomationCustomContent', { value })
      },
      isLoading() {
        return this.$store.getters['cockpit/loadingForAutomationCustomContent'];
      },
      async saveCustomContent(saveFile, garagesHaveBeenPreselected) {
        this.setLoading(true);
        this.customContentId = saveFile.customContentId;
        const startDate = new Date(saveFile.activePeriod.startDate);
        const endDate = saveFile.activePeriod.endDate && new Date(saveFile.activePeriod.endDate);
        const dayNumberStart = Math.floor(startDate.getTime() / 8.64e7);
        const dayNumberEnd = endDate && Math.floor(endDate.getTime() / 8.64e7);
        const affectedGarageIds = saveFile.garages && saveFile.garages.length ? saveFile.garages.map((e) => e.value) : [];
        const request = {
          name: 'AutomationCampaignsSetCustomContent',
          args: {
            target: this.target,
            affectedGarageIds: affectedGarageIds,
            displayName: saveFile.name,
            promotionalMessage: saveFile.customContent.promotionalMessage,
            themeColor: saveFile.customContent.themeColor,
            dayNumberStart,
            dayNumberEnd,
            noExpirationDate: !!(saveFile.activePeriod.noExpirationDate),
            customContentId: saveFile.customContentId,
            customUrl: saveFile.customUrl,
            customButtonText: saveFile.customButtonText,
          },
          fields:
            `
            result
          `
        };
        const resp = await makeApolloMutations([request]);
        if (resp && resp.errors && resp.errors.length) {
          alert(resp.errors[0].message);
        }
        // end request
        await this.fetchCampaignListForSpecificTarget(this.target, affectedGarageIds);
        this.setLoading(false);
        if (!garagesHaveBeenPreselected) {
          this.openModalCustomContent();
        }
      },
      async deleteCustomContent(customContentId) {
        const request = {
          name: 'AutomationCampaignsDeleteCustomContent',
          args: {
            customContentId
          },
          fields:
            `
            result
          `
        };
        this.setLoading(true);
        const resp = await makeApolloMutations([request]);
        if (resp && resp.errors && resp.errors.length) {
          alert(resp.errors[0].message);
          return;
        }
        this.customContents = this.customContents.filter((customContent) => customContent.id !== customContentId);
        this.campaignList = this.campaignList.map((c) => {
          if (c.customContentId === customContentId) c.customContentId = null;
          return c;
        });
        this.setLoading(false);
        this.openModalCustomContent();
      },
      addCustomContentCallback(preselectedGarages) {
        const garageList = this.campaignList.filter((e) => e.contactType === 'EMAIL' && !(e.hidden)).map((e) => ({
            label: e.garageName,
            value: e.garageId,
            customContentId: e.customContentId && e.customContentId.toString(),
            garageLogo: e.garageLogo,
            garageBrand: e.garageBrand,
            disabled : !(e.status === AutomationCampaignStatuses.IDLE || e.status === AutomationCampaignStatuses.RUNNING)
        }));
        this.$store.dispatch("openModal", {
          component: "ModalCustomContent",
          adaptive: true,
          props: {
            availableGarages: garageList,
            availableCustomContents: this.customContents,
            target: this.target,
            onSave: this.saveCustomContent,
            onDelete: this.deleteCustomContent,
            preselectedGarages,
            isLoading: this.isLoading
          },
        });
      },
      openModalCustomContent() {
        const garageList = this.campaignList.filter((e) => e.contactType === 'EMAIL' && !(e.hidden)).map((e) => ({
            label: e.garageName,
            value: e.garageId,
            customContentId: e.customContentId && e.customContentId.toString(),
            garageLogo: e.garageLogo,
            garageBrand: e.garageBrand,
            disabled : !(e.status === AutomationCampaignStatuses.IDLE || e.status === AutomationCampaignStatuses.RUNNING)
        }));
        this.$store.dispatch("openModal", {
          component: "ModalCustomContent",
          adaptive: true,
          props: {
            availableGarages: garageList,
            availableCustomContents: this.customContents,
            target: this.target,
            onSave: this.saveCustomContent,
            onDelete: this.deleteCustomContent,
            isLoading: this.isLoading
          }
        });
      },
      async dropdownSelectorStatusCallback(selectedGarages, status, loadingDisplay) {
        if (selectedGarages && selectedGarages.length) {
          return this.toggleCampaignsStatus(this.target, selectedGarages, status, null, loadingDisplay);
        }
      },
      async dropdownSelectorContactCallback(selectedGarages, channelType, loadingDisplay) {
        if (selectedGarages && selectedGarages.length) {
          return this.toggleCampaignsStatus(this.target, selectedGarages, null, channelType, loadingDisplay);
        }
      },
      async dropdownSelectorCustomContentCallback(selectedGarages, customContentId) {
        if (selectedGarages && selectedGarages.length) {
          return this.assignCustomContentToCampaigns(this.target, selectedGarages, customContentId)
        }
      },
      async fetchCampaignListForSpecificTarget(target, affectedGarageIds) {
        const request = {
          name: 'AutomationGetCampaignsForSpecificTarget',
          args: {
            target,
            affectedGarageIds,
          },
          fields:
            `
          garageId
          garageName
          status
          contactType
          runDate
          customContentId
          garageLogo
          garageBrand
          `
        };
        const resp = await makeApolloQueries([request]);
        this.setCampaignList(resp, affectedGarageIds);
        await this.fetchCustomContents([...new Set(this.campaignList.filter((c) => c.garageId).map((c) => c.garageId))]);
      },
      setCampaignList(resp, affectedGarageIds ) {
        if (affectedGarageIds && affectedGarageIds.length) {
          // remove previous garage assigned
          this.campaignList = this.campaignList
            .filter((campaign) => !affectedGarageIds.includes(campaign.garageId.toString()))
            .map(((campaign) => {
              if (campaign.customContentId === this.customContentId) {
                campaign.customContentId = null;
              }
              return campaign;
            }));
          this.campaignList = [...this.campaignList, ...resp.data.AutomationGetCampaignsForSpecificTarget];
        } else {
          this.campaignList = resp.data.AutomationGetCampaignsForSpecificTarget;
        }
      },
      async fetchCustomContents(garageIds) {
        const request = {
          name: 'AutomationGetCustomContents',
          args: {
            garageIds,
            target: this.target
          },
          fields:
            `
            id,
            displayName
            target
            promotionalMessage
            themeColor
            startAt
            endAt
            noExpirationDate
            createdBy
            createdAt
            lastModifiedBy
            lastModifiedAt
            activeGarageIds
            allTimeGarageIds
            customUrl
            customButtonText
          `
        };
        const resp = await makeApolloQueries([request]);
        this.customContents = resp.data.AutomationGetCustomContents;
      },
      async assignCustomContentToCampaigns(target, garageIds, customContentId) {
        this.setLoading(true);
        const mutation = {
          name: 'AutomationCampaignsAssignCustomContentToCampaigns',
          args: {
            target,
            garageIds,
            customContentId: customContentId === 'nothing' ? null : customContentId
          },
          fields:
            `
            modifiedGarageIds
          `
        };
        const resp = await makeApolloMutations([mutation]);
        if (resp.errors && resp.errors.length) {
          console.error('Problem while associating customContents : ', resp.errors);
          this.setLoading(false);
          return;
        }
        await this.fetchCustomContents([...new Set(this.campaignList.filter((c) => c.garageId).map((c) => c.garageId))]);
        for (const campaign of this.campaignList) {
          if (garageIds.includes(campaign.garageId)) {
            campaign.customContentId = customContentId === 'nothing' ? null : customContentId
          }
        }
        this.setLoading(false);
      },
      async toggleCampaignsStatus(target, garageIds, status = null, channelType = null, loadingDisplay = true) {
        if (loadingDisplay) {
          this.setLoading(true);
        }
        const mutation = {
          name: 'AutomationCampaignsToggleStatus',
          args: {
            target,
            garageIds,
            status,
            channelType,
          },
          fields:
            `
            garageId
            garageName
            status
            contactType
            runDate
            customContentId
            garageLogo
            garageBrand
          `
        };
        const resp = await makeApolloMutations([mutation]);
        this.campaignList = resp.data.AutomationCampaignsToggleStatus;
        await this.fetchCustomContents([...new Set(this.campaignList.filter((c) => c.garageId).map((c) => c.garageId))]);
        this.setLoading(false);
      },
      async fetchAvailableTargets() {
        const request = {
          name: 'AutomationAvailableTargets',
          args: {
            dataType: this.selectedCampaignType
          },
          fields:
            `
            name
            id
          `
        };
        const resp = await makeApolloQueries([request]);
        this.availableTargets = resp.data.AutomationAvailableTargets.sort((a, b) => a.name.localeCompare(b.name));
      },
      tagType (campaignType) {
        if(/NVS/.test(campaignType)) {
          return 'vn';
        }
        if(/UVS/.test(campaignType)) {
          return 'vo';
        }
        return 'apv';
      },
    },
    watch: {
      '$route.params.target': {
        async handler() {
          await this.refreshView();
        },
        immediate: true,
      }
    }
  }
</script>

<style lang="scss" scoped>
  .page-automation-manage-campaigns {
    position: relative;
    height: 100%;

    &__title {
      display: flex;
      flex-direction: row;

      &__dropdown {
        position: relative;
        top: -0.4rem;
      }
    }
    &__nav {
      width: 100%!important;
    }

    &__header {
      padding: 1.5rem 1rem 0 1rem;
    }

    &__subtitle {
      margin-bottom: 1rem;
    }

  }
</style>
