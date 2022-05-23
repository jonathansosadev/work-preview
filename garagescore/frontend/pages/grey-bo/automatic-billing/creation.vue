<template>
  <section id="automatic-billing-creation-wrapper">
    <form class="form-horizontal">
      <!-- TITLE -->
      <h4>Créer un nouveau compte de facturation</h4>

      <!-- BILLING ACCOUNT NAME -->
      <div :class="'form-group has-feedback has-' + (isNameOk() ? 'success' : 'error')">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-name-input"
            class="form-control input-sm gs-input"
            placeholder="Nom du compte de facturation à créer"
            v-model="billingAccountName"
            maxlength="50"
          />
          <span
            :class="'glyphicon glyphicon-' + (isNameOk() ? 'ok' : 'remove') + ' form-control-feedback gs-feedback'"
            aria-hidden="true"
          ></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT ACCOUNTING ID -->
      <div :class="'form-group has-feedback has-' + (isAccountingIdOk() ? 'success' : 'error')">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-accounting-id-input"
            class="form-control input-sm gs-input"
            placeholder="Référence comptable unique de ce compte de facturation"
            v-model="billingAccountAccountingId"
            maxlength="100"
          />
          <span
            :class="
              'glyphicon glyphicon-' + (isAccountingIdOk() ? 'ok' : 'remove') + ' form-control-feedback gs-feedback'
            "
            aria-hidden="true"
          ></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT EMAIL -->
      <div :class="'form-group has-feedback has-' + (isEmailOk() ? 'success' : 'error')">
        <div class="col-xs-12">
          <input
            type="email"
            id="gs-add-billingaccount-email-input"
            class="form-control input-sm gs-input"
            placeholder="Email de contact du compte de facturation à créer"
            v-model="billingAccountEmail"
            maxlength="200"
          />
          <span
            :class="'glyphicon glyphicon-' + (isEmailOk() ? 'ok' : 'remove') + ' form-control-feedback gs-feedback'"
            aria-hidden="true"
          ></span>
        </div>
        <div class="col-xs-12">A renseigner sous la forme "exemple1@company.com, exemple2@company.com"</div>
      </div>

      <!-- BILLING ACCOUNT COMPANY NAME -->
      <div :class="'form-group has-feedback has-' + (isCompanyNameOk() ? 'success' : 'error')">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-company-name-input"
            class="form-control input-sm gs-input"
            placeholder="Raison sociale associée à ce compte de facturation"
            v-model="billingAccountCompanyName"
            maxlength="200"
          />
          <span
            :class="
              'glyphicon glyphicon-' + (isCompanyNameOk() ? 'ok' : 'remove') + ' form-control-feedback gs-feedback'
            "
            aria-hidden="true"
          ></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT ADDRESS -->
      <div :class="'form-group has-feedback has-' + (isAddressOk() ? 'success' : 'error')">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-address-input"
            class="form-control input-sm gs-input"
            placeholder="Adresse de l'entreprise"
            v-model="billingAccountAddress"
            maxlength="500"
          />
          <span
            :class="'glyphicon glyphicon-' + (isAddressOk() ? 'ok' : 'remove') + ' form-control-feedback gs-feedback'"
            aria-hidden="true"
          ></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT POSTAL CODE -->
      <div :class="'form-group has-feedback has-' + (isPostalCodeOk() ? 'success' : 'error')">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-postal-code-input"
            class="form-control input-sm gs-input"
            placeholder="Code postal de l'entreprise"
            v-model="billingAccountPostalCode"
            maxlength="20"
          />
          <span
            :class="
              'glyphicon glyphicon-' + (isPostalCodeOk() ? 'ok' : 'remove') + ' form-control-feedback gs-feedback'
            "
            aria-hidden="true"
          ></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT CITY -->
      <div :class="'form-group has-feedback has-' + (isCityOk() ? 'success' : 'error')">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-city-input"
            class="form-control input-sm gs-input"
            placeholder="Ville de l'entreprise"
            v-model="billingAccountCity"
            maxlength="50"
          />
          <span
            :class="'glyphicon glyphicon-' + (isCityOk() ? 'ok' : 'remove') + ' form-control-feedback gs-feedback'"
            aria-hidden="true"
          ></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT COUNTRY -->
      <div :class="'form-group has-feedback has-' + (billingAccountCountry ? 'success' : 'error')">
        <div class="col-xs-12">
          <select class="form-control" v-model="billingAccountCountry">
            <option v-for="local of locales" :key="local.label" :value="local.value">{{ local.label }}</option>
          </select>
          <span
            :class="
              'glyphicon glyphicon-' + (billingAccountCountry ? 'ok' : 'remove') + ' form-control-feedback gs-feedback'
            "
            aria-hidden="true"
          ></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT NOTE -->
      <div class="form-group has-feedback has-success">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-note-input"
            class="form-control input-sm gs-input"
            placeholder="Note facultative à écrire sur la facture"
            v-model="billingAccountNote"
            maxlength="300"
          />
          <span class="glyphicon glyphicon-ok form-control-feedback gs-feedback" aria-hidden="true"></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT BILLING TYPE -->
      <div class="form-group">
        <div class="col-xs-12">
          <select
            class="form-control input-sm gs-input"
            v-model="billingAccountBillingType"
            id="gs-add-billingaccount-billing-type-input"
          >
            <option selected value="debit">
              <!-- si modifié, a modifier dans l'init en dessous -->
              Prélèvement SEPA à date de facture
            </option>
            <option value="transfer">
              Virement à date de réception de la facture
            </option>
          </select>
        </div>
      </div>

      <!-- BILLING TYPE PRICE -->
      <div
        v-if="billingAccountBillingType === 'transfer'"
        :class="'form-group has-feedback has-' + (isBillingTypePriceOk() ? 'success' : 'error')"
      >
        <div class="col-xs-12">
          <input
            type="number"
            class="form-control input-sm gs-input"
            placeholder="Prix de virement"
            v-model="billingAccountBillingTypePrice"
          />
        </div>
      </div>

      <!-- BILLING DATE -->
      <div class="form-group">
        <div class="col-xs-12">
          <div class="input-group">
            <span class="input-group-addon gs-input-addon"><i class="con-gs-calendar"></i></span>
            <select
              class="form-control input-sm gs-input"
              v-model="billingAccountBillingDate"
              id="gs-add-billingaccount-date-input"
            >
              <option disabled selected hidden value="" class="gs-option-placeholder"
                >Échéance mensuelle de facturation</option
              >
              <option v-for="n in 21" :key="n" :value="n + 10">
                {{ n + 10 }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- MANDATE ID -->
      <div v-if="hasDarkBoAccess" class="form-group has-feedback has-success">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-mandate-id-input"
            class="form-control input-sm gs-input"
            placeholder="Mandate ID (Non obligatoire)"
            v-model="billingAccountMandateId"
            maxlength="200"
          />
          <span class="glyphicon glyphicon-ok form-control-feedback gs-feedback" aria-hidden="true"></span>
        </div>
      </div>

      <!-- CUSTOMER ID -->
      <div v-if="hasDarkBoAccess" class="form-group has-feedback has-success">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-customer-id-input"
            class="form-control input-sm gs-input"
            placeholder="Customer ID (Non obligatoire)"
            v-model="billingAccountCustomerId"
            maxlength="200"
          />
          <span class="glyphicon glyphicon-ok form-control-feedback gs-feedback" aria-hidden="true"></span>
        </div>
      </div>

      <!-- GOCARDLESSSETUP -->
      <div class="form-group">
        <div class="col-xs-12">
          <div class="input-group">
            <span class="input-group-addon gs-input-addon"><i class="icon-gs-money-card"></i></span>
            <div class="form-control input-sm gs-input">
              GoCardLess Reçu ?
              <switch-button :value="Boolean(goCardLessValue)"></switch-button>
            </div>
          </div>
        </div>
      </div>

      <!-- BILLING ACCOUNT TECHNICAL CONTACT -->
      <div class="form-group has-feedback has-success">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-technicalcontact-input"
            class="form-control input-sm gs-input"
            placeholder="Contact technique (Non Obligatoire)"
            v-model="billingAccountTechnicalContact"
          />
          <span class="glyphicon glyphicon-ok form-control-feedback gs-feedback" aria-hidden="true"></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT ACCOUNTING CONTACT -->
      <div class="form-group has-feedback has-success">
        <div class="col-xs-12">
          <input
            type="text"
            id="gs-add-billingaccount-accountingcontact-input"
            class="form-control input-sm gs-input"
            placeholder="Contact compta (Non Obligatoire)"
            v-model="billingAccountAccountingContact"
          />
          <span class="glyphicon glyphicon-ok form-control-feedback gs-feedback" aria-hidden="true"></span>
        </div>
      </div>

      <!-- BILLING ACCOUNT RGPD CONTACT -->
      <div :class="'form-group has-feedback has-' + (isRGPDEmailOk() ? 'success' : 'error')">
        <div class="col-xs-12">
          <input
            type="email"
            id="gs-add-billingaccount-rgpdcontact-input"
            class="form-control input-sm gs-input"
            placeholder="Email de contact RGPD (Non Obligatoire)"
            v-model="billingAccountRGPDContact"
          />
          <span class="glyphicon glyphicon-ok form-control-feedback gs-feedback" aria-hidden="true"></span>
        </div>
      </div>

      <!-- BUTTON / ACTIONS -->
      <div class="form-group">
        <div class="col-xs-12">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            @click="addBillingAccount()"
            :disabled="!canCreateAccount()"
            title="Créer Compte"
          >
            Créer
          </button>
        </div>
      </div>
    </form>
  </section>
</template>

<script>
import SwitchButton from '~/components/automatic-billing/SwitchButton';

export default {
  components: { SwitchButton },
  props: {
    action_createBillingAccount: {
      type: Function,
      required: true,
    },
    billingAccounts: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },
  data() {
    return {
      billingAccountName: '',
      billingAccountEmail: '',
      billingAccountBillingDate: '',
      billingAccountAddress: '',
      billingAccountAccountingId: '',
      billingAccountCompanyName: '',
      billingAccountPostalCode: '',
      billingAccountCity: '',
      billingAccountCountry: null,
      billingAccountNote: '',
      billingAccountBillingType: 'debit',
      billingAccountBillingTypePrice: 12,
      billingAccountNamePattern: /(?=^[a-z0-9]+([-_ ]{1,1}[a-z0-9]+)*$)(?=^.{3,50}$)/i,
      billingAccountEmailPattern: /^(([a-zA-Z\-0-9._+]+@[a-zA-Z\-0-9._]+\.[a-zA-Z0-9]{2,})([,][ ]){0,1})+$/i,
      billingAccountAddressPattern: /(?=^[a-z0-9,;éèàêûîôâäëüïö]+([-_ ]{1,1}[a-z0-9,;éèàêûîôâäëüïö]+)*$)(?=^.{3,50}$)/i,
      billingAccountTechnicalContact: '',
      billingAccountAccountingContact: '',
      billingAccountRGPDContact: '',
      billingAccountMandateId: '',
      billingAccountCustomerId: '',
    };
  },
  computed: {
    hasDarkBoAccess() {
      return this.$store.getters['auth/hasAccessToDarkbo'];
    },
    goCardLessValue() {
      return this.billingAccountMandateId && this.billingAccountCustomerId;
    },
    locales() {
      return [
        {
          label: "Filiale de l'entreprise",
          value: null,
        },
        {
          label: 'France (fr)',
          value: 'FR',
        },
        {
          label: 'Espagne (es)',
          value: 'ES',
        }
      ];
    },
  },
  methods: {
    async addBillingAccount() {
      const data = {
        billingAccountName: this.billingAccountName,
        billingAccountEmail: this.billingAccountEmail,
        billingAccountBillingDate: this.billingAccountBillingDate,
        billingAccountAddress: this.billingAccountAddress,
        billingAccountAccountingId: this.billingAccountAccountingId,
        billingAccountCompanyName: this.billingAccountCompanyName,
        billingAccountPostalCode: this.billingAccountPostalCode,
        billingAccountCity: this.billingAccountCity,
        billingAccountCountry: this.billingAccountCountry,
        billingAccountNote: this.billingAccountNote,
        billingAccountBillingType: this.billingAccountBillingType,
        billingAccountBillingTypePrice:
          this.billingAccountBillingTypePrice && parseInt(this.billingAccountBillingTypePrice),
        billingAccountGoCardLessSetup: this.goCardLessValue,
        billingAccountTechnicalContact: this.billingAccountTechnicalContact,
        billingAccountAccountingContact: this.billingAccountAccountingContact,
        billingAccountRGPDContact: this.billingAccountRGPDContact,
        billingAccountMandateId: this.billingAccountMandateId || '',
        billingAccountCustomerId: this.billingAccountCustomerId || '',
      };

      if (this.isAccountingIdTaken()) {
        this.$snotify.error('Cette référence comptable existe déjà', 'Mauvaise référence');
      } else if (this.isNameTaken()) {
        this.$snotify.error('Ce nom existe déjà', 'Mauvais nom');
      } else if (this.canCreateAccount()) {
        try {
          const billingAccountId = await this.action_createBillingAccount(data);
          this.$snotify.success(
            `Le compte de facturation ${data.billingAccountName} a été créé avec succès.`,
            'Compte créé'
          );
          this.$router.push({
            name: 'grey-bo-automatic-billing-billing-account-billingAccountId',
            params: { billingAccountId },
          });
        } catch (error) {
          this.$snotify.error(
            `Le compte de facturation ${data.billingAccountName} n'a pas pu être créé : Impossible de créer ce compte de facturation :  ${error}`,
            'Erreur'
          );
        }
      }
    },
    isNameTaken() {
      return Boolean(this.billingAccounts.find((e) => e.name === this.billingAccountName));
    },
    isAccountingIdTaken() {
      return Boolean(this.billingAccounts.find((e) => e.accountingId === this.billingAccountAccountingId));
    },
    isNameOk() {
      return this.billingAccountName.match(this.billingAccountNamePattern);
    },
    isEmailOk() {
      return new RegExp(this.billingAccountEmailPattern).test(this.billingAccountEmail);
    },
    isRGPDEmailOk() {
      return new RegExp(this.billingAccountEmailPattern).test(this.billingAccountRGPDContact);
    },
    isAddressOk() {
      return this.billingAccountAddress.match(this.billingAccountAddressPattern);
    },
    isBillingDateOk() {
      const nb = this.billingAccountBillingDate === '' ? -1 : parseInt(this.billingAccountBillingDate, 10);
      return nb >= 1 && nb <= 31;
    },
    isAccountingIdOk() {
      return this.billingAccountAccountingId.match(this.billingAccountNamePattern);
    },
    isCompanyNameOk() {
      return this.billingAccountCompanyName && this.billingAccountCompanyName.length > 3;
    },
    isPostalCodeOk() {
      return this.billingAccountPostalCode.match(this.billingAccountAddressPattern);
    },
    isCityOk() {
      return this.billingAccountCity.match(this.billingAccountAddressPattern);
    },
    isBillingTypePriceOk() {
      return (
        this.billingAccountBillingType === 'debit' ||
        (!isNaN(this.billingAccountBillingTypePrice) &&
          (parseInt(this.billingAccountBillingTypePrice) === 0 || parseInt(this.billingAccountBillingTypePrice) > 0))
      );
    },
    canCreateAccount() {
      return (
        this.isNameOk() &&
        this.isAccountingIdOk() &&
        this.isEmailOk() &&
        this.isAddressOk() &&
        this.isCompanyNameOk() &&
        this.isPostalCodeOk() &&
        this.isCityOk() &&
        this.billingAccountCountry &&
        this.isBillingDateOk() &&
        this.isBillingTypePriceOk()
      );
    },
  },
  watch: {
    billingAccountBillingType() {
      if (this.billingAccountBillingType === 'transfer') {
        this.billingAccountBillingTypePrice = 12;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#automatic-billing-creation-wrapper {
  form {
    max-width: 600px;
    display: block;
    margin: auto;
    padding: 20px 0;
  }
  .gs-billingaccount-creator-main {
    width: 100%;
    height: 100%;
    background: transparent;
    color: #eeeeee;
  }

  .gs-billingaccount-creator-main .gs-input {
    background: #555555;
    color: #cccccc;
    border-radius: 3px;
  }

  .gs-billingaccount-creator-main .gs-input::placeholder,
  .gs-billingaccount-creator-main .gs-option-placeholder {
    color: #999999;
    font-style: italic;
  }

  .gs-billingaccount-creator-main .gs-input-addon {
    background: #555555;
    color: #cccccc;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }

  .gs-billingaccount-creator-main .gs-feedback {
    z-index: 10;
  }

  .gs-billingaccount-creator-main option {
    color: #cccccc;
  }

  .gs-billingaccount-creator-main button {
    border-radius: 3px;
  }
}
</style>
