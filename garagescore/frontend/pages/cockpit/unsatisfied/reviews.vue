<template>
  <div class="page-unsatisfied custom-scrollbar">
    <!-- NEW KPIs -->
    <KpiHeader
      :mixinKpiData="mixinKpiData"
      :dataTypeId="navigationDataProvider.dataTypeId"
      :filterReviews="filterReviews"
      :currentKpiUserIdFilter="currentKpiUserIdFilter"
    />
    <!-- TABLE -->
    <div class="page-unsatisfied__table">
      <TableUnsatisfied
        :filtersDisabled="navigationDataProvider.isFilterDisabled"
        :hasMore="hasMore"
        :loading="loadingReviews"
        :getRowSubview="getRowSubview"
        :reviews="reviews"
        :noResultGodMode="noResultGodMode"
        :fetchNextPage="fetchNextPage"
        :search="search"
        :onSearchFunction="onSearch"
        :onSearchChangeFunction="onSearchChange"
        :changeFilters="changeFilters"
        :filters="filtersValue"
        :open-modal-function="openModal"
        :fetch-unsatisfied-list="fetchUnsatisfiedList"
        :changeRowSubview="changeRowSubview"
        :icons="icons"
        :cockpitType="navigationDataProvider.cockpitType"
        :availableGarages="navigationDataProvider.availableGarages"
        :addManualUnsatisfied="addManualUnsatisfied"
        :currentGarageId="navigationDataProvider.garageIds"
        :closeModal="closeModal"
        :currentUserId="currentUserId"
        :isManager="isManager"
        :handleBack="navigationDataProvider.handleBack"
        :hasBackArrow="navigationDataProvider.hasBackArrow(canComeFrom)"
      />
    </div>
  </div>
</template>

<script>
import isEqual from 'lodash/isEqual';

import TableUnsatisfied from '~/components/cockpit/unsatisfied/reviews/TableUnsatisfied';

import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { generateSubFiltersWithRoute } from '~/util/filters';
import { makeApolloMutations, makeApolloQueries } from '~/util/graphql';
import dataTypes from '~/utils/models/data/type/data-types';
import { IconsTypes } from '~/utils/enumV2';
import kpiMixin from '~/components/cockpit/mixins/kpiMixin';
import { USERS_KPI } from '~/utils/kpi/graphqlQueries';
import KpiHeader from '~/components/cockpit/unsatisfied/reviews/KpiHeader';

const filtersUnsatisfied = [
  {
    query: 'surveySatisfactionLevel',
    payload: { filter: 'surveySatisfactionLevel' },
    callbackValue: null,
  },
  {
    query: 'unsatisfiedElapsedTime',
    payload: { filter: 'unsatisfiedElapsedTime' },
    callbackValue: null,
  },
  {
    query: 'unsatisfiedManager',
    payload: { filter: 'unsatisfiedManager' },
    callbackValue: null,
  },
  {
    query: 'unsatisfiedHasLead',
    payload: { filter: 'unsatisfiedHasLead' },
    callbackValue: null,
  },
  {
    query: 'unsatisfiedStatus',
    payload: { filter: 'unsatisfiedStatus' },
    callbackValue: null,
  },
  {
    query: 'unsatisfiedFollowUpStatus',
    payload: { filter: 'unsatisfiedFollowUpStatus' },
    callbackValue: null,
  },
];

export default {
  name: "UnsatisfiedReviewsPage",
  components: {
    KpiHeader,
    TableUnsatisfied,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  middleware: ['hasAccessToUnsatisfied'],
  mixins: [
    kpiMixin(USERS_KPI, [
      'navigationDataProvider.garageIds',
      'navigationDataProvider.periodId',
      'navigationDataProvider.dataTypeId',
      'navigationDataProvider.cockpitType',
      'navigationDataProvider.dms.frontDeskUserName',
      'navigationDataProvider.user',
    ], {
      kpiData: { usersKpi: {} },
    }),
  ],

  async asyncData({ route }) {
    const finalFilters = generateSubFiltersWithRoute(route, filtersUnsatisfied);
    return { filters: finalFilters };
  },
  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'unsatisfied');
    if (!this.$store.getters['auth/isManager'] && !this.currentFilters.unsatisfiedManager) {
      this.filters.unsatisfiedManager = this.$store.getters['auth/currentUserId'];
    }
    this.initializeFiltersValues();
    this.refreshRouteParameters();
    return this.refreshView();
  },

  async asyncData({ route }) {
    const finalFilters = generateSubFiltersWithRoute(route, filtersUnsatisfied);
    return { filters: finalFilters };
  },

  data() {
    return {
      search: '',
      liveSearch: '',
      loadingReviews: true,
      unsatisfiedList: [],
      currentPage: 1,
      hasMore: true,
      noResultGodMode: false,
      paginate: 10,
      unsatisfiedListCursor: null,
      filters: {
        type: null,
        unsatisfiedElapsedTime: null,
        unsatisfiedHasLead: null,
        unsatisfiedStatus: null,
        unsatisfiedManager: null,
        unsatisfiedFollowUpStatus: null,
        surveySatisfactionLevel: null,
      },
      rowSubview: [],
    };
  },

  computed: {
    canComeFrom() {
      return [
        'cockpit-unsatisfied-garages',
        'cockpit-unsatisfied-team'
      ];
    },
    currentUserId() {
      return this.$store.state.auth.currentUser.id;
    },
    isManager() {
      return this.$store.getters['auth/isManager'];
    },
    currentKpiUserIdFilter() {
      return this.isManager ? 'Team' : this.currentUserId;
    },
    reviews() {
      return this.unsatisfiedList;
    },
    filtersValue() {
      const filtersValue = {};
      const filters = [
        'unsatisfiedElapsedTime',
        'unsatisfiedHasLead',
        'unsatisfiedStatus',
        'unsatisfiedManager',
        'unsatisfiedFollowUpStatus',
        'surveySatisfactionLevel',
      ];

      filters.map((filter) => {
        const stateValue = this.filters[filter];
        if (stateValue) {
          filtersValue[filter] = stateValue;
        }
      });

      return filtersValue;
    },
    currentFilters() {
      const {
        cockpitType,
        dataTypeId,
        garageIds,
        periodId,
        user,
      } = this.navigationDataProvider;
      const {
        surveySatisfactionLevel,
        unsatisfiedElapsedTime,
        unsatisfiedFollowUpStatus,
        unsatisfiedHasLead,
        unsatisfiedManager,
        unsatisfiedStatus,
      } = this.filtersValue;
      const currentUser = this.$store.state.cockpit.current.user;

      return {
        periodId,
        ...(!garageIds || !garageIds.length ? {} : { garageId: garageIds }),
        ...(cockpitType ? { cockpitType } : {}),
        ...(dataTypeId ? { unsatisfiedDataType: dataTypeId } : {}),
        ...(this.search ? { search: this.search } : {}),
        ...(unsatisfiedElapsedTime ? { unsatisfiedElapsedTime } : {}),
        ...(unsatisfiedHasLead ? { unsatisfiedHasLead } : {}),
        ...(unsatisfiedStatus ? { unsatisfiedStatus } : {}),
        ...(
          (unsatisfiedManager || user)
            ? { unsatisfiedManager: (currentUser || unsatisfiedManager) }
            : {}
        ),
        ...(unsatisfiedFollowUpStatus ? { unsatisfiedFollowUpStatus } : {}),
        ...(surveySatisfactionLevel ? { surveySatisfactionLevel } : {}),
      };
    },
    icons() {
      return {
        Maintenance: IconsTypes.MAINTENANCE,
        NewVehicleSale: IconsTypes.NEWVEHICLESALE,
        UsedVehicleSale: IconsTypes.USEDVEHICLESALE,
      };
    },
  },
  methods: {
    async filterReviews(status = null, manager = null, toggle) {
      await this.changeFilters({
        filters: {
          unsatisfiedStatus: toggle ? null : status,
          unsatisfiedManager: toggle ? null : manager,
          unsatisfiedFollowUpStatus: null,
        },
      });
    },

    getRowSubview(id) {
      const item = this.rowSubview.find((i) => i.id === id);
      return item ? item.view : null;
    },

    async fetchNextPage() {
      await this.fetchUnsatisfiedList({
        page: this.currentPage + 1,
        append: true,
        before: this.unsatisfiedListCursor,
      });
    },

    async changeFilters({ filters }) {
      if (!isEqual(this.filters, filters)) {
        this.filters = {
          ...{
            type: null,
            unsatisfiedElapsedTime: null,
            unsatisfiedHasLead: null,
            unsatisfiedStatus: null,
            unsatisfiedManager: null,
            unsatisfiedFollowUpStatus: null,
          },
          ...filters,
        };
        this.saveCurrentSubfilters();
        this.refreshRouteParameters();
        await this.fetchUnsatisfiedList();
      }
    },
    async onSearch(search) {
      this.search = search;
      this.refreshRouteParameters();
      await this.fetchUnsatisfiedList({ page: 1, append: false });
    },
    onSearchChange(search) {
      this.liveSearch = search;
    },
    openModal({ component, props }) {
      this.$store.dispatch(
        'openModal',
        {
          component,
          props,
        }
      );
    },
    closeModal() {
      this.$store.dispatch('closeModal');
    },
    async fetchUnsatisfiedList({ page, append, before } = { page: 1, append: false }) {
      if (!append) {
        this.loadingReviews = true;
      }

      const request = {
        name: 'dataGetUnsatisfiedList',
        args: {
          limit: this.paginate,
          before,
          ...this.currentFilters,
        },
        fields: `datas {
          id
          followupUnsatisfiedStatus
          customer {
            fullName
            contact {
              mobilePhone
              email
            }
            city
          }
          unsatisfiedTicket {
            type
            delayStatus
            status
            createdAt
            referenceDate
            closedAt
            frontDeskUserName
            criteria {
              label
              values
            }
            manager {
              id
              firstName
              lastName
              email
            }
            vehicle {
              make
              model
              plate
              vin
              mileage
              registrationDate
            }
            comment
            actions {
              name
              createdAt
              comment
              unsatisfactionResolved
              closedForInactivity
              providedSolutions
              claimReasons
              isManual
              newValue
              previousValue
              newArrayValue
              previousArrayValue
              field
              reminderDate
              reminderActionName
              reminderStatus
              followupStatus
              followupIsRecontacted
              followupUnsatisfiedCommentForManager
              assigner {
                lastName
                firstName
                email
              }
              ticketManager {
                id
                lastName
                firstName
                email
                job
              }
              previousTicketManager {
                id
                lastName
                firstName
                email
              }
              reminderTriggeredBy {
                id
                lastName
                firstName
              }
            }
          }
          garage {
            id
            ratingType
            publicDisplayName
            type
          }
          source {
            type
          }
          review {
            createdAt
            followupChangeEvaluation
            rating {
              value
            }
            comment {
              text
              moderated
            }
          }
          service {
            frontDeskCustomerId
            providedAt
          }
          surveyFollowupUnsatisfied {
            sendAt
            lastRespondedAt
          }
          unsatisfied {
            sendAt
            followupStatus
            isRecontacted
            criteria {
              label
              values
            }
          }
        }
        cursor
        hasMore
        noResultGodMode
        `,
      };
      const {
        data: { dataGetUnsatisfiedList } = {},
      } = await makeApolloQueries([request]);
      const {
        cursor,
        datas,
        hasMore,
        noResultGodMode,
      } = dataGetUnsatisfiedList;
      this.currentPage = page;
      this.unsatisfiedListCursor = cursor;
      this.hasMore = hasMore;
      this.noResultGodMode = noResultGodMode;

      if (append) {
        this.unsatisfiedList = [...this.unsatisfiedList, ...datas];
      } else {
        this.unsatisfiedList = datas;
      }
      this.loadingReviews = false;
    },
    async refreshRouteParameters() {
      const urlParams = {
        unsatisfiedElapsedTime: this.filters.unsatisfiedElapsedTime || undefined,
        unsatisfiedHasLead: this.filters.unsatisfiedHasLead || undefined,
        unsatisfiedStatus: this.filters.unsatisfiedStatus || undefined,
        unsatisfiedManager: this.filters.unsatisfiedManager || undefined,
        unsatisfiedFollowUpStatus: this.filters.unsatisfiedFollowUpStatus || undefined,
        surveySatisfactionLevel: this.filters.surveySatisfactionLevel || undefined,
        search: this.search || undefined,
      };
      return this.navigationDataProvider.refreshRouteParameters(urlParams);
    },
    async refreshView() {
      await this.fetchUnsatisfiedList({ page: 1, append: false });
      return this.navigationDataProvider.fetchFilters();
    },
    changeRowSubview({ id, view }) {
      const item = this.rowSubview.find((i) => i.id === id);

      item
        ? (
          item.view = view === item.view
          && item.view !== null
            ? null
            : view
        )
        : this.rowSubview.push({ id, view });
    },
    async addManualUnsatisfied({
      fullName,
      email,
      phone,
      type,
      brandModel,
      unsatisfiedCriterias,
      comment,
      garageId,
      make,
      model,
      immat,
      frontDeskUserName,
    }) {
      this.loadingReviews = true;
      if (unsatisfiedCriterias) {
        unsatisfiedCriterias = [unsatisfiedCriterias]; // eslint-disable-line no-param-reassign
      }
      const request = {
        name: 'dataSetManualTicket',
        args: {
          ticketType: dataTypes.MANUAL_UNSATISFIED,
          fullName,
          email,
          phone,
          type,
          brandModel,
          unsatisfiedCriterias: unsatisfiedCriterias
            ? JSON.stringify(unsatisfiedCriterias)
            : null,
          comment,
          garageId,
          make,
          model,
          immat,
          frontDeskUserName,
        },
        fields: `message
       status
       id`,
      };
      this.loadingReviews = false;
      const { data } = await makeApolloMutations([request]);
      const manualTicket = data?.dataSetManualTicket;

      if (manualTicket?.id) {
        await this.$router.push({
          name: 'cockpit-unsatisfied-id',
          params: { id: manualTicket?.id },
        });
      } else {
        this.openModal({
          component: 'ModalMessage',
          props: {
            message: `Erreur sur le serveur: ${manualTicket?.message}`,
            type: 'danger',
          },
        });
      }
    },
    saveCurrentSubfilters() {
      sessionStorage?.setItem(
        `${this.$route.name}_subfilters`,
        JSON.stringify(this.filters),
      );
    },
    initializeFiltersValues() {
      const allowedKeys = [
        'type',
        'unsatisfiedElapsedTime',
        'unsatisfiedHasLead',
        'unsatisfiedStatus',
        'unsatisfiedManager',
        'unsatisfiedFollowUpStatus',
        'surveySatisfactionLevel',
      ];

      const savedEntries = sessionStorage?.getItem(
        `${this.$route.name}_subfilters`
      );
      Object.entries(
        savedEntries
          ? JSON.parse(savedEntries)
          : {}
      ).forEach(([filter, value]) => {
        if (value !== null && allowedKeys.includes(filter)) {
          this.$set(this.filters, filter, value);
        }
      });
    },
  },
  watch: {
    ...watchersFactory({
      'navigationDataProvider.periodId': ['refreshView'],
      'navigationDataProvider.garageIds': ['refreshView'],
      'navigationDataProvider.cockpitType': ['refreshView'],
      'navigationDataProvider.dataTypeId': ['refreshView'],
      'navigationDataProvider.dms.frontDeskUserName': ['refreshView'],
      'navigationDataProvider.user': ['refreshView'],
    }),
  },
};
</script>

<style lang="scss" scoped>
.page-unsatisfied {
  position: relative;
  height: calc(100vh - 8.5rem);
  overflow-x: hidden;
  overflow-y: auto;
  top: 1rem;
  padding-top: 0.15rem;
  box-sizing: border-box;

    &__part {
      display: flex;
      flex-flow: column;

      & + & {
        margin-top: 1rem;
      }
    }

    &__part-kpi {
      padding: 0 0.5rem 1rem 1rem;

      * + * {
        margin-top: 1rem;
      }
    }
  }

  @media (min-width: $breakpoint-min-md) {
    .page-unsatisfied {
      &__part {
        flex-flow: row;
      }

      &__part-kpi {
        * + * {
          margin-top: 0;
          margin-left: 1rem;
        }
      }
    }
  }

@media (max-width: $breakpoint-min-md) {
  .page-unsatisfied {
    top: 0;
    height: calc(100vh - 8.5rem);
  }
}
</style>
