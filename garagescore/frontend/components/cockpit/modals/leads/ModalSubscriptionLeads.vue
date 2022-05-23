<template>
  <ModalSubscription
    :contactModalSubtitle="contactModalSubtitle"
    :contactModalTitle="contactModalTitle"
    :overrideCloseCross="onClose"
    :pro="pro"
    :warningLabel="warningLabel"
    subject="user-access-request_leads"
  >
    <template slot="header-icon">
      <i class="icon-gs-car-repair"/>
    </template>
    <template slot="title">
      {{ contactModalTitle }}
    </template>
    <template slot="subtitle"> {{ subModalSubtitle }}<br /></template>
  </ModalSubscription>
</template>

<script>
import ModalSubscription from '~/components/global/ModalSubscription';

export default {
  components: { ModalSubscription },
  props: {
    isKPI: Boolean,
    onClose: Function,
  },
  data() {
    return {};
  },
  computed: {
    subModalSubtitle() {
      return this.isKPI ? this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('identify') : this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('identify2');
    },
    warningLabel() {
      return this.isKPI ? this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('warningLabel') : '';
    },
    contactModalSubtitle() {
      return this.isKPI ? this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('contactModalSubtitle') : '';
    },
    contactModalTitle() {
      return this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('contactModalTitle');
    },
    pro() {
      if (this.isKPI) {
        return [this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('timing'), this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('vnvo'), this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('model'), this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('takeBack')];
      }
      return [this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('crit1'), this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('crit2'), this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('crit3'), this.$t_locale('components/cockpit/modals/leads/ModalSubscriptionLeads')('crit4')];
    },
  },
};
</script>
