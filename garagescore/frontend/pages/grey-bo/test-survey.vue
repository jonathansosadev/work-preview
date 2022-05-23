<template>
  <div class="test-survey-sender">
    <div class="first-step" v-show="step == 0">
      <div class="info">
        <h4>Envoi d'une enquête de test par Email et/ou SMS</h4>
        <p>
          L'enquête sera liée au garage témoin et les réponses données n'impacteront pas les statistiques ni le
          certificat de l'établissement du client.
        </p>
      </div>
      <div class="send-choices">
        <div class="title">Envoyer par</div>
        <button v-on:click="showSecondStep(true, false)"><i class="icon-gs-web-mail" aria-hidden="true"></i> Email</button>
        <button v-on:click="showSecondStep(false, true)"><i class="icon-gs-help-customer-support" aria-hidden="true"></i> SMS</button>
        <button v-on:click="showSecondStep(true, true)">
          <i class="icon-gs-web-mail" aria-hidden="true"></i>&nbsp;Email + <i class="icon-gs-help-customer-support" aria-hidden="true"></i> SMS
        </button>
      </div>
    </div>
    <div class="second-step text-center">
      <div class="title">Entrer les coordonnées et envoyer</div>
      <form>
        <div class="error-display" v-show="errorMsg">{{ errorMsg }}</div>
        <div class="success-display" v-show="success">L'enquête est envoyée avec succès</div>
        <test-survey-form
          v-show="step == 1"
          :error-msg="errorMsg"
          :loading="loading"
          :send-by-email="sendByEmail"
          :send-by-phone="sendByPhone"
          :submit-fn="sendTestSurvey"
          :reset-fn="resetForm"
          :cancel-fn="refreshStep"
          :success="success"
        ></test-survey-form>
      </form>
    </div>
  </div>
</template>
<script>
import { makeApolloMutations } from '~/util/graphql';
import {PhoneNumberUtil} from 'google-libphonenumber';
import testSurveyForm from '~/components/grey-bo/testSurveyForm.vue';

const phoneUtil = PhoneNumberUtil.getInstance()
export default {
  layout: 'greybo',
  name: 'testSurvey',
  components: {
    testSurveyForm,
  },
  data() {
    return {
      step: 0,
      loading: false,
      success: false,
      errorMsg: '',
      sendByEmail: false,
      sendByPhone: false,
    };
  },
  beforeMount() {
    this.refreshStep();
  },
  methods: {
    showSecondStep(sendByEmail, sendByPhone) {
      this.step = 1;
      this.sendByEmail = sendByEmail;
      this.sendByPhone = sendByPhone;
    },
    async sendTestSurvey({language, ...args}) {
      if (this.errorMsg || this.success) {
        return;
      }
      if (this.sendByPhone && (!args.mobilePhone || !this.testMobilePhone(args.mobilePhone, language))) {
        this.handleError('Format de téléphone invalide, veuillez mettre un n° mobile au format local');
        return;
      }
      const emailPattern =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      
      if (this.sendByEmail && (!args.email || !args.email.match(emailPattern))) {
        this.handleError('Veuillez saisir une adresse email valide');
        return;
      }
      
      this.loading = true;

      try {
        const request = {
          name: 'sendTestSurvey',
          args,
          fields: `
        message
        status
      `,
        };
        const res = await makeApolloMutations([request]);
        if (!res.data || !res.data.sendTestSurvey || res.data.sendTestSurvey.status !== 'ok') {
          this.handleError(
           (res.data && res.data.sendTestSurvey && res.data.sendTestSurvey.message) || 'Erreur serveur'
          );
          return;
        }
        this.handleSuccess();
      } catch (err) {
        this.handleError(err.message);
      }
    },
    testMobilePhone(mobilePhone, language) {
      const countryCode = language.split('_').pop()
      return phoneUtil.isValidNumberForRegion(phoneUtil.parse(mobilePhone, countryCode), countryCode)
    },
    handleSuccess() {
      this.loading = false;
      this.success = true;
      setTimeout(() => {
        this.success = false;
      }, 4000);
    },
    handleError(err) {
      this.loading = false;
      this.errorMsg = err;
    },
    resetForm() {
      this.errorMsg = '';
      this.success = false;
    },
    refreshStep() {
      this.step = 0;
      this.errorMsg = '';
      this.success = false;
      this.sendByEmail = false;
      this.sendByPhone = false;
    },
  },
};
</script>

<style lang="scss">
.test-survey-sender {
  height: 100%;
  width: 100%;
  z-index: 10;
  .send-choices {
  padding: 20px 50px;
  margin: auto;
  margin-top: 20px;
  border-top: 1px solid #219ab5;
  button:nth-child(2) {
    background-color: #0e73d3;
  }
  button:nth-child(3) {
    background-color: #edce00;
  }
  button:nth-child(4) {
    background-color: #00af68;
  }
}
  form {
    text-align: center;
  }
  button,
  .success-display,
  .error-display {
    display: block;
    width: 100%;
    font-size: 18px;
    color: white;
    border: none;
    border-radius: 5px;
    margin-bottom: 10px;
    padding: 5px;
  }
  .error-display {
    background-color: rgba(255, 28, 0, 0.5);
  }
  .success-display {
    background-color: rgba(48, 185, 55, 0.5);
  }
  .info {
    margin: 60px 40px;
    padding: 10px;
    background-color: #f3f3f3;
    border: 1px solid #bcbcbc;
    border-radius: 5px;
  }
  .title {
    font-size: 28px;
    color: #219ab5;
    text-align: center;
    margin-bottom: 10px;
  }

  .second-step {
    width: 500px;
    margin: auto;
    padding-top: 50px;
  }
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
  }
}
</style>
