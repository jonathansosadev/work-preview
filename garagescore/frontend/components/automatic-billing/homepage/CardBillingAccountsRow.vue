<template>
  <tr class="card-billing-account" @click="gotoBillingAccount()">
    <td class="card-billing-account__item card-billing-account__item--name">{{ billingAccount.name }}</td>
    <td class="card-billing-account__item card-billing-account__item--email">{{ billingAccount.email }}</td>
    <td class="card-billing-account__item">{{ prettifyDateTimeSimple(billingAccount.dateNextBilling) }}</td>
  </tr>
</template>

<script>
export default {
  props: {
    billingAccount: Object,
  },
  methods: {
    gotoBillingAccount() {
      this.$router.push({
        name: 'grey-bo-automatic-billing-billing-account-billingAccountId',
        params: { billingAccountId: this.billingAccount.id },
      });
    },
    prettifyDateTimeSimple(date) {
      return this.$moment(date).format('DD/MM/YYYY');
    },
  },
};
</script>

<style lang="scss" scoped>
.card-billing-account {
  background: #ffffff;
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
    &--email {
      color: rgb(51, 122, 183);
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
}
</style>
