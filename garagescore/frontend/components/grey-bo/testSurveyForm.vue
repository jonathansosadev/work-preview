<template>
  <div class="form-group survey-form">
    <p>
      <u>Coordonnées:</u>
    </p>
    <select-material v-model="lang" :isValid="'Valid'" :options="langs">
      <template slot="label">Langue</template>
    </select-material>
    <select-material v-model="garageType" :isValid="'Valid'" :options="garageTypes">
      <template slot="label">Type de garage</template>
    </select-material>
    <select-material v-model="dataType" :isValid="'Valid'" @change="resetFn" :options="dataTypesFiltered">
      <template slot="label">Métier</template>
    </select-material>
    <select-material
      v-if="dataType === 'AUTOMATION'"
      v-model="target"
      :isValid="'Valid'"
      @change="resetFn"
      :options="targets"
    >
      <template slot="label">Ciblage</template>
    </select-material>
    <select-material
      v-if="dataType === 'AUTOMATION'"
      v-model="sendGDPR"
      :isValid="'Valid'"
      @change="resetFn"
      :options="sendGDPRoptions"
    >
      <template slot="label">Recevoir aussi le contact RGPD</template>
    </select-material>
    <input-material v-show="sendByPhone" v-model="mobilePhone" :isValid="checkPhone" @keyup="resetFn">
      <template slot="label">Téléphone mobile</template>
    </input-material>
    <input-material v-show="sendByEmail" v-model="email" :isValid="checkEmail" @keyup="resetFn">
      <template slot="label">Email</template>
    </input-material>
    <div class="button-section">
      <button type="button" v-on:click="sendTestSurvey" :disabled="errorMsg || success || loading ? 'disabled' : false">
        <i class="icon-gs-time-hour-glass icon-gs-spin" aria-hidden="true" v-if="loading" style="font-size: 1.1em"></i>
        Envoyer
      </button>
      <button type="button" class="cancel-button" v-on:click="cancelFn">Retour</button>
    </div>
  </div>
</template>
<script>
import GarageTypes from '~/utils/models/garage.type.js';
import DataTypes from '~/utils/models/data/type/data-types';
import fieldsValidation from '../../util/fieldsValidation';
import { AutomationCampaignTargets } from '~/utils/enumV2';

export default {
  name: 'testSurveyForm',
  props: {
    loading: { type: Boolean, default: false },
    sendByEmail: Boolean,
    sendByPhone: Boolean,
    success: Boolean,
    errorMsg: String,
    submitFn: { type: Function, default: () => {} },
    resetFn: { type: Function, default: () => {} },
    cancelFn: { type: Function, default: () => {} },
  },
  data: () => ({
    email: '',
    mobilePhone: '',
    lang: 'fr',
    langs: [
      { label: 'Français', value: 'fr' },
      { label: 'Espagnol', value: 'es' },
      { label: 'Catalan', value: 'ca' },
      { label: 'Anglais', value: 'en' },
      { label: 'Belgique (Français)', value: 'fr_BE' },
      { label: 'Belgique (Néérlandais)', value: 'nl_BE' },
    ],
    dataType: 'Maintenances',
    target: AutomationCampaignTargets.M_M,
    sendGDPR: 'YES',
    garageType: GarageTypes.DEALERSHIP,
    dataTypes: DataTypes.getJobs().map((job) => ({ label: DataTypes.displayName2(job), value: `${job}s` })),
  }),

  computed: {
    garageTypes() {
      return GarageTypes.values()
        .filter(this.garageTypeFilter)
        .map((type) => ({ label: GarageTypes.displayName(type), value: type }));
    },
    language() {
      switch (this.lang) {
        case 'es':
          return 'es_ES';
        case 'ca':
          return 'ca_ES';
        case 'fr_BE':
          return 'fr_FR';
        case 'nl_BE':
          return 'nl_BE';
        case 'en':
          return 'en_US';
        default:
          return 'fr_FR';
      }
    },
    checkEmail() {
      return fieldsValidation(this.email, 'email', { required: true }).status;
    },
    checkPhone() {
      return this.mobilePhone ? 'Valid' : 'Invalid';
    },
    dataTypesFiltered() {
      let dataTypes = this.dataTypesList();
      // Automation !
      dataTypes = dataTypes.map((job) => ({ label: DataTypes.displayName2(job), value: `${job}s` }));
      let automationLabel = 'Automation (Indispo. sur enquête email ET mobile.)';
      let automationDisabled = true;
      if (!this.sendByEmail || !this.sendByPhone) {
        // Automation is then available
        automationLabel = 'Automation';
        automationDisabled = false;
      }
      dataTypes.push({ label: automationLabel, value: 'AUTOMATION', disabled: automationDisabled });
      return dataTypes;
    },
    targets() {
      return AutomationCampaignTargets.values().map((target) => {
        let tag = 'client APV'
        if(/NVS/.test(target)) {
          tag = 'client VN (non actif)';
        }
        if(/UVS/.test(target)) {
          tag = 'client VO';
        }
        const label = `${this.$t_locale('components/grey-bo/testSurveyForm')(target)} - ${tag} / ${target}`;
        return { label, value: target };
      });
    },
    sendGDPRoptions() {
      return [
        { label: 'Non', value: 'NO' },
        { label: 'Oui', value: 'YES' },
      ];
    },
  },
  watch: {
    garageType: function (event) {
      const dd = this.dataTypesList();
      this.dataType = `${dd[0]}s`;
    },
  },
  methods: {
    garageTypeFilter(type) {
      return ['Dealership', 'MotorbikeDealership', 'Caravanning', 'VehicleInspection', 'Agent'].includes(type);
    },
    dataTypesList() {
      let dataTypes = DataTypes.getJobs().filter((j) => j !== DataTypes.VEHICLE_INSPECTION);
      if (this.garageType === GarageTypes.VEHICLE_INSPECTION) dataTypes = [DataTypes.VEHICLE_INSPECTION];
      return dataTypes;
    },
    async sendTestSurvey() {
      await this.submitFn({
        email: this.email,
        mobilePhone: this.mobilePhone,
        lang: this.lang,
        dataType: this.dataType,
        garageType: this.garageType,
        target: this.target,
        sendGDPR: this.sendGDPR === 'YES', // trolled by select-material, beware of the "false" string
        language: this.language,
      });
    },
  },
};
</script>
<style lang="scss" scoped>

.survey-form {
  margin: 20px 80px;
  text-align: left;
  padding: 20px;
  background-color: #f3f3f3;
  border: 1px solid #bcbcbc;
  border-radius: 5px;

  input,
  select {
    margin-bottom: 10px;
  }

  button {
    background-color: #00af68;
    width: 150px;
    display: inline-block;
  }

  .button-section {
    text-align: center;
    button {
      display: block;
      width: 100%;
      font-size: 18px;
      color: white;
      border: none;
      border-radius: 5px;
      margin-bottom: 10px;
      padding: 5px;
    }
    .cancel-button {
      background: transparent;
      text-decoration: underline;
      color: #757575;
    }
  }
}
</style>
