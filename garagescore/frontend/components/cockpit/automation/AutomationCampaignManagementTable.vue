<template>
  <div class="automation-campaign-management-table">

    <Searchbar
      class="automation-campaign-management-table__searchbar"
      :options="filterOptions"
      :filters="computedActiveFilters"
      :filtersDisabled="false"
      noValue
      @filtersChange="onFiltersChange"
      @input="debounceSearchChange"
      :placeholderString="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('SearchbarPlaceholder')"
    />
  <div class="automation-campaign-management-table__component">
    <!-- HEADER -->
    <div class="automation-campaign-management-table__component__row automation-campaign-management-table__component__row__header">
      <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__header__checkbox-box automation-campaign-management-table__component__column__checkbox-box desktop">
        <CheckBox @change="toggleAllGarages" :checked="areAllGaragesSelected"/>
      </div>
      <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__header__garage automation-campaign-management-table__component__column__garage desktop">
        <label class="label-line label-line-header" @click.prevent="toggleAllGarages">{{ selectedGaragesLabel }}</label>
      </div>
<!--      <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__header__garage mobile">
        <input class="check-with-label" type="checkbox" id="customContent" @click="toggleAllGarages"/>
        <label for="customContent"></label>
      </div>-->
      <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__header__status automation-campaign-management-table__component__column__status ">
        <DropdownSelector
          :title="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorStatusTitle')"
          :subtitle="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorStatusSubtitle')"
          icon="icon-gs-setting-toggle"
          :callback="dropdownSelectorStatusInternCallback"
          :items="dropdownSelectorStatusItems"
          :disabled="Object.keys(selectedGarages).filter((k) => selectedGarages[k]).length <= 0"
          :disabledTooltip="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('DisabledTooltip')"
          type="automation"
        />
      </div>
      <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__contact">
        <DropdownSelector
          :title="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorContactTitle')"
          :subtitle="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorContactSubtitle')"
          icon="icon-gs-phone-email"
          :callback="dropdownSelectorContactInternCallback"
          :items="dropdownSelectorContactItems"
          :disabled="Object.keys(selectedGarages).filter((k) => selectedGarages[k]).length <= 0"
          :disabledTooltip="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('DisabledTooltip')"
          type="automation"
        />
      </div>
      <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__content automation-campaign-management-table__component__column__header__content">
        <DropdownSelector
          :title="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorContentTitle')"
          :subtitle="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorContentSubtitle')"
          icon="icon-gs-file-multiple"
          :callback="dropdownSelectorCustomContentInternalCallback"
          :items="dropdownSelectorContentItems"
          :fixedFooter="dropdownSelectorContentFixedFooter"
          :disabled="Object.keys(selectedGarages).filter((k) => selectedGarages[k]).length <= 0"
          :disabledTooltip="$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('DisabledTooltip')"
          type="automation"
          size="large"
        />
      </div>
      <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__preview">
      </div>
      <div class="custom-scrollbar-margin"></div>
    </div>

    <!-- ROWS -->
        <div class="body custom-scrollbar">
          <template v-if="isLoading">
            <TableRowAutomationSkeleton v-for="n in 10"  :key="n" :columnCount="3" fixedHeight="61px" addSmallEndElement/>
          </template>
          <template v-else>
            <div v-if="noResult" class="automation-campaign-management-table__component__no-result">{{ $t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('NoResult') }}</div>
            <div :key="line.garageId" class="automation-campaign-management-table__component__row desktop" v-for="line in lines" v-show="isLineDisplayed(line.garageId)">
              <div :style="line.cursorStyle" @click.prevent="toggleSelectedGarage(line.garageId, line.isCheckable)" :class="`${garageClass[line.garageId]} ${line.isCheckable ? '' : 'automation-campaign-management-table__component__column__garage--disabled'}`" class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__checkbox-box">
                <CheckBox @click.prevent="toggleSelectedGarage(line.garageId, line.isCheckable)" :style="line.cursorStyle" :checked="selectedGarages[line.garageId]" :disabled="!(line.isCheckable)"/>
              </div>
              <div :style="line.cursorStyle" @click.prevent="toggleSelectedGarage(line.garageId, line.isCheckable)" :class="`${garageClass[line.garageId]} ${line.isCheckable ? '' : 'automation-campaign-management-table__component__column__garage--disabled'}`" class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__garage">
                <label :style="line.cursorStyle" class="label-line" :for="line.garageId" >{{ line.garageName }}</label>
              </div>
              <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__status">
                <StatusDiode class="automation-campaign-management-table__component__column__status__diode-garage" :status="getTranslationValue(line, 'campaignStatus')" :diode="line.campaignDiode" :tooltip="line.campaignTooltip">
                    <template slot="icon" v-if="line.displayIconTooltip">
                      <i class="icon-gs-help"/>
                    </template>
                </StatusDiode>
              </div>
              <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__contact">
                {{ getTranslationValue(line, 'contactType')}}
              </div>
              <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__content">
                {{ line.customContentDisplayName }}
              </div>
              <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__preview">
                <Button type="icon-btn" v-if="line.customContentDisplayName" @click="displayPreview(line.customContent.id)"><i class="icon-gs-eye"></i></Button>
              </div>
            </div>
          </template>

<!--      <div class="mobile" v-for="garageId in Object.keys(computedTable)" :key="garageId">
        <div class="automation-campaign-management-table__component__row">
            <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__garage">
              <input class="check-with-label" type="checkbox" :id="garageId" :value="garageId" v-model="selectedGarages">
              <label class="label-for-check" :for="garageId">{{ displayGarageName(garageId) }}</label>
            </div>
        </div>
        <div class="automation-campaign-management-table__component__row">
            <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__status">
              <StatusDiode :status="getCampaignStatus(garageId)" :diode="getCampaignDiode(garageId)" :tooltip="getCampaignTooltip(garageId)"/>
            </div>
            <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__contact">
              {{ displayContactType(garageId) }}
            </div>
            <div class="automation-campaign-management-table__component__column automation-campaign-management-table__component__column__content">
              {{ displayCustomContent(garageId) }}
            </div>
        </div>
      </div>-->

    </div>
  </div>
  </div>

</template>

<script>
  import TableRowAutomationSkeleton from '~/components/global/skeleton/TableRowAutomationSkeleton';
  import DropdownSelector from '~/components/global/DropdownSelector';
  import { AutomationCampaignStatuses } from "~/utils/enumV2";
  import AutomationCampaignChannelTypes from "../../../../common/models/automation-campaign-channel.type";
  import Searchbar from '~/components/ui/searchbar/Searchbar';
  import Vue from 'vue'
  import { isEqual } from 'lodash';

  export default {
    name: 'AutomationCampaignManagementTable',
    components: { DropdownSelector, Searchbar, TableRowAutomationSkeleton },

    data() {
      return {
        selectedGarages: {},
        hasCustomContent: {},
        garageClass: {},
        debounceSearch: '',
        debounceInterval: null,
        search: '',
        loadingCampaignList: false,
        activeFilters: {
          status: null,
          contact: null,
          customContent: null,
        },
        blocked: false,
        selectedGaragesLabel: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('ToggleAll'),
        areAllGaragesSelected: false,
        selectionHavingCustomContent: 0,
      };
    },

    props: {
      garagesSubscriptionStatus: Array,
      campaignList: Array,
      customContentList: Array,
      dropdownSelectorStatusCallback: Function,
      dropdownSelectorContactCallback: Function,
      dropdownSelectorCustomContentCallback: Function,
      addCustomContentCallback: Function,
      loading: Boolean,
      displayPreview: Function
    },

    watch: {
      campaignList() {
        this.emptySelectedGarages();
      },
      debounceSearch() {
        if (this.debounceInterval) {
          clearInterval(this.debounceInterval)
        }
        this.debounceInterval = setTimeout( () => {
          this.search = this.debounceSearch;
          this.onSearchChange();
        }, 350);
      }
    },
    computed: {
      isLoading() {
        return this.loadingCampaignList || this.loading
      },
      noResult() {
        for (const line of this.lines) {
          if (this.isLineDisplayed(line.garageId)) {
            return false;
          }
        }
        return true;
      },
      computedActiveFilters() {
        const result = {};

        if (this.activeFilters.status) {
          result.status = this.activeFilters.status;
        }

        if (this.activeFilters.contact) {
          result.contact = this.activeFilters.contact;
        }

        if (this.activeFilters.customContent) {
          result.customContent = this.activeFilters.customContent;
        }
        return result;
      },
      lines() {
        this.selectedGarages = {};
        this.garageClass = {};
        const lines = [];
        for (const garageId of Object.keys(this.computedTable)) {
          const garageName = this.displayGarageName(garageId);
          const campaignStatus = this.getCampaignStatus(garageId);
          const campaignEmail = this.computedTable[garageId].campaigns[AutomationCampaignChannelTypes.EMAIL];
          const campaignMobile = this.computedTable[garageId].campaigns[AutomationCampaignChannelTypes.MOBILE];
          const customContentId = campaignEmail && campaignEmail.customContentId;
          const customContent = this.customContentList && this.customContentList.find((customContent) => customContent.id === customContentId)
          const runDate = (campaignEmail && campaignEmail.runDate) || (campaignMobile && campaignMobile.runDate);
          const isCheckable = campaignStatus === AutomationCampaignStatuses.IDLE || campaignStatus === AutomationCampaignStatuses.RUNNING
          const cursorStyle = isCheckable ? { cursor: "pointer" } : { cursor: "not-allowed" }
          const displayItem = {
            garageId,
            garageName,
            campaignStatus,
            campaignDiode: this.getCampaignDiode(campaignStatus),
            campaignTooltip: this.getCampaignTooltip(garageId, campaignStatus, runDate),
            displayIconTooltip: campaignStatus === AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC || campaignStatus === AutomationCampaignStatuses.CANCELLED,
            contactType: this.getContactType(garageId),
            customContent,
            customContentDisplayName: (customContent && customContent.displayName) || '',// this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('None'),
            search: `${garageName.toLowerCase()}${garageId.toLowerCase()}`,
            isCheckable,
            cursorStyle
          };
          if (displayItem.customContent) {
            this.hasCustomContent[garageId] = true;
          } else {
            this.hasCustomContent[garageId] = false;
          }
          lines.push(displayItem);
        }
        return lines;
      },
      isLineOkWithSearch() {
        let result = {}
        let search = this.search.toLowerCase();
        for (const line of this.lines) {
          // Compute Search
          if (search) {
            if (line.search.includes(search)) {
              result[line.garageId] = true;
            }
          } else {
            result[line.garageId] = true;
          }
        }
        return result;
      },
      isLineOkWithStatus() {
        let result = {}
        for (const line of this.lines) {
          if (this.activeFilters.status) {
              if (line.campaignStatus === this.activeFilters.status) {
                result[line.garageId] = true;
              }
          } else {
            result[line.garageId] = true;
          }
        }
        return result;
      },
      isLineOkWithContactType() {
        let result = {}
        for (const line of this.lines) {
          if (this.activeFilters.contact) {
            if (this.activeFilters.contact === line.contactType) {
              result[line.garageId] = true;
            }
          } else {
            result[line.garageId] = true;
          }
        }
        return result;
      },
      isLineOkWithCustomContent() {
        let result = {}
        for (const line of this.lines) {
          if (this.activeFilters.customContent) {
            if (this.activeFilters.customContent === 'nothing' && !(line.customContent)) {
              result[line.garageId] = true;
            } else if (line.customContent && line.customContent.id === this.activeFilters.customContent) {
              result[line.garageId] = true;
            }
          } else {
            result[line.garageId] = true;
          }
        }
        return result;
      },
      filterOptions(){
        return [
          {
            icon: 'icon-gs-setting-toggle',
            label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorStatusTitle'),
            key: 'status',
            values: [
              {
                label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')(AutomationCampaignStatuses.RUNNING),
                value: AutomationCampaignStatuses.RUNNING
              },
              {
                label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')(AutomationCampaignStatuses.IDLE),
                value: AutomationCampaignStatuses.IDLE
              },
              {
                label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')(AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC),
                value: AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC
              },
              {
                label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')(AutomationCampaignStatuses.CANCELLED),
                value: AutomationCampaignStatuses.CANCELLED
              }
            ]
          },
          {
            icon: 'icon-gs-phone-email',
            label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorContactTitle'),
            key: 'contact',
            values: [
              ...this.dropdownSelectorContactItems,

            ]
          },
          {
            icon: 'icon-gs-file-multiple',
            label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorContentTitle'),
            key: 'customContent',
            values: this.dropdownSelectorContentItems
          },
        ];
      },
      computedTable() {
        const garagesObject = {};

        this.campaignList.sort((a, b) => {
          if (a.garageName < b.garageName) {
            return -1;
          }
          if (a.garageName > b.garageName) {
            return 1;
          }
          return 0;
        }).forEach((campaign) => {
          garagesObject[campaign.garageId] = garagesObject[campaign.garageId] || { garageName: campaign.garageName, campaigns: {} };
          garagesObject[campaign.garageId].campaigns[campaign.contactType] = campaign;
        });
        return garagesObject;
      },
      dropdownSelectorStatusItems() {
        return [{
          id: AutomationCampaignStatuses.RUNNING,
          status: AutomationCampaignStatuses.RUNNING,
          label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorStatusActivate')
        }, {
          id: AutomationCampaignStatuses.IDLE,
          status: AutomationCampaignStatuses.IDLE,
          label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorStatusDeactivate')
        }];
      },
      dropdownSelectorContactItems() {
        return [{
          id: AutomationCampaignChannelTypes.EMAIL,
          channelType: AutomationCampaignChannelTypes.EMAIL,
          label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorContactEmail')
        }, {
          id: AutomationCampaignChannelTypes.MOBILE,
          channelType: AutomationCampaignChannelTypes.MOBILE,
          label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorContactSms')
        }, {
          id: AutomationCampaignChannelTypes.BOTH,
          channelType: AutomationCampaignChannelTypes.BOTH,
          label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('dropdownSelectorContactEmailAndSms')
        }];
      },
      dropdownSelectorContentItems() {
        return (this.customContentList && [...(this.customContentList.map((customContent) => ({
          id: customContent.id,
          label: customContent.displayName,
          customContentId: customContent.id
        }))), {
          id: "nothing",
          customContentId: "nothing",
          label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('None')
        }]) || [];
      },
      dropdownSelectorContentFixedFooter() {
        return {
          id: "addCustomContent",
          customContentId: "addCustomContent",
          value: "addCustomContent",
          label: this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('addCustomContent'),
          icon: 'icon-gs-add',
          buttonType: 'dropdown-btn',
          disabled: this.selectionHavingCustomContent > 0,
          hoverText: this.selectionHavingCustomContent > 0 ? this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('hoverAddCustom') : ''
        }
      },
    },

    methods: {
      toggleSelectedGarage(garageId, isCheckable) {
        if (isCheckable) {
          Vue.set(this.selectedGarages, garageId, !(this.selectedGarages[garageId]))
          Vue.set(this.garageClass, garageId, this.selectedGarages[garageId] ? 'automation-campaign-management-table__component__column__garage--selected' : '')
          this.updateSelectedGaragesLabel();
          // To make a minus or plus
          const selectionMultiplier = this.selectedGarages[garageId] ? 1 : -1;
          this.selectionHavingCustomContent += (this.hasCustomContent[garageId] ? (1 * selectionMultiplier) : 0)
        }
      },
      updateSelectedGaragesLabel() {
        const keys = Object.keys(this.selectedGarages).filter((k) => this.selectedGarages[k]);
        this.selectedGaragesLabel = keys.length ? this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('NGarageSelected', { count: keys.length }) : this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('ToggleAll')
        this.areAllGaragesSelected = Object.keys(this.selectedGarages).filter((key) => this.selectedGarages[key]).length >= this.lines.filter((l) => this.isLineDisplayed(l.garageId) && l.isCheckable).length;
      },
      isLineDisplayed(garageId) {
        return this.isLineOkWithSearch[garageId] && this.isLineOkWithStatus[garageId] && this.isLineOkWithContactType[garageId] && this.isLineOkWithCustomContent[garageId];
      },
      debounceSearchChange(value) {
        this.debounceSearch = value;
      },
      onFiltersChange(newFilters) {
        const sameFilters = isEqual(this.filters, newFilters);
        if (!sameFilters) {
          for (const filter of ['status', 'contact', 'customContent']) {
            this.activeFilters[filter] = newFilters[filter] || null;
          }
          this.emptySelectedGarages();
        }
      },
      onSearchChange() {
        this.emptySelectedGarages();
      },
      displayGarageName(garageId) {
        return this.computedTable[garageId].garageName;
      },
      getCampaignStatus(garageId) {
        const campaignEmail = this.computedTable[garageId].campaigns[AutomationCampaignChannelTypes.EMAIL];
        const campaignMobile = this.computedTable[garageId].campaigns[AutomationCampaignChannelTypes.MOBILE];
        let statusEmail = campaignEmail && campaignEmail.status;
        let statusMobile = campaignMobile && campaignMobile.status;
        let finalStatus = '';

        if ([statusEmail, statusMobile].includes(AutomationCampaignStatuses.RUNNING)) {
          finalStatus = AutomationCampaignStatuses.RUNNING;
        } else {
          finalStatus = statusEmail;
        }
        return finalStatus
      },
      getCampaignDiode(campaignStatus) {
        if (campaignStatus === AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC | campaignStatus === AutomationCampaignStatuses.CANCELLED) {
          return 'warning';
        }
        return campaignStatus === AutomationCampaignStatuses.RUNNING ? 'success' : 'muted';
      },
      getCampaignTooltip(garageId, campaignStatus, runDate) {
        const garage = this.garagesSubscriptionStatus.find((garage) => garage.id === garageId);
        if (!garage || !garage.isSubscribedToAutomation) {
          return this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('garageNotSubscribed');
        }
        switch (campaignStatus) {
          case AutomationCampaignStatuses.BLOCKED_NOT_ENOUGH_HISTORIC:
            return this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('NotEnoughHistoric');
          case AutomationCampaignStatuses.IDLE:
            return ''; // this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('firstRunDay', { date: this.$dd(this.row.runDate, 'DD MMM YYYY') });
          case AutomationCampaignStatuses.RUNNING:
            return this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('nextRunDay', { date: this.$dd(runDate, 'DD MMM YYYY') });
          case AutomationCampaignStatuses.COMPLETE:
            return this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('lastRunDay', { date: this.$dd(runDate, 'DD MMM YYYY') });
          case AutomationCampaignStatuses.CANCELLED:
            return runDate ? this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('hiddenCampaign') : this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')('cancelledDay', { date: this.$dd(runDate, 'DD MMM YYYY') });
          default:
            return '';
        }
      },
      getContactType(garageId) {
        const campaignEmail = this.computedTable[garageId].campaigns[AutomationCampaignChannelTypes.EMAIL];
        const campaignMobile = this.computedTable[garageId].campaigns[AutomationCampaignChannelTypes.MOBILE];
        let statusEmail = campaignEmail && campaignEmail.status;
        let statusMobile = campaignMobile && campaignMobile.status;

        if (statusEmail === AutomationCampaignStatuses.RUNNING && statusMobile === AutomationCampaignStatuses.RUNNING) {
          return AutomationCampaignChannelTypes.BOTH;
        }

        if (statusEmail === AutomationCampaignStatuses.RUNNING) {
          return AutomationCampaignChannelTypes.EMAIL;
        }

        if (statusMobile === AutomationCampaignStatuses.RUNNING) {
          return AutomationCampaignChannelTypes.MOBILE;
        }

        return '';
      },
      emptySelectedGarages() {
        this.selectedGarages = {};
        this.selectionHavingCustomContent = 0;
        this.updateSelectedGaragesLabel()
      },
      toggleAllGarages() {
        const areAllGaragesSelected = this.areAllGaragesSelected;
        this.selectedGarages = {};
        this.garageClass = {};

        if (areAllGaragesSelected) {
          this.updateSelectedGaragesLabel()
          return;
        }

        for (const line of this.lines.filter((l) => this.isLineDisplayed(l.garageId) && l.isCheckable)) {
          this.toggleSelectedGarage(line.garageId, true);
        }
        this.updateSelectedGaragesLabel()
      },
      async dropdownSelectorStatusInternCallback({ status }) {
        this.loadingCampaignList = true;
        await this.dropdownSelectorStatusCallback(Object.keys(this.selectedGarages), status, false);
        this.emptySelectedGarages();
        this.loadingCampaignList = false;
      },
      async dropdownSelectorContactInternCallback({ channelType }) {
        this.loadingCampaignList = true;
        // We check if there is active + inactive at the same time. In this case, we toggle only the actives
        const activeGarageIds = [];
        const inactiveGarageIds = [];
        for (const line of this.lines) {
          if (this.selectedGarages[line.garageId]) {
            if (line.campaignStatus === AutomationCampaignStatuses.RUNNING) {
              activeGarageIds.push(line.garageId);
            } else {
              inactiveGarageIds.push(line.garageId);
            }
          }
        }
        await this.dropdownSelectorContactCallback(activeGarageIds.length ? activeGarageIds : inactiveGarageIds, channelType, false);
        this.emptySelectedGarages();
        this.loadingCampaignList = false;
      },
      async dropdownSelectorCustomContentInternalCallback({ customContentId }) {
        if (customContentId === 'addCustomContent') {
          this.addCustomContentCallback(Object.keys(this.selectedGarages).filter((gId) => this.selectedGarages[gId]))
          return;
        }
        this.loadingCampaignList = true;
        await this.dropdownSelectorCustomContentCallback(Object.keys(this.selectedGarages), customContentId, false);
        this.emptySelectedGarages();
        this.loadingCampaignList = false;
      },
      getTranslationValue(line, field){
        return line[field] ? this.$t_locale('components/cockpit/automation/AutomationCampaignManagementTable')(line[field]) :''
      }
    }
  }
</script>

<style lang="scss" scoped>
  .automation-campaign-management-table {
    margin: 1.5rem 1rem;
    position: relative;
    overflow: hidden;

    .label-line {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-left: .5rem;
    }
    &__searchbar {
      margin-bottom: .7rem;
    }

    &__component {

    background-color: $white;
    box-shadow: 0 0 3px 0 rgba($black, .16);

      &__no-result {
        text-align: center;
        margin-top: 3rem;
        color: $blue;
      }
      &__row {
        width: 100%;
        display: flex;
        flex-direction: row;
        box-sizing: border-box;
        flex-wrap: nowrap;
        &__header {
          height: 4rem;
        }
      }

      &__column {
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 2 1 0%;
        font-size: .92rem;
        color: $dark-grey;
        border-bottom: 1px solid rgba($grey, .5);

        &__header {
          border-bottom: 1px solid rgba($grey, .5);
          &__status {
            padding: 1.5rem 0!important;
            justify-content: center!important;
          }
          &__garage {
            font-size: .92rem!important;
            color: $dark-grey!important;
            font-weight: 700!important;
            cursor: pointer;
            padding-left: 0;
            padding-right: 0;
          }
          &__checkbox-box {
            padding-left: 1.5rem!important;
            cursor:pointer;
            margin-top: 0;
          }
          &__content {
            white-space: normal!important;
            overflow: visible!important;
            text-overflow: clip!important;
          }
        }
        &__checkbox-box {
          flex-shrink: 0;
          flex-grow: 0;
          padding-left: 0.5rem;
          cursor: pointer;
        }
        &__garage {
          flex: 2 1 15%;
          color: $black;
          font-size: 1.14rem;
          font-weight: 700;
          padding: 1.5rem 0;
          justify-content: flex-start;
          cursor: pointer;
          flex-shrink: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          &--selected {
            color: $blue;
          }
          &--disabled {
            color: rgba($black, 0.5);
            cursor: not-allowed!important;
          }
        }
        &__status {
          padding-top: 1.5rem;
          padding-bottom: 1.5rem;
          justify-content: flex-start;
          flex: 1;
          width: 15%;
          flex-shrink: 0;
          &__diode-garage {
            position: relative;
            left: 30%;
          }
          & i {
            color: $grey;
            font-size: .7rem;
            margin-left: .4rem;
          }
        }
        &__contact {
          padding: 1.5rem 0;
          flex-shrink: 0;
        }
        &__content {
          padding: 1.5rem 0;
          text-align: center;
          flex-shrink: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        &__preview {
          text-align: center;
          flex-grow: 0;
          padding: 1.5rem;
          min-width: 3rem;
          flex-shrink: 0;
        }
      }
    }
  }
.mobile {
  display: none;
}
  @media (max-width: $breakpoint-min-md) {

    .desktop {
      display: none;
    }
    .mobile {
      display: initial;
    }

    .automation-campaign-management-table {

      &__component {

        &__column {

          &__header {

            &__garage {
              flex: 0;
            }
            &__content {
              padding-right: 2rem;
            }
          }

          &__garage {
            border-bottom: none;
            padding-bottom: 0;
          }
        }

      }

    }
  }

  .body{
    height: 60vh;
    overflow: scroll;
    overflow-x: hidden;
    padding-left: 1rem;
  }

  .check-with-label {
  position: absolute; // take it out of document flow
  opacity: 0; // hide it

  & + label {
    position: relative;
    cursor: pointer;
    padding: 0;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  // Box.
  & + label:before {
    content: '';
    margin-right: 10px;
    display: inline-block;
    vertical-align: initial;
    width: 1rem;
    height: 1rem;
    background: $white;
    border: 2px solid $dark-grey;
    box-sizing: border-box;
    border-radius: 3px;
  }
  // Box hover
  &:hover + label:before {
    background: $white;
  }
  // Box focus
  &:focus + label:before {
    box-shadow: 0 0 0 3px rgba($blue, .16);
  }
  // Box checked
  &:checked + label:before {
    border: 2px solid $blue;
  }
  // Disabled state label.
  &:disabled + label {
    color: #b8b8b8;
    cursor: auto;
  }
  // Disabled box.
  &:disabled + label:before {
    box-shadow: none;
    background: #ddd;
  }
  // Checkmark. Could be replaced with an image
  &:checked + label:after {
    content: '';
    position: absolute;
    left: 3px;
    top: 8px;
    background: $blue;
    width: 2px;
    height: 2px;
    box-shadow:
      1px 0 0 $blue,
      3px 0 0 $blue,
      3px -1px 0 $blue,
      3px -3px 0 $blue,
      3px -5px 0 $blue,
      3px -7px 0 $blue;
    transform: rotate(45deg);
  }
}
.checkbox-line {
  margin-right: 0.4rem;
}
.checkbox-line:checked + .label-line {
  color: $blue;
}

.checkbox-line-header {
  cursor: pointer;
}

.label-line-header {
  cursor: pointer;
}
@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  .label-line {
    padding-left: 1.5rem!important;
  }
}
</style>
