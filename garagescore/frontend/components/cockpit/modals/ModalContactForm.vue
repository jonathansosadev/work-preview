<template>
<div class="modal-contact-form">
    <div class="modal-contact-form__actions">
      <button
        @click="closeModal"
        class="modal-contact-form__btn-close"
      >
        <i class="icon-gs-close"></i>
      </button>
    </div>
    <div class="modal-contact-form__header">
      <div class="modal-contact-form__left">
        <i :class="icon"/>
      </div>
      <div class="modal-contact-form__right">
        <div class="modal-contact-form__title">{{ title }}</div>
        <div class="modal-contact-form__subtitle">{{ subtitle }}</div>
      </div>
    </div>
    <form @submit.prevent="send">
      <div class="modal-contact-form__body">
        <div class="modal-contact-form__body-part">
          <InputMaterial
            v-model="form.lastName"
            fixedWidth="100%"
            required
            class="modal-contact-form__field"
          >
            <template #label>{{ $t_locale('components/cockpit/modals/ModalContactForm')('firstName') }}</template>
          </InputMaterial>
          <InputMaterial
            v-model="form.firstName"
            fixedWidth="100%"
            required
            class="modal-contact-form__field"
          >
            <template #label>{{ $t_locale('components/cockpit/modals/ModalContactForm')('lastName') }}</template>
          </InputMaterial>
        </div>
        <div class="modal-contact-form__body-part">
          <InputMaterial
            v-model="form.email"
            fixedWidth="100%"
            required
            type="email"
            class="modal-contact-form__field"
          >
            <template #label>{{ $t_locale('components/cockpit/modals/ModalContactForm')('mail') }}</template>
          </InputMaterial>
          <InputMaterial
            v-model="form.phone"
            fixedWidth="100%"
            required
            class="modal-contact-form__field"
          >
            <template #label>{{ $t_locale('components/cockpit/modals/ModalContactForm')('phone') }}</template>
          </InputMaterial>
        </div>
        <div class="modal-contact-form__body-part">
          <InputMaterial
            v-model="form.message"
            fixedWidth="100%"
            required
            textArea
            class="modal-contact-form__field"
          >
            <template #label>{{ $t_locale('components/cockpit/modals/ModalContactForm')('message') }}</template>
          </InputMaterial>
        </div>
      </div>
      <div class="modal-contact-form__footer">
        <Button
          :disabled="!canSend"
          size="sm"
          type="orange"
        >
          {{ $t_locale('components/cockpit/modals/ModalContactForm')('send') }}
        </Button>
      </div>
    </form>
  </div>
</template>


<script>

  export default {
    props: {
      subject: String,
      titleProp: String,
      subtitleProp: String,
      iconProp: String,
      user: Object,
      closeModal: {
        type: Function,
        required: true,
      },
      openModal: {
        type: Function,
        required: true,
      }
    },

    data() {
      return {
        loading: false,
        error: '',
        form: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          message: ''
        }
      };
    },

    mounted() {
      if (this.user) {
        this.form.firstName = this.user.firstName || '';
        this.form.lastName = this.user.lastName || '';
        this.form.email = this.user.email || '';
        this.form.phone = this.user.mobilePhone || this.user.phone || '';
      }
    },

    computed: {
      title() {
        if (this.titleProp) {
          return this.titleProp
        }
        switch (this.subject) {
          case 'user-access-request_satisfaction': return this.$t_locale('components/cockpit/modals/ModalContactForm')('satisfaction-subscription');
          case 'user-access-request_satisfactionVNVO': return this.$t_locale('components/cockpit/modals/ModalContactForm')('satisfactionVNVO-subscription');
          case 'user-access-request_unsatisfied': return this.$t_locale('components/cockpit/modals/ModalContactForm')('unsatisfied-subscription');
          case 'user-access-request_leads': return this.$t_locale('components/cockpit/modals/ModalContactForm')('leads-subscription');
          case 'user-access-request_automation': return this.$t_locale('components/cockpit/modals/ModalContactForm')('automation-subscription');
          case 'user-access-request_contacts': return this.$t_locale('components/cockpit/modals/ModalContactForm')('contacts-subscription');
          case 'user-access-request_analytics': return this.$t_locale('components/cockpit/modals/ModalContactForm')('analytics-subscription');
          case 'user-access-request_reputyscore': return this.$t_locale('components/cockpit/modals/ModalContactForm')('reputyscore-subscription');
          default: return 'GarageScore';
        }
      },

      subtitle() {
        if (this.subtitleProp) {
          return this.subtitleProp
        }
        return this.$t_locale('components/cockpit/modals/ModalContactForm')('defaultSubtitle');
      },

      icon() {
        if (this.iconProp) {
          return this.iconProp
        }
        switch (this.subject) {
          case 'user-access-request_satisfaction': return 'icon-gs-chat-bubble';
          case 'user-access-request_satisfactionVNVO': return 'icon-gs-chat-bubble';
          case 'user-access-request_unsatisfied': return 'icon-gs-sad';
          case 'user-access-request_leads': return 'icon-gs-car-repair';
          case 'user-access-request_automation': return 'icon-gs-send';
          case 'user-access-request_contacts': return 'icon-gs-database';
          case 'user-access-request_analytics': return 'icon-gs-graph-bar';
          case 'user-access-request_reputyscore': return 'icon-gs-desktop-star';
        }
      },

      canSend() {
        const {
          firstName,
          lastName,
          email,
          phone,
          message,
        } = this.form;
        return firstName && lastName && email && phone && message;
      }
    },

    methods: {
      async send() {
        try {
          if (!this.canSend) {
            return false;
          }

          this.loading = true;

          const response = await this.$store.dispatch(
            'cockpit/sendContact',
            {
              form: this.form,
              context: this.subject
            },
          );
          this.loading = false;
          this.openModal({
            component: 'ModalMessage',
            props: {
              subtitle: (
                !response
                  ? this.$t_locale('components/cockpit/modals/ModalContactForm')('demandError')
                  : this.$t_locale('components/cockpit/modals/ModalContactForm')('demandSent')
              ),
              type: !response ? 'danger' : 'success',
              title: this.title,
              icon: this.icon,
            },
          });
        } catch(err) {
          this.loading = false;
          this.error = err;
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
.modal-contact-form {
  background-color: $white;
  position: relative;
  padding: 1.8rem;
  border-radius: 4px;


  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    color: $blue;
    font-size: 2.5rem;
    margin-bottom: 1.8rem;
  }

  &__left {
    font-size: 2.5rem;
    margin-right: 0.7rem;
  }

  &__right {
    flex: 1;
  }


  &__body {
    margin-bottom: 1.8rem;
  }

  &__body-part {
    display: flex;

    & + & {
      margin-top: 1rem;
    }
  }

  &__field + &__field {
    margin-left: 1.8rem;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  &__title {
    font-size: 1.15rem;
    color: $black;
    font-weight: 700;
    margin-bottom: .5rem;
  }

  &__subtitle {
    font-size: 0.92rem;
    color: $grey;
    font-weight: 400;
    margin-bottom: 0.5rem;
  }

  &__subtitle-2 {
    font-size: 0.85rem;
    font-weight: 300;
  }

  &__actions {
    position: absolute;
    top: 2rem;
    right: 2rem;
  }

  &__btn-close {
    border: none;
    color: $dark-grey;
    font-weight: 700;
    background-color: transparent;
    outline: none;
    cursor: pointer;
  }
}
</style>
