<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="$t_locale('pages-extended/emails/notifications/subscription-confirmation/body')('title')" color="green" logo-url="/images/www/alert/big-check.png"></BaseHeader>
    </tr>

    <tr>
      <td class="content">
        <div class="opener">
          {{ $t_locale('pages-extended/emails/notifications/subscription-confirmation/body')('greetings') }},<br/><br/>
          {{ $t_locale('pages-extended/emails/notifications/subscription-confirmation/body')('phrase1') }}
        </div>

        <div class="summary">
          <div class="bold summary__title">{{ $t_locale('pages-extended/emails/notifications/subscription-confirmation/body')('summary') }}</div>
          <div class="info-line">{{ $t_locale('pages-extended/emails/notifications/subscription-confirmation/body')('startDate') }} : {{ formattedDate }}</div>
          <div class="info-line">{{ $t_locale('pages-extended/emails/notifications/subscription-confirmation/body')('numberGarages') }} : {{ subscriptionGaragesCount }}</div>
          <div class="info-line">{{ subscriptionGaragesList }}</div>
        </div>

        <div class="table">
          <table class="table__table">
            <tr class="price-row">
              <td class="header-cell first"><span>{{ $t_locale('pages-extended/emails/notifications/subscription-confirmation/body')('subscriptions') }}</span></td>
              <td class="header-cell"><span>{{ $t_locale('pages-extended/emails/notifications/subscription-confirmation/body')('finalPrice') }}</span></td>
            </tr>
            <tr class="price-row" v-for="subscription in subscriptions">
              <td class="price-cell first"><span>{{ $t_locale('pages-extended/emails/notifications/subscription-confirmation/body')(subscription.name) }}</span></td>
              <td class="price-cell center-cell"><span>{{ subscription.basePrice }}€</span></td>
            </tr>
            <tr class="price-row">
              <td class="price-cell grey-cell no-dashed first">
                <span class="bold">
                  {{ $t_locale('pages-extended/emails/notifications/subscription-confirmation/body')('grossTotal') }}
                </span>
              </td>
              <td class="price-cell center-cell grey-cell no-dashed">
                <span class="bold">{{ totalPrice }}€</span>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>

    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>


<script>
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter },
    computed: {
      payload() {
        const payload = this.$store.getters.payload
        return payload;
      },
      subscriptionStartDate() {
        return this.payload.subscriptionStartDate;
      },
      formattedDate() {
        if (!this.subscriptionStartDate) return '';
        const day = this.subscriptionStartDate.getDate();
        const month =  this.subscriptionStartDate.getMonth() + 1;
        const year =  this.subscriptionStartDate.getFullYear();
        return `${`0${day}`.slice(-2)}/${`0${month}`.slice(-2)}/${year}`;
      },
      subscriptionGaragesCount() {
        return this.payload.subscriptionGaragesCount;
      },
      subscriptionGaragesList() {
        return this.payload.subscriptionGaragesList;
      },
      subscriptions() {
        return this.payload.subscriptions;
      },
      totalPrice() {
        return this.payload.totalPrice;
      },
      specialConditions() {
        return this.payload.specialConditions;
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

    .opener {
      margin-bottom: 2.5rem;
    }
    .summary {
      &__title {
        margin-bottom: 1rem;
      }
      .info-line {
        margin-bottom: 0.5rem;
      }
    }
    .table {
      padding-top: 1rem;
      padding-bottom: 24px;
      width:100%;
      &__table {
        width:100%;
        color:#000000;
      }

      .price-row {
        .header-cell {
          &.first p {
            text-align: left;
          }
          color:#000000;
          background-color: #bfbfbf;
          padding: 14px;
          border-width: 1px;
          border-color: #ffffff;
          border-style: solid;
          text-align: center;
          font-weight: bold;
        }
        .center-cell{
          text-align: center;
        }
        .price-cell {
          &.first p {
            text-align: left;
          }
          p {
            padding:5px 10px;
          }
          color:#000000;
          padding-top: 8px;
          padding-bottom: 8px;
          padding-left: 3px;
          border-bottom: 1px dashed #bfbfbf;
        }
        .no-dashed{
          border-bottom: none;
        }

        .grey-cell{
          background-color: #f2f2f2;
          border-left: 1px solid #ffffff;
          border-right: 1px solid #ffffff;
        }
      }
    }
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
