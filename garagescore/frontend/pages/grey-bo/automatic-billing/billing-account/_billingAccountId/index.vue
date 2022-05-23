<template>
  <section id="billing-account-details-page-wrapper">
    <div v-if="billingAccount">
      <!-- FIRST BLOCK, BILLING ACCOUNT DETAILS -->
      <div class="billing-account-details">
        <h3>{{ billingAccount.name }}</h3>
        <div class="row">
          <!-- Info, Left -->
          <div class="col-xs-12 col-md-6">
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Identifiant interne :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.id }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Référence comptable :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.accountingId }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Email de contact :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.email }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Raison sociale :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.companyName }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Adresse :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.address }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Code postal :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.postalCode }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Ville :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.city }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Filiale de l'entreprise :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.country }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Contact technique :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.technicalContact }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Contact RGPD :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.RGPDContact }}</span>
            </div>
          </div>
          <!-- Info, Right -->
          <div class="col-xs-12 col-md-6">
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Note :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.note }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Méthode de facturation :</span>
              <span class="billing-account-details-info-answer">{{
                billingAccount.billingType === 'transfer' ? 'Virement' : 'Prélèvement'
              }}</span>
            </div>
            <div class="billing-account-details-info" v-if="billingAccount.billingType === 'transfer'">
              <span class="billing-account-details-info-question">Prix de facturation :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.billingTypePrice }}€</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Échéance mensuelle de facturation :</span>
              <span class="billing-account-details-info-answer"
                >Le {{ billingAccount.billingDate }} de chaque mois</span
              >
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Prochaine échéance de facturation :</span>
              <span class="billing-account-details-info-answer">{{
                prettifyDateTime(billingAccount.dateNextBilling)
              }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Nombre d'établissement(s) :</span>
              <span class="billing-account-details-info-answer"
                >{{ billingAccountGarages.length }} établissement(s)</span
              >
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Abonnements actifs :</span>
              <span
                :class="{
                  'billing-account-details-info-answer': true,
                  'billing-account-details-info-answer-with-problem':
                    billingAccountActiveSubscriptionsNumber < billingAccountGarages.length,
                }"
                >{{ billingAccountActiveSubscriptionsNumber + ' / ' + billingAccountGarages.length }}</span
              >
            </div>
            <div class="billing-account-details-info" v-if="isAdmin">
              <span class="billing-account-details-info-question">MandateID (GoCardLess) :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.mandateId || '' }}</span>
            </div>
            <div class="billing-account-details-info" v-if="isAdmin">
              <span class="billing-account-details-info-question">CustomerID (GoCardLess) :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.customerId || '' }}</span>
            </div>
            <div class="billing-account-details-info">
              <span class="billing-account-details-info-question">Contact compta :</span>
              <span class="billing-account-details-info-answer">{{ billingAccount.accountingContact }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="col-xs-12 billing-account-actions" v-if="isAdmin">
            <div>
              <button @click="editBillingAccount()" class="btn btn-xs btn-primary">
                <i class="icon-gs-edit"></i>&nbsp;Éditer
              </button>
            </div>
          </div>

          <!-- Subscriptions -->
          <div class="col-xs-12 billing-account-details-subscriptions">
            <h5>Abonnements actifs</h5>
            <div>
              <div v-if="billingAccountGarages.length <= 0" class="billing-account-details-subscriptions-with-problem">
                Aucun abonnement sur le compte
              </div>
              <div v-else>
                <table>
                  <thead>
                    <tr>
                      <th>Établissement</th>
                      <th>Abonnement</th>
                      <th>Date démarrage</th>
                      <th>Statut du garage</th>
                      <th>Prix</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="g of billingAccountGarages" :key="g.id">
                      <td>
                        <span>{{ g.publicDisplayName }}</span>
                      </td>
                      <td>
                        <span :class="!hasActiveSubscription(g) ? 'inactive-subscription' : ''">{{
                          hasActiveSubscription(g) ? 'Actif' : 'Inactif'
                        }}</span>
                      </td>
                      <td>
                        <span v-if="hasActiveSubscription(g)">{{ startDate(g.subscriptions.dateStart) }}</span>
                      </td>
                      <td>
                        <span v-if="hasActiveSubscription(g)">{{ displayStatus(g.status) }}</span>
                      </td>
                      <td>
                        <span v-if="hasActiveSubscription(g)">{{ calcPrices(g.subscriptions) }}</span>
                      </td>
                      <td>
                        <button
                          title="Voir en détails"
                          @click="goToGarageDetailsPage(g)"
                          class="btn btn-xs btn-primary"
                        >
                          <i class="icon-gs-cog"></i>
                        </button>
                        <button
                          v-if="hasActiveSubscription(g) && isAdmin"
                          title="Arrêter cet abonnement"
                          @click="terminateSubscription(g)"
                          class="btn btn-xs btn-warning"
                        >
                          <i class="icon-gs-trash"></i>
                        </button>
                        <button
                          v-if="isAdmin"
                          @click="onRemoveGarageFromBillingAccount(g)"
                          class="garage-inner-btn btn btn-xs btn-warning"
                        >
                          <i class="icon-gs-unlock"></i>&nbsp;Dissocier
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Invoices History -->
          <div class="col-xs-12 billing-account-details-subscriptions">
            <h5>Dernières factures</h5>
            <div>
              <div v-if="!invoices.length" class="billing-account-details-subscriptions-with-problem">
                Aucune facture disponible pour ce compte de facturation...
              </div>
              <div v-else>
                <table>
                  <thead>
                    <tr>
                      <th>Nom du fichier</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="invoice in invoices" :key="invoice.name">
                      <td>
                        <span>{{ invoice.name }}</span>
                      </td>
                      <td>
                        <a
                          title="Télécharger"
                          class="btn btn-xs btn-primary"
                          target="_blank"
                          :href="getInvoiceLink(invoice)"
                        >
                          <i class="icon-gs-cloud-download"></i>
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- !FIRST BLOCK, BILLING ACCOUNT DETAILS -->

      <!-- SECOND BLOCK -->
      <div class="flex-zone">
        <button class="button" :class="{ active: display === 'add' }" @click="display = 'add'">
          Ajouter un établissement
        </button>
        <button class="button" :class="{ active: display === 'create' }" @click="display = 'create'">
          Créer un établissement
        </button>
      </div>

      <div class="tabs" v-if="display === 'add'">
        <div class="tabs__body">
          <TabGarageAdd
            :billingAccount="billingAccount"
            :action_addGarageToBillingAccount="action_addGarageToBillingAccount"
            :orphanGarages="orphanGarages"
          />
        </div>
      </div>
      <div class="tabs" v-if="display === 'create'">
        <div class="tabs__body">
          <TabGarageCreate
            :billingAccount="billingAccount"
            :action_createGarage="action_createGarage"
            :garages="garages"
            :garageScorePerformersUsers="garageScorePerformersUsers"
          />
        </div>
      </div>
    </div>

    <div v-else>
      Ce compte de facturation est inconnu
    </div>
  </section>
</template>

<script>
import TabGarageAdd from '~/components/automatic-billing/details/TabGarageAdd.vue';
import TabGarageCreate from '~/components/automatic-billing/details/TabGarageCreate.vue';
import GarageSubscriptionTypes from '~/utils/models/garage.subscription.type.js';
import GarageStatus from '~/utils/models/garage.status.js';
export default {
  name: 'BillingAccountDetails',
  components: { TabGarageAdd, TabGarageCreate },
  props: {
    action_createGarage: {
      type: Function,
      required: true,
    },
    action_deleteBillingAccount: {
      type: Function,
      required: true,
    },
    action_addGarageToBillingAccount: {
      type: Function,
      required: true,
    },
    billingAccount: {
      type: Object,
      required: true,
    },
    orphanGarages: {
      type: Array,
      default: () => [],
    },
    action_removeGarageFromBillingAccount: {
      type: Function,
      required: true,
    },
    action_stopGarageSubscriptions: {
      type: Function,
      required: true,
    },
    garages: {
      type: Array,
      default: () => [],
    },
    garageScorePerformersUsers: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      display: 'add',
      billingAccountGarages: this.billingAccount.garages || [],
    };
  },
    watch:{
    billingAccount: {
      handler(newBillingAccount) {
        this.billingAccountGarages = newBillingAccount.garages;
      },
      deep: true,
    },
  },
  computed: {
    billingAccountActiveSubscriptionsNumber() {
      return this.billingAccountGarages.filter((g) => g.subscriptions.active).length;
    },
    // billingAccountGarages() {
    //   return this.billingAccount.garages || [];
    // },
    invoices() {
      return this.billingAccount.invoices || [];
    },
    isAdmin() {
      return this.$store.state.auth.ACCESS_TO_DARKBO;
    },
  },
  methods: {
    displayStatus(status) {
      return GarageStatus.displayName(status);
    },
    calcPrices(subs) {
      let totalPrice = 0;
      for (const type of GarageSubscriptionTypes.values()) {
        if (subs[type] && subs[type].price && subs[type].enabled) totalPrice += subs[type].price;
      }
      return Math.round(totalPrice * 100) / 100;
    },
    prettifyDate: function (date) {
      return this.$moment(date).format('dddd D MMMM YYYY');
    },
    startDate: function (date) {
      if (isNaN(parseInt(date * 1))) {
        // date with this format: 019-10-29T22:00:00.000Z
        return this.$moment(date).format('dddd D MMMM YYYY');
      }
      return this.$moment(parseInt(date)).format('dddd D MMMM YYYY');
    },
    prettifyDateTime: function (date) {
      return this.$moment(date).format('dddd D MMMM YYYY HH:mm:ss');
    },
    onRemoveGarageFromBillingAccount(garage) {
      if (
        confirm(
          `Voulez-vous vraiment retirer ${garage.publicDisplayName} du compte de facturation ${this.billingAccount.name} ?`
        )
      ) {
        this.action_removeGarageFromBillingAccount(this.billingAccount.id, garage.id)
          .then(() => {
            this.$snotify.success(`Le garage a retiré du compte de facturation avec succès.`, 'Garage retiré');
          })
          .catch((err) => {
            this.$snotify.error(
              `Impossible de retirer ce garage de ce compte de facturation : ${err.toString()}`,
              'Erreur'
            );
          });
      }
    },
    async terminateSubscription(garage) {
      const billingAccountId = this.billingAccount.id;
      const garageId = garage.id;

      if (confirm('Résilier dès maintenant cet abonnement ?')) {
        try {
          await this.action_stopGarageSubscriptions(garageId, billingAccountId);
          this.$snotify.success(`L'abonnement a été résilié avec succès`, 'Abonnement résilié');
          this.$store.dispatch('sendSlackMessage', {
            message: `Abonnement resilié : ${garage.publicDisplayName}`,
            channel: 'channel_of_death', // hahahahahahahaha
          });
        } catch (err) {
          this.$snotify.error(`Impossible de résilier l'abonnement : ${err}`, 'Erreur');
        }
      }
    },
    goToGarageDetailsPage: function (garage) {
      this.$router.push({
        name: 'grey-bo-automatic-billing-billing-account-billingAccountId-garages-garageId',
        params: { garageId: garage.id, billingAccountId: this.billingAccount.id },
      });
    },
    editBillingAccount() {
      this.$router.push({
        name: 'grey-bo-automatic-billing-billing-account-billingAccountId-edit',
        params: { billingAccountId: this.billingAccount.id },
      });
    },
    hasActiveSubscription(g) {
      return g.subscriptions && g.subscriptions.active;
    },
    getInvoiceLink(invoice) {
      return `/backoffice/garages/pull/viewfile?bucket=facturation-automatique&filePath=${invoice.path}`;
    },
  },
};
</script>

<style lang="scss" scoped>
#billing-account-details-page-wrapper {
  max-width: 1200px;
  margin: auto;
  .billing-account-details {
    background: #ffffff;
    padding: 15px 20px;
    width: 100%;
    height: 100%;
    border-radius: 2px;
    box-shadow: 0 0 3px #888;
    h3 {
      margin: 0 0 10px 0;
      text-align: center;
      color: #333333;
    }
    .billing-account-details-info {
      margin: 5px 0;
      .billing-account-details-info-question {
        font-size: 13px;
        color: #333333;
      }
      .billing-account-details-info-answer {
        font-size: 12px;
        font-style: italic;
        color: #209ab5;
        display: inline-block;
        padding-left: 5px;
      }
      .billing-account-details-info-answer.billing-account-details-info-answer-with-problem {
        color: #c62b1b;
      }
    }
    .billing-account-actions {
      & > div {
        border-top: 1px dotted #ccc;
        padding: 10px 0 0 0;
        button {
          margin-right: 5px;
        }
      }
    }
    .billing-account-details-subscriptions {
      h5 {
        text-align: center;
        margin: 10px 0 10px 0;
        padding: 15px 0 0 0;
        font-size: 16px;
        border-top: 1px dotted #cccccc;
        color: #333333;
      }
      table {
        width: 100%;
        th {
          font-weight: 400;
          font-size: 14px;
          color: #666666;
        }
        td {
          font-size: 11px;
          color: #333333;
          padding-top: 5px;
          span.inactive-subscription {
            color: white;
            background-color: $red;
          }
          .btn {
            padding: 0 4px;
            margin-right: 2px;
          }
        }
      }
      .billing-account-details-subscriptions-with-problem {
        color: #c62b1b;
        font-size: 12px;
        font-style: italic;
      }
    }

    &__tabs {
      margin: 1rem 0;
    }
  }

  .billing-account-details-garages {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    .billing-account-details-garage {
      width: 300px;
      height: 250px;
      padding: 10px 10px 0 0;
      h3 {
        font-size: 14px;
        text-align: center;
        margin: 0 0 15px 0;
        color: #333333;
      }
      .billing-account-details-garage-inner {
        background: #ffffff;
        padding: 15px 20px;
        width: 100%;
        height: 100%;
        border-radius: 2px;
        box-shadow: 0 0 3px #888;
        cursor: pointer;
        transition: all 0.25s linear;
        position: relative;
        .garage-inner-btn {
          position: absolute;
          right: 10px;
          bottom: 10px;
        }
      }
      .billing-account-details-garage-inner:hover {
        box-shadow: 0 0 5px #444;
        transition: all 0.5s linear;
      }
      .billing-account-details-garage-subscription-info {
        margin: 5px 0;
      }
      .billing-account-details-garage-subscription-question {
        font-size: 13px;
        color: #333333;
      }
      .billing-account-details-garage-subscription-info-answer {
        font-size: 12px;
        font-style: italic;
        color: #209ab5;
      }
      .billing-account-details-garage-subscription-info-answer.billing-account-details-garage-subscription-info-answer-with-problem {
        color: #c62b1b;
      }
    }
  }
  .flex-zone {
    display: flex;
    justify-content: center;
  }
  .button {
    background-color: #494949;
    margin: 10px auto;
    width: 49%;
    border: none;
    color: white;
    padding: 15px 32px;
    font-size: 16px;
  }
  .active {
    background-color: white;
    color: #494949;
  }
  .tabs__body {
    padding: 5px;
    background: white;
  }
}
</style>
