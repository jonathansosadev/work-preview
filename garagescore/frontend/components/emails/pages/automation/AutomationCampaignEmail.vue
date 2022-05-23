<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tbody>
      <tr>
        <td>
          <Header :themeColor="themeColorValue" :logoUrl="logoUrl" :garageName="garageName"></Header>
        </td>
      </tr>
      <tr>
        <td>
          <Title :title="ABText('title')" :customStyle="{titleStyle}"></Title>
        </td>
      </tr>
      <tr>
        <td>
          <innerHTML :content="ABText('contentText')"></innerHTML>
        </td>
      </tr>
      <tr>
        <td>
          <br/>
        </td>
      </tr>
      <template v-if="promotionalMessageWithVariables || toggleCustomContent">
        <tr id="custom-content-text">
          <td>
            <InformationInsert
              :htmlContent="promotionalMessageWithVariables"
              :color="themeColorValue"
              :blueHighlight="toggleCustomContent"
              :isEditCustomContent="toggleCustomContent"
            />
          </td>
        </tr>
        <tr>
          <td>
            <br/>
          </td>
        </tr>
      </template>
      <tr>
        <td>
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td width="20px"></td>
              <td>
                <br/>
                <p class="choiceTitle">
                  {{ ABText('titleChoices') }}
                </p>
              </td>
              <td width="20px"></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr id="custom-button-text" v-for="(choice, i) in choicesList" :key="choice.url">
        <CentralButton
          fullWidth
          :asterisk="asterisk"
          :padding="padding"
          :color="themeColorValue"
          :text="customButtonTextValue || choice.label || ABText(`choice${i+1}`)"
          :url="choice.url"
          :disabled="isPreview"
          :scrollCustomUrl="scrollCustomUrl"
          :actionToggleUrl="actionToggleUrl || actionToggleButtonText"
          >
        </CentralButton>
      </tr>
      <tr>
        <td>
          <br/>
          <br/>
        </td>
      </tr>
      <tr class="footer">
        <td>
          <Footer>
            <div slot="greetings">{{ ABText('greetings') }}</div>
            <div slot="sender">{{ ABText('sender') }}<br/></div>
            <div slot="cgu">{{ ABText('cgu') }}&nbsp;<a href="%tag_unsubscribe_url%" :class="classBinding">{{ ABText('unsubscribe') }}</a></div>
          </Footer>
        </td>
      </tr>
    </tbody>
  </table>
</template>


<script>

import Header from '../../general/Header';
import Title from '../..//general/Title';
import Footer from '../..//general/Footer';
import CentralButton from '../..//general/CentralButton';
import innerHTML from '../..//general/InnerHTML';
import InformationInsert from '../..//general/InformationInsert';
import { AutomationOrange } from '~/assets/style/global.scss';

export default {
  layout: 'email',
  name: 'AutomationCampaignEmail',
  components: { Header, Title, CentralButton, innerHTML, Footer, InformationInsert },
  props: {
    themeColor: {
      type: String,
      default: AutomationOrange
    },
    promotionalMessage: {
      type: String,
      default: ""
    },
    target: {
      type: String,
      default: "NO_TARGET"
    },
    titleStyle: {
      type: Object,
      default() {
        return {};
      }
    },
    choices: {
      type: Array,
      default() {
        return null
      }
    },
    logoUrl: {
      type: String,
      default: ""
    },
    garageName: {
      type: String,
      default: ""
    },
    customerName: {
      type: String,
      default: ""
    },
    brandName: {
      type: String,
      default: ""
    },
    isMotorbikeDealership: {
      type: Boolean,
      default: false
    },
    customUrl: {
      type: String,
      default: ""
    },
    customButtonText: {
      type: String,
      default: ""
    },
    actionToggleButtonText: {
      type: Boolean,
      default: false
    },
    actionToggleUrl: {
      type: Boolean,
      default: false
    },
    toggleCustomContent: {
      type: Boolean,
      default: false
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    replaceVariables(text) {
      return text
      .replace(/\{customerName\}/g, this.customerName)
      .replace(/\{garageName\}/g, this.garageName)
      .replace(/\{brandName\}/g, this.brandName);
    },
    ABText(key) {
      return this.$t_locale('components/emails/pages/automation/AutomationCampaignEmail')(`${this.target}_${key}`, {
        customerName: this.customerName,
        garageName: this.garageName,
        brandName: this.brandName,
        vehiculeType: this.vehiculeType,
      });
    }
  },
  computed: {
    asterisk() {
      // display asterisk for target essai/cotation
      if (/_6|_12|_18|_24/.test(this.target)) {
        return this.ABText('asterisk');
      }
      return '';
    },
    scrollCustomUrl() {
      const customButtonText = this.isPreview && document.getElementById("custom-button-text");
      if (customButtonText && this.actionToggleUrl) {
        setTimeout(() => customButtonText.scrollIntoView({behavior: "smooth"}), 150);
      }
      return this.actionToggleUrl;
    },
    customButtonTextValue() {
      const customButtonText = this.isPreview && document.getElementById("custom-button-text");
      if (customButtonText && this.actionToggleButtonText) {
        setTimeout(() =>  customButtonText.scrollIntoView({behavior: "smooth"}), 150);
      }
      return this.customButtonText;
    },
    promotionalMessageWithVariables() {
      const customContentText = this.isPreview && document.getElementById("custom-content-text");
      if (customContentText && this.promotionalMessage) {
        setTimeout(() => customContentText.scrollIntoView({behavior: "smooth"}), 150);
      }
      return this.promotionalMessage && this.replaceVariables(this.promotionalMessage);
    },
    blueHighlightInsert() {
      return  this.promotionalMessage && this.promotionalMessage.replace(/<[^>]*>?/gm, '').length > 0;
    },
    padding() {
      return '20px 0';
    },
    choicesList() {
      return this.choices || [ { label: this.ABText("choice1"), url: "#" } ];
    },
    vehiculeType() {
      if (this.isMotorbikeDealership) {
        return this.$t_locale('components/emails/pages/automation/AutomationCampaignEmail')('Motorbike');
      }
      return this.$t_locale('components/emails/pages/automation/AutomationCampaignEmail')('Vehicle');
    },
    themeColorValue() {
      return this.themeColor || AutomationOrange;
    },
    classBinding() {
      return {
        'a-disabled': this.isPreview,
      }
    },
  },
}
</script>


<style lang="scss" scoped>
  .choiceTitle {
    font-weight: 700;
    font-size: 16px;
    color: $black;
    line-height: 1.5;
    margin: 0;
  }
  .a-disabled {
    pointer-events: none
  }
</style>
