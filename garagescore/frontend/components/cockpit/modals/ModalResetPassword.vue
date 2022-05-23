<template>
  <ModalBase class="modal-reset-password" >
    <template slot="header-icon">
      <i class="modal-reset-password__icon icon-gs-reset-password"></i>
    </template>
    <template slot="header-title">
      {{$t_locale('components/cockpit/modals/ModalResetPassword')("title")}}
    </template>
    <template slot="header-subtitle">
      <AppText tag="span" class="danger">
        {{$t_locale('components/cockpit/modals/ModalResetPassword')("title2")}}
      </AppText>
    </template>
    <template slot="body">
      <div>
        <AppText tag="p">
          {{$t_locale('components/cockpit/modals/ModalResetPassword')("desc1")}}
          <b>{{this.userEmail}}</b>.<br/>
          {{$t_locale('components/cockpit/modals/ModalResetPassword')("desc2")}}
        </AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-reset-password__footer">
        <Button type="cancel" @click="closeModal">{{$t_locale('components/cockpit/modals/ModalResetPassword')("cancel")}}</Button>
        <Button type="orange" @click="resetPassword">{{$t_locale('components/cockpit/modals/ModalResetPassword')("confirm")}}</Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>

export default {
  props: {
    userEmail: { type: String },
    userId: { type: String }
  },
  computed: {
    connectAsLink() {
      return '';
    }
  },
  methods: {
    resetPassword() {
      this.$store.dispatch('closeModal');
      this.$store.dispatch('cockpit/admin/users/sendPasswordRequest', { id: this.userId });
    },
    closeModal() {
      this.$store.dispatch('closeModal');
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-reset-password {
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
