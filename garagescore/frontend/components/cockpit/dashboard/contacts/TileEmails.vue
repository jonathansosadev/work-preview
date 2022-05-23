<template>
  <Tile class="tile-email">
    <Title
      class="tile-email__header"
      icon="icon-gs-web-mail"
    >
      {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Emails") }}
    </Title>
    <div class="tile-email__body">
      <Stats
        :hoverTitle="`${$t_locale('components/cockpit/dashboard/contacts/TileEmails')('helpv1')}\n${$t_locale('components/cockpit/dashboard/contacts/TileEmails')('helpv2')}\n${$t_locale('components/cockpit/dashboard/contacts/TileEmails')('helpv3')}`"
        :value="contactsPercent(valid)"
        :positiveValue="75"
        :neutralValue="75"
        :warningValue="65"
        :dangerValue="0"
      >
        <template slot="value-unit">
          %
        </template>
        <template slot="label">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Valid") }}
        </template>
        <template slot="subtitle">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Valid") }} : {{ contactsPercent(validUncorrected) | renderNumber }}% ({{ validUncorrected | renderNumber }})<br>
          {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Corrected") }} : {{ contactsPercent(validCorrectedByClients) | renderNumber }}% ({{ validCorrectedByClients | renderNumber }})
        </template>
      </Stats>
      <Stats
        noMainValue
        :hoverTitle="`${$t_locale('components/cockpit/dashboard/contacts/TileEmails')('helpb1')}\n${$t_locale('components/cockpit/dashboard/contacts/TileEmails')('helpb2')}\n${$t_locale('components/cockpit/dashboard/contacts/TileEmails')('helpb3')}`"
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
          {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Blocked", { blockedPercent: contactsPercent(blocked) }) }}
        </template>
        <template slot="subtitle">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Already") }} : {{ contactsPercent(blockedAlreadyContacted) | renderNumber }}% ({{ blockedAlreadyContacted | renderNumber }})<br>
          {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Unsubscribe") }} : {{ contactsPercent(blockedUnsuscribed) | renderNumber }}% ({{ blockedUnsuscribed | renderNumber }})
        </template>
      </Stats>
      <Stats
        :hoverTitle="`${$t_locale('components/cockpit/dashboard/contacts/TileEmails')('helpu1')}\n${$t_locale('components/cockpit/dashboard/contacts/TileEmails')('helpu2')}\n${$t_locale('components/cockpit/dashboard/contacts/TileEmails')('helpu3')}`"
        :value="contactsPercent(unreachable)"
        reverse
        :positiveValue="25"
        :neutralValue="25"
        :warningValue="35"
        :dangerValue="100"
      >
        <template slot="value-unit">
          %
        </template>
        <template slot="label">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Unreachable") }}
        </template>
        <template slot="subtitle">
          {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Invalid") }} : {{ contactsPercent(unreachableInvalid) | renderNumber }}% ({{ unreachableInvalid | renderNumber }})<br>
          {{ $t_locale('components/cockpit/dashboard/contacts/TileEmails')("Empty") }} : {{ contactsPercent(unreachableEmpty) | renderNumber }}% ({{ unreachableEmpty | renderNumber }})
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
      return this.garageHistory.countValidEmails + this.blocked;
    },
    validUncorrected() {
      return this.valid - this.garageHistory.countModifiedEmail;
    },
    validCorrectedByClients() {
      return this.garageHistory.countModifiedEmail;
    },


    blocked() {
      return this.garageHistory.countBlockedByEmail;
    },
    blockedAlreadyContacted() {
      return this.garageHistory.countBlockedLastMonthEmail;
    },
    blockedUnsuscribed() {
      return this.garageHistory.countUnsubscribedByEmail;
    },


    unreachable() {
      return this.garageHistory.countWrongEmails + this.garageHistory.countNotPresentEmails
    },
    unreachableInvalid() {
      return this.garageHistory.countWrongEmails;
    },
    unreachableEmpty() {
      return this.garageHistory.countNotPresentEmails;
    }
  }

}
</script>

<style lang="scss" scoped>
.tile-email {
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
  .tile-email {
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
