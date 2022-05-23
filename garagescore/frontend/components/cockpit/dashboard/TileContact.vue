<template>
  <Tile class="tile-contact">
    <Title class="tile-contact__header" icon="icon-gs-database">
      {{ $t_locale('components/cockpit/dashboard/TileContact')("Contacts") }}
    </Title>
    <div class="tile-contact__padding-bar"></div>
    <div class="tile-contact__body">
      <Stats
        :dangerValue="0"
        :hoverTitle="hoverAnsweringPrcTitle"
        :neutralValue="27"
        :positiveValue="27"
        :value="answeringPrc"
        :warningValue="20"
      >
        <template slot="value-unit">%</template>
        <template slot="label">{{ $t_locale('components/cockpit/dashboard/TileContact')("responded") }}</template>
        <template slot="subtitle">
          {{ countCurrentDataTypeResponded | renderNumber }}
          {{ $t_locale('components/cockpit/dashboard/TileContact')("on") }}
          {{ countReceivedAndScheduledSurveys | renderNumber }}
          {{ $t_locale('components/cockpit/dashboard/TileContact')("surveyed") }}
        </template>
      </Stats>
      <Stats
        :dangerValue="0"
        :hoverTitle="hoverContactablePrcTitle"
        :neutralValue="80"
        :positiveValue="80"
        :value="contactablePrc"
        :warningValue="70"
      >
        <template slot="value-unit">%</template>
        <template slot="label">{{ $t_locale('components/cockpit/dashboard/TileContact')("Surveyed") }}</template>
        <template slot="subtitle">
          {{ countReceivedAndScheduledSurveys | renderNumber }}
          {{ $t_locale('components/cockpit/dashboard/TileContact')("on") }}
          {{ kpiByPeriodSingle.totalShouldSurfaceInCampaignStats | renderNumber }}
          {{ $t_locale('components/cockpit/dashboard/TileContact')("contacts") }}
        </template>
      </Stats>
      <Stats
        :dangerValue="100"
        :hoverTitle="hoverNotContactablePrcTitle"
        :neutralValue="5"
        :positiveValue="5"
        :value="notContactablePrc"
        :warningValue="15"
        reverse
      >
        <template slot="value-unit">%</template>
        <template slot="label">{{ $t_locale('components/cockpit/dashboard/TileContact')("Unreachable") }}</template>
        <template slot="subtitle">
          {{ notContactable | renderNumber }}
          {{ $t_locale('components/cockpit/dashboard/TileContact')("on") }}
          {{ kpiByPeriodSingle.totalShouldSurfaceInCampaignStats | renderNumber }}
          {{ $t_locale('components/cockpit/dashboard/TileContact')("contacts") }}
        </template>
      </Stats>
    </div>
    <InterfaceLink
      :routename="'cockpit-contacts'"
      :valid="hasAccessToContacts"
      class="tile-solved-unsatisfied-period__link"
    >
      {{ $t_locale('components/cockpit/dashboard/TileContact')('goTo') }}
    </InterfaceLink>
  </Tile>
</template>

<script>
import dataTypes from "~/utils/models/data/type/data-types";

export default {
  props: {
    dataTypeId: {
      type: [Number, String],
    },
    kpiByPeriodSingle: {
      type: Object,
      required: true,
    },
    hasAccessToContacts: Boolean,
  },
  computed: {
    answeringPrc() {
      if (!this.countReceivedAndScheduledSurveys) {
        return "-";
      }

      const value =
        (this.countCurrentDataTypeResponded /
          this.countReceivedAndScheduledSurveys) *
        100;
      return this.formatPrc(value);
    },
    contactablePrc() {
      if (!this.kpiByPeriodSingle.totalShouldSurfaceInCampaignStats) {
        return "-";
      }

      const value =
        (this.countReceivedAndScheduledSurveys /
          this.kpiByPeriodSingle.totalShouldSurfaceInCampaignStats) *
        100;
      return this.formatPrc(value);
    },
    countCurrentDataTypeResponded() {
      const { dataTypeId, kpiByPeriodSingle } = this;
      switch (dataTypeId) {
        case dataTypes.MAINTENANCE:
          return kpiByPeriodSingle.countSurveyRespondedAPV;
        case dataTypes.NEW_VEHICLE_SALE:
          return kpiByPeriodSingle.countSurveyRespondedVN;
        case dataTypes.USED_VEHICLE_SALE:
          return kpiByPeriodSingle.countSurveyRespondedVO;
        default:
          return kpiByPeriodSingle.countSurveysResponded;
      }
    },
    countReceivedAndScheduledSurveys() {
      const { kpiByPeriodSingle } = this;
      const {
        countReceivedSurveys,
        countScheduledContacts,
      } = kpiByPeriodSingle || {};
      const receivedAndScheduleSurveyCount = countScheduledContacts
        ? countReceivedSurveys + countScheduledContacts
        : countReceivedSurveys;
      return receivedAndScheduleSurveyCount || null;
    },
    hoverAnsweringPrcTitle() {
      return `${this.$t_locale('components/cockpit/dashboard/TileContact')('helpr1')}\n${this.$t_locale('components/cockpit/dashboard/TileContact')('helpr2')}\n${this.$t_locale('components/cockpit/dashboard/TileContact')('helpr3')}`;
    },
    hoverContactablePrcTitle() {
      return `${this.$t_locale('components/cockpit/dashboard/TileContact')('helps1')}\n${this.$t_locale('components/cockpit/dashboard/TileContact')('helps2')}\n${this.$t_locale('components/cockpit/dashboard/TileContact')('helps3')}`;
    },
    hoverNotContactablePrcTitle() {
      return `${this.$t_locale('components/cockpit/dashboard/TileContact')('helpc1')}\n${this.$t_locale('components/cockpit/dashboard/TileContact')('helpc2')}\n${this.$t_locale('components/cockpit/dashboard/TileContact')('helpc3')}`
    },
    notContactable() {
      const value = this.kpiByPeriodSingle?.countNotContactable;
      return isNaN(value) ? 0 : value >= 10 ? Math.round(value) : value;
    },
    notContactablePrc() {
      const { formatPrc, kpiByPeriodSingle } = this;
      const {
        countNotContactable,
        totalShouldSurfaceInCampaignStats
      } = kpiByPeriodSingle || {};

      if (!totalShouldSurfaceInCampaignStats) {
        return "-";
      }

      const ratio = countNotContactable / totalShouldSurfaceInCampaignStats;
      const value = Math.round(ratio * 1000) / 10;

      return formatPrc(value);
    },
  },
  methods: {
    formatPrc(value) {
      if (isNaN(value)) {
        return "-";
      }
      return value >= 10
        ? Math.round(value)
        : Number.parseFloat(value).toFixed(1);
    }
  },
};
</script>

<style lang="scss" scoped>
.tile-contact {
  &__padding-bar {
    // IE hack for height 1px
    padding: 1px 0px 0px 0px;
    height: 0px;

    background-color: $light-grey;
    width: 100%;
  }
  &__header {
    justify-content: center;
    margin-bottom: 14px;
  }

  &__body {
    display: flex;
    flex-flow: column;
    justify-content: center;

    margin-top: 1rem;
    margin-bottom: 19px;

    & > *:not(:first-child) {
      margin-top: 2rem;
    }
  }

  &__link {
    margin-top: 10px;
    text-align: right;
    padding-left: 14px;
    color: $orange;
    text-decoration: none;
  }
}

@media (min-width: $breakpoint-min-md) {
  .tile-contact {
    &__header {
      justify-content: center;
      margin-bottom: 14px;
    }

    &__body {
      flex-flow: column;
      align-items: flex-start;
      height: 100%;
      justify-content: space-around;

      & > *:not(:first-child) {
        margin-top: 0px;
      }
    }
  }
}
</style>
