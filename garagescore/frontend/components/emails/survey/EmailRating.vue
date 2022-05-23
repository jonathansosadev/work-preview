<template>
  <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse">
    <tbody>
      <tr>
        <td align="center" style="border-collapse:collapse">
          <table class="outer-radio-button" cellpadding="0" cellspacing="0" align="center">
            <tbody>
              <tr>
                <td align="center" style="border-collapse:collapse">

                  <table class="rating-row" cellpadding="0" cellspacing="0" align="center" v-if="surveyUrls">
                    <tbody>
                      <tr>
                        <td class="score-cell">
                          <a :href="surveyUrls[notesComputed[0].index]" class="score-circle" v-bind:class="notesComputed[0].className">
                            <span>{{ notesComputed[0].index }}</span>
                          </a>
                        </td>
                        <td style="border-collapse:collapse;width:10px">&nbsp;</td>
                        <td class="score-cell">
                          <a :href="surveyUrls[notesComputed[1].index]" class="score-circle" v-bind:class="notesComputed[1].className">
                            <span>{{ notesComputed[1].index }}</span>
                          </a>
                        </td>
                        <td style="border-collapse:collapse;width:10px">&nbsp;</td>
                        <td class="score-cell">
                          <a :href="surveyUrls[notesComputed[2].index]" class="score-circle" v-bind:class="notesComputed[2].className">
                            <span>{{ notesComputed[2].index }}</span>
                          </a>
                        </td>
                        <td style="border-collapse:collapse;width:10px">&nbsp;</td>
                        <td class="score-cell">
                          <a :href="surveyUrls[notesComputed[3].index]" class="score-circle" v-bind:class="notesComputed[3].className">
                            <span>{{ notesComputed[3].index }}</span>
                          </a>
                        </td>
                        <td style="border-collapse:collapse;width:10px">&nbsp;</td>
                        <td class="score-cell">
                          <a :href="surveyUrls[notesComputed[4].index]" class="score-circle" v-bind:class="notesComputed[4].className">
                            <span>{{ notesComputed[4].index }}</span>
                          </a>
                        </td>
                        <td style="border-collapse:collapse;width:10px">&nbsp;</td>
                        <td class="score-cell">
                          <a :href="surveyUrls[notesComputed[5].index]" class="score-circle" v-bind:class="notesComputed[5].className">
                            <span>{{ notesComputed[5].index }}</span>
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table height="10" style="border-collapse:collapse">
                    <tbody>
                      <tr>
                        <td style="border-collapse:collapse; line-height:10px;">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="rating-row" cellpadding="0" cellspacing="0" align="center" v-if="surveyUrls">
                    <tr>
                      <td class="score-cell">
                        <a :href="surveyUrls[notesComputed[6].index]" class="score-circle" v-bind:class="notesComputed[6].className">
                          <span>{{ notesComputed[6].index }}</span>
                        </a>
                      </td>
                      <td style="border-collapse:collapse;width:10px">&nbsp;</td>
                      <td class="score-cell">
                        <a :href="surveyUrls[notesComputed[7].index]" class="score-circle" v-bind:class="notesComputed[7].className">
                          <span>{{ notesComputed[7].index }}</span>
                        </a>
                      </td>
                      <td style="border-collapse:collapse;width:10px">&nbsp;</td>
                      <td class="score-cell">
                        <a :href="surveyUrls[notesComputed[8].index]" class="score-circle" v-bind:class="notesComputed[8].className">
                          <span>{{ notesComputed[8].index }}</span>
                        </a>
                      </td>
                      <td style="border-collapse:collapse;width:10px">&nbsp;</td>
                      <td class="score-cell">
                        <a :href="surveyUrls[notesComputed[9].index]" class="score-circle" v-bind:class="notesComputed[9].className">
                          <span>{{ notesComputed[9].index }} </span>
                        </a>
                      </td>
                      <td style="border-collapse:collapse;width:10px">&nbsp;</td>
                      <td class="score-cell">
                        <a :href="surveyUrls[notesComputed[10].index]" class="score-circle" v-bind:class="notesComputed[9].className">
                          <span>{{ notesComputed[10].index }}</span>
                        </a>
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
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style>
  .outer-radio-button {
    margin-top: 45px;
    border-collapse: collapse;
  }
  .rating-row {
    border-collapse: collapse;
  }
  .score-cell {
    border-collapse: collapse;
    width: 46px;
    height: 46px;
    font-weight: bold;
    background-color: #ffffff;
    font-size: 18px;
    line-height: 18px;
    text-align: center;
    border-radius: 26px;
  }
  .score-circle {
    font-weight: bold;
    font-size: 18px;
    line-height: 18px;
    text-decoration: none;
    display: block;
    padding: 13px 10px;
    border: 1px solid;
    border-radius: 26px;
  }
  .score-circle span {
    text-decoration: none;
  }
  .detractor {
    border-color: #d04331;
    color: #d04331;
  }
  .neutral {
    border-color: #e9b32f;
    color: #e9b32f;
  }
  .promotor {
    border-color: #00b050;
    color: #00b050;
  }
</style>

<script>
export default {
  components: {},
  props: {
    isReverseRating: Boolean,
    urls: {
      type: Array,
      default() {
        return [];
      }
    },
    lang: {type: String, default: 'fr_FR'}
  },
  data() {
    return {
      notes: [...Array(11).keys()],
    };
  },
  mounted() {
    this.notes = this.isReverseRating ? this.notes.reverse() : this.notes;
  },
  layout() {
    return "email";
  },
  computed: {
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
      if (this.urls && this.urls.length) return this.urls.map(this.addLocaleParamToUrl); // till we get rid of the store
      const x = this.$store.getters.emailData("surveyUrls");
      return x.score.map(this.addLocaleParamToUrl);
    },
    notesComputed() {
      const initalArray = Array.from({ length: 11 }, (_, i) => {
        return { index: i, className: i <= 6 ? 'detractor' : (i >= 9) ? 'promotor' : 'neutral' }
      });
      return this.isReverseRating ? initalArray.reverse() : initalArray;
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
