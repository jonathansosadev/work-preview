<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr align="center">
      <td>
        <table height="40" style="border-collapse:collapse">
          <tbody>
            <tr>
              <td style="border-collapse:collapse; line-height:40px;">&nbsp;</td>
            </tr>
          </tbody>
        </table>

        <table border="0" cellspacing="0" cellpadding="0" width="330">
          <tr>
            <td class="star-button detractor" align="center">
              <div>
                <a class="star-img" :href="surveyUrls.score[2]">
                  <img :src="star.grey">
                </a>
                <a class="star-number" :href="surveyUrls.score[2]">
                  <span class="rating-big">1&nbsp;</span><span class="rating-small">/5</span>
                </a>
              </div>
            </td>
            <td class="star-button detractor" align="center">
              <div>
                <a class="star-img" :href="surveyUrls.score[4]">
                  <img :src="star.grey">
                </a>
                <a class="star-number" :href="surveyUrls.score[4]">
                  <span class="rating-big">2&nbsp;</span><span class="rating-small">/5</span>
                </a>
              </div>
            </td>
            <td class="star-button detractor" align="center">
              <div>
                <a class="star-img" :href="surveyUrls.score[6]">
                  <img :src="star.grey">
                </a>
                <a class="star-number" :href="surveyUrls.score[6]">
                  <span class="rating-big">3&nbsp;</span><span class="rating-small">/5</span>
                </a>
              </div>
            </td>
            <td class="star-button neutral" align="center">
              <div>
                <a class="star-img" :href="surveyUrls.score[8]">
                  <img :src="star.orange">
                </a>
                <a class="star-number" :href="surveyUrls.score[8]">
                  <span class="rating-big">4&nbsp;</span><span class="rating-small">/5</span>
                </a>
              </div>
            </td>
            <td class="star-button promotor" align="center">
              <div>
                <a class="star-img" :href="surveyUrls.score[10]">
                  <img :src="star.green">
                </a>
                <a class="star-number" :href="surveyUrls.score[10]">
                  <span class="rating-big">5&nbsp;</span><span class="rating-small">/5</span>
                </a>
              </div>
            </td>
          </tr>
        </table>
        
        <table height="30" style="border-collapse:collapse">
          <tbody>
            <tr>
              <td style="border-collapse:collapse; line-height:30px;">&nbsp;</td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </table>
</template>

<style>
  .star-button {
    text-align: center;
    display: inline-block;
    width: 66px;
    min-width: 66px;
    max-width: 66px;
    min-height:1px;
    padding-left:0;
    padding-right:0;
    overflow: hidden;
    white-space: nowrap;
  }
  .star-button a {
    padding: 0;
    display: block;
    text-decoration: none;
  }
  .star-img {
    line-height: 0;
  }
  .star-img img {
    width: 50px;
    height: 50px;
  }
  .star-number {
    margin-top: 10px;
    padding: 0;
  }
  .rating-small {
    font-size: 10px;
  }
  .promotor a{
    color: #00b050;
  }
  .neutral a{
    color: #f5cc00;
  }
  .detractor a{
    color: #bcbcbc;
  }
</style>

<script>
export default {
  components: {},
  props: {
    lang: {type: String, default: 'fr_FR'}
  },
  data() {
    return {};
  },
  layout() {
    return "email";
  },
  computed: {
    star() {
      return {
        green: `${this.$store.state.wwwUrl}/static/latest/images/www/survey/green_star-o.png`,
        grey: `${this.$store.state.wwwUrl}/static/latest/images/www/survey/grey_star-o.png`,
        orange: `${this.$store.state.wwwUrl}/static/latest/images/www/survey/orange_star-o.png`
      };
    },
     langToMainLocale() {
      if (this.lang.startsWith('fr')) {
        return 'fr_FR';
      }
      if (this.lang.startsWith('en')) {
        return 'en_US';
      }
      if (this.lang.startsWith('ca')) {
        return 'ca_ES';
      }
      if (this.lang.startsWith('es')) {
        return 'es_ES';
      }
      if (this.lang.startsWith('nl')) {
        return 'nl_BE';
      }
      return 'fr_FR';
    },
    surveyUrls() {
      const surveyUrls = this.$store.getters.emailData("surveyUrls");
      return {...surveyUrls, score: surveyUrls.score.map(this.addLocaleParamToUrl)}
    }
  },
  methods: {
    addLocaleParamToUrl(url) {
      const urlObject = new URL(url)
      urlObject.searchParams.append('locale', this.langToMainLocale)
      return urlObject.toString()
    }
  }
};
</script>
