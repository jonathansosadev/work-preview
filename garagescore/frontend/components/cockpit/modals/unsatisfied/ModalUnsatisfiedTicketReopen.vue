<template>
  <ModalBase class="modal-ticket" type="danger">
    <template slot="header-icon">
      <i class="modal-ticket__icon icon-gs-alert-warning-circle"/>
    </template>
    <template slot="header-title">
      <AppText tag="span" bold>{{ $t_locale('components/cockpit/modals/unsatisfied/ModalUnsatisfiedTicketReopen')('title') }}</AppText>
    </template>
    <template slot="header-subtitle">
      <AppText tag="p" type="danger" class="modal-ticket__subtitle">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalUnsatisfiedTicketReopen')('subtitle') }}</AppText>
    </template>

    <template slot="footer">
      <div class="modal-ticket__footer">
        <Button type="cancel" @click="closeModal">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalUnsatisfiedTicketReopen')('cancel') }}</Button>
        <Button type="orange" @click="reopenTicket" :loading="loading">{{ $t_locale('components/cockpit/modals/unsatisfied/ModalUnsatisfiedTicketReopen')('validate') }}</Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>
export default {
  props: {
    id: String,
    garageName: String,
    customerFullName: String,
    addTicketAction: Function,
  },

  data() {
    return {
      loading: false,
    }
  },

  methods: {
    async reopenTicket() {
      this.loading = true;
      const ok = await this.addTicketAction({ id: this.id, action: 'unsatisfiedReopened' });
      this.loading = false;

      if (ok) {
        this.$store.dispatch('closeModal');
      }
    },

    closeModal() {
      this.$store.dispatch('closeModal');
    },
  }
}
</script>

<style lang="scss" scoped>
.modal-ticket {
  &__icon {
    color: $red;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    & button:first-child {
      margin-right: 0.7rem;
    }
  }
}
</style>
