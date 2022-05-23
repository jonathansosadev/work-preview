<template>
  <ModalSubscription subject="user-access-request_contacts" :pro="pro">
    <template slot="header-icon">
      <i class="icon-gs-database"/>
    </template>
    <template slot="title">
      {{ $t_locale('components/cockpit/modals/ModalSubscriptionContacts')('title') }}
    </template>
    <template slot="subtitle">
      {{ $t_locale('components/cockpit/modals/ModalSubscriptionContacts')('subtitle') }}<br/>
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
        this.$t_locale('components/cockpit/modals/ModalSubscriptionContacts')('crit1'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionContacts')('crit2'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionContacts')('crit3'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionContacts')('crit4'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionContacts')('crit5')
      ]
    }
  }
}
</script>
