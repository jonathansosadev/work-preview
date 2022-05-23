<template>
  <ModalBase class="modal-delete-child-user-status" :type="statusClass">
    <template slot="header-icon">
      <i class="modal-delete-child-user-status__icon icon-gs-trash"></i>
    </template>
    <template slot="header-title">
      <AppText tag="span" bold>{{ $t_locale('components/cockpit/modals/ModalDeleteChildUserStatus')('title') }}</AppText>
    </template>
    <template slot="header-subtitle">
      <AppText tag="span">{{ $t_locale('components/cockpit/modals/ModalDeleteChildUserStatus')('subtitle') }}</AppText>
    </template>
    <template slot="body">
      <div class="modal-delete-child-user-status__part">
        <p v-html="$t_locale('components/cockpit/modals/ModalDeleteChildUserStatus')(statusReasonMessage, { email })"></p>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-delete-child-user-status__footer">
          <Button type="orange" @click="closeModal">{{ $t_locale('components/cockpit/modals/ModalDeleteChildUserStatus')('validate') }}</Button>
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
      return (this.status === 'KO') ? 'danger' : '';
    },
    statusReasonMessage() {
      return this.statusReason;
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
.modal-delete-child-user-status {
  width: 50rem;
  &__footer {
    display: flex;
    justify-content: flex-end;
  }
  .btn {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;
    background-color:$blue;
    color:white;
  }

  .btn.danger{
    background-color:$red;
  }

  &__icon {
    font-size: 3rem;
    margin-right: 0.5rem;
    color: $red;
  }

  &__part {
    display: flex;
    flex-flow: row;
    align-items: center;
  }

  &__text {
    font-size: 1.2rem;
  }
}
</style>
