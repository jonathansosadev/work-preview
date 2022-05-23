<template>
  <ModalBase class="modal-delete-child-user">
    <template slot="header-icon">
        <i class="modal-delete-child-user__icon icon-gs-trash"></i>
    </template>
    <template slot="header-title">
        <span>{{$t_locale('components/cockpit/modals/ModalDeleteChildUser')("title")}}</span>
    </template>
    <template slot="header-subtitle">
      <AppText tag="span" type="danger">{{$t_locale('components/cockpit/modals/ModalDeleteChildUser')("title2")}}</AppText>
    </template>

    <template slot="body">
      <div class="modal-delete-child-user__part">
        <AppText tag="p">
          {{$t_locale('components/cockpit/modals/ModalDeleteChildUser')("desc1")}} <b>{{this.userEmail}}</b>,
          {{$t_locale('components/cockpit/modals/ModalDeleteChildUser')("desc2")}}<br><br>
          {{$t_locale('components/cockpit/modals/ModalDeleteChildUser')("desc3")}}
          <b>{{this.userEmail}}</b> ?<br>
        </AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-delete-child-user__footer">
        <Button type="cancel" @click="closeModal">{{$t_locale('components/cockpit/modals/ModalDeleteChildUser')("cancel")}}</Button>
        <Button type="orange" @click="deleteChild">{{$t_locale('components/cockpit/modals/ModalDeleteChildUser')("confirm")}}</Button>
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
    deleteChild() {
      this.$store.dispatch('closeModal');
      this.$store.dispatch('cockpit/admin/users/deleteChild', { userId :this.userId, userEmail: this.userEmail });
    },
    closeModal() {
      this.$store.dispatch('closeModal');
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-delete-child-user {
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
