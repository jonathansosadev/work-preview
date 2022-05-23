<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="$t_locale('pages-extended/emails/notifications/exogenous/body')('title', {satisfactionLvl, sourceType, exogenousScore} )" :subTitle="garageName" :color="color" :logo-url="imageUrl"></BaseHeader>
    </tr>

    <tr>
      <td class="content">
        <div class="greetings">{{ $t_locale('pages-extended/emails/notifications/exogenous/body')('greetings') }},</div><br>
        <p>
        {{$t_locale('pages-extended/emails/notifications/exogenous/body')('content', {satisfactionLvl, sourceType, date})}}
        </p><br>
        <h1 class="no-margin"><b class="customer-name-lead">{{ data.get('customer.fullName.value') }}</b></h1><br>
        <p>
        <span><b>{{$t_locale('pages-extended/emails/notifications/exogenous/body')('clientComment')}} :</b></span>
        </p>
        <p class="comment-body">
          <span v-if="data.get('review.comment') && data.get('review.comment.text')">{{ data.get('review.comment.text') }}</span>
          <span v-else class="grey-gs" style="font-weight: normal; font-size: 14px;">{{$t_locale('pages-extended/emails/notifications/exogenous/body')('noReview')}}.</span>
        </p>
        <br><br>
      </td>
    </tr>

    <tr><CentralButton :text="$t_locale('pages-extended/emails/notifications/exogenous/body')('see')" :url="reviewLink"/></tr>

    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>


<script>
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
  import CentralButton from '../../../../components/emails/general/CentralButton.vue';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter, CentralButton },
    methods: {
      frenchDecimal(number) {
        return number || number === 0 ? number.toString().replace(/\./, ',') : '';
      }
    },
    computed: {
      payload() { return this.$store.getters.payload; },
      color() {
        return ['red', 'yellow', 'green'][this.lvl];
      },
      imageUrl() {
        const name = ['unsatisfied', 'sensitive', 'satisfied'][this.lvl];
        return `/images/www/alert/${name}2.png`;
      },
      lvl() {
        const score = this.score;
        if (score > 6 && score < 9) return 1;
        else if (score >= 9) return 2;
        return 0;
      },
      satisfactionLvl() {
        const score = this.score;
        if (score > 6 && score < 9) return this.$t_locale('pages-extended/emails/notifications/exogenous/body')('neutral');
        else if (score >= 9) return this.$t_locale('pages-extended/emails/notifications/exogenous/body')('positive');
        return this.$t_locale('pages-extended/emails/notifications/exogenous/body')('negative');
      },
      date() {
        return this.$dd(this.data.get('review.createdAt'), "long");
      },
      data() {
        return this.payload.data;
      },
      score() {
        return this.data.get('review.rating.value');
      },
      garageName() {
        return this.payload.garage.publicDisplayName;
      },
      exogenousScore() {
        return (typeof this.score === 'number') && this.score >= 0
        && this.score <= 10 ? ` ${this.$t_locale('pages-extended/emails/notifications/exogenous/body')('at')} ${this.frenchDecimal(this.score / 2)}/5` : '';
      },
      sourceType() {
        return this.data.get('source.type');
      },
      reviewLink() {
        return this.payload.baseUrl + this.payload.gsClient.url.getShortUrl('COCKPIT_E_REPUTATION');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .one-column .comment-body {
    margin-left: 20px;
    font-size: 16px;
    color: #219AB5;
    font-style: italic;
    font-weight: bold;
  }
  h1 {
    font-size: 20px;
    margin: 5px;
  }
  h2 {
    font-size: 20px;
    color: black;
    margin: 5px;
  }
  p, .grey-gs {
    color: #7f7f7f;
  }
  #button-row {
    padding-bottom: 50px;
  }
  #button {
    border-radius: 3px;
    background-color: #ED5600!important;
    max-width: 250px;
  }
  #button-text {
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
  }
</style>
