<template>
  <ModalSubscription subject="user-access-request_analytics" :pro="pro">
    <template slot="header-icon">
      <i class="icon-gs-graph-bar"/>
    </template>
    <template slot="title">
      {{ $t_locale('components/cockpit/analytics/ModalSubscriptionAnalytics')('title') }}
    </template>
    <template slot="subtitle">
      {{ $t_locale('components/cockpit/analytics/ModalSubscriptionAnalytics')('subtitle') }}<br/>
    </template>
  </ModalSubscription>
</template>

<script>
import ModalSubscription from '~/components/global/ModalSubscription';
  
export default {
  components: { ModalSubscription },

  data() {
    return {
      pro: [this.$t_locale('components/cockpit/analytics/ModalSubscriptionAnalytics')('pro1'), this.$t_locale('components/cockpit/analytics/ModalSubscriptionAnalytics')('pro2'), this.$t_locale('components/cockpit/analytics/ModalSubscriptionAnalytics')('pro3'), this.$t_locale('components/cockpit/analytics/ModalSubscriptionAnalytics')('pro4'), this.$t_locale('components/cockpit/analytics/ModalSubscriptionAnalytics')('pro5')]
    }
  }
}
</script>
