<template>
  <div class="base-layout" :class="classBinding">
    <div class="base-layout__aside-bg" v-if="this.$store.state.sidebarOpen" @click="hideAside" />
    <div class="base-layout__aside" :class="asideClassBinding">
      <slot name="aside" />
    </div>
    <div class="base-layout__header">
      <slot name="header" />
    </div>
    <div class="base-layout__main" :class="mainClass">
<!--      <Notification type="primary" class="notification" v-if="displayNotification" @close="displayNotification = false">
        <template slot>
          <span>{{ $t_locale('components/ui/BaseLayout')('holidays') }}</span>
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
    classBinding() {
      return {
        "base-layout--tiny": this.$store.getters["sidebarTiny"]
      };
    },

    sidebarOpen() {
      return this.$store.state.sidebarOpen;
    },

    asideClassBinding() {
      return {
        "base-layout__aside--open": this.$store.state.sidebarOpen
      };
    },

    mainClass() {
      return this.$route.name.match(/welcome/) ? "base-layout__main--grey" : "";
    }
  },

  watch: {
    sidebarOpen(value, oldValue) {
      if (this.$mq === "sm") {
        document.documentElement.style.overflow = value ? "hidden" : "auto";
      } else {
        document.documentElement.style.overflow = "auto";
      }
    }
  },

  methods: {
    hideAside() {
      if (this.$store.state.sidebarOpen) {
        this.$store.dispatch("toggleSidebar", false);
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.base-layout {
  background-color: $bg-grey;
  //overflow: hidden;

  &__aside {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 102;

    transform: translateX(-$aside-mobile-size);
    transition: transform 0.3s;

    &--open {
      transform: translateX(0);
    }
  }

  &__aside-bg {
    position: fixed;
    top: 0;
    right: 0;

    height: 100vh;
    width: 100vw;
    background-color: rgba($black, 0.75);
    z-index: 101;
  }

  &__header {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 96;
  }

  &__main {
    margin-top: 3.5rem;
    min-height: calc(100vh - 3.5rem);
    &--grey {
      background-color: #f5f5f5;
    }
  }
}

@media (min-width: $breakpoint-max-lg) {
  .base-layout {
    &__main {
      margin-left: $aside-size;
    }

    &__aside {
      transform: translateX(0);
    }

    &__header {
      margin-left: $aside-size;
    }

    &--tiny {
      .base-layout {
        &__header {
          margin-left: $aside-tiny-size;
        }

        &__main {
          margin-left: $aside-tiny-size;
        }
      }
    }
  }
}
</style>
