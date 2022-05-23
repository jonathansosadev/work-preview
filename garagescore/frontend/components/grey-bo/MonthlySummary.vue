<template>
  <div class="monthly-summary-page">

    <div class="monthly-summary-page__info">
      <h4 class="monthly-summary-page__info__title">Rechercher les 12 dernières Synthèses Mensuelles envoyées à un
        utilisateur donné.</h4>
      <p class="monthly-summary-page__info__explanation">Entrez un email dans le formulaire ci-dessous et cliquer sur le
        bouton "Rechercher" pour afficher les 12 dernières synthèses mensuelles envoyées à l'utilisateur correspondant.
        Vous pourrez ensuite cliquer sur une des synthèses mensuelles pour l'afficher.</p>
    </div>

    <div class="monthly-summary-page__form">
      <form>
        <input-material name="email" v-model="email" :isValid="checkEmail" :type="'email'"
                        :submit-handler="fetchMonthlySummaries">
          <template slot="label">Email</template>
        </input-material>
        <button class="monthly-summary-page__form__button" type="button" @click="fetchMonthlySummaries"
                :disabled="!email || checkEmail === 'Invalid'">
          <i v-if="loading" class="icon-gs-cog icon-gs-spin"/>
          Rechercher
        </button>
      </form>
    </div>

    <div class="monthly-summary-page__results" v-if="results.length || error">
      <div class="error-display" v-if="error === 'NoResult'">
        Aucune synthese n'a été envoyée à cet utilisateur. Il n'est pas inscrit aux syntheses ou l'est depuis trop
        récemment.<br>
        <a v-if="userId" target="_blank" :href="getProfileLink()">Voir la page de cet utilisateur.</a>
      </div>
      <div class="error-display" v-if="error === 'UserNotFound'">Cet utilisateur n'existe pas.</div>
      <div class="error-display" v-if="error === 'UserForbidden'">Les synthèses des utilisateurs Custeed ne sont pas
        disponibles.
      </div>

      <div v-for="item in results" :key="item.id">
        <a target="_blank" :href="getReportLink(item)">{{ formatDate(item.createdAt) }}</a>
      </div>
    </div>

  </div>
</template>

<script>
import fieldsValidation from '~/util/fieldsValidation';
import * as urls from '~/utils/urls';

function isTimestamp(n) {
  const parsed = parseFloat(n);
  return !Number.isNaN(parsed) && Number.isFinite(parsed) && /^\d+\.?\d+$/.test(n);
}

export default {
  layout: 'greybo',
  name: 'MonthlySummary',
  props: {
    results: Array,
    loading: Boolean,
    error: String,
    userId: String,
    fetchUserLast12MonthlySummaries: Function,
  },
  data() {
    return {
      email: '',
    };
  },
  computed: {
    checkEmail() {
      return fieldsValidation(this.email, 'email', { required: true }).status;
    },
  },
  methods: {
    getReportLink(report) {
      return `${urls.getShortUrl('MONTLHY_SUMMARY')}/${report.id}`;
    },
    getProfileLink() {
      return `${urls.getShortUrl('COCKPIT_ADMIN_USER')}?id=${this.userId}`;
    },
    async fetchMonthlySummaries() {
      if (this.checkEmail === 'Valid') {
        await this.fetchUserLast12MonthlySummaries(this.email);
      }
    },
    formatDate(timestamp) {
      let timeStampInt;
      if (isTimestamp(timestamp)) {
        timeStampInt = parseInt(timestamp, 10);
        const lengthTimeStampInt = Math.ceil(Math.log10(timeStampInt + 1));
        if (lengthTimeStampInt === 10) timeStampInt *= 1000;
      } else {
        timeStampInt = Date.parse(timestamp);
      }
      const timeStampDate = new Date(timeStampInt - 1000 * 60 * 60 * 24 * 30); // -1 month
      const verboseDateMonth = timeStampDate.toLocaleString('default', { month: 'long' });
      const verboseDateYear = timeStampDate.toLocaleString('default', { year: 'numeric' });
      return `${verboseDateMonth} ${verboseDateYear}`;
    },
  },
};
</script>

<style lang="scss" scoped>

.monthly-summary-page {
  height: 100%;
  width: 100%;
  z-index: 10;

  &__info {
    margin: 60px 40px;
    padding: 10px;
    background-color: #f3f3f3;
    border: 1px solid #bcbcbc;
    border-radius: 5px;

    &__title {
      margin-bottom: 10px;
    }
  }

  &__form {
    text-align: center;
    margin: 20px auto;
    padding: 20px;
    max-width: 400px;

    input, select {
      margin-bottom: 10px;
    }

    &__button {
      display: block;
      width: 100%;
      font-size: 18px;
      color: white;
      border: none;
      border-radius: 5px;
      margin: 10px auto;
      padding: 5px;
      background: $green;
      cursor: pointer;

      &[disabled] {
        background: $grey;
        cursor: not-allowed;
      }
    }
  }

  &__results {
    text-align: center;
    margin: 20px auto;
    padding: 20px;
    max-width: 400px;
    background-color: #f3f3f3;
    border: 1px solid #bcbcbc;
    border-radius: 5px;

    a {
      text-transform: capitalize;
    }
  }

}
</style>
