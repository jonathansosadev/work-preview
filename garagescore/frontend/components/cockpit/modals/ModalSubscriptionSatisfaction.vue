<template>
  <ModalSubscription subject="user-access-request_satisfaction" :pro="pro">
    <template slot="header-icon">
      <i class="icon-gs-chat-bubble"/>
    </template>
    <template slot="title">
      {{ $t_locale('components/cockpit/modals/ModalSubscriptionSatisfaction')('title') }}
    </template>
    <template slot="subtitle">
      {{ $t_locale('components/cockpit/modals/ModalSubscriptionSatisfaction')('subtitle') }}<br/>
    </template>
  </ModalSubscription>
</template>

<script>
import ModalSubscription from '~/components/global/ModalSubscription';
  
export default {
  components: { ModalSubscription },

  data() {
    return {
      pro: [
        this.$t_locale('components/cockpit/modals/ModalSubscriptionSatisfaction')('crit1'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionSatisfaction')('crit2'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionSatisfaction')('crit3'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionSatisfaction')('crit4'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionSatisfaction')('crit5'),
      ]
    }
  }
}
</script>
