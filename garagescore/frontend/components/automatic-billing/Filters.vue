<template>
  <div>
    <div>
      <div class="form-group" style="display: inline-block; vertical-align: top; margin-right: 20px;">
        <label for="billingAccountToggle">Afficher les comptes de facturation :&nbsp;</label>
        <input id="billingAccountToggle" type="checkbox" v-model="filters.displayBillingAccounts" />
      </div>
      <div class="form-group" style="display: inline-block; vertical-align: top; margin-right: 20px;">
        <label for="garagesToggle">Afficher les garages :&nbsp;</label>
        <input id="garagesToggle" type="checkbox" v-model="filters.displayGarages" />
      </div>
    </div>

    <!-- Filters -->
    <div class="header-filter-block" style="margin-bottom: 20px;">
      <div class="left-part">
        <div class="form-group" style="display: inline-block; vertical-align: top; margin-right: 20px;">
          <SelectMaterial placedLabel v-model="filters.status" :options="options.pluggedSelectOptions">
            <template slot="label">Etat du garage</template>
          </SelectMaterial>
        </div>
        <div class="form-group" style="display: inline-block; vertical-align: top; margin-right: 20px;">
          <SelectMaterial placedLabel v-model="filters.typeFilter" :options="garageTypesOptions">
            <template slot="label">Type du garage</template>
          </SelectMaterial>
        </div>
        <div class="form-group" style="display: inline-block; vertical-align: top; margin-right: 20px;">
          <SelectMaterial placedLabel v-model="filters.billingType" :options="options.billingTypeOptions">
            <template slot="label">Moyen de paiement</template>
          </SelectMaterial>
        </div>
        <div class="form-group" style="display: inline-block; vertical-align: top; margin-right: 20px;">
          <SelectMaterial placedLabel v-model="filters.goCardLess" :options="options.goCardLessSelectOptions">
            <template slot="label">GCD/1ier virement reçu</template>
          </SelectMaterial>
        </div>
        <div
          class="form-group"
          style="display: inline-block; vertical-align: top; margin-right: 20px; min-width: 150px;"
        >
          <SelectMaterial placedLabel v-model="filters.bizDevId" :options="options.garageScoreBizDevsUsersSelect">
            <template slot="label">BizDev :</template>
          </SelectMaterial>
        </div>
        <div
          class="form-group"
          style="display: inline-block; vertical-align: top; margin-right: 20px; min-width: 150px;"
        >
          <SelectMaterial placedLabel v-model="filters.performerId" :options="options.garageScorePerformersUsersSelect">
            <template slot="label">Performer :</template>
          </SelectMaterial>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GarageStatus from '~/utils/models/garage.status.js';
import GarageTypes from '~/utils/models/garage.type.js';

const generatePluggedSelectedOptions = () => {
  const options = GarageStatus.values().map((v) => {
    return {
      label: GarageStatus.displayName(v),
      value: v,
    };
  });
  options.push({ label: '-', value: '' });
  return options;
};

export default {
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          displayBillingAccounts: true,
          displayGarages: true,
          status: '',
          typeFilter: '',
          billingType: '',
          goCardLess: '',
          bizDevId: '',
          performerId: '',
        };
      },
    },
  },
  data() {
    return {
      filters: this.value,
      options: {
        pluggedSelectOptions: generatePluggedSelectedOptions(),
        goCardLessSelectOptions: [
          {
            label: 'Renseigné',
            value: 'completed',
          },
          {
            label: 'Non renseigné',
            value: 'notCompleted',
          },
          {
            label: '-',
            value: '',
          },
        ],
        billingTypeOptions: [
          {
            label: 'Prélèvement',
            value: 'debit',
          },
          {
            label: 'Virement',
            value: 'transfer',
          },
          {
            label: '-',
            value: '',
          },
        ],
      },
    };
  },
  computed: {
    garageTypesOptions() {
      const options = GarageTypes.values().map((type) => ({ label: GarageTypes.displayName(type), value: type }));
      options.push({ label: '-', value: '' });
      return options;
    },
  },
  watch: {
    filters: {
      handler() {
        this.$emit('input', this.filters);
      },
      deep: true,
    },
  },
};
</script>

<style></style>
