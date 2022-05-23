<template>
  <ModalBase class="modal-ticket" type="danger">
    <template slot="header-icon">
      <i class="modal-ticket__icon icon-gs-unlock"/>
    </template>
    <template slot="header-title">
      <AppText tag="span" bold>{{ $t_locale('components/cockpit/modals/leads/ModalLeadsTicketReopen')('title') }}</AppText>
    </template>
    <template slot="header-subtitle">
      <AppText tag="p" type="danger" class="modal-ticket__subtitle">{{ $t_locale('components/cockpit/modals/leads/ModalLeadsTicketReopen')('areYouSure') }}</AppText>
    </template>

    <template slot="footer">
      <div class="modal-ticket__footer">
        <Button type="cancel" @click="closeModal">{{ $t_locale('components/cockpit/modals/leads/ModalLeadsTicketReopen')('cancel') }}</Button>
        <Button type="orange" @click="reopenTicket" :loading="loading">{{ $t_locale('components/cockpit/modals/leads/ModalLeadsTicketReopen')('validate') }}</Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
export default {
  props: {
    id: String,
    addTicketAction: {type: Function, required: true},
  },

  data () {
    return {
      loading: false
    };
  },

  methods: {
    async reopenTicket () {
      this.loading = true;
      const ok = await this.addTicketAction({id: this.id, action: 'leadReopened'});
      this.loading = false;

      if (ok) {
        this.$store.dispatch('closeModal');
      }
    },

    closeModal () {
      this.$store.dispatch('closeModal');
    },
  }
};
</script>

<style lang="scss" scoped>
.modal-ticket {
  &__icon {
    color: $red;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;

    & Button:first-child {
      margin-right: 0.7rem;
    }
  }
}
</style>
