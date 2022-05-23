<template>
  <ModalBase class="modal-delete-tag" type="danger">
    <template slot="header-icon">
      <img ref="logo" src="/logo/logo-custeed-picto.svg" class="modal-delete-tag__header-logo" alt="custeed" />
    </template>
    <template slot="header-title" class="modal-delete-tag__header-title">
      <span>{{ $t_locale('components/global/ModalDeleteTag')('title') }}</span>
    </template>
    <template slot="header-subtitle" class="modal-delete-tag__header-subtitle">
      <span>{{ $t_locale('components/global/ModalDeleteTag')('subTitle') }}</span>
    </template>
    <template slot="body">
      <div class="modal-delete-tag__message">
        <i class="icon-gs-info" />
        <AppText class="modal-delete-tag__message__title" tag="span" align="center" bold>{{
          $t_locale('components/global/ModalDeleteTag')('confirmDeleteTitle')
        }}</AppText>
        <AppText class="modal-delete-tag__message__text" tag="span" align="center" bold>{{
          $t_locale('components/global/ModalDeleteTag')('confirmationDeleteText')
        }}</AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-delete-tag__footer">
        <template>
          <Button type="phantom" @click="closeModal()">
            <span>{{ $t_locale('components/global/ModalDeleteTag')('cancel') }}</span>
          </Button>
          &nbsp;&nbsp;
          <Button type="orange" @click="deleteTag(tagId)">
            <span>{{ $t_locale('components/global/ModalDeleteTag')('confirm') }}</span>
          </Button>
        </template>
      </div>
    </template>
  </ModalBase>
</template>
<script>
export default {
  name: "ModalDeleteTag",
  props: {
    tagId: {
      type: String,
      default: '',
    },
    closeModal: {
      type: Function,
      default: () => console.error('ModalDeleteTag.vue :: closeModal not set'),
    },
    deleteTag: {
      type: Function,
      default: () => console.error('ModalDeleteTag.vue :: closeModal not set'),
    },
  }
}
</script>
<style lang="scss" scoped>
.modal-delete-tag {
  overflow: auto;
  height: 100%;
  width: 48.571rem;
  &__message {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin-top: 3rem;
    line-height: 1.5;
    & i {
      font-size: 70px;
      color: $red;
      text-align: center;
    }
    &__title {
      font-size: 1.5rem;
      color: $black;
      margin: 1.5rem 0 1rem 0 !important;
    }
    &__text {
      margin-bottom: 0.3rem;
    }
  }
  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}
@media (max-width: $breakpoint-min-md) {
  .modal-delete-tag {
    &__header-title {
      font-size: 1.143rem;
    }
    &__header-subtitle {
      font-size: 0.929rem;
    }
  }
}
@media (max-width: $breakpoint-min-sm) {
  .modal-delete-tag {
    width: 100%;
    &__header-title {
      font-size: 1rem;
    }
    &__header-subtitle {
      font-size: 0.786rem;
    }
  }
}
</style>