<template>
  <div class="rgpd-page">
    <h1>RGPD</h1>
    <RgpdForm
      :billingAccounts="billingAccounts"
      :contactNumber="contactNumber"
      :customerNumber="customerNumber"
      :dataNumber="dataNumber"
      :displayReverse="displayReverse"
      :onSubmitSearch="searchCustomer"
      :onAnonymization="startAnonymizator"
    />
  </div>
</template>

<script>
import { makeApolloMutations, makeApolloQueries } from '~/util/graphql';
import RgpdForm from '~/components/grey-bo/RgpdForm/index.vue'

export default {
  layout: 'greybo',
  name: "rgpd",
  components: {
    RgpdForm
  },
  data() {
    return {
      billingAccounts: [],
      contactNumber: 0,
      customerNumber: 0,
      dataNumber: 0,
      displayReverse: false,
    }
  },
  computed: {},
  methods: {
    async startAnonymizator(input) {
      const request = {
        name: 'rgpdSetAnonymizeFromInput',
        args: { input },
        fields:
        `
          error
        `
      };

      await makeApolloMutations([request]);

      this.billingAccounts = [];
      this.contactNumber = 0;
      this.customerNumber = 0;
      this.dataNumber = 0;
      this.copiedData = [];
      alert('Anonymisation terminée !');
    },
    async searchCustomer(searchInput) {
      const request = {
        name: 'rgpdGetRelatedDataFromInput',
        args: { input: searchInput },
        fields:
        `
          error
          customer
          data
          contact
          billingAccounts {
            name
            RGPDContact
          }
        `
      };

      const queryResult = await makeApolloQueries([request]);
      const { data: { rgpdGetRelatedDataFromInput } } = queryResult;
      const {
        billingAccounts,
        contact,
        customer,
        data,
      }  = rgpdGetRelatedDataFromInput || [];

      this.billingAccounts = [...billingAccounts ];
      this.contactNumber = contact;
      this.customerNumber = customer;
      this.dataNumber = data;
      this.displayReverse = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.rgpd-page {
  height: 100%;
  width: 100%;
  z-index: 10;
  padding: 3em;
  .clickable {
    cursor: pointer;
  }
  .input-group-addon:hover {
    color: #444;
    background-color: #ddd;
  }
}
</style>
