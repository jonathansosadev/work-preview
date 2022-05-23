<template>
  <div class="history-ticket">
    <div class="history-ticket__title">
      <Title icon="icon-gs-user-alert">{{ $t_locale('components/global/HistoryTicket')('title')  }}</Title>
    </div>
    <div class="history-ticket__content" v-if="type === 'lead'">
      <HistoryTicketItem
        v-for="(action, index) in revertedArray"
        :key="index"
        :action="action"
        :ticketId="id"
        :type="type"
        :sourceType="sourceType"
        :agentGarageName="agentGarageName"
        :automationCampaign="automationCampaign"
        :leadTicketSaleType="ticket.saleType"
        :leadTicketTradeIn="ticket.tradeIn"
        :cockpitType="cockpitType"
        :cancelReminderDispatch="cancelReminderDispatch"
      />
    </div>
    <div class="history-ticket__content" v-if="type === 'unsatisfied'">
      <HistoryTicketItem
        v-for="(action, index) in revertedArray"
        :key="index"
        :action="action"
        :ticketId="id"
        :type="type"
        :cockpitType="cockpitType"
        :cancelReminderDispatch="cancelReminderDispatch"
      />
    </div>
  </div>
</template>

<script>
import HistoryTicketItem from './HistoryTicketItem.vue';

export default {
  components: { HistoryTicketItem },
  props: {
    id: String,
    type: String,
    ticket: Object,
    sourceType: String,
    agentGarageName: String,
    automationCampaign: Object,
    cockpitType: String,
    cancelReminderDispatch: Function
  },

  computed: {
    revertedArray() {
      return this.ticket.actions.reverse();
    }
  },
}
</script>
