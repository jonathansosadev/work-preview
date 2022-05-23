<template>
  <ModalBase class="modal-delete-model-response" type="danger">
    <template slot="header-icon">
      <img ref="logo" src="/logo/logo-custeed-picto.svg" class="modal-exports__logo" alt="custeed" />
    </template>

    <template slot="header-title" class="header-title">
      <span>{{ $t_locale('components/cockpit/admin/ModalDeleteModelResponse')('title') }}</span>
    </template>

    <template slot="header-subtitle" class="header-subtitle">
      <span>{{ $t_locale('components/cockpit/admin/ModalDeleteModelResponse')('subtitle') }}</span>
    </template>
    <template slot="body">
      <div class="modal-delete-model-response__message">
        <i class="icon-gs-info" />
        <AppText class="modal-delete-model-response__message__title" tag="span" align="center" bold>{{
          $t_locale('components/cockpit/admin/ModalDeleteModelResponse')('confirmDeleteTitle')
        }}</AppText>
        <AppText class="modal-delete-model-response__message__text" tag="span" align="center" bold>{{
          `${$t_locale('components/cockpit/admin/ModalDeleteModelResponse')('confirmDeleteSubTitle1')} ${nGarages} ${$t_locale('components/cockpit/admin/ModalDeleteModelResponse')('etablissements')}`
        }}</AppText>
        <AppText class="modal-delete-model-response__message__text" tag="span" align="center" bold>{{
          $t_locale('components/cockpit/admin/ModalDeleteModelResponse')('confirmDeleteSubTitle2')
        }}</AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-delete-model-response__footer">
        <template>
          <Button type="phantom" @click="closeModal()">
            <span>{{ $t_locale('components/cockpit/admin/ModalDeleteModelResponse')('cancel') }}</span>
          </Button>
          &nbsp;&nbsp;
          <Button type="orange" @click="deleteModel(templateId)">
            <span>{{ $t_locale('components/cockpit/admin/ModalDeleteModelResponse')('confirm') }}</span>
          </Button>
        </template>
      </div>
    </template>
  </ModalBase>
</template>
<script>
export default {
  name: 'ModalDeleteModelResponse',
  props: {
    closeModal: {
      type: Function,
      default: () => ({}),
    },
    templateId: {
      type: String,
      default: '',
    },
    deleteModel: {
      type: Function,
      default: () => ({}),
    },
    nGarages: {
      type: Number,
      default: 0,
    },
  },
};
</script>
<style lang="scss" scoped>
.modal-delete-model-response {
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
  .modal-delete-model-response {
    .header-title {
      font-size: 1.143rem;
    }
    .header-subtitle {
      font-size: 0.929rem;
    }
  }
}
@media (max-width: $breakpoint-min-sm) {
  .modal-delete-model-response {
    width: 100%;
    .header-title {
      font-size: 1rem;
    }
    .header-subtitle {
      font-size: 0.786rem;
    }
  }
}
</style>
