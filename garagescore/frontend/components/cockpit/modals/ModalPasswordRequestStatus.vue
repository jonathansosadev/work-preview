<template>
  <ModalBase class="modal-password-request-status" :type="statusClass">
    <template slot="header-icon">
      <i class="modal-password-request-status__icon icon-gs-reset-password" :class="statusClass"></i>
    </template>
    <template slot="header-title">
      {{ $t_locale('components/cockpit/modals/ModalPasswordRequestStatus')('title') }}
    </template>
    <template slot="header-subtitle">
      <AppText tag="span" class="danger">
        {{ $t_locale('components/cockpit/modals/ModalPasswordRequestStatus')('sent') }}
      </AppText>
    </template>
    <template slot="body">
      <div>
        <AppText tag="p" v-html="statusReasonMessage"></AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-password-request-status__footer">
        <Button :type="statusClass" @click="closeModal">{{ $t_locale('components/cockpit/modals/ModalPasswordRequestStatus')('validate') }}</Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>

export default {
  props: {
    status: { type: String },
    statusReason: { type: String },
    email: { type: String }
  },
  computed: {
    statusClass() {
      return this.status === 'OK' ? 'orange' : 'danger';
    },
    statusReasonMessage() {
      if (this.status === 'OK') {
        return this.$t_locale('components/cockpit/modals/ModalPasswordRequestStatus')('demandSent')
      }
      return this.$t_locale('components/cockpit/modals/ModalPasswordRequestStatus')('errorFailed')
    }
  },
  methods: {
    closeModal() {
      this.$store.dispatch('closeModal');
    }
  },
  mounted() {
    this.$store.dispatch('cockpit/admin/users/refreshView');
  }
}
</script>

<style lang="scss" scoped>
.modal-password-request-status {
  &__icon {
    color: $blue;
    &.danger {
      color: $red;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
