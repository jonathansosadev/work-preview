<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader
        :title="[$t_locale('pages-extended/emails/notifications/report/monthly/body')('summary'), $t_locale('pages-extended/emails/notifications/report/monthly/body')(`month${month}`), year].join(' ')"
        :subTitle="garagesText" color="blue"
      ></BaseHeader>
    </tr>

    <tr>
      <td class="content">
        {{ $t_locale('pages-extended/emails/notifications/report/monthly/body')('greetings') }},<br/><br/>
        {{ $t_locale('pages-extended/emails/notifications/report/monthly/body')('phrase1') }}
        <span class="bold nowrap">
          1 {{ $t_locale('pages-extended/emails/notifications/report/monthly/body')(`month${month}`) }} {{ year }} - {{ endOfMonth }} {{ $t_locale('pages-extended/emails/notifications/report/monthly/body')(`month${month}`) }} {{ year }}.
        </span>
      </td>
    </tr>

    <tr><td>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" class="perfs-table">
        <tr>
          <td>
            <table border="0" cellspacing="0" cellpadding="0" class="category-table">
              <tr><td class="category-title"> {{ $t_locale('pages-extended/emails/notifications/report/monthly/body')('leads') }} </td></tr>
              <tr><td class="category-perf">
                {{ leads.perf | number }}
                <img class="progress" v-if="Number.isFinite(leads.perf)" :src="progressIcons[leads.evolution]"/>
              </td></tr>
            </table>
            <table border="0" cellspacing="0" cellpadding="0" class="category-table">
              <tr><td class="category-title"> {{ $t_locale('pages-extended/emails/notifications/report/monthly/body')('satisfaction') }} </td></tr>
              <tr><td class="category-perf">
                {{ satisfaction.perf | score }}
                <img class="progress" v-if="Number.isFinite(satisfaction.perf)" :src="progressIcons[satisfaction.evolution]"/>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table border="0" cellspacing="0" cellpadding="0" class="category-table">
              <tr><td class="category-title"> {{ $t_locale('pages-extended/emails/notifications/report/monthly/body')('problemResolution') }} </td></tr>
              <tr><td class="category-perf">
                {{ problemResolution.perf | percentage }}
                <img class="progress" v-if="Number.isFinite(problemResolution.perf)" :src="progressIcons[problemResolution.evolution]"/>
              </td></tr>
            </table>
            <table border="0" cellspacing="0" cellpadding="0" class="category-table">
              <tr><td class="category-title"> {{ $t_locale('pages-extended/emails/notifications/report/monthly/body')('validEmails') }} </td></tr>
              <tr><td class="category-perf">
                {{ validEmails.perf | percentage }}
                <img class="progress" v-if="Number.isFinite(validEmails.perf)" :src="progressIcons[validEmails.evolution]"/>
              </td></tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>

    <tr><td class="content">
      <span class="bold">{{ $t_locale('pages-extended/emails/notifications/report/monthly/body')('phrase2a') }}</span>
      {{ $t_locale('pages-extended/emails/notifications/report/monthly/body')('phrase2b') }}
    </td></tr>

    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/report/monthly/body')('reportLink')" :url="reportLink"/>
    </tr>

    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>


<script>
  import BaseHeader from '../../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../../components/emails/notifications/BaseFooter';
  import CentralButton from '../../../../../components/emails/general/CentralButton';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter, CentralButton },
    computed: {
      payload() { return this.$store.getters.payload; },
      month() {
        return this.payload.month;
      },
      year() {
        return this.payload.year;
      },
      endOfMonth() {
        return new Date(this.year, this.month + 1, 0).getDate();
      },
      reportLink() {
        return encodeURI(this.payload.reportLink);
      },
      garagesText() {
        const garages = this.payload.garages;
        if (!garages || !garages.length) return '';
        return garages.length > 1 ? this.$t_locale('pages-extended/emails/notifications/report/monthly/body')('groupOf', { n: garages.length}) : garages[0].publicDisplayName;
      },
      leads() {
        return this.payload.leads || {};
      },
      satisfaction() {
        return this.payload.satisfaction || {};
      },
      problemResolution() {
        return this.payload.problemResolution || {};
      },
      validEmails() {
        return this.payload.validEmails || {};
      },

      progressIcons() {
        return {
          increase: this.payload.gsClient.latestStaticUrl('/images/www/report/icon-gs-progress-up.png'),
          decrease: this.payload.gsClient.latestStaticUrl('/images/www/report/icon-gs-progress-down.png'),
          constant: this.payload.gsClient.latestStaticUrl('/images/www/report/icon-gs-equal.png')
        }
      }
    },
    filters: {
      number(value) {
        return Number.isFinite(value) ? value : '-';
      },
      percentage(value) {
        return Number.isFinite(value) ? `${Math.round(value)}%` : '-';
      },
      score(value) {
        return Number.isFinite(value) ? parseFloat(Math.round(value * 10) / 10).toFixed(1) : '-';
      }
    }
  }
</script>

<style lang="scss" scoped>

  /** ----------Header----------- **/
  .bold {
    font-weight: 700;
  }
  .nowrap {
    white-space: nowrap;
  }

  .content {
    padding-bottom: 30px;
    padding-left: 20px;
    padding-right: 20px;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.43;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }

  .perfs-table {
    min-width: 100%;
    width: 100%;
  }
  .category-table {
    display: inline-block;
    min-width: 290px;
    width: 290px
  }
  .category-title {
    padding-bottom: 15px;
    padding-left: 20px;
    font-family: Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    color: #000;
  }
  .category-perf {
    padding-bottom: 30px;
    padding-left: 20px;
    font-family: Arial;
    font-size: 30px;
    font-weight: 700;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.13;
    letter-spacing: normal;
    text-align: left;
    color: #219ab5;
  }
  #button-row {
    padding-bottom: 50px;
  }
  .button {
    border-radius: 3px;
    background-color: #ED5600!important;
    max-width: 250px;
  }
  .button-text {
    text-decoration: none;
    border-radius: 3px;
    padding: 15px 30px;
    max-width: 200px;
    display: inline-block;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.43;
    letter-spacing: 0.7px;
    text-align: center;
    color: #FFF;
    /*margin: 0 38px;*/

  }
  /** --------------------------- **/

  #question {
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 33px;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
  .bolded {
    font-family: Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }

  /** --------------------------- **/

</style>
