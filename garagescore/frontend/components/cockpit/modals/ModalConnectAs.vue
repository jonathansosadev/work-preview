<template>
  <ModalBase class="modal-connect-as">
    <template slot="header-icon">
      <i class="icon-gs-user-anonymous"></i>
    </template>
    <template slot="header-title">
      <span>{{$t_locale('components/cockpit/modals/ModalConnectAs')("title")}}</span>
    </template>
    <template slot="header-subtitle">
      <span>{{$t_locale('components/cockpit/modals/ModalConnectAs')("title2")}} {{ userEmail }}</span>
    </template>
    <template slot="body">
      <div class="modal-connect-as__part">
        <AppText tag="p" class="modal-connect-as__text">
          {{$t_locale('components/cockpit/modals/ModalConnectAs')("desc1")}} <b>{{ userEmail }}</b>
          {{$t_locale('components/cockpit/modals/ModalConnectAs')("desc2")}} : <b>{{ userPassword }}</b>
          <AppText tag="p" type="danger">{{$t_locale('components/cockpit/modals/ModalConnectAs')("desc3")}}</AppText>
          {{$t_locale('components/cockpit/modals/ModalConnectAs')("desc4")}}<br>
          {{$t_locale('components/cockpit/modals/ModalConnectAs')("desc5")}} :
        </AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-connect-as__link-container">
        <a class="modal-connect-as__link-container__link" style="cursor: pointer" target="_blank" :href="connectAsLink">{{$t_locale('components/cockpit/modals/ModalConnectAs')("link")}}</a>
      </div>
    </template>
  </ModalBase>
</template>


<script>
import * as urls from '~/utils/urls.js'

export default {
  props: {
    userEmail: { type: String },
    userPassword: { type: String }
  },
  computed: {
    connectAsLink() {
      return `${urls.getShortUrl('AUTH_BACKDOOR')}?email=${encodeURIComponent(this.userEmail)}&password=${this.userPassword}`;
    }
  }
}
</script>

<style lang="scss" scoped>
  .modal-connect-as {
    &__link-container {
      width: 100%;
      text-align: center;
    }
  }
</style>
