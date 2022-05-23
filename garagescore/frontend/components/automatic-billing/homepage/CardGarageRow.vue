<template>
  <tr class="card-garage" @click="gotoGarage()">
    <td class="card-garage__item">
      BizDev : <span :class="bizDevClass">{{ bizDevEmail }}</span> <br />Performer :
      <span :class="performerClass">{{ performerEmail }}</span>
    </td>
    <td class="card-garage__item card-garage__item--name">{{ garage.publicDisplayName }}</td>
    <td class="card-garage__item">{{ billingAccountName }}</td>
    <td class="card-garage__item card-garage__item--email">{{ GarageTypes.displayName(garage.type) }}</td>
    <td class="card-garage__item">{{ garageStatus }}</td>
    <td class="card-garage__item" :class="garageClassBinding">{{ subscriptions }}</td>
    <td class="card-garage__item">{{ garage.email }}</td>
  </tr>
</template>

<script>
import GarageTypes from '~/utils/models/garage.type.js';
import GarageStatus from '~/utils/models/garage.status.js';
import garageSubscriptionTypes from '~/utils/models/garage.subscription.type.js';

export default {
  data() {
    return {
      GarageTypes,
    };
  },
  props: {
    garage: {
      type: Object,
      required: true,
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
  },
  computed: {
    billingAccount() {
      return this.garage.billingAccount;
    },
    garageClassBinding() {
      return {
        'card-garage--error': !this.billingAccount,
      };
    },
    garageStatus() {
      if (this.garage && this.garage.status) {
        return GarageStatus.displayName(this.garage.status);
      }
      return 'Non défini';
    },
    bizDevEmail() {
      const actualBizDevId = (this.garage && this.garage.bizDevId) || null;
      if (actualBizDevId && this.garageScoreBizDevsUsers) {
        const user = this.garageScoreBizDevsUsers.find((u) => u.id === actualBizDevId);
        if (user && user.email) {
          return user.email;
        }
      }
      return 'Non défini';
    },
    performerEmail() {
      const actualPerformerId = (this.garage && this.garage.performerId) || null;
      if (actualPerformerId && this.garageScorePerformersUsers) {
        const user = this.garageScorePerformersUsers.find((u) => u.id === actualPerformerId);
        if (user && user.email) {
          return user.email;
        }
      }
      return 'Non défini';
    },
    bizDevClass() {
      return this.bizDevEmail === 'Non défini' ? 'thinned' : 'bolded';
    },
    performerClass() {
      return this.performerEmail === 'Non défini' ? 'thinned' : 'bolded';
    },
    subscriptions() {
      let formattedString = '';
      if (this.garage.subscriptions && this.garage.subscriptions.active) {
        for (const subscription of garageSubscriptionTypes.values()) {
          if (this.garage.subscriptions[subscription] && this.garage.subscriptions[subscription].enabled) {
            formattedString += `${garageSubscriptionTypes.displayName(subscription, 'fr', 'BILLING')}, `;
          }
        }
        if (formattedString.length > 0) {
          formattedString = formattedString.substring(0, formattedString.length - 2);
        }
        return formattedString;
      } else {
        return "Pas d'abonnements";
      }
    },
    billingAccountName() {
      if (!this.billingAccount) {
        return 'Non associé';
      }
      if (!this.billingAccount.name) {
        return 'Compte sans nom renseigné';
      }
      return this.billingAccount.name;
    },
  },
  methods: {
    gotoGarage() {
      if (this.billingAccount) {
        this.$router.push({
          name: 'grey-bo-automatic-billing-billing-account-billingAccountId-garages-garageId',
          params: { billingAccountId: this.billingAccount.id, garageId: this.garage.id },
        });
      }
    },
    prettifyDateTime(date) {
      return this.$moment(date).format('dddd D MMMM YYYY HH:mm:ss');
    },
    prettifyDateTimeSimple(date) {
      return this.$moment(date).format('DD/MM/YYYY');
    },
  },
};
</script>

<style lang="scss" scoped>
.card-garage {
  background: darken(#ffffff, 2%);
  width: 100%;
  height: 100%;
  border-radius: 2px;
  padding: 0.6rem;

  &:hover {
    cursor: pointer;
  }

  &__item {
    padding: 0.6rem;
    &--name {
      font-weight: bold;
    }
    &--error {
      color: #c62b1b;
    }
  }

  &__label {
    font-size: 1.1rem;
    color: #333333;
  }

  &__value {
    font-size: 1rem;
    font-style: italic;
    color: #209ab5;

    &--error {
      color: #c62b1b;
    }
  }

  &__title {
    text-align: center;
    color: #333333;
    margin-bottom: 0.6rem;
  }
  .bolded {
    font-weight: bold;
    color: #209ab5;
  }
  .thinned {
    font-weight: lighter;
    color: grey;
  }
}
</style>
