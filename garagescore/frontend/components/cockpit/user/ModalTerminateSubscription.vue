<template>
  <ModalBase class="modal-terminate-subscription">
        
    <template slot="header-icon">
      <i class="icon-gs-validation-check-circle"></i>
    </template>
    <template slot="header-title">
      <AppText tag="div" size="md" bold>{{ $t_locale('components/cockpit/user/ModalTerminateSubscription')('thanks') }}</AppText>
    </template>
    <template slot="body">
      <div class="modal-terminate-subscription__body">
        <AppText tag="div" type="muted">
          {{ $t_locale('components/cockpit/user/ModalTerminateSubscription')('explanation') }}
        </AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-terminate-subscription__footer">
        <Button type="orange" @click.native="closeModal">
          <span>{{ $t_locale('components/cockpit/user/ModalTerminateSubscription')('okay') }}</span>
        </Button>
      </div>
    </template>
    
  </ModalBase>
</template>

<script>
  export default {
    props: {},
    methods: {
      closeModal() {
        this.$store.dispatch('closeModal');
        this.$store.dispatch('openModal', { component: 'ModalAddFavorite', props: {} })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .modal-terminate-subscription {
    &__body {
      position:relative;
    }

    &__footer {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
