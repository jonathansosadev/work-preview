<template>
  <div class="header-nav-folder" :class="classBinding">
    <div class="header-nav-folder__left">
      <nuxt-link :to="{ name: routeList }" class="header-nav-folder__link">
        <i class="header-nav-folder__icon icon-gs-left-circle" />
        <AppText
          class="header-nav-folder__title"
          tag="span"
          bold
        >
          {{ $t_locale('components/global/HeaderNavFolder')("back") }}
        </AppText>
      </nuxt-link>
    </div>
    <div class="header-nav-folder__right" v-if="items.length > 0">
      <AppText
        tag="span"
        class="header-nav-folder__title"
        bold
      >
        {{ contentTypeLabel || $t_locale('components/global/HeaderNavFolder')("files") }}
      </AppText>
      <div class="header-nav-folder__actions">
        <button
          class="header-nav-folder__button"
          v-if="currentIndex !== 0"
          @click="goPrev"
        >
          <i class="icon-gs-left" />
        </button>
        <button
          class="header-nav-folder__button"
          v-if="(currentIndex + 1) < items.length"
          @click="goNext"
        >
          <i class="icon-gs-right" />
        </button>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    currentId: String,
    routeList: String,
    routeId: String,
    customIdLabel: String,
    contentTypeLabel: String,
    sidebarTiny: Boolean
  },

  computed: {
    currentIndex() {
      return this.items.findIndex(e => e.id === this.currentId);
    },
    classBinding() {
      return {
        "header-nav-folder--sidebar-tiny": this.sidebarTiny,
      };
    }
  },

  methods: {
    goNext() {
      this.$router.push({
        name: this.routeId,
        params: { [this.customIdLabel || 'id']: this.items[this.currentIndex + 1].id }
      });
    },

    goPrev() {
      this.$router.push({
        name: this.routeId,
        params: { [this.customIdLabel || 'id']: this.items[this.currentIndex - 1].id }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.header-nav-folder {
  background-color: $white;
  box-shadow: 0 1px 3px 0 rgba($black, .16);
  width: calc(100% - #{$aside-size});
  z-index: 50;
  height: 50px;
  display: flex;
  flex-direction: row;

  &__left {
    flex: 1;
    padding: 1.29rem;
    display: flex;
    align-items: center;
  }

  &__right {
    flex: 1;

    display: flex;
    justify-content: flex-end;
  }

  &__icon {
    font-size: 1rem;
    margin-right: 0.5rem;
  }

  &__link {
    text-decoration: none;
    color: $black;
    display: flex;
  }

  &__button {
    height: 100%;
    width: 2.4rem;
    border: none;
    background-color: $dark-grey;
    color: $white;
    cursor: pointer;
  }

  &__title {
    font-size: 1rem;
    display: flex;
    align-items: center;
  }

  &__actions {
    margin-left: 0.5rem;
  }
}

@media (min-width: $breakpoint-min-md) and (max-width: $breakpoint-max-lg) {
  .header-nav-folder {
    width: calc(100% - #{$aside-tiny-size});
  }
}
@media (max-width: $breakpoint-min-xl) and (min-width: $breakpoint-max-lg) {
  .header-nav-folder {
    width: calc(100% - #{$aside-size});

    &--sidebar-tiny {
      width: calc(100% - #{$aside-tiny-size});
    }
  }
}
@media (max-width: $breakpoint-min-md) {
  .header-nav-folder {
    width: 100%;
  }
}
</style>
