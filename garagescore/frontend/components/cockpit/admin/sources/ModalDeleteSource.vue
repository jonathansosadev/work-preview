<template>
  <ModalBase class="modal-delete-child-user">
    <template slot="header-icon">
        <i class="modal-delete-child-user__icon icon-gs-trash"></i>
    </template>
    <template slot="header-title">
        <span>{{ $t_locale('components/cockpit/admin/sources/ModalDeleteSource')("title") }}</span>
    </template>
    <template slot="header-subtitle">
      <AppText tag="span" type="danger">{{ $t_locale('components/cockpit/admin/sources/ModalDeleteSource')("subtile") }}</AppText>
    </template>

    <template slot="body">
      <div class="modal-delete-child-user__part">
        <AppText tag="p">
          {{ $t_locale('components/cockpit/admin/sources/ModalDeleteSource')("contentStart") }} <b>{{ source.type }}</b>
          {{ $t_locale('components/cockpit/admin/sources/ModalDeleteSource')("contentFor") }} <b>{{ source.garagePublicDisplayName }}</b>
          {{ $t_locale('components/cockpit/admin/sources/ModalDeleteSource')("contentEnd") }}
          <br><br>
          {{ $t_locale('components/cockpit/admin/sources/ModalDeleteSource')("question") }} <b>{{ source.type }}</b>
          {{ $t_locale('components/cockpit/admin/sources/ModalDeleteSource')("contentFor") }} <b>{{ source.garagePublicDisplayName }}</b> ?
        </AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-delete-child-user__footer">
        <Button type="cancel" @click="closeModal">{{ $t_locale('components/cockpit/admin/sources/ModalDeleteSource')("cancel") }}</Button>
        <Button type="orange" @click="handleDeleteSource(source.garageId , source.email, source.phone, source.type)">{{ $t_locale('components/cockpit/admin/sources/ModalDeleteSource')("confirm") }}</Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>
export default {
  props: {
    source: { type: Object },
    handleDeleteSource: { type: Function },
    closeModal: { type: Function }
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
