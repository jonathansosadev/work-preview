<template>
    <table class="email-new-lead" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <Header :logoUrl="brandLogoUrl" :garageName="garageName"></Header>
        </td>
      </tr>
      <!-- GREETINGS MESSAGE -->
      <tr>
        <td>
          <innerHTML :content="body"></innerHTML>
        </td>
      </tr>

      <tr class="footer">
        <td>
          <Footer>
            <div slot="greetings">{{ getContent('greetings') }}</div>
            <div slot="sender">{{ getContent('sender') }}</div>
            <div slot="cgu">{{ getContent('cgu') }}&nbsp;<a :href="unsubscribeUrl">{{ getContent('unsubscribe') }}</a></div>
          </Footer>
        </td>
      </tr>
    </table>
</template>

<script>
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import Footer from '../../../../components/emails/general/Footer';
  import innerHTML from '../../../../components/emails/general/InnerHTML';
  import Header from '../../../../components/emails/general/Header';


  export default {
    layout: 'email',
    components: { BaseHeader, Footer, innerHTML, Header },
    methods: {
      getContent(key) {
        return this.$t_locale('pages-extended/emails/automation/gdpr/body')(`${key}`, this.arguments);
      },
      applyArguments(str) {
        for (const arg of Object.keys(this.arguments)) {
          while (str.includes(`{${arg}}`)) {
            str = str.replace(`{${arg}}`, this.arguments[arg]);
          }
        }
        return str;
      }

    },
    computed: {
      payload() { return this.$store.getters.payload; },
      bannerPrefix() {
        return ''
      },
      arguments() {
        return {
          garageName: this.payload.garagePublicDisplayName || '',
          customerName: this.payload.customerName || '',
          brandName: this.payload.brandName || '',
          dpoEmail: this.dpoEmail || '',
          unsubscribeUrl: this.unsubscribeUrl
        }
      },
      title() {
        return this.garageName;
      },
      dpoEmail() {
        return 'privacy@custeed.com';
      },
      subTitle() {
        return this.garageName;
      },
      color() {
        return 'blue';
      },
      brandLogoUrl() {
        return this.payload.logoUrl || '';
      },
      garageName() {
        return this.payload.garagePublicDisplayName;
      },
      customerName() {
        return this.payload.customerName || '';
      },
      gsClient() {
        return this.payload.gsClient;
      },
      config() {
        return this.payload.config;
      },
      unsubscribeUrl() {
        return this.payload.unsubscribeUrl;
      },
      body() {
        return this.getContent('contentText')
      },
      locale() {
        return this.payload.locale || 'fr_FR'
      }
    },
  }
</script>


<style lang="scss" scoped>
  .email-new-lead {
    width: 100%;
    color: #7f7f7f;
    font-size: 14px;
    font-family: "Trebuchet MS", sans-serif;

    td {
      padding: 10px 5px;
    }

    .bullet-list {
      margin-top: 40px;
    }

    .no-padding {
      padding: 0;
    }

    .pro-tip {
      padding-bottom: 30px;
    }

    .customer-name {
      color: #000000;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .customer-info {
      line-height: 1.5;
    }

    .blue {
      color: #219AB5;
      a {
        text-decoration: underline;
      }
    }

    .subtitle {
      font-weight: 700;
      margin: 10px 0;
    }

    .review {
      font-size: 16px;
      font-weight: 700;
      font-style: italic;
      color: #219AB5;
      padding: 10px 15px;
    }

    .rejected {
      color: #d14836;
      padding-left: 15px;
    }

    .details {
      padding-left: 15px;
      .lead > div {
        padding: 5px 0;
      }
      .lead-subdetail {
        padding: 10px 15px 5px 15px;
      }
    }

    .cta-wrapper {
      padding: 25px 0;
      text-align: center;
    }

    .cta {
      padding-bottom: 12px;
      text-decoration: none;
      padding-left: 39px;
      padding-right: 39px;
      padding-top: 12px;
      display: inline-block;
      background-color: #ed5600;
      color: #FFFFFF;
      border-radius: 3px;
      font-size: 16px;
      font-weight: bold;
    }

    .copyright {
      font-size: 12px;
      font-style: italic;
      color: #999
    }
  }
</style>
