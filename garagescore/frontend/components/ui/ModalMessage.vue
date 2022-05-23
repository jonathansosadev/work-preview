<template>
  <ModalBase class="modal-message">
    <template v-if="icon" slot="header-icon">
      <i :class="icon"/>
    </template>
    <template v-if="title" slot="header-title">
      <div>{{ title }}</div>
    </template>
    <template v-if="subtitle" slot="header-subtitle">
      <div :class="subtitleClass" v-html="subtitle"></div>
    </template>
    <template v-if="message" slot="body">
      <span :class="messageClass" v-html="message"></span>
    </template>
    <template v-if="message" slot="footer">
      <Button :type="type" class="btn" @click.native="close()">
        <span>{{ $t_locale('components/ui/ModalMessage')('validate') }}</span>
      </Button>
    </template>
  </ModalBase>
</template>

<script>
  import { validateEmail } from '../../util/email';
  export default {
    props: {
      title: { type: String },
      icon: { type: String },
      subtitle: { type: String },
      message: { type: String },
      type: { type: String, default: 'primary' },
      reloadPageOnClose: { type: Boolean }
    },
    computed: {
      subtitleClass() {
        return {
          'modal-message__subtitle--danger': this.type === 'danger',
          'modal-message__subtitle--success': this.type === 'success',
        }
      },

      messageClass() {
        return {
          'modal-message__message--danger': this.type === 'danger',
          'modal-message__message--success': this.type === 'success',
        }
      }
    },
    methods: {
      close() {
        this.$store.dispatch('closeModal')
      }
    }
  }
</script>

<style lang="scss" scoped>
  .modal-message {
    &__subtitle {
      &--danger {
        color: $red;
      }
      &--success {
        color: $green;
      }
    }
    &__message {
      &--danger {
        color: $red;
      }
      &--success {
        color: $dark-grey;
      }
    }
  }
</style>
