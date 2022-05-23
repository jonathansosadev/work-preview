<template>
  <ModalBase
    :overrideCloseCross="overrideCloseCross"
    class="modal-subscription"
  >
    <template slot="header-icon">
      <slot name="header-icon"></slot>
    </template>
    <template slot="header-title">
      <slot name="title"></slot>
    </template>
    <template slot="header-subtitle">
      <slot name="subtitle"></slot>
    </template>
    <template slot="header-subtitle-2">
      <AppText tag="span" type="danger">{{ warningLabel ? warningLabel : $t_locale('components/global/ModalSubscription')('defaultUnavailable') }}</AppText>
    </template>

    <template slot="body">
      <ul class="modal-subscription__pro">
        <li v-for="(p, index) in pro" :key="index" class="modal-subscription__pro__item">
          <i class="icon-gs-ok-bubble modal-subscription__pro__icon" :key="index"></i>
          <span v-if="withHtml" v-html="p" class="modal-subscription__pro__text">{{ p }}</span>
          <span v-else class="modal-subscription__pro__text">{{ p }}</span>
        </li>
      </ul>
    </template>
    <template slot="footer">
      <div class="modal-subscription__footer">
        <Button class="modal-subscription__footer__button" type="orange" @click="openContactForm">{{ $t_locale('components/global/ModalSubscription')('askAccess') }}</Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
  export default {
    props: {
      contactModalIcon: { type: String },
      contactModalTitle: { type: String },
      contactModalSubtitle: { type: String },
      overrideCloseCross: Function,
      pro: {
        type: Array,
        default: () => ([]),
      },
      subject: String,
      warningLabel: { type: String },
      withHtml: {
        type: Boolean,
        default: false
      },
    },

    methods: {
      openContactForm() {
        this.$store.dispatch('openModal',
          {
            component: 'ModalContactForm',
            props:
              {
                subject: this.subject,
                titleProp: this.contactModalTitle,
                subtitleProp: this.contactModalSubtitle,
                iconProp: this.contactModalIcon,
                user: this.$store.getters['auth/currentUser'],
                openModal: (payload) => {
                  this.$store.dispatch('openModal', payload)
                },
                closeModal: () => {
                  this.$store.dispatch('closeModal')
                },
              }
          });
      }
    },

    computed: {

    }
  }
</script>


<style lang="scss" scoped>
  .modal-subscription {
    &__pro {
      list-style: none;
      margin: 0;
      padding: 0;
      margin-left: 3.7rem;
      padding-right: 1rem;
      font-weight:400;

      &__item {
        padding: 0.4rem 0;
        display: flex;
        align-items: center;
        color: $dark-grey;
        font-size: 1rem;
        &:first-child {
          padding-top: 0;
        }
        &:last-child {
          padding-bottom: 0;
        }
      }

      &__icon {
        color: $dark-grey;
        font-size: 1.4rem;
        margin-right: 0.7rem;
      }

      ::v-deep &__text {
        display: flex;
        align-items: center;
        img {
          width: 1.4rem;
          margin: 0 0 0 0.5rem;
        }
      }
    }

    &__footer {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      &__button {
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }
  }
</style>
