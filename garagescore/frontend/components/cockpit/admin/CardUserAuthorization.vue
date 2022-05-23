<template>
  <Card class="card-user-authorization">
    <div class="card-user-authorization__header">
      <div class="card-user-authorization__header-part">
        <Title icon="icon-gs-setting-slider">{{$t_locale('components/cockpit/admin/CardUserAuthorization')("auths")}}</Title>
      </div>
    </div>
    <div class="card-user-authorization__body">
      <div class="card-user-authorization__item" v-for="a in dataAuthorization" :key="a.key">
        <Toggle v-model="a.value" :disabled="a.disabled" >{{ a.label }}</Toggle>
      </div>
    </div>
  </Card>
</template>


<script>
export default {
  props: {
    authorization: Object,
    conditions: { type: Object }
  },

  data() {
    return {
      dataAuthorization: [
        { 'label': this.$t_locale('components/cockpit/admin/CardUserAuthorization')("ACCESS_TO_WELCOME"), key: 'ACCESS_TO_WELCOME', value: this.authorization['ACCESS_TO_WELCOME'], disabled: false },
        { 'label': this.$t_locale('components/cockpit/admin/CardUserAuthorization')("ACCESS_TO_SATISFACTION"), key: 'ACCESS_TO_SATISFACTION', value: this.authorization['ACCESS_TO_SATISFACTION'], disabled: !this.hasAccessToSatisfaction() },
        { 'label': this.$t_locale('components/cockpit/admin/CardUserAuthorization')("ACCESS_TO_UNSATISFIED"), key: 'ACCESS_TO_UNSATISFIED', value: this.authorization['ACCESS_TO_UNSATISFIED'], disabled: !this.hasAccessToSatisfaction() },
        { 'label': this.$t_locale('components/cockpit/admin/CardUserAuthorization')("ACCESS_TO_LEADS"), key: 'ACCESS_TO_LEADS', value: this.authorization['ACCESS_TO_LEADS'], disabled: (!this.conditions.hasLeadAtLeast && !this.conditions.hasCrossLeadsAtLeast) },
        { 'label': this.$t_locale('components/cockpit/admin/CardUserAuthorization')("ACCESS_TO_AUTOMATION"), key: 'ACCESS_TO_AUTOMATION', value: this.authorization['ACCESS_TO_AUTOMATION'], disabled: !this.conditions.hasAutomationAtLeast },
        { 'label': this.$t_locale('components/cockpit/admin/CardUserAuthorization')("ACCESS_TO_CONTACTS"), key: 'ACCESS_TO_CONTACTS', value: this.authorization['ACCESS_TO_CONTACTS'], disabled: false },
        { 'label': this.$t_locale('components/cockpit/admin/CardUserAuthorization')("ACCESS_TO_E_REPUTATION"), key: 'ACCESS_TO_E_REPUTATION', value: this.authorization['ACCESS_TO_E_REPUTATION'], disabled: !this.conditions.hasEReputationAtLeast },
        { 'label': this.$t_locale('components/cockpit/admin/CardUserAuthorization')("ACCESS_TO_ESTABLISHMENT"), key: 'ACCESS_TO_ESTABLISHMENT', value: this.authorization['ACCESS_TO_ESTABLISHMENT'], disabled: false },
        { 'label': this.$t_locale('components/cockpit/admin/CardUserAuthorization')("ACCESS_TO_TEAM"), key: 'ACCESS_TO_TEAM', value: this.authorization['ACCESS_TO_TEAM'], disabled: false }
      ]
    };
  },

  watch: {
    'dataAuthorization': {
      deep: true,
      handler(val) {
        this.$store.dispatch('cockpit/admin/profile/updateAuthorization', {
          authorization: {
            ACCESS_TO_WELCOME: val[0].value === true,
            ACCESS_TO_SATISFACTION: val[1].value === true,
            ACCESS_TO_UNSATISFIED: val[2].value === true,
            ACCESS_TO_LEADS: val[3].value === true,
            ACCESS_TO_AUTOMATION: val[4].value === true,
            ACCESS_TO_CONTACTS: val[5].value === true,
            ACCESS_TO_E_REPUTATION: val[6].value === true,
            ACCESS_TO_ESTABLISHMENT: val[7].value === true,
            ACCESS_TO_TEAM: val[8].value === true
          }
        });
      }
    }
  },

  methods: {
    hasAccessToSatisfaction() {
      return (this.conditions.hasMaintenanceAtLeast || this.conditions.hasVnAtLeast || this.conditions.hasVoAtLeast || this.conditions.hasViAtLeast);
    }
  },
}
</script>

<style lang="scss">
.card-user-authorization {
  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid $grey;
  }

  &__header-part + &__header-part {
    margin-left: 1rem;
  }

  &__header-part {
    display: flex;
    align-items: center;
  }

  &__header-toggle {
    margin-right: 1rem;
  }

  &__header-loading {
    margin-right: 0.25rem;
  }

  &__body {
    margin-top: 1rem;
    display:  flex;
    flex-wrap: wrap;
  }

  &__item {
    padding: 0.25rem;
  }

  &__item + &__item {
    margin-left: 1rem;
  }
}
</style>
