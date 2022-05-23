<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <BaseHeader
          :title="$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('title')"
          color="red"
          logo-url="/images/www/alert/unsatisfied2.png"
        ></BaseHeader>
      </tr>
      <tr>
        <td align="center" id="content">
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('greetings') }}<br/><br/>
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('intro') }}<br/><br/>
          <span class="bolded">{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('todayReminders') }}</span>
          <span v-if="!payload.hasTodayReminder"> {{$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('noReminder')}}</span><br/><br/>

          <div class="left-margin" @key="index" v-for="(action, index) in payload.contact.payload.actions.filter((e) => e.reminderFirstDay === e.reminderNextDay)" >
            <p :class="isLastAction(index)">
              <span>{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('client') }}</span>
              <span class="gs-blue-txt"> {{ action.customerFullName }}</span>
              <span> | {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('action') }}</span>
              <span class="gs-blue-txt"> {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')(action.reminderActionName) }}</span><br/>
              <a :href="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('COCKPIT_UNSATISFIED_TICKET') + action.dataId" target="_blank" class="link">{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('access') }}</a>
            </p>
          </div><br/>

          <span class="bolded">{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('lateReminders') }}</span>
          <span v-if="!payload.hasDelayedReminder">{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('noLateReminder') }}</span><br/><br/>

          <div class="left-margin" @key="index" v-for="(action, index) in payload.contact.payload.actions.filter((e) => e.reminderFirstDay < e.reminderNextDay)">
            <p :class="isLastAction(index, true)">
              <span>{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('client') }}</span>
              <span class="gs-blue-txt"> {{ action.customerFullName }}</span>
              <span>  |  {{  $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('plannedReminder') }}</span>
              <span class="gs-blue-txt"> {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('daysAgo', {days: daysElapsed(action.reminderFirstDay)}) }}</span>
              <span> | {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('action') }}</span>
              <span class="gs-blue-txt"> {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')(action.reminderActionName) }}</span><br/>
              <a :href="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('COCKPIT_UNSATISFIED_TICKET') + action.dataId" target="_blank" class="link">{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('access') }}</a>
            </p>
          </div><br/>
          <span>{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reminder-ticket/body')('outro') }}</span><br/><br/>
        </td>
      </tr>
      <tr>
        <BaseFooter></BaseFooter>
      </tr>
  </table>
</template>


<script>

import BaseHeader from '../../../../../components/emails/notifications/BaseHeader';
import BaseFooter from '../../../../../components/emails/notifications/BaseFooter';

export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter },
  methods: {
    isLastAction(index, isLate) {
      let actionsAmount = isLate ? this.payload.contact.payload.actions.filter((e) => e.reminderFirstDay < e.reminderNextDay).length
        : this.payload.contact.payload.actions.filter((e) => e.reminderFirstDay === e.reminderNextDay).length;
      actionsAmount--;
      if (parseInt(index) === actionsAmount) {
        return 'last-reminder';
      }
      return '';
    },
    daysElapsed(days) {
      return Math.floor(Date.now() / 8.64e7) - days;
    }
  },
  computed: {
    payload() { return this.$store.getters.payload; },
  },
}
</script>

<style lang="scss" scoped>
  /** ----------Header----------- **/

  #bg-man {
    background-color: #F1F9FB;
  }
  #man {
    margin: 23px 0;
    height: 146px;
    width: 232px;
    display: block;
  }
  #content {
    padding-left: 20px;
    padding-right: 20px;
    padding-top:30px;
    height: 53px;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.43;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
  #button-row {
    padding: 50px 0;
  }
  .button {
    border-radius: 3px;
    background-color: transparent!important;
    max-width: 200px;
  }
  .button-text {
    text-decoration: none;
    border-radius: 3px;
    padding: 15px 40px;
    max-width: 200px;
    border: 1px solid #EC5601;
    display: inline-block;
    font-family: Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: 0.7px;
    text-align: center;
    color: #EC5601;
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
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }

  .last-reminder{
    margin-bottom: 0;
  }

  .left-margin {
    margin-left:30px;

  }
  .gs-blue-txt {
    color: #219ab5;
  }
  .link {
    text-decoration: underline;
    color: #3e75d6;
  }

  /** --------------------------- **/

</style>
