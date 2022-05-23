<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="$t_locale('pages-extended/emails/notifications/product-demonstration/body')('title', { productName })" color="blue" logo-url="/images/www/alert/notepad.png"></BaseHeader>
    </tr>

    <tr>
      <td class="content">
         {{ $t_locale('pages-extended/emails/notifications/product-demonstration/body')('greetings') }}<br/><br/>
        <p> {{ $t_locale('pages-extended/emails/notifications/product-demonstration/body')('intro', { productName }) }}</p>

        <div style="padding-left: 50px">
          <p v-if="name">{{ $t_locale('pages-extended/emails/notifications/product-demonstration/body')('name') }}: <b>{{ name }}</b></p>
          <p v-if="email">{{ $t_locale('pages-extended/emails/notifications/product-demonstration/body')('email') }}: <b>{{ email }}</b></p>
          <p v-if="phone">{{ $t_locale('pages-extended/emails/notifications/product-demonstration/body')('phone') }}: <b>{{ phone }}</b></p>
          <p v-if="businessName">{{ $t_locale('pages-extended/emails/notifications/product-demonstration/body')('businessName') }}: <b>{{ businessName }}</b></p>
        </div><br><br>
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
      payload() { return this.$store.getters.payload; },
      productName() { return this.payload.productName; },
      name() { return this.payload.name; },
      email() { return this.payload.email; },
      phone() { return this.payload.phone; },
      businessName() { return this.payload.businessName; }
    }
  }
</script>

<style lang="scss" scoped>
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

    .table {
      padding-top: 1rem;
      padding-bottom: 24px;
      width:100%;
      &__table {
        width:100%;
        color:#000000;
      }
    }
  }
</style>
