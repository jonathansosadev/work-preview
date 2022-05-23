<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="handleBack">
              <i class="icon-gs-solid-left" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('back') }}</span>
            </button>
          </div>
        </template>
        <Searchbar
          :options="filterOptions"
          :filters="filters"
          v-model="currentSearch"
          :filtersDisabled="filtersDisabled"
          @filtersChange="onFiltersChange"
          @input="onSearchChange"
          @searchClick="onSearch"
        />
      </div>
    </div>

    <div class="table__header table-cockpit-header">
      <TableHeader
        class="table-unsatisfied-header__review"
        :style="{ flex: 2 }"
        :display="['md', 'lg']"
      >
        <!-- New unsatisfied button  -->
        <Button
          type="contained-white"
          @click="openModal"
          v-tooltip="{ content: $t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('create') }"
        >
          <template>
            <template slot="left">
              <i class="icon-gs-add" />
            </template>
            <AppText tag="span" bold>
              {{ $t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('create') }}
            </AppText>
          </template>
        </Button>
      </TableHeader>
      <TableHeader center />
      <TableHeader center>
        <TableFiltersLabel
          filterKey="surveySatisfactionLevel"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="unsatisfiedElapsedTime"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="unsatisfiedManager"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="unsatisfiedStatus"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="unsatisfiedFollowUpStatus"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
    </div>
  </div>
</template>

<script>
import TableFiltersLabel from '~/components/global/TableFiltersLabel';
import Searchbar from '~/components/ui/searchbar/Searchbar';
import UnsatisfiedFollowupStatus from '~/utils/models/data/type/unsatisfied-followup-status';

export default {
  components: {
    Searchbar,
    TableFiltersLabel,
  },

  props: {
    filtersDisabled: {
      type: Boolean,
      default: false,
    },
    search: String,
    changeFilters: {
      type: Function,
      required: true,
    },
    openModalFunction: {
      type: Function,
      required: true,
    },
    filters: {
      type: Object,
      required: true,
    },
    onSearchFunction: {
      type: Function,
      required: true,
    },
    onSearchChangeFunction: {
      type: Function,
      required: true,
    },
    fetchUnsatisfiedList: {
      type: Function,
      required: true,
    },
    cockpitType: {
      type: String,
      required: true,
    },
    availableGarages: {
      type: Array,
      default: () => [],
    },
    addManualUnsatisfied: {
      type: Function,
      required: true,
    },
    closeModal: {
      type: Function,
      required: true,
    },
    currentGarageId: {
      type: Array,
      validator(value) {
        if (!(value instanceof Array) && value !== null) {
          const messagePrefix = '[Vue warn]:';
          const messageBody = 'Invalid prop: type check failed for prop';
          const propName = 'currentGarageId';
          const errorMessage = `${messagePrefix} ${messageBody} "${propName}".`;
          const expectedValueMessage = `Expected Array or Null, got ${typeof value}`;

          console.error(`${errorMessage}${expectedValueMessage}`);
          return false;
        }
        return true;
      },
    },
    currentUserId: String,
    isManager: Boolean,
    hasBackArrow: Boolean,
    handleBack: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      currentSearch: this.search,
      filterOptions: [
        {
          icon: 'icon-gs-gauge-dashboard',
          label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('score'),
          key: 'surveySatisfactionLevel',
          values: [
            { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('Neutral'), value: 'Neutral' },
            { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('Detractor'), value: 'Detractor' },
          ],
        },

        {
          icon: 'icon-gs-time-hour-glass',
          label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedElapsedTime'),
          key: 'unsatisfiedElapsedTime',
          values: [
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedElapsedTimeNew'),
              value: 'New',
            },
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedElapsedTimeImminent'),
              value: 'Imminent',
            },
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedElapsedTimeExceeded'),
              value: 'Exceeded',
            },
          ],
        },

        {
          icon: 'icon-gs-group',
          label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedManager'),
          key: 'unsatisfiedManager',
          values: [
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedManagerMyTickets'),
              value: this.currentUserId,
            },
            ...(this.isManager
              ? [{ label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedManagerTeam'), value: 'Team' }]
              : []),
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedManagerUnassigned'),
              value: 'Unassigned',
            },
          ],
        },

        {
          icon: 'icon-gs-folder',
          label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedStatus'),
          key: 'unsatisfiedStatus',
          values: [
            { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedStatusContact'), value: 'Contact' },
            { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedStatusVisit'), value: 'Visit' },
            { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedStatusClosing'), value: 'Closing' },
            { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedStatusResolved'), value: 'Resolved' },
            { label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedStatusClosed'), value: 'Closed' },
          ],
        },

        {
          icon: 'icon-gs-sad',
          label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')('unsatisfiedFollowUpStatus'),
          key: 'unsatisfiedFollowUpStatus',
          values: [
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')(UnsatisfiedFollowupStatus.NEW_UNSATISFIED),
              value: UnsatisfiedFollowupStatus.NEW_UNSATISFIED,
            },
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')(UnsatisfiedFollowupStatus.RESOLVED),
              value: UnsatisfiedFollowupStatus.RESOLVED,
            },
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')(UnsatisfiedFollowupStatus.IN_PROGRESS),
              value: UnsatisfiedFollowupStatus.IN_PROGRESS,
            },
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')(UnsatisfiedFollowupStatus.NOT_RESOLVED),
              value: UnsatisfiedFollowupStatus.NOT_RESOLVED,
            },
            {
              label: this.$t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader')(UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER),
              value: UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER,
            },
          ],
        },
      ],
    };
  },

  methods: {
    onFiltersChange(newFilters) {
      this.changeFilters({ filters: newFilters });
    },

    async onSearch() {
      this.onSearchFunction(this.currentSearch);
      await this.fetchUnsatisfiedList({ page: 1, append: false });
    },

    onSearchChange() {
      this.onSearchChangeFunction(this.currentSearch);
    },

    openModal() {
      this.openModalFunction({
        component: 'ModalAddUnsatisfied',
        props: {
          cockpitType: this.cockpitType,
          availableGarages: this.availableGarages,
          addManualUnsatisfied: this.addManualUnsatisfied,
          currentGarageId: this.currentGarageId,
          closeModal: this.closeModal,
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.table-unsatisfied-header {
  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
<style lang="scss" scoped>
</style>
