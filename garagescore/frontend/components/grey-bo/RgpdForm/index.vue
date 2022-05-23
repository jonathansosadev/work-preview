<template>
  <div class="container">
    <section class="form-section">
      <h2 class="subtitle">Rechercher un client final</h2>
      <div class="form-group">
        <div class="input-group">
          <input
            @keyup.enter="submitSearch"
            v-model="searchInput"
            class="input input-group__input"
            id="search-rgpd"
            placeholder="Rechercher un client final par email ou téléphone"
            type="text"
          />
          <button
            @click="submitSearch"
            class="input-group__button"
            type="button"
          >
            <i aria-hidden="true" class="icon-gs-search search-icon"></i>
          </button>
        </div>
        <p class="help-text">
          <i aria-hidden="true" class="icon help-text__icon icon-gs-alert-warning-circle" />
          Respectez les formats suivants:
          <b class="text--strong">
            simon@gmail.com
          </b>
          ou
          <b class="text--strong">
            +33612345678
          </b>
        </p>
      </div>
      <p v-if="displayReverse && !isDataHashed">
        <i>
          Après anonymisation, vous pouvez retrouver les données en cherchant:
          <b class="text--strong">{{ hashedData }}</b>
        </i>
      </p>
      <div class="card-container">
        <div v-if="customerNumber" class="card card--red">
          <div class="card__header card--red-bg">Clients</div>
          <div class="card__main">
            <i class="icon icon-gs-customer" />
            <div class="main__description">
              {{ customerNumber }} clients uniques
            </div>
          </div>
        </div>
        <div v-if="dataNumber" class="card card--blue">
          <div class="card__header card--blue-bg">Données</div>
          <div class="card__main">
            <i class="icon icon-gs-database" />
            <div class="main__description">
              {{ dataNumber }} prestations
            </div>
          </div>
        </div>
        <div v-if="contactNumber" class="card card--yellow">
          <div class="card__header card--yellow-bg">Contacts</div>
          <div class="card__main">
            <i class="icon icon-gs-web-mail"></i>
            <div class="main__description">
              {{ contactNumber }} emails
            </div>
          </div>
        </div>
      </div>
      <button
        @click="anonymizeCustomerContact"
        v-if="hasAtLeastOneData && !isDataHashed"
        class="button button--primary"
        type="button"
      >
        Anonymiser
      </button>
      <p v-else-if="isDataHashed">Données déjà anonymisées</p>
    </section>
    <section>
      <h2 v-if="hasBillingAccounts" class="subtitle">
        Contacts RGPD des Etablissements à informer
      </h2>
      <ul v-if="hasBillingAccounts" class="RGPDContacts">
        <li
          v-for="billingAccount of billingAccounts"
          :key="billingAccount.name"
          class="RGPDContact"
        >
          <div class="RGPDContact__content">
            <span>{{ billingAccount.name }}</span> :&nbsp;
            <span>
              <b
                :class="{
                  'text--secondary': !billingAccount.RGPDContact
                }"
                class="text--strong"
              >
                {{ billingAccount.RGPDContact || 'vide' }}
              </b>
            </span>
          </div>
          <button
            v-if="billingAccount.RGPDContact"
            @click="copy(billingAccount.RGPDContact)"
            :class="{
              'button--primary': !hasDataInClipboard,
              'button--success': hasDataInClipboard
            }"
            class="button RGPDContact__button"
          >
            {{ getCopyButtonText(billingAccount.RGPDContact) }}
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
function md5(inputString) {
  var hc = '0123456789abcdef';
  function rh(n) {
    var j,
      s = '';
    for (j = 0; j <= 3; j++) s += hc.charAt((n >> (j * 8 + 4)) & 0x0f) + hc.charAt((n >> (j * 8)) & 0x0f);
    return s;
  }
  function ad(x, y) {
    var l = (x & 0xffff) + (y & 0xffff);
    var m = (x >> 16) + (y >> 16) + (l >> 16);
    return (m << 16) | (l & 0xffff);
  }
  function rl(n, c) {
    return (n << c) | (n >>> (32 - c));
  }
  function cm(q, a, b, x, s, t) {
    return ad(rl(ad(ad(a, q), ad(x, t)), s), b);
  }
  function ff(a, b, c, d, x, s, t) {
    return cm((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a, b, c, d, x, s, t) {
    return cm((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a, b, c, d, x, s, t) {
    return cm(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a, b, c, d, x, s, t) {
    return cm(c ^ (b | ~d), a, b, x, s, t);
  }
  function sb(x) {
    var i;
    var nblk = ((x.length + 8) >> 6) + 1;
    var blks = new Array(nblk * 16);
    for (i = 0; i < nblk * 16; i++) blks[i] = 0;
    for (i = 0; i < x.length; i++) blks[i >> 2] |= x.charCodeAt(i) << ((i % 4) * 8);
    blks[i >> 2] |= 0x80 << ((i % 4) * 8);
    blks[nblk * 16 - 2] = x.length * 8;
    return blks;
  }
  var i,
    x = sb(inputString),
    a = 1732584193,
    b = -271733879,
    c = -1732584194,
    d = 271733878,
    olda,
    oldb,
    oldc,
    oldd;
  for (i = 0; i < x.length; i += 16) {
    olda = a;
    oldb = b;
    oldc = c;
    oldd = d;
    a = ff(a, b, c, d, x[i + 0], 7, -680876936);
    d = ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, x[i + 10], 17, -42063);
    b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = gg(b, c, d, a, x[i + 0], 20, -373897302);
    a = gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = hh(a, b, c, d, x[i + 5], 4, -378558);
    d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = hh(d, a, b, c, x[i + 0], 11, -358537222);
    c = hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = ii(a, b, c, d, x[i + 0], 6, -198630844);
    d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = ad(a, olda);
    b = ad(b, oldb);
    c = ad(c, oldc);
    d = ad(d, oldd);
  }
  return rh(a) + rh(b) + rh(c) + rh(d);
}

export default {
  name: "RgpdForm",
  layout: 'greybo',
  props: {
    billingAccounts: Array,
    contactNumber: Number,
    customerNumber: Number,
    dataNumber: Number,
    displayReverse: Boolean,
    onSubmitSearch: Function,
    onAnonymization: Function,
  },
  data() {
    return {
      copiedData: [],
      searchInput: '',
    };
  },
  computed: {
    hasAtLeastOneData() {
      return (this.customerNumber || this.dataNumber || this.contactNumber);
    },
    hasBillingAccounts() {
      return !!(this.billingAccounts?.length);
    },
    hasDataInClipboard() {
      return !!(this.copiedData?.length);
    },
    hashedData() {
      const { searchInput } = this;
      if (searchInput.includes('@')) {
        const email = searchInput;
        const [localPart, domain] = email.split('@');
        return `email_${md5(localPart)}@${domain}`;
      } else {
        const phone = searchInput;
        const PhoneNumbersize = 8;
        const reversedIndex = -(PhoneNumbersize)
        const forcedIndicative = '+338';
        const cleanedPhoneNumber = phone.replace(/ /g, '');
        const cleanedPhoneNumberSize = cleanedPhoneNumber.length;
        const lastDigitsReversed = cleanedPhoneNumber
          .slice(reversedIndex, cleanedPhoneNumberSize)
          .split('')
          .reverse()
          .join('');
        return forcedIndicative + lastDigitsReversed;
      }
    },
    isDataHashed() {
      const { searchInput } = this;
      return searchInput.includes('email_') || searchInput.includes('+338');
    },
  },
  methods: {
    anonymizeCustomerContact() {
      const { searchInput } = this;
      this?.onAnonymization(searchInput)
    },
    copy(RGPDContact) {
      const textArea = document.createElement('textarea');
      textArea.value = RGPDContact;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      this.copiedData.push(RGPDContact);
    },
    getCopyButtonText(RGPDContact) {
      return !this.copiedData.includes(RGPDContact)
        ? 'Copier'
        : 'Copié ✓'
    },
    submitSearch() {
      const { searchInput } = this;
      this?.onSubmitSearch(searchInput)
    }
  },
};
</script>

<style lang="scss" scoped>
ul, li {
  list-style: none;
  margin: 0;
  padding: 0;
}
.container {
  max-width: 1400px;
}
.subtitle {
  font-size: 1.5rem;
}

.form-section {
  margin: $separator 0;
}

.help-text {
  margin-bottom: 0.8rem;
  margin-left: 0.5rem;
  margin-top: 0.5rem;
  & &__icon {
    font-size: 0.9rem;
    margin-right: 0.2rem;
  }
}

.text--strong {
  font-weight: 600;
}
.text--secondary {
  color: $grey;
}

.card-container {
  margin: $separator 0;
}
.card {
  background: $white;

  border: 1px solid;
  border-radius: 4px;

  display: inline-block;
  width: 150px;
  margin: 5px;
  overflow: hidden;

  &.card--red {
    color: $red;
  }
  &.card--blue {
    color: $blue;
  }
  &.card--yellow {
    color: $yellow-darker;
  }

  &__header {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    border-bottom: 1px solid;
    padding: 5px 10px;

    &.card--red-bg {
      background-color: #ffebee;
      border-color: $light-red;
    }
    &.card--blue-bg {
      background-color: #e0f7fa;
      border-color: #80deea;
    }
    &.card--yellow-bg {
      background-color: #fff8e1;
      border-color: #ffe082;
    }
  }
  &__main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 15px 0;
  }
}

.button {
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.42857143;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
  &--primary {
    background-color: $blue;
    color: $white;
  }
  &--success {
    background-color: $green;
    color: $white;
  }
}

.input {
  z-index: 2;

  display: block;
  height: 34px;
  width: 100%;

  margin-bottom: 0;
  padding: 6px 12px;

  color: $dark-grey;
  font-size: 14px;
  line-height: 1.42857143;

  background-color: #fff;
  background-image: none;

  border: 1px solid $grey;
  border-radius: 4px;

  outline: none;

  -webkit-transition: border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s;
  -o-transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
  transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
}
.input-group {
  display: flex;
}
.input-group .input-group__input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.input-group .input-group__button {
  border: none;
  background-color: $grey;

  padding: 0.5rem 0.8rem;

  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.icon {
  font-size: 2.5rem;
  height: 2.5rem;
}

.search-icon {
  color: $black;
  font-size: 1.2rem;
}

.main__description {
  margin-top: 0.5rem;
  font-size: 12px;
  text-align: center;
}

.RGPDContacts {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem 0;
  width: 480px;
  .RGPDContact {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    width: 100%;
    &__content {
      box-sizing: border-box;
      flex: 1;
      display: flex;
      align-items: center;
      height: 34px;
      padding: 0.25rem 0.5rem;
      border: solid 1px #ededed;
      border-radius: 3px;
      background-color: white;
    }
  }
}
</style>
