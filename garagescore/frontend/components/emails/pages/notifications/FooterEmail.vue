<template>
  <div>
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr v-if="!garageTypeIsVI">
        <td align="center" class="question first">
          {{ $t('manageEmails') }}
          <a
            :href="manageEmailsUrl"
          >
            {{ $t('manageEmailsLink') }}
          </a>
          <br><br>
        </td>
      </tr>
      <tr>
        <td v-if="!garageTypeIsVI" align="center" class="question">
          {{ $t('question') }} <a href="mailto:customer_success@custeed.com">customer_success@custeed.com</a>
          <br><br>
        </td>
        <td v-else align="center" class="question">
          {{ $t('question_short') }} <a href="mailto:fr.automotive.marketing@sgs.com">fr.automotive.marketing@sgs.com</a>
          <br><br>
        </td>
      </tr>
      <tr>
        <td class="signature">
          <div class="sign-part-1">{{ $t('regards') }}</div>
          <div class="bolded">{{ $t('garageScoreTeam') }}</div>
          <br><br>
        </td>
      </tr>
      <tr v-if="legal === 'unsatisfied'">
        <td class="legal">
          <p>
            {{ $t('legalUnsatisfied', {threshold : defaultThreshold}) }}
          </p>
          <p>
            {{ $t('legalUnsatisfied2') }}
            <br>
            {{ $t('copyright', { fullYearNumber }) }}
          </p>
        </td>
      </tr>
    </table>
    <!-- email on acid analytics -->
    <div id="_eoa_div" />
    <img id="_eoa_img" src="https://7Ifr6P5tPy.eoapxl.com/7Ifr6P5tPy/" style="height:1px !important;width:1px !important;border-width:0 !important;margin-top:0 !important;margin-bottom:0 !important;margin-right:0 !important;margin-left:0 !important;padding-top:0 !important;padding-bottom:0 !important;padding-right:0 !important;padding-left:0 !important;display:block;" alt="" title="" border="0" width="1" height="1">
  </div>
</template>

<script>

export default {
    name: "FooterEmail",
    props: {
        garageTypeIsVI: {
            type: Boolean,
            default: false
        },
        defaultThreshold: {
            type: String,
            default: ""
        },
        manageEmailsUrl: {
            type: String,
            default: ""
        },
        fullYearNumber: {
            type: Number,
            default: null
        },
        legal: {
            type: String,
            default: ""
        },
    }
}
</script>

<style lang="scss" scoped>
  .first {
    padding-top: 10px;
  }
  .legal p {
    font-size: 12px !important;
    font-style: italic;
    color: #999;
    font-family: "Trebuchet MS", sans-serif;
  }
  .bolded {
    font-family: "Trebuchet MS", sans-serif;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    color: #757575;
  }
  .question {
    padding-left: 20px;
    padding-right: 20px;
    font-family: "Trebuchet MS", sans-serif;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.43;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
  .signature {
    padding-left: 20px;
    padding-right: 20px;
  }
  .sign-part-1 {
    font-family: "Trebuchet MS", sans-serif;
    margin-bottom: 5px;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
</style>
