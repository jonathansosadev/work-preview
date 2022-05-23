<template>
  <div class="form-invoice">
    <div class="form-text">
      <div class="form-group">
        <div class="input-group">
          <input id="entityName" type="text" name="entityName" v-model="invoiceGroupName" required :class="{ 'has-value':invoiceGroupName, validated: invoiceGroupName }">
          <label for="entityName">{{$t_locale('components/subscription-form/InvoiceGroup')("entityName")}} *</label>
        </div>
      </div>
    </div>
    <p class="text-bold">{{$t_locale('components/subscription-form/InvoiceGroup')("chooseLinkedGarage", { garage: this.getGarageType(1) })}}:</p>
    <div class="form-radio d-flex">
      <div :key="index" v-for="(garageName, index) in garagesNames" class="flex-g1 form-group">
        <div class="input-group">
          <i v-if="garages.includes(garageName)" class="text-blue icon-check pass-through icon-gs-validation-check-circle"/>
          <input type="checkbox" :id="garageName + uid" :value="garageName" v-model="garages">
          <label :for="garageName + uid"> {{garageName}}
          </label>
        </div>
      </div>
    </div>
    <br/><br/>
    <div><span class="warning" v-if="!invoiceGroupName">{{$t_locale('components/subscription-form/InvoiceGroup')("atLeastOne")}}</span></div>
    <div><span class="warning" v-if="garages.length < 2">{{$t_locale('components/subscription-form/InvoiceGroup')("atLeastTwo")}} {{this.getGarageType(1)}}</span></div>
    <div class="button">
      <input @click="removeGroup" class="removeInvoiceGroup" type="button" :value="$t_locale('components/subscription-form/InvoiceGroup')('delete')">
    </div>
  </div>
</template>
<script>
  let kk = 0;
  export default {
    name: 'InvoiceGroup',
    props: ['n', 'config'],
    data() {
      const garage = this.$store.getters['subscription/invoiceGroupeGarages'](this.n) || [];
      return {
        uid: kk++,
        garages: garage
      };
    },
    computed: {
      invoiceGroupName: {
        get() { return this.$store.state.subscription.invoice.groups[this.n].name; },
        set(value) { this.$store.commit('subscription/updateInvoiceGroup', { groupId: this.n, field: 'name', value }); }
      },
      garagesNames() {
        const groups = this.$store.state.subscription.invoice.groups;
        const names = {};
        this.$store.state.subscription.garages.forEach((g) => { names[g.name] = g.name; });
        for (let g = 0; g < groups.length; g++) {
          if (g !== this.n) {
            groups[g].garages.forEach(n => { delete names[n]; });
          }
        }
        return Object.keys(names);
      }
    },
    watch: {
      garages: function secondaryMakes(value) {
        this.$store.commit('subscription/updateInvoiceGroup', { groupId: this.n, field: 'garages', value });
      }
    },
    methods: {
      removeGroup() {
        this.$store.commit('subscription/removeInvoiceGroup', this.n);
      },
      getGarageType(i) {
        const wording = this.$t_locale('components/subscription-form/InvoiceGroup')(`config['${this.config.id}'].wording.garages`);
        if (typeof wording === 'object' && wording[i]) {
          return wording[i];
        }
        return '';
      },
    }
  };
</script>

<style lang="css" scoped>

  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed,
  figure, figcaption, footer, header, hgroup,
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }
  /* HTML5 display-role reset for older browsers */
  article, aside, details, figcaption, figure,
  footer, header, hgroup, menu, nav, section {
    display: block;
  }
  body {
    line-height: 1;
  }
  ol, ul {
    list-style: none;
  }
  blockquote, q {
    quotes: none;
  }
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
</style>

<style lang="scss" scoped>
  $blue: #219ab5;
  $light-grey: #f7f7f7;
  $grey: #e0e0e0;
  $medium-grey: #aaaaaa;
  $medium-lightgrey: #bfbfbf;
  $dark-grey: #333333;
  $green: #00b050;
  $red: #ff3860;

  .pass-through {
    pointer-events: none;
  }
  .icon-check {
    position: absolute;
  }

  input[type=button].removeInvoiceGroup {
    cursor: pointer;
    background-color: $grey;
    border: 0;
    color: $dark-grey;
    font-weight: bold;
    text-transform: uppercase;
    padding: 5px 10px;
    transition-duration: .5s;
    border-radius: 4px;
    margin-left: 4px;
    font-size: 10px;
  }
</style>
