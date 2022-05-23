<template>
  <div class="app-header">
    <Header class="app-header__main">
      <div class="app-header__left">
        <AppFilters
          v-if="!showFilters"
          :availableAutomationCampaigns="availableAutomationCampaigns"
          :availableCampaignTypes="availableCampaignTypes"
          :availableCockpitTypes="availableCockpitTypes"
          :availableDataTypes="availableDataTypes"
          :availableDms="availableDms"
          :availableFrontDeskUsers="availableFrontDeskUsers"
          :availableGarages="availableGarages"
          :availableLeadSaleTypes="availableLeadSaleTypes"
          :availablePeriods="availablePeriods"
          :availableUsers="availableUsers"

          :authorizations="authorizations"
          :currentCockpitType="currentCockpitType"
          :currentDMS="currentDMS"
          :currentPeriodId="periodId"
          :currentUser="currentUser"
          :currentUserId="currentUserId"
          :garageIds="garageIds"
          :setCurrentCockpitType="setCurrentCockpitType"
          :setCurrentDMS="setCurrentDMS"
          :setCurrentPeriod="setCurrentPeriod"
          :setCurrentUser="setCurrentUser"
          :setCurrentLeadSaleType="setCurrentLeadSaleType"
          :closeModalFunction="closeModalFunction"
          :openModalFunction="openModalFunction"

          :customExports="customExports"
          :deleteCustomExportFunction="deleteCustomExportFunction"
          :exportGetAvailableFrontDeskUsers="exportGetAvailableFrontDeskUsers"
          :openCustomExportModalFunction="openCustomExportModalFunction"
          :saveCustomExportFunction="saveCustomExportFunction"
          :shortcutExportPayload="shortcutExportPayload"
          :startExportFunction="startExportFunction"
          :updateCustomExportFunction="updateCustomExportFunction"

          :applyItemsSelected="applyItemsSelected"
          :openModalCreateTag="openModalCreateTag"
          :openModalDeleteTag="openModalDeleteTag"
          :openModalUpdateTag="openModalUpdateTag"

          :optionSelected="optionSelected"
          :garagesFilter="garagesFilter"
          :setGarageFilterMode="setGarageFilterMode"
          :selectedTags="selectedTags"
          :setSelectedTags="setSelectedTags"
          headerFilters
          class="app-header__filters"
        />
      </div>
      <div class="app-header__right">
        <LanguageSwitcher v-if="shouldDisplayLanguageDropdown" />
        <i
          v-if="showConnectAs"
          v-tooltip="{ content: 'Se connecter en tant que cet utilisateur' }"
          class="icon-gs-user-anonymous app-header__icon"
          @click="connectAs"
        />
        <a
          v-if="hasAccessToDarkBo"
          href="/backoffice"
          class="app-header__link"
        >
          <i
            class="icon-gs-cog app-header__icon"
            v-tooltip="{ content: 'Backoffice' }"
          />
        </a>
        <nuxt-link
          v-if="hasAccessToGreyBo"
          @click.native="toGreyBo"
          to="/grey-bo"
          class="app-header__link"
        >
          <i
            class="icon-gs-repair app-header__icon"
            v-tooltip="{ content: 'Outils internes' }"
          />
        </nuxt-link>
        <div class="app-header__user-profile">
          <UserProfile
            :currentUser="currentUser"
            mode="desktop"
          />
        </div>
      </div>
      <div
        v-if="displayFilters"
        @click="toggleFilters"
        class="app-header__shader"
      />
    </Header>
  </div>
</template>

<script>
import AppFilters from "~/components/global/AppFilters.vue";
import UserProfile from "~/components/global/UserProfile.vue";
import LanguageSwitcher from "~/components/i18n/LanguageSwitcher.vue";
import { garagesValidator } from '~/utils/components/validators';

export default {
  name: "CockpitHeader",
  components: {
    AppFilters,
    LanguageSwitcher,
    UserProfile,
  },
  props: {
    adminData: {
      type: Object,
      required: true,
    },
    onConnectAs: {
      type: Function,
      required: true,
    },

    isFiltersVisible: Boolean,

    authorizations: {
      type: Object,
      required: true,
    },
    hasAccessToDarkBo: Boolean,
    hasAccessToEreputation: Boolean,
    hasAccessToGreyBo: Boolean,

    availableAutomationCampaigns: {
      type: Array,
      default: () => [],
    },
    availableCampaignTypes: {
      type: Array,
      default: () => [],
    },
    availableCockpitTypes: {
      type: Array,
      default: () => []
    },
    availableDataTypes: {
      type: Array,
      default: () => [],
    },
    availableDms: {
      type: Array,
      default: () => []
    },
    availableFrontDeskUsers: {
      type: Array,
      default: () => [],
    },
    availableGarages: {
      type: Array,
      default: () => [],
    },
    availableLeadSaleTypes: {
      type: Array,
      default: () => [],
    },
    availablePeriods: {
      type: Array,
      default: () => [],
    },
    availableUsers: {
      type: Array,
      default: () => []
    },

    closeModalFunction: {
      type: Function,
      default: () => console.error('CockpitHeader.vue ::closeModalFunction not set')
    },
    openModalFunction: {
      type: Function,
      default: () => console.error('CockpitHeader.vue :: openModalFunction not set')
    },

    currentCockpitType: {
      type: String,
      default: ""
    },
    currentDMS: {
      type: Object,
      default: () => {}
    },
    currentUser: {
      type: Object,
      default: () => ({}),
    },
    currentUserId: {
      type: String,
      default: ''
    },
    garageIds: {
      required: true,
      validator: garagesValidator
    },
    periodId: {
      type: String,
      default: ''
    },
    setCurrentCockpitType: {
      type: Function,
      default: () =>({})
    },
    setCurrentDMS: {
      type: Function,
      default: () => console.error('CockpitHeader.vue :: setCurrentDMS not set')
    },
    setCurrentPeriod: {
      type: Function,
      default: () => console.error('CockpitHeader.vue :: setCurrentPeriod not set')
    },
    setCurrentLeadSaleType: {
      type: Function,
      required: true,
    },
    setCurrentUser: {
      type: Function,
      default: () => console.error('CockpitHeader.vue :: setCurrentUser not set')
    },

    customExports: {
      type: Array,
      default: () => [],
    },
    deleteCustomExportFunction: {
      type: Function,
      default: () => console.error('CockpitHeader.vue :: updateCustomExportFunction not set')
    },
    exportGetAvailableFrontDeskUsers: {
      type: Function,
      default: () => console.error('CockpitHeader.vue :: exportGetAvailableFrontDeskUsers not set')
    },
    openCustomExportModalFunction: {
      type: Function,
      default:() => console.error('CockpitHeader:vue :: openCustomExportModalFunction not set')
    },
    saveCustomExportFunction: {
      type: Function,
      default: () => console.error('CockpitHeader.vue :: saveCustomExportFunction not set')
    },
    shortcutExportPayload: {
      type: Object,
      default: () => null,
    },
    startExportFunction: {
      type: Function,
      default: () => console.error('CockpitHeader.vue :: startExportFunction not set')
    },
    updateCustomExportFunction: {
      type: Function,
      default: () => console.error('CockpitHeader.vue :: updateCustomExportFunction not set')
    },

    garagesFilter: {
      type: Array,
      default: () => []
    },
    optionSelected: {
      type: String,
      default: 'garages'
    },
    setGarageFilterMode: {
      type: Function,
      default: () => console.error(
        'CockpitHeader.vue :: setGarageFilterMode not set'
      )
    },
    openModalCreateTag: {
      type: Function,
      default: (garagesSelected) => console.error('CockpitHeader.vue :: openModalCreateTag is not set', garagesSelected)
    },
    openModalDeleteTag: {
      type: Function,
      default: (tagName) => console.error('CockpitHeader.vue :: openModalDeleteTag is not set', tagName)
    },
    openModalUpdateTag: {
      type: Function,
      default: (id, nameTag, garagesSelected) => console.error(
        'CockpitHeader.vue :: openModalUpdateTag is not set',
        id,
        nameTag,
        garagesSelected,
      )
    },
    applyItemsSelected: {
      type: Function,
      default: (garages, tags) => console.error('CockpitHeader.vue :: applyItemsSelected is not set', garages, tags)
    },
    selectedTags:{
      type: Array,
      default: () => []
    },
    setSelectedTags: {
      type: Function,
      default: ()=>console.error('CockpitHeader.vue :: setSelectedTags is not set')
    }
  },

  data() {
    return {
      displayFilters: false,
      filterIntersection: false,
      observer: null,
    };
  },

  mounted() {
    const el = document.getElementById("filters-inside");

    if (el) {
      this.observer = new IntersectionObserver(
        (entries) => {
          const [firstEntry] = entries || [];
          this.filterIntersection = firstEntry && !firstEntry.isIntersecting;
        },
        { rootMargin: "-30px 0px 0px 0px" },
      );

      this.observer.observe(el);
    }
  },
  beforeDestroy() {
    const el = document.getElementById("filters-inside");
    if (el) {
      this.observer.unobserve(el);
    }
  },

  computed: {
    shouldDisplayLanguageDropdown() {
      return this.$mq !== 'sm' && this.hasAccessToGreyBo;
    },
    idInQuery() {
      return this.$route.params.id || this.$route.query.id;
    },
    showConnectAs() {
      return (
        this.hasAccessToGreyBo &&
        this.$route.name === "cockpit-admin-user-id" &&
        this.idInQuery
      );
    },
    showFilters() {
      const routeName = this.$route.name;
      const isAutomationRouteWithoutData = (
        routeName.includes('automation')
        && !this.authorizations.hasAutomationAtLeast
      );
      const isCrossLeadRoute = routeName.includes('cross-leads');
      const areIntersectingFiltersVisible = (
        this.filterIntersection
        && this.isFiltersVisible
      );
      return (
        areIntersectingFiltersVisible
        || isAutomationRouteWithoutData
        || isCrossLeadRoute
      );
    },
  },

  methods: {
    connectAs() {
      try {
        const {
          adminData,
          idInQuery,
        } = this;
        const userEmail = adminData.profile.user.email;
        this.onConnectAs({ id: idInQuery, userEmail });
      } catch (e) {
        console.error(e);
      }
    },
    toggleFilters() {
      this.displayFilters = !this.displayFilters;
    },
    toGreyBo()  {
      this.$router.push("/grey-bo");
    },
  }
};
</script>

<style lang="scss" scoped>
.app-header {
  ::v-deep .dropdown__dropdown {
    z-index: 102;
  }

  &__main {
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    align-items: center;
  }

  &__left {
    display: flex;
    height: 100%;
    flex: 1;
    width: 0;
  }

  &__filters {
    width: auto;
    justify-content: flex-end !important;

    ::v-deep .dropdown-mobile {
      transform: scale(0.75);
    }

    ::v-deep .dropdown-mobile__label {
      display: none;
    }

    ::v-deep .dropdown-mobile--active {
      .dropdown-mobile__icon-wrapper {
        background-color: $white;
      }
    }

    ::v-deep .app-filters__part {
      flex: unset;
    }

    ::v-deep .dropdown-mobile {
      padding: 0;
    }
  }

  &__right {
    height: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  &__message {
    color: $blue;
    padding: 0 1rem;
  }

  &__part {
    height: 100%;
    margin: auto;
    display: none;

    &:not(:last-child) {
      border-right: 1px solid $grey;
    }
  }

  &__icon {
    cursor: pointer;
    color: $white;
    margin-right: 1rem;
    display: block;
    font-size: 1.5rem;
  }

  &__link {
    text-decoration: none;
    display: none;
  }

  &__badge {
    margin-right: 0.25rem;
  }

  &__user-profile {
    display: none;
  }

  &__shader {
    position: absolute;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.75);
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
  }
}

@media (min-width: $breakpoint-min-md) {
  .app-header {
    &__left {
      flex: 1;
    }

    &__part {
      display: block;
    }

    &__link {
      display: block;
    }

    &__btn-filters {
      display: none;
    }

    &__user-profile {
      display: block;
    }

    &__filters {
      width: 100%;
      justify-content: flex-start !important;
      flex-wrap: nowrap !important;

      ::v-deep .app-filters__part {
        flex: 0 1 auto;
      }

      ::v-deep .dropdown-mobile {
        transform: scale(0.75);
      }

      ::v-deep .dropdown-mobile__label {
        display: none;
      }

      ::v-deep .dropdown-mobile--active {
        .dropdown-mobile__icon-wrapper {
          background-color: $white;
        }
      }

      ::v-deep .dropdown-mobile {
        padding: 0;
      }
    }
  }
}
</style>
