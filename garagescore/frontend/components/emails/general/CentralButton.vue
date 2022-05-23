<template>
  <td align="center" id="button-row" :style="generalStyle">

    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr align="center">
        <td>
          <table border="0" cellspacing="0" cellpadding="0" width="100%">
            <tr>
              <td width="20px">
              </td>
              <td :style="buttonGlobalStyle" class="button" align="center">
                <template v-if="url && !clipboard">
                    <a :style="linkStyle" :bgcolor="bgColor" :class="classBinding" :href="url" target="_blank">{{ text }}</a>
                </template>
                <template v-else-if="url && clipboard && clipboard.length">
                  <span class="hide" id="hide_customer_comment">{{ clipboard }}</span>
                  <button class="clipboard-button" type="button" onclick="
                      const copyText = document.getElementById('hide_customer_comment');
                      const doc = document;
                      const range = doc.createRange();
                      const select = window.getSelection;
                      const txt = doc.createTextNode(copyText.innerHTML);
                      doc.body.appendChild(txt);
                      range.selectNodeContents(txt);
                      select().addRange(range);
                      doc.execCommand('copy');
                      select().removeAllRanges();
                      txt.remove();
                    ">
                    <a :style="linkStyle" :bgcolor="bgColor" :class="classBinding" :href="url" target="_blank">{{ text }}</a>
                  </button>
                </template>
                <template v-else>
                  <a :style="linkStyle" :bgcolor="bgColor" :class="classBinding" target="_blank">{{ text }}</a>
                </template>
                <p v-if="asterisk && asterisk.length > 0" class="asterisk">{{ asterisk }}</p>
              </td>
              <td width="20px">
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

  </td>
</template>

<script>
import { Orange } from '~/assets/style/global.scss';

export default {
  components: { },
  methods: {
  },
  props: {
    url: String,
    text: String,
    color: String,
    fullWidth: Boolean,
    padding: String,
    asterisk: String,
    width: String,
    clipboard: String,
    disabled: {
      type: Boolean,
      default: false
    },
    actionToggleUrl: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    classBinding() {
      return {
        'button-text': true,
        'button-text--reversed': this.reversed,
        'a-disabled': this.disabled,
        'a-fullWidth': this.fullWidth,
      }
    },
    bgColor() {
      return ;
    },
    buttonGlobalStyle() {
      if (this.actionToggleUrl) {
        return {
          'border-radius': '3px',
          width: '1rem',
          padding: '3px',
          'box-shadow': '0 0 0 2px #219ab5',
        }
      }
      return {};
    },
    linkStyle() {
      const style = {
        'background-color' : this.color || Orange,
        'border-color' : this.color || Orange,
      };
      if (this.width) style.width = this.width;
      return style;
    },
    generalStyle() {
      const style = {
        padding: this.padding || '50px 0',
      };
      return style;
    }
  }
}
</script>


<style lang="scss" scoped>
  .clipboard-button{
    background-color: transparent;
    border: none;
    cursor: pointer;
  }
  .hide {
    display: none;
  }
  .asterisk {
    font-family: Arial,sans-serif;
    text-align: center;
    margin-top: 5px;
    padding: 2rem;
    padding-top: 0;
    color: $dark-grey;
    line-height: 1.43;
  }
  .button {
    border-radius: 3px;
    background-color: transparent!important;
    max-width: 180px;
  }
  .button-text {
    display: inline-block;
    border-left: 39px solid $orange;
    border-right: 39px solid $orange;
    border-top: 12px solid $orange;
    border-bottom: 12px solid $orange;
    background-color: $orange;
    color: $white;
    border-radius: 3px;
    font-size: 16px;
    font-weight:bold;
    text-decoration: none;
    letter-spacing: 1px;

    &--reversed {
      border: 1px solid $orange;
      color: $orange;
      background-color: $white;
    }
  }
  .a-link {
    color : $white;
    font-size : 14px;
    max-width : 600px !important;
    width : 100% !important;
    font-weight: bold;
    font-style: normal;
    font-family : Arial, sans-serif;
    letter-spacing : 0;
    border-left : inherit;
    border-right : inherit;
    padding-left : 15px;
    padding-right : 15px;
    box-sizing : border-box;
    line-height : 1.43;
  }
  .a-disabled {
    pointer-events: none
  }
  .a-fullWidth {
    width: auto;
  }
</style>
