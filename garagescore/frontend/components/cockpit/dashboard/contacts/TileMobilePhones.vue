<template>
  <Tile class="tile-mobile">
    <Title
      class="tile-mobile__header"
      icon="icon-gs-mobile"
    >
      {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Mobiles") }}
    </Title>
    <div class="tile-mobile__body">
      <Stats
        :hoverTitle="`${$t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')('helpv1')}\n${$t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')('helpv2')}\n${$t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')('helpv3')}`"
        :value="contactsPercent(valid)"
        :positiveValue="90"
        :neutralValue="90"
        :warningValue="80"
        :dangerValue="0"
      >
        <template slot="value-unit">
          %
        </template>
        <template slot="label">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Valid") }}
        </template>
        <template slot="subtitle">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Valid") }} : {{ contactsPercent(validUncorrected) | renderNumber }}% ({{ validUncorrected | renderNumber }})<br>
          {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Corrected") }} : {{ contactsPercent(validCorrectedByClients) | renderNumber }}% ({{ validCorrectedByClients | renderNumber }})
        </template>
      </Stats>
      <Stats
        noMainValue
        :hoverTitle="`${$t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')('helpb1')}\n${$t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')('helpb2')}\n${$t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')('helpb3')}`"
        :value="contactsPercent(blocked)"
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
          {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Blocked", { blockedPercent: contactsPercent(blocked) }) }}
        </template>
        <template slot="subtitle">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Already") }} : {{ contactsPercent(blockedAlreadyContacted) | renderNumber }}% ({{ blockedAlreadyContacted | renderNumber }})<br>
          {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Unsubscribe") }} : {{ contactsPercent(blockedUnsuscribed) | renderNumber }}% ({{ blockedUnsuscribed | renderNumber }})
        </template>
      </Stats>
      <Stats
        :hoverTitle="`${$t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')('helpu1')}\n${$t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')('helpu2')}\n${$t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')('helpu3')}`"
        :value="contactsPercent(unreachable)"
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
          {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Unreachable") }}
        </template>
        <template slot="subtitle">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Invalid") }} : {{ contactsPercent(unreachableInvalid) | renderNumber }}% ({{ unreachableInvalid | renderNumber }})<br>
          {{ $t_locale('components/cockpit/dashboard/contacts/TileMobilePhones')("Empty") }} : {{ contactsPercent(unreachableEmpty) | renderNumber }}% ({{ unreachableEmpty | renderNumber }})
        </template>
      </Stats>
    </div>
  </Tile>
</template>

<script>
export default {
  methods: {
    contactsPercent(raw) {
      const value = (raw / this.garageHistory.totalShouldSurfaceInCampaignStats) * 100;
      return isNaN(value) ? 0 : value >= 10 ? Math.round(value) : Math.round((value * 100)) / 100;
    }
  },
  computed: {
    garageHistory() {
      return this.$store.state.cockpit.contacts.garageHistory;
    },

    valid() {
      return this.garageHistory.countValidPhones + this.garageHistory.countBlockedByPhone;
    },
    validUncorrected() {
      return this.valid - this.garageHistory.countModifiedPhone;
    },
    validCorrectedByClients() {
      return this.garageHistory.countModifiedPhone;
    },


    blocked() {
      return this.garageHistory.countBlockedByPhone;
    },
    blockedAlreadyContacted() {
      return this.garageHistory.countBlockedLastMonthPhone;
    },
    blockedUnsuscribed() {
      return this.garageHistory.countUnsubscribedByPhone;
    },


    unreachable() {
      return this.garageHistory.countWrongPhones + this.garageHistory.countNotPresentPhones;
    },
    unreachableInvalid() {
      return this.garageHistory.countWrongPhones;
    },
    unreachableEmpty() {
      return this.garageHistory.countNotPresentPhones;
    }
  }

}
</script>

<style lang="scss" scoped>
.tile-mobile {
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
  .tile-mobile {
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
