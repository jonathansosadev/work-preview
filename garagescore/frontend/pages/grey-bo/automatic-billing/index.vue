<template>
  <section id="automatic-billing-home-wrapper">
    <template>
      <div>
        <Search :value="search" @input="(val) => $emit('update:search', val)" />
        <div class="form-group" style="display: inline-block; vertical-align: top; margin-left: 20px;">
          <button class="btn" @click="goToCreatePage()">
            <i class="icon-gs-add-outline-circle"></i>
            Ajouter un nouveau compte de facturation
          </button>
        </div>
      </div>

      <!-- Filters type -->
      <div style="display: flex; flex-wrap: wrap;">
        <Filters :value="filters" @input="(val) => $emit('update:filters', val)"/>
        <div class="counters">
          <span>DMS non automatisable : {{ amountGaragesWithStatus('DataMissing') }}</span
          ><br />
          <span>A brancher : {{ amountGaragesWithStatus('ToPlug') }}</span
          ><br />
          <span>Abonnement à créer : {{ amountGaragesWithStatus('ToCreate') }}</span
          ><br />
          <span>Attente du go de lancement : {{ amountGaragesWithStatus('Ready') }}</span
          ><br />
          <span>Garages en auto : {{ amountGaragesWithStatus('RunningAuto') }}</span
          ><br />
          <span>Garages en manuel : {{ amountGaragesWithStatus('RunningManual') }}</span
          ><br />
        </div>
      </div>

      <div class="billing-accounts">
        <!-- BILLING ACCOUNT LIST -->
        <div class="table-responsive" v-if="filters.displayBillingAccounts">
          <table width="100%">
            <thead>
              <tr>
                <th class="list-title" width="30%">Nom du groupe</th>
                <th class="list-title" width="25%">Email de contact</th>
                <th class="list-title" width="10%">Début d'abonnement</th>
                <!-- <th class="list-title" width="10%">Abo actifs</th> -->
              </tr>
            </thead>
            <tbody>
              <CardBillingAccountsRow
                v-for="billingAccount of filteredBillingAccounts"
                :key="billingAccount.id"
                :billingAccount="billingAccount"
              />
            </tbody>
          </table>
        </div>
        <!-- GARAGE ACCOUNT LIST -->
        <div class="table-responsive" v-if="filters.displayGarages">
          <table width="100%">
            <thead>
              <tr>
                <th class="list-title" width="20%">Gestionnaires du garage</th>
                <th class="list-title" width="20%">Nom du garage</th>
                <th class="list-title" width="20%">Compte de factu</th>
                <th class="list-title" width="15%">Type</th>
                <th class="list-title" width="13%">Statut</th>
                <th class="list-title" width="20%">Abonnements actifs</th>
                <th class="list-title" width="20%">Interlocuteur technique</th>
              </tr>
            </thead>
            <tbody>
              <CardGarageRow
                v-for="garage in filteredGarages"
                :key="garage.id"
                :garage="garage"
                :garageScoreBizDevsUsers="garageScoreBizDevsUsers"
                :garageScorePerformersUsers="garageScorePerformersUsers"
              />
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </section>
</template>

<script>
import CardBillingAccountsRow from '~/components/automatic-billing/homepage/CardBillingAccountsRow.vue';
import CardGarageRow from '~/components/automatic-billing/homepage/CardGarageRow.vue';
import Search from '~/components/automatic-billing/Search';
import Filters from '~/components/automatic-billing/Filters';

export default {
  layout: 'greybo',
  components: { CardBillingAccountsRow, CardGarageRow, Search, Filters },
  props: {
    garages: {
      type: Array,
      default: function () {
        return [];
      },
    },
    billingAccounts: {
      type: Array,
      default: function () {
        return [];
      },
    },
    garageScoreBizDevsUsers: {
      type: Array,
      default: function () {
        return [];
      },
    },
    garageScorePerformersUsers: {
      type: Array,
      default: function () {
        return [];
      },
    },
    search: {
      type: String,
      required: true,
    },
    filters: {
      type: Object,
      required: true,
    },
  },
  mounted(){
    this.$router.replace({ query: this.queryParams });
  },
  computed: {
    filteredBillingAccounts() {
      return this.filterBillingAcounts(this.billingAccounts);
    },
    filteredGarages() {
      return this.filterGarages(this.garagesWithBA);
    },
    garagesWithBA() {
      return this.garages.filter((garage) => garage.billingAccount);
    },
    queryParams() {
      const params = {};
      if (this.search) {
        params.search = this.search;
      }
      for (const [key, value] of Object.entries(this.filters)) {
        if (value !== '') {
          params[key] = String(value);
        }
      }
      return params;
    },
  },
  methods: {
    goToCreatePage() {
      this.$router.push({ name: 'grey-bo-automatic-billing-creation' });
    },
    amountGaragesWithStatus(status) {
      return this.filteredGarages.filter((i) => i.status === status).length;
    },
    filterGarages(garages) {
      if (
        !this.filters.typeFilter &&
        !this.filters.status &&
        !this.filters.bizDevId &&
        !this.filters.performerId &&
        !this.search
      ) {
        return garages;
      }

      const filteredGarages = [];

      for (const garage of garages) {
        if (this.filters.typeFilter && this.filters.typeFilter !== garage.type) {
          continue;
        }

        if (this.filters.status && this.filters.status !== garage.status) {
          continue;
        }

        if (this.filters.bizDevId && this.filters.bizDevId !== garage.bizDevId) {
          continue;
        }

        if (this.filters.performerId && this.filters.performerId !== garage.performerId) {
          continue;
        }

        if (this.search) {
          if (
            !(
              garage.publicDisplayName.toLowerCase().includes(this.search.toLowerCase()) ||
              garage.id.toLowerCase().includes(this.search.toLowerCase())
            )
          ) {
            continue;
          }
        }

        filteredGarages.push(garage);
      }

      return filteredGarages;
    },
    filterBillingAcounts(billingAccounts) {
      if (!this.filters.billingType && !this.filters.goCardLess && !this.search) {
        return billingAccounts;
      }
      const filteredBillingAccounts = [];

      for (const billingAccount of billingAccounts) {
        if (this.filters.goCardLess) {
          switch (this.filters.goCardLess) {
            case 'completed':
              if (!(billingAccount.customerId && billingAccount.mandateId)) {
                continue;
              }
              break;

            case 'notCompleted':
              if (billingAccount.customerId && billingAccount.mandateId) {
                continue;
              }
              break;
            default:
              break;
          }
        }

        if (this.filters.billingType && this.filters.billingType !== billingAccount.billingType) {
          continue;
        }

        if (this.search) {
          if (
            !(
              billingAccount.name.toLowerCase().includes(this.search.toLowerCase()) ||
              billingAccount.email.toLowerCase().includes(this.search.toLowerCase()) ||
              billingAccount.id.toLowerCase().includes(this.search.toLowerCase())
            )
          ) {
            continue;
          }
        }
        filteredBillingAccounts.push(billingAccount);
      }

      return filteredBillingAccounts;
    },
  },
  watch: {
    queryParams: {
      handler: function () {
        this.$router.replace({ query: this.queryParams });
      },
      deep: true,
    },
    'filters.bizDevId': function () {
      if (this.bizDevId) {
        this.filters.displayBillingAccounts = false;
        this.filters.displayGarages = true;
      }
    },
    'filters.performerId': function () {
      if (this.performerId) {
        this.filters.displayBillingAccounts = false;
        this.filters.displayGarages = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#automatic-billing-home-wrapper {
  .header-filter-block {
    display: flex;
    flex-direction: row;
    > .counters {
      > span {
        white-space: nowrap;
      }
    }
  }

  .table-responsive {
    width: 100%;
    margin-bottom: 15px;
    overflow-y: hidden;
    padding: 20px;
    -ms-overflow-style: -ms-autohiding-scrollbar;
  }

  .list-title {
    padding: 10px 10px;
  }
  .gs-flex {
    display: flex;
  }
  .billing-accounts {
    &__add {
      width: 100%;
      height: 100%;
      background-color: $white;
      border-radius: 2px;
      padding: 15px 20px;

      &:hover {
        cursor: pointer;
      }
    }

    &__add-body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
    }

    &__add-icon {
      font-size: 1.5rem;
      display: inline-block;
      color: #219ab5;
    }
  }
}
</style>
