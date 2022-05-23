<template>
  <ModalSubscription subject="user-access-request_automation" :pro="pro">
    <template slot="header-icon">
      <i class="icon-gs-send" />
    </template>
    <template slot="title">
      {{ $t_locale('components/cockpit/automation/ModalSubscriptionAutomation')('title') }}
    </template>
    <template slot="subtitle">
      {{ $t_locale('components/cockpit/automation/ModalSubscriptionAutomation')('subtitle') }}<br>
    </template>
  </ModalSubscription>
</template>

<script>
import ModalSubscription from '~/components/global/ModalSubscription';

export default {
  components: { ModalSubscription },

  data () {
    return {
      pro: [
        this.$t_locale('components/cockpit/automation/ModalSubscriptionAutomation')('crit1'),
        this.$t_locale('components/cockpit/automation/ModalSubscriptionAutomation')('crit2'),
        this.$t_locale('components/cockpit/automation/ModalSubscriptionAutomation')('crit3'),
        this.$t_locale('components/cockpit/automation/ModalSubscriptionAutomation')('crit4'),
        this.$t_locale('components/cockpit/automation/ModalSubscriptionAutomation')('crit5'),
        this.$t_locale('components/cockpit/automation/ModalSubscriptionAutomation')('crit6')
      ]
    }
  }
}
</script>
