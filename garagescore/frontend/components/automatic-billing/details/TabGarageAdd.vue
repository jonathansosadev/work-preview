<template>
  <div class="tag-garage-add">
    <h5>Ajouter un établissement existant au compte de facturation {{ billingAccount.name }}</h5>
    <multiselect
      placeholder="Saisissez le nom, l'id ou le slug de l'établissement"
      label="publicDisplayName"
      track-by="publicDisplayName"
      v-model="selectedGarage"
      :multiple="false"
      :hide-selected="true"
      select-label=""
      :options="orphanGarages"
    >
    </multiselect>
  </div>
</template>

<script>
export default {
  props: {
    billingAccount: {
      type: Object,
      required: true,
    },
    orphanGarages: {
      type: Array,
      default: () => [],
    },
    action_addGarageToBillingAccount: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      selectedGarage: null,
    };
  },
  methods: {
    addGarage(garageId) {
      const billingAccountId = this.billingAccount.id
      this.action_addGarageToBillingAccount(billingAccountId, garageId)
        .then(() => {
          this.$snotify.success(`Le garage a été ajouté au compte de facturation avec succès.`, 'Garage ajouté');
          this.$router.push({
            name: 'grey-bo-automatic-billing-billing-account-billingAccountId-garages-garageId',
            params: { garageId, billingAccountId },
          });
        })
        .catch((err) => {
          this.$snotify.error(
            `Impossible d'ajouter ce garage à ce compte de facturation : ${err.toString()}`,
            'Erreur'
          );
        });
    },
  },
  watch: {
    selectedGarage() {
      this.addGarage(this.selectedGarage.id);
    },
  },
};
</script>
