<template>
  <div class="gs-footer">
    <div class="container">
      <section class="gs-footer-disclaimer">
        <div class="gs-footer-custeed-disclaimer">
          <a :href="$t_locale('components/certificate/CtfFooter')('custeedLink')" target="_blank">Custeed</a>
          {{ $t_locale('components/certificate/CtfFooter')('custeedDesc', { garageName: this.garageName }) }}
        </div>
        <div class="gs-footer-garagescore-disclaimer">
          {{ $t_locale('components/certificate/CtfFooter')('garagescoreDesc0') }}
          <a :href="$t_locale('components/certificate/CtfFooter')('garageScoreLink')" target="_blank">Custeed</a>
          {{ $t_locale('components/certificate/CtfFooter')('garagescoreDesc1') }}
        </div>
        <div class="gs-footer-erep-disclaimer">
          {{ $t_locale('components/certificate/CtfFooter')('erepDesc0') }}
          <a :href="$t_locale('components/certificate/CtfFooter')('erepLink')" target="_blank">Custeed</a>
          {{ $t_locale('components/certificate/CtfFooter')('erepDesc1') }}
        </div>
        <a href="/">© Custeed</a> 2017 - 2022 - {{ $t_locale('components/certificate/CtfFooter')('allRightsReserved') }} <a :href="cguLink">{{ $t_locale('components/certificate/CtfFooter')('legalClaims') }}</a>
      </section>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      garageName: String
    },
    data() {
      return {
      };
    },
    computed: {
      cguLink() {
        const locale = this.$store.getters['certificate/locale'];
        if (['es_ES', 'ca_ES'].includes(locale)) return '/CGU-es.pdf';
        return '/CGU.pdf';
      }
    }
  }
</script>

<style lang="scss" scoped>
  .gs-footer {
    width: 100%;
    background: #f5f5f5;
    height: 210px;
    @media (max-width: 768px) {
      padding-top: 30px;
      padding-bottom: 0;
      height: 0;
    }
    .gs-footer-menu {
      display: inline-block;
      vertical-align: top;
      width: 25%;
      padding: 10px 30px 10px 0;
      @media (max-width: 1200px) {
        padding: 10px 15px 10px 0;
      }
      @media (max-width: 768px) {
        width: 100%;
        text-align: center;
        border-top: 2px dotted #bcbcbc;
        &:first-of-type {
          border: none;
        }
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        li {
          font-size: 14px;
          font-weight: 300;
          color: #BCBCBC;

          span {
            display: inline-block;
            width: 25px;
            img {
            }
          }
        }
      }
      h4 {
        font-size: 16px;
        color: #43b9ad;
        font-weight: normal;
      }
    }
    .gs-footer-disclaimer {
      font-size: 16px;
      font-weight: 300;
      color: #757575;

      text-align: center;
      margin-top: 40px;
      a {
        color: inherit;
      }
    }
  }
</style>
