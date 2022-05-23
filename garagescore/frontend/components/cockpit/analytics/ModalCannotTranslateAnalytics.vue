<template>
  <ModalBase class="modal-cannot-translate-analytics">
    
    <template slot="header-icon">
      <i class="icon-gs-graph-bar"></i>
    </template>
    <template slot="header-title">
      <AppText tag="div" size="md" bold>{{ $t_locale('components/cockpit/analytics/ModalCannotTranslateAnalytics')('title') }}</AppText>
    </template>
    <template slot="header-subtitle">
      {{ $t_locale('components/cockpit/analytics/ModalCannotTranslateAnalytics')('subtitle') }}<br/>
    </template>

    <template slot="body">
      <div class="modal-cannot-translate-analytics__body">
        <AppText tag="div" type="muted">{{ $t_locale('components/cockpit/analytics/ModalCannotTranslateAnalytics')('cannotTranslate') }}</AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-cannot-translate-analytics__footer">
        <Button type="orange"  @click.native="closeModal">
          <span>{{ $t_locale('components/cockpit/analytics/ModalCannotTranslateAnalytics')('ok') }}</span>
        </Button>
      </div>
    </template>

  </ModalBase>
</template>

<script>
  export default {
    data() {
      return {}
    },
    methods: {
      closeModal() {
        this.$store.dispatch('closeModal');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .modal-cannot-translate-analytics {
    &__body {
      position:relative;
    }

    &__footer {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>