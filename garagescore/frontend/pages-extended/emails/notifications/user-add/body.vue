<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="$t_locale('pages-extended/emails/notifications/user-add/body')('title')" :subTitle="garageName" color="blue" logo-url="/images/www/alert/user-add.png"></BaseHeader>
    </tr>

    <tr>
      <td class="content">
        <div class="greetings">{{ $t_locale('pages-extended/emails/notifications/user-add/body')('greetings') }},</div>
        <div class="phrase1">
          <span class="bold">{{ userFullName }}</span>, <JobHandler :job="userJob"/>, {{ $t_locale('pages-extended/emails/notifications/user-add/body')('wantsNewUser') }}
        </div>

        <div class="user-details">
          <div class="bold">{{ $t_locale('pages-extended/emails/notifications/user-add/body')('userDetails') }}</div>
          <div class="left-tab detail">{{ $t_locale('pages-extended/emails/notifications/user-add/body')('email') }} <span class="value">{{ newUserEmail }}</span></div>
          <div class="left-tab detail">{{ $t_locale('pages-extended/emails/notifications/user-add/body')('job') }} <span class="value"> <JobHandler :job="newUserJob"/></span></div>
          <div class="left-tab">{{ $t_locale('pages-extended/emails/notifications/user-add/body')('requestedGarages') }}</div>
          <div class="left-tab value" v-for='garage of requestedGarages'>{{ garage.publicDisplayName }}</div>
        </div>

        {{ $t_locale('pages-extended/emails/notifications/user-add/body')('toAddClick') }}
      </td>
    </tr>
    <tr><CentralButton :text="$t_locale('pages-extended/emails/notifications/user-add/body')('createUser')" :url="addUserLink"/></tr>

    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>


<script>
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
  import JobHandler from '../../../../components/emails/notifications/JobHandler';
  import CentralButton from '../../../../components/emails/general/CentralButton.vue';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter, JobHandler, CentralButton },
    computed: {
      payload() { return this.$store.getters.payload; },
      contact() {
        return this.payload.contact;
      },
      garageName() {
        return this.payload.garage && this.payload.garage.publicDisplayName;
      },
      user() {
        return this.payload.assigner;
      },
      userFullName() {
        return (this.user && this.user.getFullName()) || '';
      },
      userJob() {
        return (this.user && this.user.job) || '';
      },
      newUserEmail() {
        return this.contact && this.contact.payload && this.contact.payload.newUserEmail;
      },
      newUserJob() {
        return this.contact && this.contact.payload && this.contact.payload.newUserJob;
      },
      requestedGarages() {
        return this.payload.garages;
      },
      addUserLink() {
        const urlWithoutToken = this.payload.baseUrl + this.payload.gsClient.url.getShortUrl('GARAGE_USERS_CREATE_FORM_CONTACT');
        return encodeURI(urlWithoutToken + this.payload.contact.getId());
      },
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

    .greetings {
      padding-bottom: 2rem;
    }
    .phrase1 {
      padding-bottom: 2.5rem;
    }
    .user-details {
      margin-bottom: 1.5rem;
      .bold {
        margin-bottom: 1.5rem;
      }
      .left-tab {
        margin-left: 2rem;
      }
      .detail {
        margin-bottom: 0.5rem;
      }
      .value {
        color: #219AB5;
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
