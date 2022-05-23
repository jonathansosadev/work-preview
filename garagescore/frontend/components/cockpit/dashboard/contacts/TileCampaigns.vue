<template>
  <Tile class="tile-campaigns">
    <Title
      class="tile-campaigns__header"
      icon="icon-gs-cloud-upload"
    >
      {{ $t_locale('components/cockpit/dashboard/contacts/TileCampaigns')("Campaign") }}
    </Title>
    <div class="tile-campaigns__body">
      <Stats
        :hoverTitle="`${$t_locale('components/cockpit/dashboard/contacts/TileCampaigns')('helps1')}\n${$t_locale('components/cockpit/dashboard/contacts/TileCampaigns')('helps2')}\n${$t_locale('components/cockpit/dashboard/contacts/TileCampaigns')('helps3')}`"
        :value="validPercent"
        :positiveValue="80"
        :neutralValue="80"
        :warningValue="70"
        :dangerValue="0"
      >
        <template slot="value-unit">
          %
        </template>
        <template slot="label">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileCampaigns')("Surveyed") }}
        </template>
        <template slot="subtitle">
          {{ validNumber | renderNumber }} {{ $t_locale('components/cockpit/dashboard/contacts/TileCampaigns')("customerSurveyed") }}.
        </template>
      </Stats>
      <Stats
        :hoverTitle="`${$t_locale('components/cockpit/dashboard/contacts/TileCampaigns')('helpb1')}\n${$t_locale('components/cockpit/dashboard/contacts/TileCampaigns')('helpb2')}\n${$t_locale('components/cockpit/dashboard/contacts/TileCampaigns')('helpb3')}`"
        :value="blockedPercent"
        reverse
        :positiveValue="10"
        :neutralValue="10"
        :warningValue="20"
        :dangerValue="100"
      >
        <template slot="value-unit">
          %
        </template>
        <template slot="label">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileCampaigns')("Blocked") }}
        </template>
        <template slot="subtitle">
          {{ blockedNumber | renderNumber }} {{ $t_locale('components/cockpit/dashboard/contacts/TileCampaigns')("campaignBlocked") }}.
        </template>
      </Stats>
      <Stats
        :hoverTitle="`${$t_locale('components/cockpit/dashboard/contacts/TileCampaigns')('helpu1')}\n${$t_locale('components/cockpit/dashboard/contacts/TileCampaigns')('helpu2')}\n${$t_locale('components/cockpit/dashboard/contacts/TileCampaigns')('helpu3')}`"
        :value="unreachablePercent"
        reverse
        :positiveValue="20"
        :neutralValue="20"
        :warningValue="30"
        :dangerValue="100"
      >
        <template slot="value-unit">
          %
        </template>
        <template slot="label">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileCampaigns')("Unreachable") }}
        </template>
        <template
          slot="subtitle"
        >
          {{ unreachableNumber | renderNumber }} {{ $t_locale('components/cockpit/dashboard/contacts/TileCampaigns')("customerUnreachable") }}.
        </template>
      </Stats>
    </div>
  </Tile>
</template>
<script>
export default {
  computed: {
    garageHistory() {
      return this.$store.state.cockpit.contacts.garageHistory;
    },

    countReceivedAndScheduledSurveys() {
      return this.garageHistory.countScheduledContacts ? this.garageHistory.countReceivedSurveys + this.garageHistory.countScheduledContacts || null : this.garageHistory.countReceivedSurveys || null;
    },

    validPercent() {
      const valid = this.countReceivedAndScheduledSurveys
        ? this.countReceivedAndScheduledSurveys
        : this.garageHistory.countReceivedSurveys;
      const value =
        Math.round((valid / this.garageHistory.totalShouldSurfaceInCampaignStats) * 1000) / 10;
      return isNaN(value) ? 0 : value >= 10 ? Math.round(value) : value;
    },
    validNumber() {
      const value = this.countReceivedAndScheduledSurveys
        ? this.countReceivedAndScheduledSurveys
        : this.garageHistory.countReceivedSurveys;
      return isNaN(value) ? 0 : value >= 10 ? Math.round(value) : value;
    },

    blockedPercent() {
      const value =
        Math.round(
          (this.garageHistory.countBlocked / this.garageHistory.totalShouldSurfaceInCampaignStats) *
            1000
        ) / 10;
      return isNaN(value) ? 0 : value >= 10 ? Math.round(value) : value;
    },
    blockedNumber() {
      const value = this.garageHistory.countBlocked;
      return isNaN(value) ? 0 : value >= 10 ? Math.round(value) : value;
    },

    unreachablePercent() {
      const value =
        Math.round(
          (this.garageHistory.countNotContactable /
            this.garageHistory.totalShouldSurfaceInCampaignStats) *
            1000
        ) / 10;
      return isNaN(value) ? 0 : value >= 10 ? Math.round(value) : value;
    },

    unreachableNumber() {
      const value = this.garageHistory.countNotContactable;
      return isNaN(value) ? 0 : value >= 10 ? Math.round(value) : value;
    }
  }
};
</script>

<style lang="scss" scoped>
.tile-campaigns {
  &__header {
    justify-content: center;
    margin-bottom: 3.5rem;
  }

  &__body {
    display: flex;
    flex-flow: row;
    height: 100%;
  }
}

@media (min-width: $breakpoint-min-md) {
  .tile-campaigns {
    &__header {
      justify-content: flex-start;
    }

    &__body {
      flex-flow: column;
      align-items: flex-start;
    }
  }
}
</style>
