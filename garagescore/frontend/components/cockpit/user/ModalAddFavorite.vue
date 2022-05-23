<template>
  <ModalBase class="modal-add-favorite">
    
    <template slot="header-icon">
      <i class="icon-gs-web"></i>
    </template>
    <template slot="header-title">
      <AppText tag="div" size="md" bold>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('title') }}</AppText>
    </template>

    <template slot="body">
      <div class="modal-add-favorite__body">
        <!-- <span >comment ajouter un favoris:</span> -->
        <AppText tag="div" type="muted" v-if="['Microsoft Internet Explorer', 'Microsoft Edge'].includes(sBrowser)">
          {{ $t_locale('components/cockpit/user/ModalAddFavorite')('topRight')}}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('star') }}</strong>&nbsp;{{ $t_locale('components/cockpit/user/ModalAddFavorite')('thenOn') }}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('addFav')}}</strong>&nbsp;{{ $t_locale('components/cockpit/user/ModalAddFavorite')('thenSelect')}}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('favTab') }}</strong>&nbsp;{{ $t_locale('components/cockpit/user/ModalAddFavorite')('then') }}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('add') }}</strong>
        </AppText>
        <AppText tag="div" type="muted" v-if="['Google Chrome or Chromium', 'Opera', 'unknown', 'Apple Safari'].includes(sBrowser)">
          {{ $t_locale('components/cockpit/user/ModalAddFavorite')('urlBarRight') }}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('star') }}</strong>&nbsp;{{ $t_locale('components/cockpit/user/ModalAddFavorite')('thenChoose') }}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('favBar') }}</strong>&nbsp;{{ $t_locale('components/cockpit/user/ModalAddFavorite')('then') }}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('ok') }}</strong>
        </AppText>
        <AppText tag="div" type="muted" v-if="['Mozilla Firefox'].includes(sBrowser)">
          {{ $t_locale('components/cockpit/user/ModalAddFavorite')('urlBarRight') }}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('star') }}</strong>&nbsp;{{ $t_locale('components/cockpit/user/ModalAddFavorite')('thenChoose') }}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('persoBar') }}</strong>&nbsp;{{ $t_locale('components/cockpit/user/ModalAddFavorite')('then') }}&nbsp;<strong>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('end') }}</strong>
        </AppText>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-add-favorite__footer">
        <Button type="orange"  @click.native="closeModal">
          <span>{{ $t_locale('components/cockpit/user/ModalAddFavorite')('ok') }}</span>
        </Button>
      </div>
    </template>

  </ModalBase>
</template>

<script>
  export default {
    data() {
      return { sBrowser: 'unknown'}
    },
    mounted() {
      const sUsrAg = navigator.userAgent;
      if (sUsrAg.indexOf("Firefox") > -1) {
        this.sBrowser = "Mozilla Firefox";
        //"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
      } else if (sUsrAg.indexOf("Opera") > -1) {
        this.sBrowser = "Opera";
      } else if (sUsrAg.indexOf("Trident") > -1) {
        this.sBrowser = "Microsoft Internet Explorer";
        //"Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
      } else if (sUsrAg.indexOf("Edge") > -1) {
        this.sBrowser = "Microsoft Edge";
        //"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
      } else if (sUsrAg.indexOf("Chrome") > -1) {
        this.sBrowser = "Google Chrome or Chromium";
        //"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
      } else if (sUsrAg.indexOf("Safari") > -1) {
        this.sBrowser = "Apple Safari";
        //"Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
      } else {
        this.sBrowser = "unknown";
      }
    },
    methods: {
      closeModal() {
        this.$router.push('/cockpit');
        this.$store.dispatch('closeModal');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .modal-add-favorite {
    &__body {
      position:relative;
    }

    &__footer {
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
