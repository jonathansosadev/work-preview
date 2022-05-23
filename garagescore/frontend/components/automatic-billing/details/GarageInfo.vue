<template>
  <div class="garage-info">
    <div>
      <span class="garage-info--error">{{ displayMissingInfos }}</span>
    </div>
    <div class="garage-info__form">
      <!-- Column 1 -->
      <div class="garage-info__column">
        <div class="garage-info__item">
          <InputMaterial v-model="name" class="garage-info__input" required>
            <template slot="label">Nom</template>
          </InputMaterial>
        </div>
        <div class="garage-info__item">
          <InputMaterial v-model="externalId" class="garage-info__input">
            <template slot="label">Nom caché (Facultatif, apparait dans cockpit, pas pour le client final)</template>
          </InputMaterial>
        </div>
        <div class="garage-info__item">
          <InputMaterial v-model="group" :error="validGroupErrorMsg" class="garage-info__input" required>
            <template slot="label">Nom du groupe affiché dans les emails</template>
          </InputMaterial>
        </div>
        <div class="garage-info__item">
          <SelectMaterial
            v-model="garageType"
            :disabled="modify"
            :options="GarageTypes"
            class="garage-info__input"
            required
          >
            <template slot="label">Type <span v-if="modify"> (admin only)</span></template>
          </SelectMaterial>
        </div>
        <div class="garage-info__item">
          <SelectMaterial v-model="locale" :options="locales" class="garage-info__input" required>
            <template slot="label">Pays (langue)</template>
          </SelectMaterial>
        </div>
        <div class="garage-info__item">
          <label class="garage-info__label">Pays additionnels:</label>
          <multiselect
            v-model="additionalLocales"
            :custom-label="localesCustomLabel"
            placeholder="Sélectionnez un/des pays"
            track-by="value"
            :multiple="true"
            :allow-empty="true"
            :options="filteredLocales"
            class="garage-info__input"
            :hide-selected="true"
            select-label=""
          >
          </multiselect>
        </div>
        <div class="garage-info__item">
          <SelectMaterial v-model="timezone" :options="timezones" class="garage-info__input" required>
            <template slot="label">Timezone (pour dates et horaires)</template>
          </SelectMaterial>
        </div>
        <div class="garage-info__item">
          <SelectMaterial v-model="ratingType" :options="ratingTypes" class="garage-info__input" required>
            <template slot="label">Type de notation</template>
          </SelectMaterial>
        </div>
        <div class="garage-info__item">
          <SelectMaterial
            v-model="certificateWording"
            :options="certificateWordings"
            class="garage-info__input"
            required
          >
            <template slot="label">Verbatim lien certificat</template>
          </SelectMaterial>
        </div>
      </div>
      <!-- Column 2 -->
      <div class="garage-info__column">
        <div class="garage-info__item">
          <InputMaterial
            v-model="businessId"
            :disabled="disabledSiret"
            :error="validSiretErrorMsg"
            class="garage-info__input"
            maxlength="14"
            required
          >
            <template slot="label">Siret</template>
          </InputMaterial>
          <input v-if="!modify" v-model="mirrorForm" type="checkbox" /><span v-if="!modify">&nbsp;&nbsp;Miroir</span>
        </div>
        <div class="garage-info__item">
          <InputMaterial v-model="googlePlaceId" class="garage-info__input" required>
            <template slot="label">Google place id</template>
          </InputMaterial>
          <a
            class="garage-info__link"
            href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder?hl=fr"
            target="_blank"
          >
            Trouver l'id
            <i class="icon-gs-link" />
          </a>
        </div>
        <div class="garage-info__item">
          <SelectMaterial v-model="brand" :options="selectBrands" class="garage-info__input">
            <template slot="label">Marque</template>
          </SelectMaterial>
        </div>
        <div class="garage-info__item">
          <div class="garage-info__pill-list">
            <div
              v-for="(brandName, index) in brandNames"
              :key="index"
              class="garage-info__pill"
              @click="removeBrand(index)"
            >
              <span class="garage-info__pill-content">{{ brandName }}</span>
              <i class="icon-gs-close-circle garage-info__pill-icon" />
            </div>
          </div>
        </div>
        <div class="garage-info__item">
          <InputMaterial v-model="link" class="garage-info__input" required>
            <template slot="label">Lien RDV certificat</template>
          </InputMaterial>
        </div>
        <div class="garage-info__item">
          <InputMaterial
            ref="zohoDealUrl"
            v-model="zohoDealUrl"
            :disabled="disableZohoUrl"
            :error="zohoDealUrlErrorMessage"
            class="garage-info__input"
            required
          >
            <template slot="label">URL opportunité ZOHO</template>
          </InputMaterial>
          <input v-model="disableZohoUrl" type="checkbox" /><span>&nbsp;&nbsp;Pas d'URL</span>
        </div>
        <div v-if="!modify" class="garage-info__item">
          <SelectMaterial v-model="performerId" :options="performerIds" class="garage-info__input" required>
            <template slot="label">Assigner un Performance Manager</template>
          </SelectMaterial>
        </div>
      </div>
      <!-- Column 3 -->
      <div class="garage-info__column">
        <div class="garage-info__item">
          <label class="garage-info__label">Signature email:</label>
          <InputMaterial
            v-model="surveySignature.defaultSignature.lastName"
            class="garage-info__input garage-info__input--small"
            required
          >
            <template slot="label" required>Nom</template>
          </InputMaterial>
          <InputMaterial
            v-model="surveySignature.defaultSignature.firstName"
            class="garage-info__input garage-info__input--small"
            required
          >
            <template slot="label" required>Prénom</template>
          </InputMaterial>
          <InputMaterial
            v-model="surveySignature.defaultSignature.job"
            class="garage-info__input garage-info__input--small"
            required
          >
            <template slot="label" required>Fonction</template>
          </InputMaterial>
        </div>
        <div class="garage-info__item">
          <label class="garage-info__label">Seuils d'alertes:</label>
          <InputMaterial
            v-model.number="apv"
            class="garage-info__input garage-info__input--small"
            max="10"
            min="0"
            required
            type="number"
          >
            <template slot="label" required>APV</template>
          </InputMaterial>
          <InputMaterial
            v-model.number="vn"
            class="garage-info__input garage-info__input--small"
            max="10"
            min="0"
            required
            type="number"
          >
            <template slot="label" required>VN</template>
          </InputMaterial>
          <InputMaterial
            v-model.number="vo"
            class="garage-info__input garage-info__input--small"
            max="10"
            min="0"
            required
            type="number"
          >
            <template slot="label" required>VO</template>
          </InputMaterial>
        </div>
        <div class="garage-info__item">
          <SelectMaterial
            v-model="allowReviewCreationFromContactTicket"
            :options="allowReviewCreationFromContactTicketOptions"
            class="garage-info__input"
            required
          >
            <template slot="label">Envoyer sur Satisfaction les avis créés depuis Contact</template>
          </SelectMaterial>
        </div>
        <div class="garage-info__item">
          <SelectMaterial
            v-model="enableCrossLeadsSelfAssignCallAlert"
            :options="enableCrossLeadsSelfAssignCallAlertOptions"
            class="garage-info__input"
            required
          >
            <template slot="label">Activer l'alerte appel décroché</template>
          </SelectMaterial>
        </div>
        <div class="garage-info__item">
          <SelectMaterial
            v-model="leadsVisibleToEveryone"
            :options="leadsVisibleToEveryoneOptions"
            class="garage-info__input"
            required
          >
            <template slot="label">Autoriser les non-manager à voir tous les tickets</template>
          </SelectMaterial>
        </div>
      </div>
      <div class="garage-info__row">
        <div v-show="garageType === 'Agent'">
          <div class="garage-info__row">
            <div class="field-title">
              Parent: <span :class="parentSelectedClass">{{ parent }}</span>
              <i
                @click="unSelect()"
                v-if="parentGarageId"
                class="icon-gs-close-circle garage-info__pill-icon left-margin"
              ></i>
              <span class="text-danger left-margin" v-if="warning">{{ ' (' + warning + ')' }}</span>
              <multiselect
                v-model="selectedGarageR1"
                :custom-label="customLabel"
                :hide-selected="true"
                :multiple="false"
                :options="selectGarages"
                placeholder="Saisissez le nom, l'id ou le slug de l'établissement"
                select-label=""
                track-by="publicDisplayName"
              >
              </multiselect>
            </div>
          </div>
        </div>
      </div>
      <div v-if="parentGarageId" class="garage-info__row">
        <div class="garage-info__column">
          <div class="field-title">
            Partager les projets d'achats
            <SwitchButton :value="shareLeadTicket" @change="shareLeadTicket = !shareLeadTicket"></SwitchButton>
          </div>
        </div>
        <div class="garage-info__column" style="text-align: center" v-if="shareLeadTicket">
          <div class="field-title">
            VN
            <SwitchButton
              :value="shareLeadTicketNewVehicleSale"
              @change="shareLeadTicketNewVehicleSale = !shareLeadTicketNewVehicleSale"
            ></SwitchButton>
          </div>
        </div>
        <div class="garage-info__column" style="text-align: center" v-if="shareLeadTicket">
          <div class="field-title">
            VO
            <SwitchButton
              :value="shareLeadTicketUsedVehicleSale"
              @change="shareLeadTicketUsedVehicleSale = !shareLeadTicketUsedVehicleSale"
            ></SwitchButton>
          </div>
        </div>
        <div class="garage-info__column"></div>
      </div>
      <div class="garage-info__row">
        <div class="garage-info__item garage-info__item--end">
          <button :disabled="disableBtn" class="btn btn-primary btn-xs" v-on:click="submitForm()">
            {{ !modify ? 'Créer' : 'Sauvegarder' }} le garage
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputMaterial from '../ui/InputMaterial.vue';
import SelectMaterial from '../ui/SelectMaterial.vue';
import SwitchButton from '~/components/automatic-billing/SwitchButton';
import { AutoBrands, MotoBrands, CaravanBrands, OtherBrands } from '~/utils/enumV2';
import GarageTypes from '~/utils/models/garage.type.js';
import GarageTimezones from '~/utils/models/garage.timezones.js';

export default {
  components: { InputMaterial, SelectMaterial, SwitchButton },
  props: {
    form: { type: Object },
    submit: { type: Function, required: true },
    modify: { type: Boolean, default: false },
    allFieldsRequired: { type: Boolean, default: true },
    mirror: { type: Boolean, default: false },
    garageId: { type: String },
    garages: {
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
  data() {
    return {
      brand: '',
      brands: [...AutoBrands.values(), ...MotoBrands.values(), ...CaravanBrands.values(), ...OtherBrands.values()],
      shareLeadTicket: false,
      shareLeadTicketNewVehicleSale: false,
      shareLeadTicketUsedVehicleSale: false,
      garageType: '',
      ratingTypes: [
        {
          label: 'Note de 0 à 10',
          value: 'rating',
        },
        {
          label: 'Note de 10 à 0',
          value: 'rating-descendant',
        },
        {
          label: 'Étoiles',
          value: 'stars',
        },
      ],
      certificateWordings: [
        { label: 'Demande de RDV', value: 'appointment' },
        { label: 'Demande de devis', value: 'quotation' },
      ],
      //Form
      externalId: '',
      locale: '',
      additionalLocales: [],
      timezone: '',
      type: GarageTypes.DEALERSHIP,
      ratingType: 'rating',
      isReverseRating: false,
      certificateWording: 'appointment',
      name: '',
      group: '',
      businessId: '',
      googlePlaceId: '',
      brandNames: [],
      surveySignature: {
        useDefault: true,
        defaultSignature: {
          lastName: '',
          firstName: '',
          job: '',
        },
      },
      apv: 6,
      vn: 6,
      vo: 6,
      link: '',
      zohoDealUrl: '',
      disableZohoUrl: false,
      parentGarageId: null,
      mirrorForm: false,
      selectedGarageR1: null,
      performerId: '',
      allowReviewCreationFromContactTicket: false,
      allowReviewCreationFromContactTicketOptions: [
        {
          label: 'Non',
          value: false,
        },
        {
          label: 'Oui',
          value: true,
        },
      ],
      enableCrossLeadsSelfAssignCallAlert: true,
      enableCrossLeadsSelfAssignCallAlertOptions: [
        {
          label: 'Non',
          value: false,
        },
        {
          label: 'Oui',
          value: true,
        },
      ],
      leadsVisibleToEveryone: false,
      leadsVisibleToEveryoneOptions: [
        {
          label: 'Non',
          value: false,
        },
        {
          label: 'Oui',
          value: true,
        },
      ],
    };
  },
  computed: {
    isMirror() {
      return this.mirror || this.mirrorForm;
    },
    hasRequiredFieldsFilled() {
      return [
        this.name,
        this.group,
        this.type,
        this.garageType,
        this.locale,
        this.timezone,
        this.googlePlaceId,
        this.link,
        this.apv,
        this.vn,
        this.vo,
        this.performerId,
      ].every((property) => Boolean(property));
    },
    additionalLocalesKeys() {
      return this.additionalLocales.map((locale) => locale.value);
    },
    areSelectedLocalesValid() {
      return !this.additionalLocalesKeys.includes(this.locale);
    },
    areBusinessInfoValid() {
      return this.businessId || this.isMirror || this.disabledSiret;
    },
    isZohoInfoValid() {
      return this.disableZohoUrl || (this.zohoDealUrl && !this.zohoDealUrlErrorMessage);
    },
    hasSurveySignatureFilled() {
      return (
        this.surveySignature.defaultSignature.lastName &&
        this.surveySignature.defaultSignature.firstName &&
        this.surveySignature.defaultSignature.job
      );
    },
    parentGarage() {
      return this.garages.find((g) => g.id === this.parentGarageId);
    },
    disableBtn() {
      if (
        (this.allFieldsRequired &&
          (!this.areSelectedLocalesValid ||
            !this.hasRequiredFieldsFilled ||
            !this.areBusinessInfoValid ||
            !this.brandNames.length ||
            !this.isZohoInfoValid ||
            !this.hasSurveySignatureFilled ||
            !typeof this.allowReviewCreationFromContactTicket === 'boolean' ||
            !typeof this.enableCrossLeadsSelfAssignCallAlert === 'boolean')) ||
        !typeof this.leadsVisibleToEveryone === 'boolean'
      ) {
        return true;
      }
      if (this.garageType !== GarageTypes.AGENT && this.validSiretErrorMsg === null) {
        return false;
      }
      const parent = this.garages.find((g) => g.id === this.parentGarageId);
      return !parent || parent.type !== GarageTypes.DEALERSHIP || this.validSiretErrorMsg;
    },
    displayMissingInfos() {
      if (!(typeof this.leadsVisibleToEveryone === 'boolean')) {
        return 'Autoriser les non-manager à voir tous les tickets est nécessaire';
      }
      if (!(typeof this.enableCrossLeadsSelfAssignCallAlert === 'boolean')) {
        return "Activer l'alerte appel décroché est nécessaire";
      }
      if (!(typeof this.allowReviewCreationFromContactTicket === 'boolean')) {
        return 'Envoyer sur satisfaction est nécessaire';
      }
      if (!this.disableBtn) {
        return '';
      }
      if (!this.name) {
        return 'Le Nom est nécessaire';
      }
      if (!this.group) {
        return 'Le Nom du group est nécessaire';
      }
      if (!this.type) {
        return 'le Type est nécessaire';
      }
      if (!this.garageType) {
        return 'le Type est nécessaire';
      }
      if (!this.locale) {
        return 'Pays est nécessaure';
      }
      if (!this.timezone) {
        return 'TimeZone est nécessaire';
      }
      if (!this.businessId && !this.isMirror && !this.disabledSiret) {
        return 'Siret est nécessaire';
      }
      if (!this.googlePlaceId) {
        return 'Google place id est nécessaire';
      }
      if (!this.brandNames.length) {
        return 'Marque est nécessaire';
      }
      if (!this.link) {
        return 'Lien RDV certificat est nécessaire';
      }
      if (!this.areSelectedLocalesValid) {
        return 'Vous ne pouvez pas ajouter le même pays en principal et en additionel';
      }
      if (!this.isZohoInfoValid) {
        return 'Url Zoho est nécessaire';
      }
      if (!this.performerId) {
        return 'Assigner un Performance manager est nécessaire';
      }
      if (!this.surveySignature.defaultSignature.lastName) {
        return 'Signature email Nom est nécessaire';
      }
      if (!this.surveySignature.defaultSignature.firstName) {
        return 'Signature email Prénom est nécessaire';
      }
      if (!this.surveySignature.defaultSignature.job) {
        return 'Signature email Fonction est nécessaire';
      }
      return '';
    },
    zohoDealUrlErrorMessage() {
      if (!this.zohoDealUrl) {
        return '';
      }
      if (
        this.zohoDealUrl.length !== 'https://crm.zoho.com/crm/org321574269/tab/Potentials/1886266000011044001'.length
      ) {
        return "Le nombre de charactère n'est pas le bon. Exemple: https://crm.zoho.com/crm/org321574269/tab/Potentials/1886266000011044001";
      }
      return '';
    },
    selectGarages() {
      return this.garages.filter((g) => g.id !== this.garageId && g.type === GarageTypes.DEALERSHIP);
    },
    warning() {
      const parent = this.garages.find((g) => g.id === this.parentGarageId);
      if (!parent) {
        return '';
      }
      // else return `${parent.users.map(u => `${u.lastName || u.fullName || u.firstName || 'N/A'} - ${u.email}`).slice(0, 1).join(', ')}, et ${parent.users.length - 1} autres ...`;
      return '';
    },
    parent() {
      const parent = this.garages.find((g) => g.id === this.parentGarageId);
      if (!parent) {
        return 'Veuillez choisir un R1';
      }
      return `${parent.publicDisplayName} - ${this.parentGarageId} (${parent.type})`;
    },
    selectBrands() {
      const brands = [];
      this.brands
        .filter((brand) => !this.brandNames.some((brandName) => brandName === brand))
        .forEach((value) => {
          brands.push({ label: value, value });
        });
      return brands;
    },

    GarageTypes() {
      return GarageTypes.values()
        .map((type) => ({ label: GarageTypes.displayName(type), value: type }))
        .filter((e) => {
          return e.value !== 'CarRental' && e.value !== 'UtilityCarDealership' && e.value !== 'Other';
        });
    },

    timezones() {
      return GarageTimezones.values().map((tz) => ({ label: tz, value: tz }));
    },

    locales() {
      return [
        {
          label: 'France (fr)',
          value: 'fr_FR',
        },
        {
          label: 'Belgique (fr)',
          value: 'fr_BE',
        },
        {
          label: 'Monaco (fr)',
          value: 'fr_MC',
        },
        {
          label: 'Belgique (nl)',
          value: 'nl_BE',
        },
        {
          label: 'Suisse (fr)',
          value: 'fr_CH',
        },
        {
          label: 'Nouvelle-Calédonie (fr)',
          value: 'fr_NC',
        },
        {
          label: 'Espagne (es)',
          value: 'es_ES',
        },
        {
          label: 'Espagne (ca)',
          value: 'ca_ES',
        },
        {
          label: 'USA (en)',
          value: 'en_US',
        },
      ];
    },
    filteredLocales() {
      return this.locales.filter((locale) => locale.value !== this.locale);
    },

    performerIds() {
      const performersUsers = this.garageScorePerformersUsers;
      return performersUsers.map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }));
    },

    parentSelectedClass() {
      return this.parentGarageId ? '' : 'garage-info--error';
    },

    validGroupErrorMsg() {
      return this.group && this.group.toLowerCase().includes('group')
        ? 'Ne pas Mentionner "Groupe" dans ce nom, c\'est ajouté automatiquement'
        : null;
    },

    validSiretErrorMsg() {
      if (this.isMirror) {
        if (!this.businessId) {
          return null;
        }
        return 'Pas de siret pour un miroir';
      }
      if (this.businessId && this.businessId.length === 14) {
        const g = this.garages.find((e) => e.businessId === this.businessId);
        if (g && this.garageId !== g.id) {
          return `SIRET déjà existant sur ${g.slug}`;
        }
      }
      if (this.locale !== 'fr_FR') {
        return null;
      }
      if (this.businessId && this.businessId.length > 0) {
        if (!/^\d+$/.test(this.businessId)) {
          return 'SIRET ne doit contenir que des chiffres';
        }
      }
      return !this.businessId || this.businessId.length < 14 ? 'SIRET = 14 caractères' : null;
    },
    canSetMultipleManagers() {
      return this.type === GarageTypes.DEALERSHIP || this.type === GarageTypes.MOTORBIKE_DEALERSHIP;
    },
    disabledSiret() {
      return ['es_ES', 'ca_ES'].includes(this.locale);
    },
  },

  methods: {
    localesCustomLabel(option) {
      return option.label
    },
    customLabel(option) {
      return `${option.publicDisplayName} - ${option.slug} - ${option.id}`;
    },
    submitForm() {
      const form = {
        name: this.name && this.name.trim().replace(/  +/g, ' '),
        externalId: this.externalId && this.externalId.trim(),
        group: this.group && this.group.trim(),
        businessId: this.businessId && this.businessId.trim(),
        googlePlaceId: this.googlePlaceId && this.googlePlaceId.trim(),
        locale: this.locale,
        additionalLocales: this.additionalLocalesKeys,
        timezone: this.timezone,
        brandNames: this.brandNames,
        surveySignature: {
          defaultSignature: {
            // useDefault: true,
            lastName:
              this.surveySignature.defaultSignature.lastName && this.surveySignature.defaultSignature.lastName.trim(),
            firstName:
              this.surveySignature.defaultSignature.firstName && this.surveySignature.defaultSignature.firstName.trim(),
            job: this.surveySignature.defaultSignature.job && this.surveySignature.defaultSignature.job.trim(),
          },
        },
        apv: this.apv,
        vn: this.vn,
        vo: this.vo,
        link: this.link && this.link.trim(),
        zohoDealUrl: this.zohoDealUrl && this.zohoDealUrl.trim(),
        disableZohoUrl: Boolean(this.disableZohoUrl),
        type: this.type,
        ratingType: this.checkIsReverseRating(this.ratingType) ? 'rating' : this.ratingType,
        isReverseRating: this.checkIsReverseRating(this.ratingType),
        certificateWording: this.certificateWording,
        parentGarageId: this.parentGarageId,
        shareLeadTicket: this.shareLeadTicket,
        shareLeadTicketNewVehicleSale: this.shareLeadTicketNewVehicleSale,
        shareLeadTicketUsedVehicleSale: this.shareLeadTicketUsedVehicleSale,
        performerId: this.performerId,
        allowReviewCreationFromContactTicket: JSON.parse(this.allowReviewCreationFromContactTicket), // Convert string to boolean
        enableCrossLeadsSelfAssignCallAlert: JSON.parse(this.enableCrossLeadsSelfAssignCallAlert),
        leadsVisibleToEveryone: JSON.parse(this.leadsVisibleToEveryone),
      };
      this.submit(form);
    },
    unSelect() {
      this.parentGarageId = '';
    },
    selectParent(garageId) {
      this.parentGarageId = garageId;
    },
    removeBrand(index) {
      this.brandNames.splice(index, 1);
    },
    transformMark(value) {
      if (value > 10) {
        return 10;
      }
      if (value < 0) {
        return 0;
      }
      return value;
    },
    checkIsReverseRating(ratingType) {
      return Boolean(ratingType) && Boolean(ratingType.split('-')[1]);
    },
  },

  watch: {
    selectedGarageR1() {
      if (this.selectedGarageR1) {
        this.selectParent(this.selectedGarageR1.id);
      }
    },
    form(value) {
      if (value) {
        this.name = value.name || '';
        this.group = value.group || '';
        this.businessId = value.businessId || '';
        this.googlePlaceId = value.googlePlaceId || '';
        this.brandNames = value.brandNames || [];

        this.surveySignature.defaultSignature = {
          lastName: (value.surveySignature && value.surveySignature.defaultSignature.lastName) || '',
          firstName: (value.surveySignature && value.surveySignature.defaultSignature.firstName) || '',
          job: (value.surveySignature && value.surveySignature.defaultSignature.job) || '',
        };

        this.apv = value.apv || 6;
        this.vn = value.vn || 6;
        this.vo = value.vo || 6;
        this.link = value.link || '';
        this.zohoDealUrl = value.zohoDealUrl || '';
        this.disableZohoUrl = value.disableZohoUrl || false;
        this.garageType = value.type;
        this.locale = value.locale;
        this.additionalLocales = this.locales.filter((locale) => value.additionalLocales.includes(locale.value));
        this.timezone = value.timezone;
        this.type = value.type;
        this.ratingType = value.isReverseRating ? `${value.ratingType}-descendant` : value.ratingType;
        this.isReverseRating = false;
        this.certificateWording = value.certificateWording;
        this.externalId = value.externalId;
        this.parentGarageId = value.parentGarageId || null;
        if (this.parentGarageId) {
          this.selectedGarageR1 = this.selectGarages.find((g) => g.id === this.parentGarageId);
        }
        this.shareLeadTicket = value.shareLeadTicket;
        this.shareLeadTicketNewVehicleSale = value.shareLeadTicketNewVehicleSale;
        this.shareLeadTicketUsedVehicleSale = value.shareLeadTicketUsedVehicleSale;
        this.performerId = value.performerId;
        this.allowReviewCreationFromContactTicket =
          typeof this.allowReviewCreationFromContactTicket === 'boolean' || value.allowReviewCreationFromContactTicket === 'true'
            ? value.allowReviewCreationFromContactTicket
            : false;
        this.enableCrossLeadsSelfAssignCallAlert =
          typeof value.enableCrossLeadsSelfAssignCallAlert === 'boolean' || value.enableCrossLeadsSelfAssignCallAlert === 'true'
            ? value.enableCrossLeadsSelfAssignCallAlert
            : true;
        this.leadsVisibleToEveryone =
          typeof value.leadsVisibleToEveryone === 'boolean' || value.leadsVisibleToEveryone === 'true' ? value.leadsVisibleToEveryone : false;
      }
    },
    brand(value) {
      this.brand = '';
      if (value !== '') {
        this.brandNames.push(value);
      }
    },

    vn(value) {
      this.vn = this.transformMark(value);
    },

    apv(value) {
      this.apv = this.transformMark(value);
    },

    vo(value) {
      this.vo = this.transformMark(value);
    },
    shareLeadTicket(value) {
      this.shareLeadTicket = value;
      if (!value) {
        this.shareLeadTicketUsedVehicleSale = false;
        this.shareLeadTicketNewVehicleSale = false;
      }
    },
    shareLeadTicketNewVehicleSale(value) {
      this.shareLeadTicketNewVehicleSale = value;
    },
    shareLeadTicketUsedVehicleSale(value) {
      this.shareLeadTicketUsedVehicleSale = value;
    },
    garageType(value) {
      this.type = value;
      if (value !== 'Agent') {
        this.shareLeadTicket = false;
        this.shareLeadTicketNewVehicleSale = false;
        this.shareLeadTicketUsedVehicleSale = false;
        this.parentGarageId = '';
      }
    },
    disableZohoUrl(value) {
      if (value) {
        this.zohoDealUrl = '';
      }
    },
    locale(value) {
      if (['es_ES', 'ca_ES'].includes(value)) {
        this.businessId = '';
      }
    },
  }
};
</script>
<style lang="scss" scoped>
.left-margin {
  margin-left: 8px;
}

.field-title {
  font-weight: 700;
  display: inline-block;
  height: 100%;
  padding: 6px 0;

  .gs-switch-button {
    margin-left: 10px;
    margin-top: -2px;
  }
}

.garage-info {
  &--error {
    color: #bb2222;
  }

  &__form {
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    position: relative;

    width: 100%;
  }

  &__row {
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
    position: relative;

    width: 100%;
  }

  &__column {
    display: flex;
    flex-flow: column;
    flex: 1;
    margin: 0.25rem;

    &:not(:last-child) {
      margin-right: 1rem;
    }
  }

  &__item {
    display: flex;
    flex-flow: row;
    width: 100%;
    align-items: flex-end;
    flex-wrap: wrap;

    &:not(:last-child) {
      margin-bottom: 16px;
    }

    &--end {
      border-top: 1px dotted #cccccc;
      padding-top: 10px;
      justify-content: flex-end;
    }
  }

  &__label {
    margin: 0;
    margin-right: 16px;
  }

  &__input {
    margin-right: 16px;
    flex: 1;
  }

  &__button {
    background-color: #219ab5;
    border-radius: 5px;
    color: white;
    border: none;
    padding: 1rem 3rem;
  }

  &__pill-list {
    display: flex;
    flex-flow: row;
    flex-wrap: wrap;
  }

  &__pill {
    display: flex;
    justify-content: center;
    align-items: center;

    padding: 10px;
    background-color: transparent;
    border-radius: 10px;
    color: #219ab5;
    margin: 0.25rem;
    font-size: 12px;

    &:hover {
      cursor: pointer;
    }
  }

  &__pill-content {
    display: block;
    margin-right: 5px;
  }

  &__pill-icon {
    color: silver;
    cursor: pointer;
  }

  &__link {
    border-bottom: 1px solid silver;
    text-decoration: none;
    color: #219ab5;

    &:hover {
      color: #219ab5;
      border-bottom: 1px solid #219ab5;
    }
  }

  &__pending-wrapper {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
    z-index: 2;
  }
}
</style>
