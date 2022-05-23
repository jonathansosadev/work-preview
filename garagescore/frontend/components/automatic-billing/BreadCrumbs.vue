<template>
  <section class="gs-breadcrumbs-wrapper">
    <span @click="gotoHome" class="gs-breadcrumbs-link">
      Accueil
    </span>
    <span
      v-if="selectedBillingAccount"
      @click="gotoBillingAccount(selectedBillingAccount.id)"
    >
      > <span class="gs-breadcrumbs-link">{{ selectedBillingAccount.name }}</span>
    </span>
    <span
      v-if="selectedBillingAccount && selectedGarage"
      @click="gotoGarage(selectedBillingAccount.id, selectedGarage.id)"
    >
      > <span class="gs-breadcrumbs-link">{{ selectedGarage.publicDisplayName }}</span>
    </span>
  </section>
</template>

<script>
export default {
  props: {
    garage:{
      type: Object,
      default: () => null,
    },
    billingAccount:{
      type: Object,
      default: () => null,
    },
  },
  computed:{
    selectedGarage(){
      return this.$route.params.garageId && this.garage;
    },
    selectedBillingAccount(){
      return this.$route.params.billingAccountId && this.billingAccount;
    },
  },
  methods: {
    gotoHome: function () {
      this.$router.push({ name: 'grey-bo-automatic-billing' });
    },
    gotoBillingAccount: function (billingAccountId) {
      this.$router.push({ name: 'grey-bo-automatic-billing-billing-account-billingAccountId', params: { billingAccountId } });
    },
    gotoGarage: function (billingAccountId, garageId) {
      this.$router.push({ name: 'grey-bo-automatic-billing-billing-account-billingAccountId-garages-garageId', params: { billingAccountId, garageId } });
    },
  },
};
</script>

<style lang="scss" scoped>
.gs-breadcrumbs-wrapper {
  margin: 13px 0;
  color: #333;
  .gs-breadcrumbs-link {
    cursor: pointer;
    font-size: 12px;
    color: inherit;
    text-transform: capitalize;
    &:hover {
      color: #209ab5;
    }
  }
}
</style>
