<template>
  <div class="page-welcome custom-scrollbar">
    <div class="page-welcome__stats">
      <div class="page-welcome__item">
        <TileSkeleton v-if="isSingleKpiByPeriodLoading">
          <StatsSkeleton />
          <StatsSkeleton />
          <StatsSkeleton />
        </TileSkeleton>
        <TileSatisfaction
          v-else
          :kpiByPeriodSingle="kpiByPeriodSingle"
          :hasAccessToSatisfaction="hasAccessToSatisfaction"
        />
      </div>
      <div class="page-welcome__item page-welcome__item--split">
        <div class="page-welcome__subitem page-welcome__subitem--a">
          <TileSkeleton v-if="isSingleKpiByPeriodLoading">
            <StatsSkeleton />
          </TileSkeleton>
          <TilePurchaseProject
            v-else
            :authorizations="authorizations"
            :closeModal="onCloseModal"
            :kpiByPeriodSingle="kpiByPeriodSingle"
            :hasAccessToLeads="hasAccessToLeads"
            :openModal="onOpenModal"
          />
        </div>
        <div
          v-if="enableTileSalesPeriod"
          class="page-welcome__subitem page-welcome__subitem--b"
        >
          <TileSkeleton v-if="isGaragesConversionsLoading">
            <StatsSkeleton />
          </TileSkeleton>
          <TileSalesPeriod
            v-else
            :authorizations="authorizations"
            :garagesConversions="garagesConversions"
            :openModal="onOpenModal"
          />
        </div>
        <div class="page-welcome__subitem page-welcome__subitem--c">
          <TileSkeleton v-if="isGaragesSolvedUnsatisfiedLoading">
            <StatsSkeleton />
          </TileSkeleton>
          <TileSolvedUnsatisfiedPeriod
            v-else
            :cockpitType="cockpitType"
            :garagesSolvedUnsatisfied="garagesSolvedUnsatisfied"
            :hasAccessToUnsatisfied="hasAccessToUnsatisfied"
          />
        </div>
      </div>
      <div class="page-welcome__item">
        <TileSkeleton v-if="isSingleKpiByPeriodLoading">
          <StatsSkeleton />
          <StatsSkeleton />
          <StatsSkeleton />
        </TileSkeleton>
        <TileContact
          v-else
          :dataTypeId="dataTypeId"
          :kpiByPeriodSingle="kpiByPeriodSingle"
        />
      </div>
    </div>
    <div
      class="page-welcome__ereputation"
      style="flex: 1; padding: 1rem; padding-top: 0;"
    >
      <TileSkeleton v-if="isEreputationKpisLoading">
        <div class="tiles">
          <EReputationStatsSkeleton v-for="n in 4" :key="n" />
        </div>
      </TileSkeleton>
      <TileEReputation
        v-else
        :erepKpis="erepKpis"
        :kpiByPeriodSingle="kpiByPeriodSingle"
        :interactive="false"
        :childModalProps="childModalProps"
        :openModal="onOpenModal"
        :ereputationProps="ereputationProps"
      />
    </div>
  </div>
</template>
<script>
import TileSatisfaction from '~/components/cockpit/dashboard/TileSatisfaction.vue';
import TileContact from '~/components/cockpit/dashboard/TileContact.vue';
import TilePurchaseProject from '~/components/cockpit/dashboard/TilePurchaseProject.vue';
import TileSalesPeriod from '~/components/cockpit/dashboard/TileSalesPeriod.vue';
import TileSolvedUnsatisfiedPeriod from '~/components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod.vue';
import TileEReputation from '~/components/cockpit/dashboard/TileEReputation.vue';

import EReputationStatsSkeleton from '~/components/global/skeleton/EReputationStatsSkeletons.vue';
import TileSkeleton from '~/components/global/skeleton/TileSkeleton.vue';
import StatsSkeleton from '~/components/global/skeleton/StatsSkeleton.vue';
import GarageTypes from '~/utils/models/garage.type.js';
import { setupHotJar } from '~/util/externalScripts/hotjar';

export default {
  name: "Welcome",
  components: {
    TileSatisfaction,
    TileContact,
    TilePurchaseProject,
    TileSalesPeriod,
    TileSolvedUnsatisfiedPeriod,
    TileEReputation,
    TileSkeleton,
    StatsSkeleton,
    EReputationStatsSkeleton,
  },
  props: {
    authorizations: Object,
    childModalProps: Object,
    cockpitType: String,
    dataTypeId: String,
    erepKpis: {
      type: Array,
      default() {
        return [];
      },
    },
    kpiByPeriodSingle: {
      type: Object,
      default() {
        return {};
      },
    },
    garagesConversions: {
      type: Object,
      default() {
        return {};
      },
    },
    garagesSolvedUnsatisfied: {
      type: Object,
      default() {
        return {};
      },
    },
    hasAccessToLeads: Boolean,
    hasAccessToSatisfaction: Boolean,
    hasAccessToUnsatisfied: Boolean,
    isEreputationKpisLoading: Boolean,
    isSingleKpiByPeriodLoading: Boolean,
    isGaragesConversionsLoading: Boolean,
    isGaragesSolvedUnsatisfiedLoading: Boolean,
    onOpenModal: Function,
    onCloseModal: Function,
    ereputationProps: {
      type: Object,
      required: true,
    }
  },

  computed: {
    enableTileSalesPeriod() {
      return !GarageTypes.VEHICLE_INSPECTION === this.$store.getters['cockpit/cockpitType'];
    },
  },

  async mounted() {
    setupHotJar(this.$store.getters['locale'], 'welcome');
    return this.$store.dispatch('cockpit/welcome/refreshView');
  },
};
</script>

<style lang="scss" scoped>
.tiles {
  display: flex;
  align-items: center;
  width: 100%;

  & > * {
    flex: 1;
    width: 100%;
  }

  & > *:not(:first-child) {
    margin-left: 1rem;
  }

  @media (max-width: 1200px) {
    flex-flow: column;

    & > *:not(:first-child) {
      margin-top: 1rem;
    }
  }
}

.page-welcome {
  position: relative;
  height: calc(100vh - 8.5rem);
  overflow-x: hidden;
  overflow-y: auto;
  top: 1rem;
  padding-top: .15rem;
  box-sizing: border-box;

  .tiles {
    display: flex;
    align-items: center;
    padding: 20px;

    @media (max-width: 1200px) {
      flex-flow: column;
    }
  }

  &__stats {
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-flow: column;
    padding: 1rem;
    padding-top: 0;
  }

  &__subitem {
    flex: 1;
    margin-bottom: 1rem;

    &:last-child {
      margin: 0;
    }
  }

  &__item {
    height: 100%;
    width: 100%;

    &--split {
      margin-bottom: 0;
    }

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  // Prevent horizontal scroll bar apparition
  &__ereputation {
    .tiles {
      padding: 0;
    }

    .tile-skeleton__body {
      padding: 20px;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .page-welcome {
    &__stats {
      flex-flow: row;
      height: 36rem; //IE FIX
    }

    &__subitem {
      margin-bottom: 1rem;

      &:first-child {
        margin: 0;
        margin-bottom: 1rem;
      }

      &:last-child {
        margin: 0;
      }
    }

    &__item {
      flex: 1;
      height: 36rem; //IE FIX
      margin: 0 1rem 0 1rem;

      &--split {
        display: flex;
        flex-flow: column;
      }

      &:not(:last-child) {
        margin: 0;
      }

      &:first-child {
        margin: 0 1rem 0 0;
      }

      &:last-child {
        margin: 0 0 0 1rem;
      }

      &--twice {
        flex-direction: column;
      }
    }
  }
}

@media (max-width: $breakpoint-min-md) {
  .page-welcome {
    top: 0;
    height: calc(100vh - 8.5rem);
  }
}
</style>
