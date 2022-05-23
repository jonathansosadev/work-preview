<template>
  <section id="automatic-billing-wrapper">
    <template>
      <div class="pull-right help-icon">
        <i class="icon-gs-help-question-circle"></i>
        <div class="help-content">
          <h4>Qu'est-ce que la facturation automatique ?</h4>
          <p>
            La facturation automatique permet de gérer les abonnements de nos partenaires avec le moins d'effort
            possible, que ce soit d'un point vue administratif (factures, paiements, consommation) ou d'un point de vue
            opérationnel (qui a accès à quoi)
          </p>
          <h4>Concrètement, comment ça marche ?</h4>
          <p>
            Sur la page d'accueil vous trouverez la liste des comptes de facturations. Ces derniers sont des
            regroupements arbitraires d'établissements. Par exemple, 4 établissements peuvent voir leurs factures être
            agrégées en une seule, etc.
          </p>
          <p>
            Dans chaque compte de facturation il vous est possible d'associer un ou plusieurs établissements. Une fois
            cela fait vous pouvez configurer les abonnements du garage !
          </p>
        </div>
      </div>
      <h1 class="automatic-billing-main-title">
        Facturation &amp; Abonnements&nbsp; &nbsp;<button
          v-if="orphanGarages.length"
          @click.prevent="goToOrphans"
          class="btn btn-xs btn-warning"
        >
          <i class="icon-gs-alert-warning-circle"></i>&nbsp;{{ orphanGarages.length }} Établissements non configurés
        </button>
      </h1>

      <!-- BREADCRUMBS -->
      <bread-crumbs :billingAccount="billingAccount" :garage="garage"></bread-crumbs>

      <!-- ROUTING SECTION -->
      <div v-if="isLoading">
        Loading...
      </div>
      <nuxt-child
        v-else
        :garageScoreBizDevsUsers="garageScoreBizDevsUsers"
        :garageScorePerformersUsers="garageScorePerformersUsers"
        :action_updateGarageTicketsConfig="action_updateGarageTicketsConfig"
        :action_updateGarageStatus="action_updateGarageStatus"
        :action_createBillingAccount="action_createBillingAccount"
        :action_updateBillingAccount="action_updateBillingAccount"
        :action_addGarageToBillingAccount="action_addGarageToBillingAccount"
        :action_removeGarageFromBillingAccount="action_removeGarageFromBillingAccount"
        :action_deleteBillingAccount="action_deleteBillingAccount"
        :action_updateGarage="action_updateGarage"
        :action_createGarageSubscriptions="action_createGarageSubscriptions"
        :action_stopGarageSubscriptions="action_stopGarageSubscriptions"
        :action_updateGarageSubscriptions="action_updateGarageSubscriptions"
        :action_createGarage="action_createGarage"
        :orphanGarages="orphanGarages"
        :billingAccounts="billingAccounts"
        :garages="garages"
        :garage="garage"
        :billingAccount="billingAccount"
        :search.sync="search"
        :filters.sync="filters"
        :action_fetchGarage="fetchGarage"
      />

      <vue-snotify></vue-snotify>
    </template>
    <!-- TITLE -->
  </section>
</template>

<script>
import { postRequest, putRequest, deleteRequest } from '../../util/gsTools';
import BreadCrumbs from '~/components/automatic-billing/BreadCrumbs';
import { makeApolloQueries, makeApolloMutations } from '../../util/graphql';
import * as urls from '~/utils/urls';
const greyboUrls = urls.getUrlNamespace('GREYBO');
import {
  getGaragesQuery,
  getGarageQuery,
  getBillingAccountQuery,
  getBillingAccountsQuery,
  subscriptionsFragment,
} from '../../api/graphql/grey-bo/automatic-billing';
import axios from 'axios';

export default {
  layout: 'greybo',
  components: { BreadCrumbs },
  data() {
    return {
      garageScoreBizDevsUsers: [],
      garageScorePerformersUsers: [],
      garages: [],
      billingAccounts: [],
      garage: {},
      billingAccount: {},
      search: this.$route.query.search || '',
      filters: {
        displayBillingAccounts: this.$route.query.displayBillingAccounts || true,
        displayGarages: this.$route.query.displayGarages || true,
        status: this.$route.query.status || '',
        typeFilter: this.$route.query.typeFilter || '',
        billingType: this.$route.query.billingType || '',
        goCardLess: this.$route.query.goCardLess || '',
        bizDevId: this.$route.query.bizDevId || '',
        performerId: this.$route.query.performerId || '',
      },
    };
  },
  async mounted() {
    [
      this.garages,
      this.billingAccounts,
      this.garageScoreBizDevsUsers,
      this.garageScorePerformersUsers,
    ] = await Promise.all([
      this.fetchGarages(),
      this.fetchBillingAccounts(),
      this.fetchGarageScoreBizDevsUsers(),
      this.fetchGarageScorePerformersUsers(),
    ]);
    this.mutation_setCurrentRouteState();
  },
  computed: {
    orphanGarages() {
      return this.garages.filter(({ billingAccount }) => !(billingAccount && billingAccount.id));
    },
    isLoading() {
      if (this.$route.params.billingAccountId) {
        if (this.$route.params.garageId) {
          return this.garage.id !== this.$route.params.garageId;
        }
        return this.billingAccount.id !== this.$route.params.billingAccountId;
      }
      return false;
    },
  },
  methods: {
    goToOrphans() {
      this.$router.push({ name: 'grey-bo-automatic-billing-orphans' });
    },
    // * __ state methods
    // fetch and set this.billingAccount and/or this.garage based on the current $route.params
    async mutation_setCurrentRouteState() {
      const billingAccountId = this.$route.params.billingAccountId;
      if (billingAccountId) {
        if (this.billingAccount.id !== billingAccountId) {
          await this.mutation_selectBillingAccount(billingAccountId);
        }
      }
      if (this.billingAccount && this.$route.params.garageId) {
        this.mutation_selectGarage(this.$route.params.garageId);
      }
    },
    // manage billing accounts and garages by reference
    mutation_selectGarage(garageId) {
      if (!this.billingAccount) {
        return;
      }
      // the trick here is that the billingAccountGarage is a full garage object
      // while the garage at garageIndex is a garage object with partial data
      // so we link the two objects keeping the billingAccountGarage data
      let billingAccountGarage = this.billingAccount.garages.find(({ id }) => id === garageId);
      let garageIndex = this.garages.findIndex(({ id }) => id === garageId);

      this.garage = billingAccountGarage;
      this.garages.splice(garageIndex, 1, this.garage);
    },
    //select and fetch the billing account
    async mutation_selectBillingAccount(billingAccountId) {
      if (this.billingAccount.id === billingAccountId) {
        return;
      }
      // the trick here is that the billingAccount is a full billingAccount object
      // while the ba is a billingAccount object with partial data
      // so we link the two objects keeping the billingAccount data
      const billingAccount = await this.fetchBillingAccount(billingAccountId);
      let ba = this.billingAccounts.find(({ id }) => id === billingAccount.id);
      Object.assign(ba, billingAccount);

      this.billingAccount = ba;
    },
    mutation_removeGarageFromBillingAccount(billingAccountId, garageId) {
      const billingAccount = this.billingAccounts.find((ba) => ba.id === billingAccountId);
      const garageIndex = billingAccount.garages.findIndex((garage) => garage.id === garageId);

      if (garageIndex >= 0) {
        billingAccount.garages.splice(garageIndex, 1);
      }
    },
    mutation_addGarage(garage, billingAccountId) {
      if (billingAccountId) {
        const billingAccount = this.billingAccounts.find((ba) => ba.id === billingAccountId);

        billingAccount.garages.push(garage);
        garage.billingAccount = billingAccount;
      }
      this.garages.push(garage);
    },
    mutation_removeBillingAccountFromGarage(garageId) {
      const garage = this.garages.find((garage) => garage.id === garageId);
      garage.billingAccount = null;
    },
    mutation_setGarageTicketsConfiguration(garageId, { userId, alertType }) {
      const garage = this.garages.find((garage) => garage.id === garageId);
      if (!garage.ticketsConfiguration) {
        garage.ticketsConfiguration = {};
      }
      garage.ticketsConfiguration[alertType] = userId;
    },
    mutation_setGarageStatus(garageId, status) {
      const garage = this.garages.find((garage) => garage.id === garageId);
      garage.status = status;
    },
    mutation_setGarageTickets(garageId, tickets) {
      const garage = this.garages.find((garage) => garage.id === garageId);
      const ticketsConfiguration = {};
      for (const { id, userId } of tickets) {
        ticketsConfiguration[id] = userId;
      }
      garage.ticketsConfiguration = ticketsConfiguration;
    },
    mutation_addBillingAccount(billingAccount) {
      this.billingAccounts.push(billingAccount);
    },
    mutation_updateBillingAccount(billingAccountId, updatedBillingAccount) {
      let ba = this.billingAccounts.find((ba) => ba.id === billingAccountId);
      Object.assign(ba, updatedBillingAccount);
    },
    mutation_updateGarage(garageId, updatedGarage) {
      let garage = this.garages.find((garage) => garage.id === garageId);
      Object.assign(garage, updatedGarage);
    },
    mutation_deleteBillingAccount(billingAccountId) {
      const index = this.billingAccounts.findIndex((ba) => ba.id === billingAccountId);
      if (index > 0) {
        this.billingAccounts.splice(index, 1);
      }
    },
    mutation_addGarageToBillingAccount(billingAccountId, garage) {
      const garageId = garage.id;
      const billingAccount = this.billingAccounts.find((ba) => ba.id === billingAccountId);
      const g = this.garages.find((garage) => garage.id === garageId);

      Object.assign(g, garage);
      billingAccount.garages.push(g);
    },
    mutation_setGarageSubscriptions(garageId, subscriptions) {
      const { annexGarageId, ...garageSubscsriptions } = subscriptions;
      const garage = this.garages.find((garage) => garage.id === garageId);
      Object.assign(garage.subscriptions, garageSubscsriptions);
      Object.assign(garage, { annexGarageId });
    },
    mutation_setGarageAnnexGarageId(garageId, annexGarageId) {
      const garage = this.garages.find((garage) => garage.id === garageId);
      garage.annexGarageId = annexGarageId;
    },
    // * __ end state methods
    formatGarageScoreBizDevsUsers(bizDevsUsers) {
      return bizDevsUsers ? bizDevsUsers.sort((a, b) => a.email.localeCompare(b.email)) : [];
    },
    async action_updateGarageTicketsConfig({ garageId, userId, oldUserId, alertType }) {
      const request = {
        name: 'garageSetTicketsConfiguration',
        args: { garageId, userId, oldUserId, alertType },
        fields: `
        message
        status
      `,
      };
      const { err } = await makeApolloMutations([request]);
      if (err) {
        throw new Error(err);
      }
      this.mutation_setGarageTicketsConfiguration(garageId, { userId, alertType });
    },
    async action_updateGarageStatus(garageId, status, tickets) {
      const toggleStatusRequest = {
        name: 'GarageSetGarageStatus',
        args: { id: garageId, status, tickets },
        fields: `
          result
        `,
      };
      const { data, err } = await makeApolloMutations([toggleStatusRequest]);
      if (err) {
        throw new Error(err);
      }
      if (data.GarageSetGarageStatus.result !== 'OK') {
        throw new Error('Problème côté serveur : ' + data.GarageSetGarageStatus.result);
      }
      this.mutation_setGarageStatus(garageId, status);
      this.mutation_setGarageTickets(garageId, tickets);
      return data.GarageSetGarageStatus;
    },
    action_createBillingAccount(billingAccount) {
      return new Promise((resolve, reject) => {
        const url = greyboUrls.BILLING.BILLING_ACCOUNTS.CREATE;

        postRequest(url, billingAccount, (errCreate, result) => {
          if (errCreate) {
            reject(errCreate);
          }
          if (!result.content) {
            reject('No data found');
          } else {
            const billingAccountId = result.content.id;
            this.mutation_addBillingAccount(result.content);
            resolve(billingAccountId);
          }
        });
      });
    },
    action_updateBillingAccount(billingAccountId, updatedBillingAccount) {
      return new Promise((resolve, reject) => {
        const url = greyboUrls.BILLING.BILLING_ACCOUNTS.UPDATE.replace(':billingAccountId', billingAccountId);

        putRequest(url, updatedBillingAccount, (errUpdate, result) => {
          if (errUpdate || !result.content) {
            reject(`Impossible de mettre à jour ce compte de facturation :  ${errUpdate}`);
          } else {
            this.mutation_updateBillingAccount(billingAccountId, result.content);
            resolve();
          }
        });
      });
    },
    action_deleteBillingAccount(billingAccountId) {
      return new Promise((resolve, reject) => {
        const url = greyboUrls.BILLING.BILLING_ACCOUNTS.DELETE.replace(':billingAccountId', billingAccountId);

        deleteRequest(url, (errDel) => {
          if (errDel) {
            reject(`Impossible de supprimer ce compte de facturation :  ${errDel}`);
          } else {
            this.mutation_deleteBillingAccount(billingAccountId);
            resolve();
          }
        });
      });
    },
    action_addGarageToBillingAccount(billingAccountId, garageId) {
      return new Promise((resolve, reject) => {
        const url = greyboUrls.BILLING.BILLING_ACCOUNTS.GARAGES.ADD.replace(':billingAccountId', billingAccountId);
        const data = { garageId };

        postRequest(url, data, async (errAdd, result) => {
          if (errAdd || !result.content) {
            reject(`Impossible d'ajouter ce garage à ce compte de facturation :  ${errAdd}`);
          } else {
            const garage = await this.fetchGarage(garageId);
            this.mutation_addGarageToBillingAccount(billingAccountId, garage).then(() => {
              resolve(result.content);
            });
          }
        });
      });
    },
    action_removeGarageFromBillingAccount(billingAccountId, garageId) {
      return new Promise((resolve, reject) => {
        const url = greyboUrls.BILLING.BILLING_ACCOUNTS.GARAGES.REMOVE.replace(
          ':billingAccountId',
          billingAccountId
        ).replace(':garageId', garageId);

        deleteRequest(url, (errDel) => {
          if (errDel) {
            reject(`Impossible de retirer ce garage de compte de facturation :  ${errDel}`);
          } else {
            this.mutation_removeGarageFromBillingAccount(billingAccountId, garageId);
            this.mutation_removeBillingAccountFromGarage(garageId);
            resolve();
          }
        });
      });
    },
    async action_updateGarage(garageId, updatedGarage) {
      const request = {
        name: 'GarageSetGarage',
        args: { id: garageId, garagesModifications: updatedGarage },
        fields: `
          garageUpdated
        `,
      };
      const { data, err } = await makeApolloMutations([request]);
      if (err) {
        throw new Error(err);
      }
      if (!data.GarageSetGarage.garageUpdated) {
        throw new Error('garage-set-garage return : ' + data.GarageSetGarage.garageUpdated);
      }
      const garage = await this.fetchGarage(garageId);
      this.mutation_updateGarage(garageId, garage);
    },
    async action_createGarageSubscriptions(garageId, billingAccountId, subscriptions) {
      const { active, ...sanitizedSubscriptions } = subscriptions;
      const { data, err } = await makeApolloMutations([
        {
          name: 'garageSetCreateSubscriptions',
          args: { garageId, billingAccountId, subscriptions: sanitizedSubscriptions },
          fields: subscriptionsFragment,
        },
      ]);
      if (err) {
        throw new Error(err);
      }
      const updatedSubscriptions = { ...sanitizedSubscriptions, ...data.garageSetCreateSubscriptions };
      this.mutation_setGarageSubscriptions(garageId, updatedSubscriptions);
    },
    async action_updateGarageSubscriptions(garageId, billingAccountId, subscriptions) {
      const { active, ...sanitizedSubscriptions } = subscriptions;
      const { data, err } = await makeApolloMutations([
        {
          name: 'garageSetUpdateSubscriptions',
          args: { garageId, billingAccountId, subscriptions: sanitizedSubscriptions },
          fields: subscriptionsFragment,
        },
      ]);
      if (err) {
        throw new Error(err);
      }
      const updatedSubscriptions = { ...sanitizedSubscriptions, ...data.garageSetUpdateSubscriptions };
      this.mutation_setGarageSubscriptions(garageId, updatedSubscriptions);
    },
    async action_stopGarageSubscriptions(garageId, billingAccountId) {
      const { data, err } = await makeApolloMutations([
        {
          name: 'garageSetStopSubscriptions',
          args: { garageId, billingAccountId },
          fields: subscriptionsFragment,
        },
      ]);
      if (err) {
        throw new Error(err);
      }
      this.mutation_setGarageSubscriptions(garageId, data.garageSetStopSubscriptions);
    },
    async action_createGarage(garage) {
      const billingAccountId = garage.billingAccountId;
      const query = `mutation createGarage($input: InputCreateGarage) {
        createGarage(input: $input) {
          id,
        }
      }`;
      return new Promise((resolve) => {
        axios({
          url: '/graphql',
          method: 'post',
          data: {
            query,
            variables: { input: garage },
          },
        }).then(async (resp) => {
          const err = resp.data.errors;
          if (err) {
            resolve({ err });
          } else {
            const garage = await this.fetchGarage(resp.data.data.createGarage.id);
            this.mutation_addGarage(garage, billingAccountId);
            resolve({ garage });
          }
        });
      });
    },
    async fetchBillingAccounts() {
      const { data } = await makeApolloQueries([getBillingAccountsQuery()]);
      return data.billingAccountGetBillingAccounts;
    },
    async fetchGarages() {
      const { data } = await makeApolloQueries([getGaragesQuery()]);
      return data.garageGetGarages;
    },
    async fetchGarage(garageId) {
      const { data } = await makeApolloQueries([getGarageQuery(garageId)]);
      return data.garageGetGarage;
    },
    async fetchBillingAccount(accountId) {
      const { data } = await makeApolloQueries([getBillingAccountQuery(accountId)]);
      return data.billingAccountGetBillingAccount;
    },
    async fetchGarageScoreBizDevsUsers() {
      const request = {
        name: 'userGetGarageScoreUsers',
        args: {
          bizDevs: true,
        },
        fields: ` id
          firstName
          lastName
          email
        `,
      };
      const { data } = await makeApolloQueries([request]);
      return this.formatGarageScoreBizDevsUsers(data.userGetGarageScoreUsers);
    },
    async fetchGarageScorePerformersUsers() {
      const request = {
        name: 'userGetGarageScoreUsers',
        args: {
          perfManagers: true,
        },
        fields: ` id
          firstName
          lastName
          email
        `,
      };
      const { data } = await makeApolloQueries([request]);
      return data.userGetGarageScoreUsers;
    },
  },
  watch: {
    async '$route.params'() {
      this.mutation_setCurrentRouteState();
    },
  },
};
</script>

<style lang="scss" scoped>
#automatic-billing-wrapper {
  background: #f5f5f5;
  padding: 0 20px 20px 20px;
  .help-icon {
    position: relative;
    top: 6px;
    color: #209ab5;
    &:hover {
      cursor: pointer;
      .help-content {
        display: block;
      }
    }
    .help-content {
      width: 400px;
      text-align: justify;
      cursor: text;
      box-shadow: 0 0 10px #ccc;
      padding: 10px 20px;
      position: absolute;
      top: 0;
      z-index: 10;
      background: #ffffff;
      right: 0;
      display: none;
    }
  }
  .automatic-billing-main-title {
    text-align: left;
  }
}
</style>
