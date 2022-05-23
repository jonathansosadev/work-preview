<script>
import { isEqual } from '~/util/arrayTools.js';
import { getGaragesIdsFromTags } from '~/util/filters.js';
import { makeApolloQueries } from '~/util/graphql';
import AutomationCampaignTypes from '~/utils/models/automation-campaign.type';
import DataTypes from '~/utils/models/data/type/data-types';
import GarageTypes from '~/utils/models/garage.type.js';

export default {
  name: 'NavigationDataProvider',
  props: {
    onDataReady: {
      type: Function,
      required: true,
    },
    onDataUpdate: {
      type: Function,
      default: () => () => {},
    },
  },

  async created() {
    this.navigationFetchFilters().then(() => {
      this.isBooting = false;
      this.onDataReady(this.navigationDataProvider);
    });
  },
  render() {
    return this.$scopedSlots.default({
      navigationDataProvider: this.navigationDataProvider,
      isLoading: this.isBooting,
    });
  },

  data() {
    return {
      isBooting: true,
      navigationAllGarages: [],
      navigationAvailableAutomationCampaignTypes: [],
      navigationAvailableCockpitTypes: [],
      navigationAvailableDataTypes: DataTypes.values(),
      navigationAvailableDms: [],
      navigationAvailableFrontDeskUsers: [],
      navigationAvailableLeadSaleTypes: [],
      navigationAvailablePeriods: [{ id: 'lastQuarter' }, { id: 'CURRENT_YEAR' }, { id: 'ALL_HISTORY' }],
      navigationAvailableUsers: [],
      navigationRawAvailableGarages: [],
      navigationCurrent: {
        automationCampaignType: AutomationCampaignTypes.AUTOMATION_MAINTENANCE,
        cockpitType: GarageTypes.DEALERSHIP,
        dataTypeId: null,
        dms: {
          frontDeskUserName: 'ALL_USERS',
          garageId: null,
        },
        garageIds: null,
        garageType: null,
        lastChanged: null,
        leadSaleType: null,
        loadingForAutomationCustomContent: true,
        periodId: 'lastQuarter',
        user: null,
      },
      navigationTags: [],
      navigationCustomExports: [],
      navigationFilters: {
        loading: true,
      },
      // TODO Update with new routing / navigation system
      // navigationFromRowClick: null,
      // navigationIsLocalStorageEnabled: null,
      navigationOrigin: 'browser',
      navigationSidebarOpen: false,
      navigationSidebarOpenSubmenu: false,
      navigationSidebarTiny: false,

      // local use ready
      navigationGarageSignatures: [],
    };
  },
  /*
   * AppFilters store calls
   * ______GETTERS
   * isFiltersVisible
   *
   * cockpit/authorizations
   * cockpit/canSubscribeToCrossLeads
   *
   * cockpit/automationCampaignType
   * cockpit/cockpitType
   * cockpit/getCurrentPeriodId
   * cockpit/getCurrentGarageId
   *
   * cockpit/availableDms
   * cockpit/availableCockpitTypes
   * cockpit/availableGarages
   * cockpit/availablePeriods
   * cockpit/availableFrontDeskUsers
   *
   * cockpit/selectedDataType
   * cockpit/selectedFrontDeskUserName
   * cockpit/selectedGarage
   * cockpit/selectedGarageId
   * cockpit/selectedLeadSaleType
   * cockpit/selectedPeriod
   * cockpit/selectedUser
   *
   * cockpit/isFiltersLoading
   *
   *
   * route
   *
   *
   * sidebarOpen ❌
   * sidebarTiny ❌
   *
   * auth/currentUser ❌
   * auth/isGaragescoreUser
   * auth/WIDGET_MANAGEMENT
   * auth/hasAccessToEreputation
   * auth/hasAccessToTeam
   *
   * cockpit/admin ❌
   * cockpit/admin/users/users ❌
   * cockpit/customExports
   *
   * profile/jobsByCockpitType
   *
   *
   *
   * ______DISPATCH
   * cockpit/changeCurrentLeadSaleType
   *
   * */
  computed: {
    navigationAllGaragesNotFiltered() {
      return this.navigationAvailableGarages || [];
    },
    navigationAreFiltersVisible() {
      return ![
        'cockpit-unsatisfied-id',
        'cockpit-leads-id',
        'cockpit-automation',
        'cockpit-admin-profile',
        'cockpit-admin-users',
        'cockpit-admin-garages',
        'cockpit-admin-user-id',
        'cockpit-admin-sources',
        'cockpit-admin-surveys',
        'cockpit-admin-widget',
        'cockpit-cross-leads',
        'cockpit-automation-campaigns-manage-target',
        'cockpit-analytics',
        'cockpit-analytics-id',
      ].includes(this.navigationRoute.name);
    },
    navigationAuthorizations() {
      const { navigationAvailableGarages: garages, navigationSelectedGarage: selectedGarage } = this;

      return {
        currentHasCrossLeads: selectedGarage?.subscriptions?.CrossLeads,
        currentHasEreputation: selectedGarage?.subscriptions?.EReputation,
        hasAutomationAtLeast: garages.some((garage) => garage?.subscriptions?.Automation === true),
        hasCrossLeadsAtLeast: garages.some((garage) => garage?.subscriptions?.CrossLeads === true),
        hasEReputationAtLeast: garages.some((garage) => garage?.subscriptions?.EReputation === true),
        hasLeadAtLeast: garages.some((garage) => garage?.subscriptions?.Lead === true),
        hasMaintenanceAtLeast: garages.some((garage) => garage?.subscriptions?.Maintenance === true),
        hasViAtLeast: garages.some((garage) => garage?.subscriptions?.VehicleInspection === true),
        hasVnAtLeast: garages.some((garage) => garage?.subscriptions?.NewVehicleSale === true),
        hasVoAtLeast: garages.some((garage) => garage?.subscriptions?.UsedVehicleSale === true),
      };
    },
    navigationAutomationCampaignType() {
      return this.navigationCockpit.current.automationCampaignType;
    },
    navigationAvailableGarages() {
      return this.navigationCockpit.availableGarages;
    },
    navigationAvailableCrossLeadsGarages() {
      return (
        this.navigationAvailableGarages.filter(
          (garage) => garage.subscriptions?.active && garage.subscriptions?.CrossLeads
        ) || []
      );
    },
    navigationCanAccessToAutomation() {
      return this.navigationAvailableGarages.filter(
        (garage) =>
          ['fr_FR', 'es_ES', 'ca_ES'].includes(garage.locale) && GarageTypes.hasAccessToAutomation(garage.type)
      );
    },
    navigationCanSubscribeToAutomation() {
      return this.navigationAvailableGarages.filter(
        (garage) =>
          !garage?.subscriptions?.Automation &&
          garage?.subscriptions?.active &&
          ['fr_FR', 'es_ES', 'ca_ES'].includes(garage.locale) &&
          GarageTypes.hasAccessToAutomation(garage.type) // filter active ones
      );
    },
    navigationCanSubscribeToCrossLeads() {
      return this.navigationAvailableGarages.filter(
        (garage) =>
          !garage?.subscriptions?.CrossLeads &&
          garage?.subscriptions?.active &&
          garage.locale === 'fr_FR' &&
          GarageTypes.hasAccessToCrossLeads(garage.type) // filter active ones
      );
    },
    navigationCockpit() {
      return this.$store.state.cockpit;
    },
    navigationCockpitType() {
      return this.navigationCockpit.current.cockpitType;
    },
    navigationCurrentLeadSaleTypeSuffix() {
      const suffixes = {
        [DataTypes.MAINTENANCE]: 'Apv',
        [DataTypes.NEW_VEHICLE_SALE]: 'Vn',
        [DataTypes.USED_VEHICLE_SALE]: 'Vo',
        [DataTypes.UNKNOWN]: 'Unknown',
      };
      return suffixes[this.navigationSelectedLeadSaleType] || '';
    },
    navigationDataProvider() {
      const {
        navigationAllGarages,
        navigationAllGaragesNotFiltered,
        navigationAreFiltersDisabled,
        navigationAreFiltersLoading,
        navigationAreFiltersVisible,
        navigationAuthorizations,
        navigationAvailableCockpitTypes,
        navigationAvailableCrossLeadsGarages,
        navigationAvailableDataTypes,
        navigationAvailableDms,
        navigationAvailableFrontDeskUsers,
        navigationAvailableGarages,
        navigationAvailableLeadSaleTypes,
        navigationAvailablePeriods,
        navigationCanAccessToAutomation,
        navigationCanSubscribeToAutomation,
        navigationCanSubscribeToCrossLeads,
        navigationChangeUser,
        navigationChangeAutomationCampaignType,
        navigationChangeDms,
        navigationChangeCockpitType,
        navigationChangeDataTypeId,
        navigationChangeFrontDeskUserName,
        navigationChangeGarage,
        navigationChangeLeadSaleType,
        navigationChangePeriod,
        navigationCockpitType,
        navigationCurrent,
        navigationCurrentLeadSaleTypeSuffix,
        navigationCustomExports,
        navigationDataTypeId,
        navigationDms,
        navigationFetchFilters,
        navigationFetchGarageSignatures,
        navigationFromRowClick,
        navigationFromRowClickName,
        navigationFrontDeskUserName,
        navigationGarageIds,
        navigationGarageSignatures,
        navigationHasSidebarSubmenu,
        navigationIsSelectedPeriodLight,
        navigationLeadSaleType,
        navigationLoadingForAutomationCustomContent,
        navigationLocale,
        navigationOrigin,
        navigationPeriodId,
        navigationRoute,
        navigationSelectedAutomationCampaignType,
        navigationSelectedDataType,
        navigationSelectedFrontDeskUserName,
        navigationSelectedGarage,
        navigationSelectedGarageIds,
        navigationSelectedLeadSaleType,
        navigationSelectedPeriod,
        navigationSelectedUser,
        navigationSetSidebarOpen,
        navigationSetSidebarTiny,
        navigationSetAvailableUsers,
        navigationSetGarageId,
        navigationSetUser,
        navigationSidebarOpen,
        navigationSidebarOpenSubmenu,
        navigationSidebarTiny,
        navigationToggleSidebarTiny,
        navigationUser,
        navigationWwwUrl,
        navigationIsFiltersDisabled,
        navigationSyncRouteToState,
        navigationHandleBack,
        navigationHasBackArrow,
        navigationRefreshRouteParameters,
        navigationSetFromRowClick,
        navigationSelectedTags,
        setNavigationTagsSelected,
        navigationChangeGaragesSubscription,
        navigationCreateRoute,
        navigationSetDms
      } = this;

      return {
        allGarages: navigationAllGarages,
        allGaragesNotFiltered: navigationAllGaragesNotFiltered,
        areFiltersDisabled: navigationAreFiltersDisabled,
        areFiltersLoading: navigationAreFiltersLoading,
        areFiltersVisible: navigationAreFiltersVisible,
        authorizations: navigationAuthorizations,
        availableCockpitTypes: navigationAvailableCockpitTypes,
        availableCrossLeadsGarages: navigationAvailableCrossLeadsGarages,
        availableDataTypes: navigationAvailableDataTypes,
        availableDms: navigationAvailableDms,
        availableFrontDeskUsers: navigationAvailableFrontDeskUsers,
        availableGarages: navigationAvailableGarages,
        availableLeadSaleTypes: navigationAvailableLeadSaleTypes,
        availablePeriods: navigationAvailablePeriods,
        canAccessToAutomation: navigationCanAccessToAutomation,
        canSubscribeToAutomation: navigationCanSubscribeToAutomation,
        canSubscribeToCrossLeads: navigationCanSubscribeToCrossLeads,
        changeAutomationCampaignType: navigationChangeAutomationCampaignType,
        changeCockpitType: navigationChangeCockpitType,
        changeDataTypeId: navigationChangeDataTypeId,
        changeDms: navigationChangeDms,
        changeFrontDeskUserName: navigationChangeFrontDeskUserName,
        changeGarage: navigationChangeGarage,
        changeLeadSaleType: navigationChangeLeadSaleType,
        changeUser: navigationChangeUser,
        changePeriod: navigationChangePeriod,
        cockpitType: navigationCockpitType,
        current: navigationCurrent,
        currentLeadSaleTypeSuffix: navigationCurrentLeadSaleTypeSuffix,
        customExports: navigationCustomExports,
        dataTypeId: navigationDataTypeId,
        dms: navigationDms,
        fetchFilters: navigationFetchFilters,
        fetchGarageSignatures: navigationFetchGarageSignatures,
        fromRowClick: navigationFromRowClick,
        fromRowClickName: navigationFromRowClickName,
        frontDeskUserName: navigationFrontDeskUserName,
        garageIds: navigationGarageIds,
        garageSignatures: navigationGarageSignatures,
        hasSidebarSubmenu: navigationHasSidebarSubmenu,
        isSelectedPeriodLight: navigationIsSelectedPeriodLight,
        leadSaleType: navigationLeadSaleType,
        loadingForAutomationCustomContent: navigationLoadingForAutomationCustomContent,
        locale: navigationLocale,
        origin: navigationOrigin,
        periodId: navigationPeriodId,
        route: navigationRoute,
        selectedAutomationCampaignType: navigationSelectedAutomationCampaignType,
        selectedDataType: navigationSelectedDataType,
        selectedFrontDeskUserName: navigationSelectedFrontDeskUserName,
        selectedGarage: navigationSelectedGarage,
        selectedGarageIds: navigationSelectedGarageIds,
        selectedLeadSaleType: navigationSelectedLeadSaleType,
        selectedPeriod: navigationSelectedPeriod,
        selectedUser: navigationSelectedUser,
        setSidebarOpen: navigationSetSidebarOpen,
        setSidebarTiny: navigationSetSidebarTiny,
        setAvailableUser: navigationSetAvailableUsers,
        setGarageId: navigationSetGarageId,
        setUser: navigationSetUser,
        sidebarOpen: navigationSidebarOpen,
        sidebarOpenSubmenu: navigationSidebarOpenSubmenu,
        sidebarTiny: navigationSidebarTiny,
        toggleSidebarTiny: navigationToggleSidebarTiny,
        user: navigationUser,
        wwwUrl: navigationWwwUrl,
        isFiltersDisabled: navigationIsFiltersDisabled,
        syncRouteToState: navigationSyncRouteToState,
        handleBack: navigationHandleBack,
        hasBackArrow: navigationHasBackArrow,
        refreshRouteParameters: navigationRefreshRouteParameters,
        setFromRowClick: navigationSetFromRowClick,
        changeGaragesSubscription: navigationChangeGaragesSubscription,
        selectedTags: navigationSelectedTags,
        setTagsSelected: setNavigationTagsSelected,
        createRoute: navigationCreateRoute,
        navigationSetDms
      };
    },
    navigationDataTypeId() {
      return this.navigationCockpit.current.dataTypeId;
    },
    navigationUser() {
      return this.navigationCockpit.current.user;
    },
    navigationDms() {
      return this.navigationCockpit.current.dms;
    },
    navigationFrontDeskUserName() {
      const { frontDeskUserName } = this.navigationDms || {};
      return frontDeskUserName;
    },
    navigationGarageIds() {
      let garageIds = null;

      const { garageId: dmsGarageId } = this.navigationDms || {};
      garageIds = dmsGarageId || this.navigationCockpit.current.garageIds;
      garageIds = !garageIds || Array.isArray(garageIds) ? garageIds : [garageIds];

      return garageIds;
    },
    navigationGetOrigin() {
      return this.navigationOrigin;
    },
    navigationIsFiltersDisabled() {
      return (
        !this.navigationSelectedGarageIds &&
        this.navigationAvailableGarages.length > 100 &&
        !this.navigationIsSelectedPeriodLight
      );
    },
    navigationAreFiltersLoading() {
      return this.navigationFilters.loading;
    },
    navigationIsSelectedPeriodLight() {
      if (this.navigationPeriodId === 'lastQuarter') {
        return true;
      }
      const mosthlyRegex = /20[0-9]{2}-month[01][1-9]/;
      return mosthlyRegex.test(this.navigationPeriodId);
    },
    navigationLeadSaleType() {
      return this.navigationCockpit.current.leadSaleType;
    },
    navigationFromRowClick() {
      return this.navigationCockpit.fromRowClick;
    },
    navigationFromRowClickName() {
      return this.navigationFromRowClick?.name;
    },
    navigationLoadingForAutomationCustomContent() {
      return this.navigationCurrent.loadingForAutomationCustomContent;
    },
    navigationLocale() {
      return this.$store.getters['locale'];
    },
    navigationWwwUrl() {
      return this.$store.getters['wwwUrl'];
    },
    navigationPeriodId() {
      return this.navigationCockpit.current.periodId;
    },
    navigationState() {
      return this.$store.state;
    },
    navigationRoute() {
      return this.navigationState.route;
    },
    navigationSelectedAutomationCampaignType() {
      return this.navigationAutomationCampaignType;
    },
    navigationSelectedDataType() {
      return this.navigationDataTypeId;
    },
    navigationSelectedFrontDeskUserName() {
      return (this.navigationDms?.garageId && this.navigationDms?.frontDeskUserName !== 'ALL_USERS') || null;
    },
    navigationSelectedGarage() {
      const { navigationAvailableGarages, navigationGarageIds } = this;
      return navigationAvailableGarages.find((garage) => navigationGarageIds?.includes(garage.id));
    },
    navigationSelectedGarageIds() {
      return this.navigationGarageIds;
    },
    navigationSelectedLeadSaleType() {
      return this.navigationLeadSaleType;
    },
    navigationSelectedPeriod() {
      return this.navigationPeriodId;
    },
    navigationSelectedUser() {
      return this.navigationCockpit.current.user || 'ALL_USERS';
    },
    navigationSelectedTags() {
      return this.navigationTags;
    },
  },
  methods: {
    navigationChangeAutomationCampaignType(automationCampaignType) {
      this.navigationSetLastFilterChange('automationCampaignType');
      this.navigationSetAutomationCampaignType(automationCampaignType);
    },
    navigationSetLeadSaleType(leadSaleType) {
      this.navigationCurrent.leadSaleType = leadSaleType;
    },
    navigationChangeDms(dms) {
      this.$store.commit('cockpit/setLastFilterChange', 'frontDeskUserName');
      this.$store.commit('cockpit/setCurrentDms', dms);
    },
    navigationChangeUser(userId, blockLastFilterChange) {
      if (!blockLastFilterChange) {
        this.navigationSetLastFilterChange('manager');
      }
      this.navigationSetUser(userId);
    },
    navigationChangePeriod(periodId) {
      this.navigationSetLastFilterChange('period');
      this.navigationSetPeriodId(periodId);
      if (!this.navigationIsSelectedPeriodLight) {
        this.navigationFlushBottomFilters();
      }
    },
    navigationChangeGarage(garageId) {
      this.navigationSetLastFilterChange('garageId');
      this.navigationSetGarageId(garageId);
      this.navigationSetUser(null);
      if (garageId === null && this.navigationAvailableGarages.length > 10) {
        this.navigationFlushBottomFilters();
      }
    },
    navigationChangeFrontDeskUserName(frontDeskUserName) {
      this.navigationSetLastFilterChange('frontDeskUserName');
      this.navigationSetFrontDeskUserName(frontDeskUserName);
    },
    navigationChangeCockpitType(cockpitType) {
      this.navigationSetCockpitType(cockpitType);
      const newAvailableGarages = this.navigationAvailableGarages;
      this.navigationSetGarageId(newAvailableGarages.length === 1 ? newAvailableGarages[0].id : null);
      this.navigationSetDataTypeId(null);
      this.$store.dispatch('refreshRouteParameters');
    },
    navigationChangeDataTypeId(dataTypeId) {
      this.navigationSetLastFilterChange('type');
      this.navigationSetAutomationCampaignType(dataTypeId);
      if (dataTypeId === null) {
        this.navigationCurrent.dms = {
          frontDeskUserName: 'ALL_USERS',
          garageId: null,
        };
      }
    },
    navigationChangeLeadSaleType(leadSaleType) {
      this.navigationSetLastFilterChange('leadSaleType');
      this.navigationSetLeadSaleType(leadSaleType);
    },

    navigationCreateRoute(name, params, queryParameters) {
      let garageIdsTemp = (
        (this.navigationDms?.garageId ? [this.navigationDms.garageId] : null)
        || this.navigationGarageIds
        || undefined
      );

      let urlParams = {
        cockpitType: this.navigationCockpitType || undefined,
        periodId: this.navigationPeriodId || undefined,
        garageIds: garageIdsTemp,
        dataTypeId: this.navigationDataTypeId || undefined,
        leadSaleType: this.navigationLeadSaleType || undefined,
        automationCampaignType: this.navigationAutomationCampaignType || undefined,
        dms: (this.navigationDms && this.navigationDms.frontDeskUserName)? this.navigationDms.frontDeskUserName : undefined,
        user: this.navigationUser || undefined,
        startDate: this.navigationCockpit.current.startDate || undefined,
        endDate: this.navigationCockpit.current.endDate || undefined,
      };

      const query = Object.assign(
        { ...this.$route.query },
        { ...urlParams, ...(queryParameters ? queryParameters : {}) }
      );


      return { 
        name, 
        params,
        query
      }
    },
    async navigationRefreshRouteParameters(queryParameters) {
      const { query } = this.navigationCreateRoute(this.$route.name, undefined, queryParameters)

      try {
        const areQueriesEqual = Object.keys(query).every(prop => {
          return query[prop] === this.$route.query[prop] || (Array.isArray(query[prop]) && query[prop][0] === this.$route.query[prop])
        });

        if (!areQueriesEqual) {
          console.error("WARN: Missing URL query args - this isn't used the way it should");
          await this.$router.replace(
            { query },
            () => {},
            (e) => {
              if (e) {
                console.error('navigationRefreshRouteParameters abort : ', e);
              }
            }
          );
        }
      } catch (e) {
        console.error(e);
      }
    },
    navigationHasBackArrow(canComeFrom) {
      return canComeFrom.includes(this.$store?.state?.cockpit?.fromRowClick?.name);
    },
    navigationHandleBack() {
      this.$router.push({
        name: this.$store.state.cockpit.fromRowClick.name,
        query: this.$store.state.cockpit.fromRowClick.query,
      });
      this.navigationSyncRouteToState(this.$store.state.cockpit.fromRowClick);
    },
    async navigationSyncRouteToState(route) {
      if (route.query) {
        this.$store.commit('cockpit/setCurrentCockpitType', route.query.cockpitType || GarageTypes.DEALERSHIP, {
          root: true,
        });
        this.$store.commit('cockpit/setCurrentDataTypeId', route.query.dataTypeId || null, { root: true });
        this.$store.commit('cockpit/setCurrentLeadSaleType', route.query.leadSaleType || null, { root: true });
        this.$store.commit('cockpit/setCurrentAutomationCampaignType', route.query.automationCampaignType || null, {
          root: true,
        });
        this.$store.commit('cockpit/setCurrentPeriodId', route.query.periodId || 'lastQuarter', { root: true });

        const currentDmsToSet = route.query.dms
          ? {
              frontDeskUserName: route.query.dms,
              garageId: route.query.garageIds || null,
            }
          : { frontDeskUserName: 'ALL_USERS', garageId: null };
        this.$store.commit('cockpit/setCurrentDms', currentDmsToSet, { root: true });

        this.$store.commit('cockpit/setCurrentUser', route.query.user || null, { root: true });

        if (route.query.garageIds) {
          this.$store.commit('cockpit/setCurrentGarageId', route.query.garageIds, { root: true });
          const currentGarage = this.navigationAvailableGarages.find(({ id }) => id === route.query.garageId);
          if (currentGarage) {
            this.$store.commit('cockpit/setCurrentCockpitType', GarageTypes.getCockpitType(currentGarage.type), {
              root: true,
            });
          }
        } else {
          this.$store.commit('cockpit/setCurrentGarageId', null, { root: true });
        }
      }
    },
    async navigationFetchFilters() {
      let garageIds =
        this.navigationCockpit.current.dms.garageId || this.navigationCockpit.current.garageIds || undefined;
      garageIds = !garageIds || Array.isArray(garageIds) ? garageIds : [garageIds];

      const cockpitType = this.navigationCockpit.current.cockpitType || undefined;
      // dataTypeId is null when 'All' is selected, do not fallback to undefined
      const type = this.navigationCockpit.current.dataTypeId;
      const leadSaleType = this.navigationCockpit.current.leadSaleType || undefined;
      const ticketType = this.$store.state.route.name.includes('cockpit-leads') ? 'lead' : 'unsatisfied';
      // filterToFetch: { type: graphql.GraphQLString }
      const actions = [];
      switch (this.$store.state.route.name) {
        case 'cockpit-satisfaction-reviews':
        case 'cockpit-satisfaction-team':
          actions.push(
            this.$store.dispatch('cockpit/fetchSingleFilter', {
              filterToFetch: 'frontDeskUserName',
              garageIds,
              cockpitType,
              type,
            })
          );
          break;
        case 'cockpit-unsatisfied-reviews':
        case 'cockpit-unsatisfied-team':
          actions.push(
            this.$store.dispatch('cockpit/fetchSingleFilter', {
              filterToFetch: 'manager',
              garageIds,
              cockpitType,
              type,
              ticketType,
            })
          );
          break;
        case 'cockpit-leads-reviews':
        case 'cockpit-leads-team':
        case 'cockpit-leads-followed':
          actions.push(
            this.$store.dispatch('cockpit/fetchSingleFilter', {
              filterToFetch: 'manager',
              garageIds,
              cockpitType,
              leadSaleType,
              ticketType,
            })
          );
          break;
        case 'cockpit-contacts-team':
        case 'cockpit-contacts-reviews':
          actions.push(
            this.$store.dispatch('cockpit/fetchSingleFilter', {
              filterToFetch: 'frontDeskUserName',
              garageIds,
              cockpitType,
              type,
            })
          );
          break;
      }
      return new Promise((resolve) => {
        this.$store.commit('cockpit/setFiltersLoading', true);
        Promise.all(actions)
          .then(() => {
            this.$store.commit('cockpit/setFiltersLoading', false);
            resolve();
          })
          .catch((e) => {
            console.log('FiltersLoading error', e);
            this.$store.commit('cockpit/setFiltersLoading', false);
            resolve();
          });
      });
    },
    async navigationFetchSingleFilter(queryArgs) {
      const { navigationAllGarages: allGarages } = this;

      const request = {
        name: 'cockpitTopFiltersGetCockpitFilters',
        fields: `
              garageId
              garageType
              type
              source
              automationCampaignType
              frontDeskUserName {
                frontDeskUserName
                garageId
                type
              }
              leadSaleType
              manager {
                name
                userId
              }
            `,
        args: {
          ...queryArgs,
        },
      };
      const { data } = await makeApolloQueries([request]);
      const { cockpitTopFiltersGetCockpitFilters } = data || {};
      const result = cockpitTopFiltersGetCockpitFilters;
      const { filterToFetch } = queryArgs;

      switch (filterToFetch) {
        case 'garageId':
          if (result.garageId.length > 0) {
            this.navigationSetAvailableGarages(allGarages.filter((g) => result.garageId.includes(g.id)));
          } else {
            this.navigationSetAvailableGarages([...this.navigationAllGarages]);
          }
          break;
        case 'cockpitType':
          break;
        case 'source':
          break;
        case 'frontDeskUserName':
          this.navigationSetAvailableDms(result.frontDeskUserName);
          break;
        case 'manager':
          result.manager = result?.manager?.filter(({ name }) => name) || [];
          this.navigationSetAvailableUsers(result.manager);
          if (result?.manager?.length === 0) {
            this.navigationSetUser(null);
          }
          break;
      }
    },
    navigationSetAvailableAutomationCampaignTypes(availableAutomationCampaignTypes) {
      this.navigationAvailableAutomationCampaignTypes = availableAutomationCampaignTypes.map((availableType) => ({
        id: availableType,
      }));
      const OptionsLeadSaleTypes = this.navigationAvailableAutomationCampaignTypes.filter((type) => {
        return [
          AutomationCampaignTypes.AUTOMATION_MAINTENANCE,
          AutomationCampaignTypes.AUTOMATION_VEHICLE_SALE,
          AutomationCampaignTypes.AUTOMATION_NEW_VEHICLE_SALE,
          AutomationCampaignTypes.AUTOMATION_USED_VEHICLE_SALE,
          AutomationCampaignTypes.AUTOMATION_VEHICLE_INSPECTION,
        ].includes(type.id);
      });
      const isCurrentCampaignTypeAvailable = this.navigationAvailableAutomationCampaignTypes.find(
        ({ id }) => id === this.navigationAutomationCampaignType
      );
      if (!isCurrentCampaignTypeAvailable) {
        this.navigationCurrent.automationCampaignType = null;
      }
      if (OptionsLeadSaleTypes.length === 1) {
        const [firstLeadSaleType] = OptionsLeadSaleTypes;
        this.navigationCurrent.automationCampaignType = firstLeadSaleType.id;
      }
    },
    navigationSetAutomationCampaignType(automationCampaignType) {
      this.navigationCurrent.automationCampaignType = automationCampaignType;
    },
    navigationSetAvailableDms(availableDms = []) {
      this.navigationAvailableDms = [...availableDms];
      if (
        !this.availableDms?.find(({ frontDeskUserName }) => frontDeskUserName === this.navigationDms.frontDeskUserName)
      ) {
        this.navigationCurrent.dms = {
          frontDeskUserName: 'ALL_USERS',
          garageId: null,
        };
      }
    },
    navigationSetAvailableGarages(garages) {
      this.navigationRawAvailableGarages = garages;
      if (garages[0]) {
        this.navigationCurrent.cockpitType = GarageTypes.getCockpitType(garages[0].type);
      }
      const newAvailableGarages =
        garages?.filter(({ type }) => GarageTypes.getCockpitType(type) === this.navigationCockpitType) || [];
      if (newAvailableGarages.length === 1) {
        this.navigationCurrent.garageIds = garages[0].id;
        this.navigationCurrent.garageType = garages[0].type;
      }
      this.navigationAvailableCockpitTypes = [];
      for (const garage of garages) {
        // If it's not a valid cockpit type, fallback to dealership.
        // Example: "Agent" will use a "Dealership" cockpit
        const type = GarageTypes.getCockpitType(garage.type);
        if (!this.navigationAvailableCockpitTypes.includes(type)) {
          this.navigationAvailableCockpitTypes.push(type);
        }
      }
    },
    navigationSetAvailablePeriods(availablePeriods) {
      this.navigationAvailablePeriods = availablePeriods?.filter((period) => period?.id !== '2018') || [];
    },
    navigationSetCockpitType(cockpitType) {
      this.navigationCurrent.cockpitType = cockpitType;
    },
    navigationSetDataTypeId(dataTypeId) {
      this.navigationCurrent.dataTypeId = dataTypeId;
    },
    navigationSetFiltersLoading(loading) {
      this.$store.commit('cockpit/setFiltersLoading', loading);
      this.navigationFilters.loading = loading;
    },
    navigationSetFromRowClick(route) {
      this.$store.commit('cockpit/setFromRowClick', route);
    },
    navigationSetLastFilterChange(value) {
      this.navigationCurrent.lastChanged = value;
    },
    navigationSetOrigin(origin) {
      this.navigationOrigin = origin;
    },
    navigationSetPeriodId(periodId) {
      this.navigationCurrent.periodId = periodId;
    },
    navigationSetUser(userId) {
      this.navigationCurrent.user = userId;
    },
    navigationSetDms(dms) {
      this.navigationCurrent.dms = dms;

      if (dms.garageId) {
        this.navigationCurrent.garageIds = Array.isArray(dms.garageId) ? dms.garageId : [dms.garageId];
      }
    },
    navigationSetGarageId(garageIds) {
      if (!isEqual(this.navigationGarageIds, garageIds)) {
        this.navigationCurrent.dms = {
          frontDeskUserName: 'ALL_USERS',
          garageId: null,
        };
        this.navigationCurrent.garageIds = garageIds;
      }
    },
    navigationSetFrontDeskUserName(frontDeskUserName) {
      this.navigationCurrent.dms.frontDeskUserName = frontDeskUserName;
    },
    navigationSetSidebarOpen(value) {
      this.navigationSidebarOpen = value;
    },
    navigationSetSidebarTiny(value) {
      this.navigationSidebarTiny = value;
    },
    navigationHasSidebarSubmenu(value) {
      this.navigationSidebarOpenSubmenu = value;
    },
    navigationToggleSidebarTiny(value) {
      this.navigationSetSidebarTiny(value ?? !this.navigationSidebarTiny);
    },
    navigationSetAvailableUsers(availableUsers = []) {
      this.navigationAvailableUsers = [...availableUsers];
      const hasCurrentUser = this.navigationAvailableUsers.find(({ userId }) => userId === this.navigationCurrent.user);
      if (!hasCurrentUser) {
        this.navigationCurrent.user = null;
      }
    },
    async navigationFetchGarageSignatures() {
      const request = {
        name: 'garageGetGaragesSignatures',
        fields: `
        _id
        lastName
        firstName
        job
        group
      `,
      };
      const { data } = await makeApolloQueries([request]);
      this.navigationGarageSignatures = data?.garageGetGaragesSignatures;
    },
    setCurrentFiltersGaragesSelected({ garageIds, tags }) {
      this.$store.dispatch('cockpit/setCurrentFiltersGaragesSelected', { garageIds, tags });
    },
    setNavigationTagsSelected(tags) {
      this.navigationTags = tags;
    },
    navigationChangeGaragesSubscription({ authorization, val }) {
      this.navigationSetGaragesSubscription({ [authorization]: val });
    },
    navigationSetGaragesSubscription(authorizations) {
      for (const garage of this.navigationAvailableGarages) {
        if (!garage.subscriptions) {
          this.$set(garage, 'subscriptions', {});
        }
        for (const authorization of Object.keys(authorizations)) {
          this.$set(garage.subscriptions, authorization, authorizations[authorization]);
        }
      }
    },
  },
  watch: {
    navigationAutomationCampaignType(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.onDataUpdate(this.navigationDataProvider);
      }
    },
    navigationCockpitType(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.onDataUpdate(this.navigationDataProvider);
      }
    },
    navigationDataTypeId(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.onDataUpdate(this.navigationDataProvider);
      }
    },
    navigationDms(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.onDataUpdate(this.navigationDataProvider);
      }
    },
    navigationGarageId(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.onDataUpdate(this.navigationDataProvider);
      }
    },
    navigationLeadSaleType(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.onDataUpdate(this.navigationDataProvider);
      }
    },
    navigationPeriodId(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.onDataUpdate(this.navigationDataProvider);
      }
    },
    navigationUser(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.onDataUpdate(this.navigationDataProvider);
      }
    },
  },
};
</script>
