<template>
  <ModalSubscription
    :pro="pro"
    subject="user-access-request_reputyscore"
    withHtml
    class="modal-subscription-ereputation"
  >
    <template slot="header-icon">
      <img
        alt="E-Reputation"
        src="/e-reputation/EReputationLogo.svg"
        class="modal-subscription-ereputation__logo"
      >
    </template>
    <template slot="title">
      {{ $t_locale('components/cockpit/modals/e-reputation/ModalSubscriptionEreputation')('reputyScore') }}
    </template>
    <template slot="subtitle">
      {{ $t_locale('components/cockpit/modals/e-reputation/ModalSubscriptionEreputation')('subtitle') }}<br>
    </template>
  </ModalSubscription>
</template>

<script>
import ModalSubscription from '~/components/global/ModalSubscription';

export default {
  name: 'ModalSubscriptionEreputation',
  components: { ModalSubscription },

  data() {
    return {
      pro: [
        this.$t_locale('components/cockpit/modals/e-reputation/ModalSubscriptionEreputation')('centralisation') + "<img title='Google' src='/e-reputation/Google.svg' alt='Google'/> <img title='Facebook' src='/frontend/static/e-reputation/Facebook.svg' alt='Facebook'/> <img title='PagesJaunes' src='/frontend/static/e-reputation/PagesJaunes.svg' alt='PagesJaunes'/>",
        this.$t_locale('components/cockpit/modals/e-reputation/ModalSubscriptionEreputation')('interface'),
        this.$t_locale('components/cockpit/modals/e-reputation/ModalSubscriptionEreputation')('alerts'),
        this.$t_locale('components/cockpit/modals/e-reputation/ModalSubscriptionEreputation')('control')
      ]
    }
  }
}
</script>
