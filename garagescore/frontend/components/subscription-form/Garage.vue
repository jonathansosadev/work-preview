<template>
  <div>
    <p class="numberGarage text-blue">{{getGarageType(2)}} n° {{ garageId + 1 }}</p>
    <div class="form-garage form-text d-flex">
      <div class="flex-g0 form-group">
        <div class="input-group">
          <input id="companyName" :tabindex="100 + 100*garageId + 1" type="text" name="companyName" v-on:blur="focusOut($event)" v-model="garageName" required v-bind:class="{ 'has-value':garageName,  validated: garageName }">
          <label for="companyName">
          <span v-if="config.wording && config.wording.garageName">
            {{ config.wording.garageName }}
          </span>
            <span v-else>{{ $t_locale('components/subscription-form/Garage')('companyName') }}</span>*</label>
        </div>
        <div class="input-group">
          <p class="control">
            <input id="address" :tabindex="100 + 100*garageId + 7" type="text" name="address" v-on:blur="focusOut($event)" v-model="garageAddress" required v-bind:class="{ 'has-value':garageAddress,  validated: garageAddress }">
            <label for="address">{{ $t_locale('components/subscription-form/Garage')('address') }} *</label>
          </p>
        </div>
        <div class="input-group"  v-if="config.withPrimaryMakes" >
          <select id="primaryBrand" :tabindex="100 + 100*garageId + 11" v-on:blur="focusOut($event)" v-model="garagePrimaryMake" required v-bind:class="{ 'has-value':garagePrimaryMake,  validated: garagePrimaryMake }">
            <optgroup :label="$t_locale('components/subscription-form/Garage')('chooseMake')">
              <option :value="garagePrimaryMake" :key="garagePrimaryMake" v-if="garagePrimaryMake && isCommonMake(garagePrimaryMake)">{{garagePrimaryMake}}</option>
              <option v-for="make in makes" :value="make" :key="make" v-if="isCommonMake(make)">{{make}}</option>
            </optgroup>
            <optgroup label="------------------">
              <option :value="garagePrimaryMake" :key="garagePrimaryMake" v-if="garagePrimaryMake && !isCommonMake(garagePrimaryMake)">{{garagePrimaryMake}}</option>
              <option v-for="make in makes" :value="make" :key="make" v-if="!isCommonMake(make)">{{make}}</option>
            </optgroup>
          </select>
          <label for="primaryBrand">{{ $t_locale('components/subscription-form/Garage')('primaryMake') }} *</label>
          <span class="arrow"></span>
        </div>
        <div v-if="config.withDealer && config.withDealer" class="input-group">
          <p class="control">
            <input id="garageDealer" :tabindex="100 + 100*garageId + 9" type="text" name="garageDealer" v-on:blur="focusOut($event)" v-model="garageDealer" required v-bind:class="{ 'has-value':garageDealer,  validated: garageDealer }">
            <label for="garageDealer">{{ $t_locale('components/subscription-form/Garage')('garageDealer') }}</label>
          </p>
        </div>
      </div>
      <div class="flex-g0 form-group">
        <div class="input-group">
          <input id="siret" :tabindex="100 + 100*garageId + 2" type="number" name="siret" v-on:blur="focusOut($event)" v-model="garageSiret" required v-bind:class="{ 'has-value':garageSiret,  validated: garageSiret }">
          <label for="siret">{{ $t_locale('components/subscription-form/Garage')('businessNumber') }} *</label>
        </div>
        <div class="input-group">
          <input id="postCode" :tabindex="100 + 100*garageId + 9" type="number" name="postCode" v-on:blur="focusOut($event)" v-model="garagePostCode" required v-bind:class="{ 'has-value':garagePostCode, validated: garagePostCode }">
          <label for="postCode">{{ $t_locale('components/subscription-form/Garage')('postCode') }} *</label>
        </div>
        <div v-show="!hasSecondaryMake && config.withSecondaryMakes" id="addSecondaryMakes" @click="addSecondaryMakes">
          <input :tabindex="100 + 100*garageId + 7" class="text-blue" type="button" value="Marque secondaire">
        </div>
        <div v-for="n in secondaryMakes.length" :key="n" v-if="hasSecondaryMake">
          <div class="input-group">
            <select :tabindex="100 + 100 * garageId + 8" v-on:blur="focusOut($event)" v-model="secondaryMakes[n-1]">
              <optgroup :label="$t_locale('components/subscription-form/Garage')('chooseMake')">
                <option :value="secondaryMakes[n-1]" :key="secondaryMakes[n-1]" v-if="secondaryMakes[n-1] && isCommonMake(secondaryMakes[n-1])">{{secondaryMakes[n-1]}}</option>
                <option v-for="make in makes" :value="make" :key="make" v-if="isCommonMake(make)">{{make}}</option>
              </optgroup>
              <optgroup label="------------------">
                <option :value="secondaryMakes[n-1]" :key="secondaryMakes[n-1]" v-if="secondaryMakes[n-1] && !isCommonMake(secondaryMakes[n-1])">{{secondaryMakes[n-1]}}</option>
                <option v-for="make in makes" :value="make" :key="make" v-if="!isCommonMake(make)">{{make}}</option>
              </optgroup>
            </select>
            <i class="icon-gs-down arrow" />
            <i class="icon-gs-close-circle cross" @click="removeSecondaryMakes(n-1)" />
          </div>
        </div>
        <div v-if="secondaryMakes.length < 10 && hasSecondaryMake">
          <div class="input-group">
            <select id="secondaryMake" v-model="secondaryMakes[secondaryMakes.length]">
              <optgroup :label="$t_locale('components/subscription-form/Garage')('chooseMake')">
                <option :value="secondaryMakes[secondaryMakes.length]" :key="secondaryMakes[secondaryMakes.length]" v-if="secondaryMakes[secondaryMakes.length] && isCommonMake(secondaryMakes[secondaryMakes.length])">{{secondaryMakes[secondaryMakes.length]}}</option>
                <option v-for="make in makes" :value="make" :key="make" v-if="isCommonMake(make)">{{make}}</option>
              </optgroup>
              <optgroup label="------------------">
                <option :value="secondaryMakes[secondaryMakes.length]" :key="secondaryMakes[secondaryMakes.length]" v-if="secondaryMakes[secondaryMakes.length] && !isCommonMake(secondaryMakes[secondaryMakes.length])">{{secondaryMakes[secondaryMakes.length]}}</option>
                <option v-for="make in makes" :value="make" :key="make" v-if="!isCommonMake(make)">{{make}}</option>
              </optgroup>
            </select>
            <label for="secondaryMake">$t_locale('components/subscription-form/Garage')('secondaryMake') {{ secondaryMakes.length + 1 }}</label>
          </div>
        </div>
      </div>
      <div class="flex-g0 form-group">
        <div class="input-group">
          <input id="garageDms" :tabindex="100 + 100*garageId + 3" type="text" name="garageDms" v-on:blur="focusOut($event)" v-model="garageDms" v-bind:class="{ 'has-value':garageDms,  validated: garageDms }">
          <label for="garageDms">{{ $t_locale('components/subscription-form/Garage')('DMS') }} </label>
        </div>
        <div class="input-group">
          <input id="town" :tabindex="100 + 100*garageId + 10" type="text" name="town" v-on:blur="focusOut($event)" v-model="garageCity" required v-bind:class="{ 'has-value':garageCity,  validated: garageCity }">
          <label for="town">{{ $t_locale('components/subscription-form/Garage')('city') }}  *</label>
        </div>
      </div>
      <div class="flex-g0 form-group">
        <div class="input-group">
          <select id="type" required name="type" :tabindex="100 + 100*garageId + 5" v-on:blur="focusOut($event)" v-model="garageType" v-bind:class="{ 'has-value':garageType, validated: garageType }">
            <option v-for="garageType in GarageTypes.values()" :key="garageType" :value="garageType">{{ GarageTypes.displayName(garageType) }}</option>
          </select>
          <label for="type">{{ $t_locale('components/subscription-form/Garage')('type') }} *</label>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import GarageTypes from '~/utils/models/garage.type'
  export default {
    name: 'Garage',
    props: ['garageId', 'user', 'config'],
    data() {
      const secondaryMakes = this.$store.getters['subscription/secondaryMakes'](this.garageId) || [];
      return {
        hasSecondaryMake: secondaryMakes && secondaryMakes.length > 0,
        secondaryMakes,
        GarageTypes,
        regexText: /^[0-9a-zA-ZÀ-ÿ-, ]+$/,
        regexSiret: /^([\d]+)$/,
        regexPostCode: /^(\d+)$/,
        regexMail: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        regexPhone: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
      };
    },
    computed: {
      makes() { return this.config.makes.filter((make) => this.garagePrimaryMake !== make && !this.secondaryMakes.includes(make)); },
      garageName: {
        get() { return this.$store.state.subscription.garages[this.garageId].name; },
        set(value) { this.$store.commit('subscription/updateGarage', { garageId: this.garageId, field: 'name', value }); }
      },
      garageType: {
        get() { return this.$store.state.subscription.garages[this.garageId].type; },
        set(value) { this.$store.commit('subscription/updateGarage', { garageId: this.garageId, field: 'type', value }); }
      },
      garageAddress: {
        get() { return this.$store.state.subscription.garages[this.garageId].address; },
        set(value) { this.$store.commit('subscription/updateGarage', { garageId: this.garageId, field: 'address', value }); }
      },
      garagePostCode: {
        get() { return this.$store.state.subscription.garages[this.garageId].postCode; },
        set(value) { this.$store.commit('subscription/updateGarage', { garageId: this.garageId, field: 'postCode', value }); }
      },
      garageCity: {
        get() { return this.$store.state.subscription.garages[this.garageId].city; },
        set(value) { this.$store.commit('subscription/updateGarage', { garageId: this.garageId, field: 'city', value }); }
      },
      garageSiret: {
        get() { return this.$store.state.subscription.garages[this.garageId].siret; },
        set(value) { this.$store.commit('subscription/updateGarage', { garageId: this.garageId, field: 'siret', value }); }
      },
      garageDms: {
        get() { return this.$store.state.subscription.garages[this.garageId].dms; },
        set(value) { this.$store.commit('subscription/updateGarage', { garageId: this.garageId, field: 'dms', value }); }
      },
      garagePrimaryMake: {
        get() { return this.$store.state.subscription.garages[this.garageId].primaryMake; },
        set(value) { this.$store.commit('subscription/updateGarage', { garageId: this.garageId, field: 'primaryMake', value }); }
      },
      garageDealer: {
        get() { return this.$store.state.subscription.garages[this.garageId].dealer; },
        set(value) { this.$store.commit('subscription/updateGarage', { garageId: this.garageId, field: 'dealer', value }); }
      }
    },
    watch: {
      secondaryMakes: function secondaryMakes(value) {
        this.$store.commit('subscription/updateGarage',
          { garageId: this.garageId, field: 'secondaryMakes', value: value.filter(m => m && typeof m === 'string') });
      }
    },
    methods: {
      isCommonMake(make) {
        return this.config.commonMakes.includes(make);
      },
      addSecondaryMakes() {
        if (!this.$el.querySelector('#addSecondaryMakes').classList.contains('absolute-style')) {
          this.$el.querySelector('#addSecondaryMakes').classList.add('absolute-style');
        }
        this.hasSecondaryMake = true;
      },
      removeSecondaryMakes(n) {
        if (this.secondaryMakes.length === 0) {
          this.$el.querySelector('#addSecondaryMake').classList.remove('absolute-style');
        }
        this.secondaryMakes.splice(n, 1);
        if (this.secondaryMakes.length === 0) {
          this.hasSecondaryMake = false;
        }
      },
      getGarageType(i) {
        const wording = this.$t_locale('components/subscription-form/Garage')(`config['${this.config.id}'].wording.garages`);
        if (typeof wording === 'object' && wording[i]) {
          return wording[i];
        }
        return '';
      },
      focusOut(event) {
        event.target.classList.remove('validated');
        if (event.target.required) {
          event.target.classList.add('has-error');
        }
        if (event.target.value !== "") {
          event.target.classList.add('has-value');
          this.validate(event.target)
        }
      },
      validate(target) {
        if (target.type === "text") {
          if (this.regexText.test(target.value)) {
            target.classList.remove('has-error');
            target.classList.add('validated');
          }
        } else if (target.type === "email") {
          if (this.regexMail.test(target.value)) {
            target.classList.remove('has-error');
            target.classList.add('validated');
          }
        } else if (target.type === "number" && target.name === "siret") {
          if (this.regexSiret.test(target.value)) {
            target.classList.remove('has-error');
            target.classList.add('validated');
          }
        } else if (target.type === "number" && target.name === "postCode") {
          if (this.regexPostCode.test(target.value)) {
            target.classList.remove('has-error');
            target.classList.add('validated');
          }
        } else if  (target.type === "tel") {
          if (this.regexPhone.test(target.value)) {
            target.classList.remove('has-error');
            target.classList.add('validated');
          }
        } else if (target.type === "radio") {
          if (target.checked) {
            target.classList.remove('has-error');
            target.classList.add('validated');
          }
        } else if (target.type === "select-one") {
          if (typeof target.selectedIndex === "number") {
            target.classList.remove('has-error');
            target.classList.add('validated');
          }
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  $blue: #219ab5;
  $light-grey: #f7f7f7;
  $grey: #e0e0e0;
  $medium-grey: #aaaaaa;
  $dark-grey: #333333;
  $green: #00b050;
  $red: #ff3860;

  .arrow { // angle-down
    cursor: pointer;
    font-weight: 900;
    position: absolute;
    right: 0;
    top: 14px;
    pointer-events: none;
  }
  .cross { // times-circle
    cursor: pointer;
    position: absolute;
    right: -20px;
    top: 14px;
  }

  .garage {
    .numberGarage {
      padding-left: 10px;
    }
    .form-garage {
      border: 1px solid $blue;
      background: $light-grey;
      padding-top: 10px;
      &.form-text .form-group .input-group input {
        -webkit-box-shadow: 0 0 0 30px $light-grey inset;
      }
    }
    .blue-icon {
      position: absolute;
      font-weight: 900;
      color: $blue;
    }
    #addSecondaryMake {
      padding-top: 15px;
      position: relative;
      input[type=button] {
        border: inherit;
        cursor: pointer;
        background: white;
        font-weight: bold;
        padding-left: 20px;
      }
      &:after {
        position: absolute;
        content: "(facultatif)";
        color: $blue;
        bottom: 2px;
        font-size: 12px;
      }
      &.absolute-style {
        position: absolute;
        z-index: 1;
        right: -160px;
      }
    }
  }
</style>
