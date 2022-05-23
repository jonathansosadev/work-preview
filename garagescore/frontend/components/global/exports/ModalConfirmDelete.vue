<template>
  <ModalBase class="modal-confirm-delete" type="danger">

    <template slot="header-icon">
      <img ref="logo" src="/logo/logo-custeed-picto.svg" class="modal-exports__logo" alt="custeed">
    </template>

    <template slot="header-title">
      <span>{{ $t_locale('components/global/exports/ModalConfirmDelete')('Title') }}</span>
    </template>

    <template slot="header-subtitle">
      <span>{{ $t_locale('components/global/exports/ModalConfirmDelete')('Subtitle') }}</span>
    </template>

    <template slot="bodyheader">
      <div class="modal-confirm-delete__back">
        <div @click="closeModal()" class="modal-confirm-delete__back__cta">
          <i class="icon-gs-left-circle"/>
          <AppText class="modal-confirm-delete__back__text" tag="div" bold>{{ $t_locale('components/global/exports/ModalConfirmDelete')('Back') }}</AppText>
        </div>
        <div class="modal-confirm-delete__back__filler">
        </div>
      </div>
    </template>

    <template slot="body">
      <div class="modal-confirm-delete__delete">
        <i class="icon-gs-alert-information-circle"/>
        <AppText class="modal-confirm-delete__delete__title" tag="span" align="center" bold>{{ $t_locale('components/global/exports/ModalConfirmDelete')('DeletionTitle') }}</AppText>
        <AppText class="modal-confirm-delete__delete__text" tag="span" align="center" bold>
          {{ $t_locale('components/global/exports/ModalConfirmDelete')('Question', { garagesCount: countLabel }) }}
        </AppText>
        <AppText class="modal-confirm-delete__delete__text" tag="span" align="center" bold>{{ $t_locale('components/global/exports/ModalConfirmDelete')('DeletionContent') }}</AppText>
      </div>
    </template>

    <template slot="footer" >
      <div class="modal-confirm-delete__footer">
        <Button @click="closeModal()" type="phantom" thick>
          <span>{{ $t_locale('components/global/exports/ModalConfirmDelete')('Cancel') }}</span>
        </Button>
        <Button @click="deleteExport()" type="orange" thick>
          <span>{{ $t_locale('components/global/exports/ModalConfirmDelete')('Confirm') }}</span>
        </Button>
      </div>
    </template>

  </ModalBase>
</template>

<script>

export default {
  name: 'ModalConfirmDelete',
  props: {
    customExport: {
      type: Object,
      default: () => ({}),
    },
    closeModalFunction: {
      type: Function,
      default: () => console.error('ModalConfirmDelete.vue :: closeModalFunction not set')
    },
    deleteCustomExportFunction: {
      type: Function,
      default: () => console.error('ModalConfirmDelete.vue :: deleteCustomExportFunction not set')
    },
    openCustomExportModalFunction: {
      type: Function,
      default: () => console.error('ModalConfirmDelete.vue :: openCustomExportModalFunction not set')
    },
    queryWrapper: {
      type: Function,
      default: () => console.error('ModalConfirmDelete.vue :: queryWrapper not set')     
    }
  },

  data() {
    return {

    };
  },

  computed: {
    countLabel () {
      return this.customExport.garageIds.includes('All') ? this.$t_locale('components/global/exports/ModalConfirmDelete')('All') : this.customExport.garageIds.length;
    }
  },

  methods: {
    closeModal() {
      this.openCustomExportModalFunction();
    },
    async deleteExport() {
      await this.queryWrapper({queryFunction: this.deleteCustomExportFunction, errorMessage: `${this.$t_locale('components/global/exports/ModalConfirmDelete')('Error_DeleteCustomExport')}\n${this.$t_locale('components/global/exports/ModalConfirmDelete')('ContactUs')}`}, { id: this.customExport.id });
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-confirm-delete {
  overflow: auto;
  height: 100%;
  width: 680px;

  &__delete {
    display: flex;
    flex-direction: column;
    margin-top: 3rem;

    & i {
      font-size: 70px;
      color: $red;
      text-align: center;
    }

    &__title {
      font-size: 1.5rem;
      color: $black;
      margin: 1.5rem 0 1rem 0!important;
    }
    &__text {
      font-size: 1rem;
      color: $dark-grey;
      line-height: 1.5;
      margin: .2rem 0!important;
    }
  }

  &__back {
    color: $black;
    background-color: $bg-grey;
    border-bottom: 1px solid rgba($grey, .5);
    width: 100%;
    padding: 1rem 0.5rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    &__cta {
      cursor: pointer;
      flex-grow: 0;
      display: flex;
    }
    &__text {
      margin-top: -1px!important;
      margin-left: .3rem!important;
    }
    &__filler {
      flex-grow: 1;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
