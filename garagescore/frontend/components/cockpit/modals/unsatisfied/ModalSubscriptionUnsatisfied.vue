<template>
  <ModalSubscription subject="user-access-request_unsatisfied" :pro="pro">
    <template slot="header-icon">
      <i class="icon-gs-sad"/>
    </template>
    <template slot="title">
      {{$t_locale('components/cockpit/modals/unsatisfied/ModalSubscriptionUnsatisfied')('title')}}
    </template>
    <template slot="subtitle">
      {{ $t_locale('components/cockpit/modals/unsatisfied/ModalSubscriptionUnsatisfied')('subtitle') }}<br/>
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
        this.$t_locale('components/cockpit/modals/unsatisfied/ModalSubscriptionUnsatisfied')('crit1'),
        this.$t_locale('components/cockpit/modals/unsatisfied/ModalSubscriptionUnsatisfied')('crit2'),
        this.$t_locale('components/cockpit/modals/unsatisfied/ModalSubscriptionUnsatisfied')('crit3'),
        this.$t_locale('components/cockpit/modals/unsatisfied/ModalSubscriptionUnsatisfied')('crit4'),
        this.$t_locale('components/cockpit/modals/unsatisfied/ModalSubscriptionUnsatisfied')('crit5'),
      ]
    }
  }
}
</script>
