<template>
  <div class="table" :class="classBinding">
    <div ref="table" class="table__content" :style="{ 'margin-top': -tableShadowMargin }">
      <slot name="header-fixed" ref="header-fixed" v-if="isFixed" />
      <slot name="header" ref="header" />
      <slot name="info" />
      <template v-if="!loading">
        <div class="table__row-body" v-if="$slots.beforeRow">
          <slot name="beforeRow" />
        </div>
        <div v-for="(row, index) in rows" :key="index" class="table__row-body">
          <slot name="row" v-bind:row="row" v-bind:index="index"></slot>
        </div>
      </template>
      <div class="table__row-body" v-if="loading && $slots['row-loading']">
        <slot name="row-loading" />
      </div>
      <div v-if="!(rows.length) && !loading">
        <slot name="empty">
          <div class="table__empty-text">{{ displayedNoResultText }}</div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    rows: Array,
    loading: {
      type: Boolean,
      default: true
    },
    fixed: Boolean,
    scrollOffset: { type: Number, default: 49 },
    noResultText: String,
    noResultGodMode: Boolean,
  },

  data() {
    return {
      isFixed: false,
      shadowHeight: 110
    };
  },

  computed: {
    classBinding() {
      return {
        "table--sidebar-tiny": this.$store.getters["sidebarTiny"],
        "table--fix": this.isFixed
      };
    },
    tableShadowMargin() {
      return this.isFixed ? `${this.shadowHeight}px` : 0;
    },
    displayedNoResultText() {
      return this.noResultGodMode ? this.$t_locale('components/ui/table/Table')("NoResultGodMode") : (this.noResultText || this.$t_locale('components/ui/table/Table')("NoResult"));
    },
  },

  mounted() {
    if (this.$refs.header) {
      this.shadowHeight = this.$refs.header.getBoundingClientRect().height;
    }

    window.addEventListener("scroll", this.handleScroll);

    if (this.fixed) {
      setInterval(() => {
        if (this.$refs.table) {
          this.isFixed = this.$refs.table.getBoundingClientRect().top <= this.shadowHeight;
        }
      }, 50);
    }
  }
};
</script>

<style lang="scss">
.table {
  width: 100%;
  position: relative;

  &__row {
    background-color: $white;
  }

  &__back {
    display: flex;
    font-size: 1rem;
    color: $orange;
    padding: 0 1rem;
    box-shadow: 0 0 3px 0 rgba($black, .16);
    background-color: $white;
    border-radius: 20px;
    height: 2.5rem;
    margin-right: .15rem;

    button {
      display: flex;
      align-items: center;
      border: 0;
      background: transparent;
      cursor: pointer;
      padding: 0px;
    }

    .icon-gs-left-circle {
      margin-right: 7px;
    }

    &__label {
      font-weight: bold;
    }
  }

  &__row-body {
    margin-left: 1rem;
    margin-right: 1rem;

    &:not(:last-child) {
      border-bottom: 1px solid rgba($grey, .4);
    }
  }

  &__content {
    min-height: 4rem;
    width: 100%;
    background: $white;
    border-radius: 20px;
    padding-bottom: 1rem;
  }

  &__thead {
    width: 100%;
    display: block;
  }

  &--fix {
    .table__thead:first-of-type {
      position: fixed;
      top: 112px;
      z-index: 94;
    }
  }

  &__empty {
    width: 100%;
    background-color: $white;
    border-radius: 0 0 20px 20px;
  }

  &__empty-text {
    font-size: 0.9rem;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 5rem!important;
    margin-left: 1rem;
    margin-right: .5rem;
    border-radius: 0 0 20px 20px;
    color: $dark-grey;
    padding-top: 2rem;
    box-sizing: border-box;
  }

  &__header {
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: nowrap;
    max-width: 100vw;
    border-radius: 20px 20px 0 0;
    background: $white;

    &--top {
      padding: 0px;
    }
  }

  &__searchbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    border-bottom: 10px solid $bg-grey;
    border-radius: 20px 20px 0 0;
    background: $bg-grey;

    &--end {
      justify-content: flex-end;
    }

    .searchbar {
      flex: 1;
      width: 100%;
      border-radius: 20px;
    }

    .button-export__wrapper {
      display: none;
    }

    & > * + * {
      border-left: 1rem solid $bg-grey;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .table {
    &--fix {
      .table__thead:first-of-type {
        width: calc(100% - #{$aside-size} - 2rem);
      }

      &.table--sidebar-tiny {
        .table__thead:first-of-type {
          width: calc(100% - #{$aside-tiny-size});
        }
      }
    }
  }
}

@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
  @media (min-width: $breakpoint-min-md) {
   .table {
      &--fix {
        .table__thead:first-of-type {
          width: calc(100% - 16.4rem);
        }
      }
    }
  }
}
@-moz-document url-prefix() {
  @media (min-width: $breakpoint-min-md) {
   .table {
      &--fix {
        .table__thead:first-of-type {
          width: calc(100% - 16.4rem);
        }
      }
    }
  }
}

@media (min-width: $breakpoint-min-lg) {
  .table {
    &__header {
      padding: 0;
      background-color: $white;
    }

    &__searchbar {
      .button-export__wrapper {
        display: block;
      }
    }
  }
}

@media (max-width: $breakpoint-min-md) {
  .table {
    &--fix {
    .table__thead:first-of-type {
      top: 18.2vh;
      width: calc(100% - 2.2rem);
    }
  }
  }
}
</style>
