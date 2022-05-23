<template>
  <ModalSubscription subject="user-access-request_satisfactionVNVO" :warningLabel="warningLabel" :contactModalTitle="title" :contactModalSubtitle="subtitle" :contactModalIcon="icon" :pro="pro">
    <template slot="header-icon">
      <i :class="icon"/>
    </template>
    <template slot="title">
      {{ title }}
    </template>
    <template slot="subtitle">
      {{ $t_locale('components/cockpit/modals/ModalSubscriptionVNVO')('subtitle') }}<br/>
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
        this.$t_locale('components/cockpit/modals/ModalSubscriptionVNVO')('crit1'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionVNVO')('crit2'),
        this.$t_locale('components/cockpit/modals/ModalSubscriptionVNVO')('crit3')
      ],
      warningLabel: this.$t_locale('components/cockpit/modals/ModalSubscriptionVNVO')('warningLabel'),
      title: this.$t_locale('components/cockpit/modals/ModalSubscriptionVNVO')('title'),
      subtitle: this.$t_locale('components/cockpit/modals/ModalSubscriptionVNVO')('subtitle2'),
      icon: this.$store.getters['cockpit/NewVehicleSaleIcon']
    }
  }
}
</script>
