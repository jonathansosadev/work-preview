<template>
  <Tile class="tile-satisfaction">
    <Title icon="icon-gs-chat-bubble" class="tile-satisfaction__header">
      {{ $t_locale('components/cockpit/dashboard/TileSatisfaction')("satisfaction") }}
    </Title>
    <div class="tile-satisfaction__padding-bar"></div>
    <div class="tile-satisfaction__body">
      <Stats
        :dangerValue="-100"
        :hoverTitle="npsScoreHoverTitle"
        :neutralValue="60"
        :positiveValue="60"
        :value="npsScore"
        :warningValue="40"
      >
        <template slot="label">NPS</template>
        <template slot="label-subtitle">(Net Promoter Score)</template>
        <template slot="subtitle">
          {{ kpiByPeriodSingle.countSurveysResponded | renderNumber }}
          {{ $t_locale('components/cockpit/dashboard/TileSatisfaction')("responded") }}
        </template>
      </Stats>
      <Stats
        :dangerValue="0"
        :hoverTitle="promotorPrcHoverTitle"
        :neutralValue="85"
        :positiveValue="85"
        :value="surveyPromotorPrc"
        :warningValue="75"
      >
        <template slot="value-unit">%</template>
        <template slot="label">{{ $t_locale('components/cockpit/dashboard/TileSatisfaction')("promoters") }}</template>
        <template
          slot="subtitle"
        >{{ kpiByPeriodSingle.countSurveySatisfied | renderNumber }} {{ $t_locale('components/cockpit/dashboard/TileSatisfaction')("on") }} {{ kpiByPeriodSingle.countSurveysResponded | renderNumber }} {{ $t_locale('components/cockpit/dashboard/TileSatisfaction')("responded") }}</template>
      </Stats>
      <Stats
        :dangerValue="100"
        :hoverTitle="detractorPrcHoverTitle"
        :neutralValue="5"
        :positiveValue="5"
        :value="surveyDetractorPrc"
        :warningValue="10"
        reverse
      >
        <template slot="value-unit">%</template>
        <template slot="label">{{ $t_locale('components/cockpit/dashboard/TileSatisfaction')("detractors") }}</template>
        <template slot="subtitle">
          {{ kpiByPeriodSingle.countSurveyUnsatisfied | renderNumber }}
          {{ $t_locale('components/cockpit/dashboard/TileSatisfaction')("on") }}
          {{ kpiByPeriodSingle.countSurveysResponded | renderNumber }}
          {{ $t_locale('components/cockpit/dashboard/TileSatisfaction')("responded") }}
        </template>
      </Stats>
    </div>
    <InterfaceLink
      :routename="'cockpit-satisfaction'"
      :valid="hasAccessToSatisfaction"
      class="tile-solved-unsatisfied-period__link"
    >
      {{ $t_locale('components/cockpit/dashboard/TileSatisfaction')('goTo') }}
    </InterfaceLink>
  </Tile>
</template>

<script>
export default {
  props: {
    kpiByPeriodSingle: {
      type: Object,
      required: true,
    },
    hasAccessToSatisfaction: Boolean,
  },
  computed: {
    npsScore() {
      if (!this.kpiByPeriodSingle.countSurveysResponded) {
        return "-";
      }
      const rawPromotorRate = 100 * this.kpiByPeriodSingle.countSurveySatisfied / this.kpiByPeriodSingle.countSurveysResponded;
      const rawDetractorRate = 100 * this.kpiByPeriodSingle.countSurveyUnsatisfied / this.kpiByPeriodSingle.countSurveysResponded;
      return Math.round(rawPromotorRate - rawDetractorRate);
    },
    detractorPrcHoverTitle() {
      return `${this.$t_locale('components/cockpit/dashboard/TileSatisfaction')('helpd1')}\n${this.$t_locale('components/cockpit/dashboard/TileSatisfaction')('helpd2')}\n${this.$t_locale('components/cockpit/dashboard/TileSatisfaction')('helpd3')}`
    },
    npsScoreHoverTitle() {
      return `${this.$t_locale('components/cockpit/dashboard/TileSatisfaction')('helpnps1')}\n${this.$t_locale('components/cockpit/dashboard/TileSatisfaction')('helpnps2')}\n${this.$t_locale('components/cockpit/dashboard/TileSatisfaction')('helpnps3')}`;
    },
    promotorPrcHoverTitle() {
      return `${this.$t_locale('components/cockpit/dashboard/TileSatisfaction')('helpp1')}\n${this.$t_locale('components/cockpit/dashboard/TileSatisfaction')('helpp2')}\n${this.$t_locale('components/cockpit/dashboard/TileSatisfaction')('helpp3')}`
    },
    surveyPromotorPrc() {
      if (!this.kpiByPeriodSingle.countSurveysResponded) {
        return "-";
      }
      return Math.round(
        (this.kpiByPeriodSingle.countSurveySatisfied /
          this.kpiByPeriodSingle.countSurveysResponded) *
          100
      );
    },
    surveyDetractorPrc() {
      if (!this.kpiByPeriodSingle.countSurveysResponded) {
        return "-";
      }
      return Math.round(
        (this.kpiByPeriodSingle.countSurveyUnsatisfied /
          this.kpiByPeriodSingle.countSurveysResponded) *
          100
      );
    }
  },
};
</script>

<style lang="scss" scoped>
.tile-satisfaction {
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
  .tile-satisfaction {
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
