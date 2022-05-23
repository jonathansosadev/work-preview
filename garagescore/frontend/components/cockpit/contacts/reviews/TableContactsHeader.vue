<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="handleBack">
              <i class="icon-gs-solid-left" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('back') }}</span>
            </button>
          </div>
        </template>
        <Searchbar
          :options="filterOptions"
          :filters="filters"
          v-model="search"
          :filtersDisabled="filtersDisabled"
          @filtersChange="onFiltersChange"
          @input="onSearchChange"
          @searchClick="onSearch"
        />
      </div>
    </div>
    <div class="table__header table-cockpit-header">
      <TableHeader
        center
        :style="{ flex: 2 }"
        :display="['lg', 'md']"
      />
      <TableHeader center />
      <TableHeader center>
        <TableFiltersLabel
          filterKey="email"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="mobile"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="campaign"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="contactDetails"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center :style="{ flex: 1.5 }">
        <TableFiltersLabel
          filterKey="processing"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
    </div>
  </div>
</template>

<script>

import { debounce, isEqual } from 'lodash';

import TableFiltersLabel from '~/components/global/TableFiltersLabel';
import Searchbar from '~/components/ui/searchbar/Searchbar';
import campaignStatus from '~/utils/models/data/type/campaign-contact-status.js';
import ContactTicketStatus from '~/utils/models/data/type/contact-ticket-status.js';
import emailStatus from '~/utils/models/data/type/email-status.js';
import phoneStatus from '~/utils/models/data/type/phone-status.js';

export default {
  components: {
    Searchbar,
    TableFiltersLabel,
  },

  props: {
    filtersDisabled: { type: Boolean, default: false },
    hasOnlyContactWithoutCampaign: { type: Boolean, default: false },
    changeContactSearch: { type: Function, required: true },
    fetchContactsListPage: { type: Function, required: true },
    changeContactFilters: { type: Function, required: true },
    changeContactLiveSearch: { type: Function, required: true },
    handleBack: { type: Function, required: true },
    hasBackArrow: { type: Boolean },
    liveSearch: { type: String },
    currentFilters: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      search: this.liveSearch,
    };
  },

  computed: {
    filters() {
      const filtersValue = {};
      const filters = [
        'type',
        'email',
        'mobile',
        'campaign',
        'contactDetails',
        'processing',
      ];

      filters.map(f => {
        const stateValue = this.currentFilters[f];
        if (stateValue) {
          filtersValue[f] = stateValue;
        }
      });

      if (
        !this.hasOnlyContactWithoutCampaign
        && filtersValue.processing
        && filtersValue.processing === ContactTicketStatus.TO_RECONTACT_WITHOUT_CAMPAIGN
      ) {
        delete filtersValue.processing;
      }

      return filtersValue;
    },

    filterOptions() {
      let filterOptions = [
        {
          key: 'email',
          label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('email'),
          icon: 'icon-gs-web-mail',
          values: [
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Valid'), value: emailStatus.VALID },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Empty'), value: emailStatus.EMPTY },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Wrong'), value: emailStatus.WRONG },
            {
              label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('RecentlyContacted'),
              value: emailStatus.RECENTLY_CONTACTED,
            },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Unsubscribed'), value: emailStatus.UNSUBSCRIBED },
            {
              label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Dropped'),
              value: emailStatus.DROPPED,
            },
          ],
        },

        {
          key: 'mobile',
          label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('mobile'),
          icon: 'icon-gs-mobile',
          values: [
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Valid'), value: phoneStatus.VALID },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Empty'), value: phoneStatus.EMPTY },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Wrong'), value: phoneStatus.WRONG },
            {
              label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('RecentlyContacted'),
              value: phoneStatus.RECENTLY_CONTACTED,
            },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Unsubscribed'), value: phoneStatus.UNSUBSCRIBED },
          ],
        },

        {
          key: 'campaign',
          label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('campaign'),
          icon: 'icon-gs-cloud-upload',
          values: [
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Received'), value: campaignStatus.RECEIVED },
            {
              label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('ReceivedNotResponded'),
              value: 'ReceivedNotResponded',
            },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Scheduled'), value: campaignStatus.SCHEDULED },
            {
              label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('NotReceived'),
              value: campaignStatus.NOT_RECEIVED,
            },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Blocked'), value: campaignStatus.BLOCKED },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Impossible'), value: campaignStatus.IMPOSSIBLE },
          ],
        },

        {
          key: 'contactDetails',
          label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('contactDetails'),
          icon: 'icon-gs-user-square',
          values: [
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Revised'), value: 'Revised' },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Validated'), value: 'Validated' },
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('NotValidated'), value: 'NotValidated' },
          ],
        },

        {
          key: 'processing',
          label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Process'),
          icon: 'icon-gs-edit',
          values: [
            ...(this.hasOnlyContactWithoutCampaign ? [
              {
                label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('ToRecontactWithoutCampaign'),
                value: ContactTicketStatus.TO_RECONTACT_WITHOUT_CAMPAIGN,
              }] : [
              {
                label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('ToRecontact'),
                value: ContactTicketStatus.TO_RECONTACT,
              }]),
            { label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Ongoing'), value: ContactTicketStatus.ONGOING },
            {
              label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('Terminated'),
              value: ContactTicketStatus.TERMINATED,
            },
            {
              label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('NotPossible'),
              value: ContactTicketStatus.NOT_POSSIBLE,
            },
            {
              label: this.$t_locale('components/cockpit/contacts/reviews/TableContactsHeader')('ClosedWithoutTreatment'),
              value: ContactTicketStatus.CLOSED_WITHOUT_TREATMENT,
            },
          ],
        },
      ];

      return filterOptions;
    },
  },

  methods: {
    async onSearch() {
      this.changeContactSearch({ search: this.search });
      await this.fetchContactsListPage({ page: 1, append: false });
    },
    onSearchChange() {
      this.changeContactLiveSearch({ search: this.search });
    },

    onFiltersChange(newFilters) {
      const sameFilters = isEqual(this.filters, newFilters);

      if (!sameFilters) {
        this.changeContactFilters({ filters: newFilters });
        debounce(() => this.fetchContactsListPage({ page: 1, append: false }), 500);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
