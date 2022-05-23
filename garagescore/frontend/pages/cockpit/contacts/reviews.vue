<template>
  <div class="page-contacts custom-scrollbar">
    <div v-if="!hasOnlyContactWithoutCampaign" class="page-contacts__stats">
      <div class="page-contacts__item">
        <StatsResponded
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-contacts__item">
        <StatsValidEmails
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-contacts__item">
        <StatsNotContactable
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
    </div>
    <div class="page__table">
      <TableContacts
        :filtersDisabled="navigationDataProvider.isFiltersDisabled"
        :hasOnlyContactWithoutCampaign="hasOnlyContactWithoutCampaign"
        :contacts="contactsList"
        :hasMore="hasMore"
        :getRowSubview="getRowSubview"
        :loading="loading"
        :noResultGodMode="noResultGodMode"
        :fetchNextPage="fetchNextPage"
        :getNotPossibleStatus="getNotPossibleStatus"
        :updateContactsListData="updateContactsListData"
        :changeRowSubview="setRowSubview"
        :updateData="updateData"
        :liveSearch="liveSearch"
        :fetchContactsListPage="fetchContactsListPage"
        :changeContactSearch="changeContactSearch"
        :changeContactLiveSearch="setContactLiveSearch"
        :changeContactFilters="changeContactFilters"
        :handleBack="navigationDataProvider.handleBack"
        :hasBackArrow="navigationDataProvider.hasBackArrow(canComFrom)"
        :currentFilters="filters"
        :saveTicket="saveTicket"
      />
    </div>
  </div>
</template>

<script>
import StatsNotContactable from '~/components/cockpit/contacts/StatsNotContactable.vue';
import StatsResponded from '~/components/cockpit/contacts/StatsResponded.vue';
import StatsValidEmails from '~/components/cockpit/contacts/StatsValidEmails.vue';
import TableContacts from '~/components/cockpit/contacts/reviews/TableContacts';
import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { generateSubFiltersWithRoute } from '~/util/filters';
import { makeApolloMutations, makeApolloQueries } from '~/util/graphql';
import CampaignStatus from '~/utils/models/data/type/campaign-contact-status.js';
import PhoneStatus from '~/utils/models/data/type/phone-status.js';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { KPI_BY_PERIOD_SINGLE_KPI } from '~/utils/kpi/graphqlQueries';

const filtersContact = [
  {
    query: 'type',
    payload: { filter: 'type' },
    callbackValue: null,
  },
  {
    query: 'email',
    payload: { filter: 'email' },
    callbackValue: null,
  },
  {
    query: 'mobile',
    payload: { filter: 'mobile' },
    callbackValue: null,
  },
  {
    query: 'campaign',
    payload: { filter: 'campaign' },
    callbackValue: null,
  },
  {
    query: 'contactDetails',
    payload: { filter: 'contactDetails' },
    callbackValue: null,
  },
  {
    query: 'processing',
    payload: { filter: 'processing' },
    callbackValue: null,
  },
];

export default {
  name: 'ContactsReviewsPage',
  components: {
    StatsResponded,
    StatsValidEmails,
    StatsNotContactable,
    TableContacts,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  middleware: ['hasAccessToContacts'],
  mixins: [chartsKpiMixin('COCKPIT_CONTACTS_REVIEWS', KPI_BY_PERIOD_SINGLE_KPI, { kpiByPeriodSingle: {} })],

  async asyncData({ route }) {
    const finalFilters = generateSubFiltersWithRoute(route, filtersContact);
    return { filters: finalFilters };
  },
  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'contact');
    this.initializeFiltersValues();
    await this.refreshRouteParameters();
    await this.refreshView();
  },

  data() {
    return {
      loading: true,
      search: '',
      liveSearch: '',
      filters: {
        type: null,
        email: null,
        mobile: null,
        campaign: null,
        contactDetails: null,
        processing: null,
      },
      paginate: 10,
      currentPage: 1,
      hasMore: true,
      noResultGodMode: false,
      contactsList: [],
      rowSubview: [],
    };
  },

  computed: {
    hasOnlyContactWithoutCampaign() {
      // Issue #4258 Temp, check if garage has Contact without campaign like Chanoines Garages
      let garageIds = this.navigationDataProvider.availableGarages.map((garage) => garage.id);
      const { selectedGarageIds } = this.navigationDataProvider;
      if (selectedGarageIds) {
        garageIds = Array.isArray(selectedGarageIds) ? selectedGarageIds : [selectedGarageIds];
      }
      const chanoineGarages = [
        '5fb647e1eb47b800035b2f5a',
        '5fb64c84eb47b800035b302c',
        '5fb64ec1eb47b800035b3088',
        '5fb65059eb47b800035b30bd',
        '5fb653f6eb47b800035b31b4',
        '5fb6554aeb47b800035b31eb',
        '5fc4c86ff38f000003569c04',
      ];

      return !garageIds.find((garageId) => !chanoineGarages.includes(garageId));
    },

    canComFrom() {
      return ['cockpit-contacts-garages', 'cockpit-contacts-team'];
    },
  },
  methods: {
    getRowSubview(id) {
      const item = this.rowSubview.find((i) => i.id === id);
      return item ? item.view : null;
    },
    setRowSubview({ id, view }) {
      const item = this.rowSubview.find((i) => i.id === id);
      if (item) {
        item.view = view === item.view && (item.view !== null ? null : view);
      } else {
        this.rowSubview.push({ id, view });
      }
    },

    getNotPossibleStatus(row) {
      const fiveDaysAgo = new Date().getTime() - 1000 * 24 * 60 * 60 * 5;
      if (row.surveyRespondedAt && !row.contactTicketStatus) {
        return { value: 'Answered', type: 'success' };
      }
      if (row.customerCampaignContactStatus === CampaignStatus.NO_CAMPAIGN) {
        return null;
      }
      if (row.customerCampaignContactStatus === CampaignStatus.SCHEDULED) {
        return { value: 'Planned', type: 'success' };
      }
      if (row.customerCampaignContactStatus === CampaignStatus.BLOCKED) {
        return { value: 'Blocked', type: 'danger' };
      }
      if (row.customerCampaignContactStatus !== CampaignStatus.RECEIVED) {
        return { value: 'Impossible', type: 'danger' };
      }
      if (row.customerPhoneStatus !== PhoneStatus.VALID) {
        return { value: 'PhoneError', type: 'danger' };
      }
      if (fiveDaysAgo < new Date(row.campaignFirstSendAt).getTime()) {
        return { value: 'TooSoon', type: 'success' };
      }
      return null;
    },

    async refreshRouteParameters() {
      const urlParams = {
        type: this.filters.type || undefined,
        email: this.filters.email || undefined,
        mobile: this.filters.mobile || undefined,
        campaign: this.filters.campaign || undefined,
        contactDetails: this.filters.contactDetails || undefined,
        processing: this.filters.processing || undefined,
        search: this.search || undefined,
      };
      return this.navigationDataProvider.refreshRouteParameters(urlParams);
    },

    async refreshView() {
      await this.fetchContactsListPage({ page: 1, append: false });
      return this.navigationDataProvider.fetchFilters();
    },

    changeContactSearch({ search }) {
      this.setContactSearch({ search });
      this.refreshView();
    },

    async changeContactFilters({ filters }) {
      this.setContactFilters({ filters: Object.assign({}, filters) });
      this.saveCurrentSubfilters();
      await this.refreshRouteParameters();
      await this.refreshView();
    },

    async fetchNextPage() {
      await this.fetchContactsListPage({ page: this.currentPage + 1, append: true });
    },

    async fetchContactsListPage({ page, append } = { page: 1, append: false }) {
      this.setLoading(true);
      const frontDeskUserName =
        this.navigationDataProvider.dms.frontDeskUserName === 'ALL_USERS'
          ? undefined
          : this.navigationDataProvider.dms.frontDeskUserName;
      const request = {
        name: 'dataGetContactsList',
        args: {
          cockpitType: this.navigationDataProvider.cockpitType,
          periodId: this.navigationDataProvider.periodId,
          type: this.navigationDataProvider.dataTypeId,
          garageId: this.navigationDataProvider.garageIds,
          frontDeskUserName,
          search: this.search,
          limit: this.paginate,
          skip: (page - 1) * this.paginate,
          contactsOrder: 'DESC',
          ...(this.filters.email ? { emailStatus: this.filters.email } : {}),
          ...(this.filters.mobile ? { phoneStatus: this.filters.mobile } : {}),
          ...(this.filters.campaign ? { campaignStatus: this.filters.campaign } : {}),
          ...(this.filters.contactDetails ? { revisionStatus: this.filters.contactDetails } : {}),
          ...(this.filters.processing ? { ticketStatus: this.filters.processing } : {}),
        },
        fields: `list {
          id
          customerTitle
          customerFullName
          customerPhone
          customerEmail
          customerEmailIsNc
          customerStreet
          customerCity
          customerPostalCode
          customerOldTitle
          customerOldFullName
          customerOldPhone
          customerOldEmail
          customerOldStreet
          customerOldCity
          customerOldPostalCode
          garageProvidedCustomerId
          vehicleMake
          vehicleModel
          vehicleRegistrationPlate
          vehicleVin
          vehicleMileage
          vehicleRegistrationFirstRegisteredAt
          serviceProvidedAt
          garageProvidedFrontDeskUserName
          garagePublicDisplayName
          garageType
          type
          customerCampaignContactStatus
          explainCampaignContactStatus
          customerEmailStatus
          customerPhoneStatus
          customerUnsubscribedByEmail
          customerUnsubscribedByPhone
          explainEmailStatus
          explainPhoneStatus
          isCampaignContactedByEmail
          isCampaignContactedByPhone
          campaignFirstSendAt
          isApv
          isVn
          isVo
          surveyRespondedAt
          campaignStatus
          serviceFrontDeskUserName
          garageSubscriptions {
            Maintenance
            NewVehicleSale
            UsedVehicleSale
            Lead
            EReputation
          }
          contactTicket {
            status
            comment
            score
            unsatisfiedCriteria
            resolved
            assigner
            leadType
            leadToCreate
            leadAssigner
            leadComment
            leadTiming
            leadBodyType
            leadEnergy
            leadFinancing
            leadSaleType
            leadTradeIn
            leadBudget
            leadBrandModel
            updatedAt
            closedAt
          }
          users {
            id
            job
            firstName
            lastName
            email
          }
        }
        hasMore
        noResultGodMode`,
      };
      const resp = await makeApolloQueries([request]);
      const { data: { dataGetContactsList: { list, hasMore, noResultGodMode } = {} } = {} } = resp;
      append ? this.appendContactsList(list) : this.setContactsList(list);
      this.setCurrentPage({ page });
      this.setHasMore(hasMore);
      this.setNoResultGodMode(noResultGodMode);
      this.setLoading(false);
    },

    async saveTicket(ticket) {
      this.setLoading(true);
      const request = {
        name: 'dataSetContactTicket',
        args: ticket,
        fields: `
        status
        leadType
        leadToCreate
        leadAssigner
        leadComment
        leadTiming
        leadFinancing
        leadSaleType
        leadTradeIn
        leadBudget
        leadBrandModel
        leadBodyType
        leadEnergy
        updatedAt
        closedAt
      `,
      };
      const res = await makeApolloMutations([request]);
      this.setLoading(false); // Too quick, it's weird
      return res?.data?.dataSetContactTicket;
    },

    async updateData({ id, field, value }) {
      const getBackendField = (field) => {
        switch (field) {
          case 'title':
            return 'title';
          case 'fullName':
            return 'fullName';
          case 'phone':
            return 'contact.mobilePhone';
          case 'email':
            return 'contact.email';
          case 'street':
            return 'street';
          case 'city':
            return 'city';
          case 'postalCode':
            return 'postalCode';
          default:
            return null;
        }
      };

      const backendField = getBackendField(field);
      if (!backendField) {
        return false;
      }
      const request = {
        name: 'dataSetField',
        args: { id, field: backendField, value },
        fields: `
        message
        status
      `,
      };
      const resp = await makeApolloMutations([request]);
      return resp?.data?.dataSetField?.status;
    },

    setContactsList(data) {
      this.contactsList = data;
    },

    updateContactsListData({ id, field, value }) {
      const contact = this.contactsList.find((c) => c.id === id);
      if (field === 'contactTicket') {
        if (!contact.contactTicket) {
          contact.contactTicket = {};
        }
        Object.keys(value).forEach((k) => {
          if (Array.isArray(value[k])) {
            contact.contactTicket[k] = [...value[k]];
          } else {
            contact.contactTicket[k] = value[k];
          }
        });
      } else {
        contact[`customer${field.charAt(0).toUpperCase()}${field.slice(1)}`] = value;
        contact['customerIsRevised'] = value;
      }
    },

    setContactSearch({ search }) {
      this.search = search;
    },
    setContactLiveSearch({ search }) {
      this.liveSearch = search;
    },

    setContactFilters({ filters }) {
      this.filters = filters;
    },

    setCurrentPage({ page }) {
      this.currentPage = page;
    },

    setHasMore(data) {
      this.hasMore = data;
    },

    setNoResultGodMode(data) {
      this.noResultGodMode = data;
    },

    appendContactsList(data) {
      this.contactsList = this.contactsList.concat(data);
    },

    setLoading(isLoading) {
      this.loading = isLoading;
    },
    saveCurrentSubfilters() {
      sessionStorage?.setItem(`${this.$route.name}_subfilters`, JSON.stringify(this.filters));
    },
    initializeFiltersValues() {
      const allowedKeys = ['type', 'email', 'mobile', 'campaign', 'contactDetails', 'processing'];
      const savedEntries = sessionStorage?.getItem(`${this.$route.name}_subfilters`);
      Object.entries(savedEntries ? JSON.parse(savedEntries) : {}).forEach(([filter, value]) => {
        if (value !== null && allowedKeys.includes(filter)) {
          this.$set(this.filters, filter, value);
        }
      });
    },

    // async startExport({ dispatch }, { email }) {
    //   const exportType = ExportTypes.CONTACTS;
    //   const specificFilters = {
    //     contactsSearch: this.search || null,
    //     contactsEmailStatus: this.filters.email || null,
    //     contactsPhoneStatus: this.filters.mobile || null,
    //     contactsCampaignStatus: this.filters.campaign || null,
    //     contactsRevisionStatus: this.filters.contactDetails || null,
    //     contactsTicketStatus: this.filters.processing || null,
    //   };
    //
    //   return dispatch('cockpit/startExport', { exportType, email, specificFilters }, { root: true });
    // },
  },
  watch: {
    ...watchersFactory({
      'navigationDataProvider.garageIds': ['refreshView'],
      'navigationDataProvider.periodId': ['refreshView'],
      'navigationDataProvider.dataTypeId': ['refreshView'],
      'navigationDataProvider.cockpitType': ['refreshView'],
      'navigationDataProvider.dms.frontDeskUserName': ['refreshView'],
      'navigationDataProvider.user': ['refreshView'],
    }),
  },
};
</script>

<style lang="scss" scoped>
.page-contacts {
  position: relative;
  height: calc(100vh - 8.5rem);
  overflow-x: hidden;
  overflow-y: auto;
  top: 1rem;
  padding-top: 0.15rem;
  box-sizing: border-box;

  &__stats {
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-flow: column;
    padding: 0 0.5rem 1rem 1rem;
  }

  &__subitem {
    flex: 1;

    &:first-child {
      margin-right: 0.25rem;
    }

    &:last-child {
      margin-left: 0.25rem;
    }
  }

  &__item {
    height: 221px;
    width: 100%;

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .page-contacts {
    &__stats {
      flex-flow: row;
    }

    &__subitem {
      flex: 1;

      &:first-child {
        margin: 0;
        margin-bottom: $separator; //Remove this;
      }

      &:last-child {
        margin: 0;
      }
    }

    &__item {
      width: 33%;
      flex: 1;
      margin: 0 0.5rem;

      &:not(:last-child) {
        margin-bottom: 0;
      }

      &:first-child {
        margin: 0 0.5rem 0 0;
      }

      &:last-child {
        margin: 0 0 0 0.5rem;
      }
    }
  }
}

@media (max-width: $breakpoint-min-md) {
  .page-contacts {
    top: 0;
    height: calc(100vh - 8.5rem);
  }
}
</style>
