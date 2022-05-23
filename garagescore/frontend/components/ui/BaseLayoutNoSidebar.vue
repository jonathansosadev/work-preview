<template>
  <div class="base-layout">
    <div class="base-layout__header">
      <slot name="header" />
    </div>
    <div class="base-layout__main" :class="mainClass">
<!--      <Notification type="primary" class="notification" v-if="displayNotification" @close="displayNotification = false">
        <template slot>
          <span>{{ $t_locale('components/ui/BaseLayoutNoSidebar')('holidays') }}</span>
        </template>
      </Notification>-->
      <slot name="subheader" />
      <slot name="body">
        <nuxt/>
      </slot>
    </div>
    <slot />
    <ModalWrapper />
    <ServiceWorker />
  </div>
</template>

<script>
import ModalWrapper from '~/components/global/ModalWrapper';
import Notification from '~/components/ui/Notification';

export default {
  components: { ModalWrapper, Notification },

  data() {
    return {
      displayNotification: true
    }
  },
  computed: {
    mainClass() {
      return this.$route.name.match(/welcome/) ? "base-layout__main--grey" : "";
    }
  },

  methods: {
  }
};
</script>


<style lang="scss" scoped>
.base-layout {
  background-color: $bg-grey;

  &__header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 100;
  }

  &__main {
    margin-top: 3.5rem;
    min-height: calc(100vh - 3.5rem);
    &--grey {
      background-color: #f5f5f5;
    }
  }
}

</style>
