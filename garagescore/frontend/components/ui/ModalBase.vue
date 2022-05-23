<template>
  <div class="modal-base">
    <div class="modal-base__header" ref="header" :class="noContentClass">
      <div class="modal-base__header__left">
        <slot name="header-icon">
        </slot>
      </div>
      <div class="modal-base__header__right">
        <div class="modal-base__header__right__title">
          <slot name="header-title">
          </slot>
        </div>
        <div class="modal-base__header__right__subtitle">
          <slot name="header-subtitle">
          </slot>
        </div>
        <div class="modal-base__header__right__subtitle-2">
          <slot name="header-subtitle-2">
          </slot>
        </div>
      </div>
      <button class="modal-base__header__btn-close" @click="close">
        <i class="icon-gs-close"/>
      </button>
    </div>
    <div class="modal-base__bodyheader" v-if="$slots.bodyheader">
      <slot name="bodyheader">
      </slot>
    </div>
    <div class="modal-base__body custom-scrollbar" :class="bodyClass" v-if="$slots.body">
      <slot name="body">
      </slot>
    </div>
    <div class="modal-base__footer" v-if="$slots.footer">
      <slot name="footer">
      </slot>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    type: String,
    longBody: Boolean,
    overrideCloseCross: Function,
    noScroll: Boolean,
  },

  computed: {
    noContentClass() {
      return {
        'modal-base__header--no-content': !this.$slots.body && !this.$slots.footer,
      }
    },

    bodyClass() {
      return {
        'modal-base__body--no-footer': !this.$slots.footer,
        'modal-base__body--long-body': this.longBody,
        'modal-base__body--no-scroll': this.noScroll,
      }
    }
  },

  methods: {
    close() {
      this.overrideCloseCross ? this.overrideCloseCross() : this.$store.dispatch('closeModal');
    },
  }
}
</script>

<style lang="scss" scoped>

.modal-base {
  background-color: $white;
  padding: 1.5rem;
  border-radius: 3px;
  box-shadow: 0 25px 35px 0 rgba($black, .16);
  max-height:100%;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
  overflow: hidden;
  padding: 1.5rem;
  border-radius: 3px;
  box-shadow: 0 25px 35px 0 rgba($black, .16);

  &__header {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    color: $blue;
    font-size: 2.5rem;
    padding-bottom: .5rem;
    flex-shrink:0;
    border-bottom: 1px solid rgba($grey, .5);
    width: 100%;

    &--no-content {
      margin-bottom:0;
    }

    &__left {
      font-size: 2.5rem;
      margin-right: 0.5rem;
    }

    &__right {
      flex-grow: 1;

      &__title {
        font-size: 1.2rem;
        color: $black;
        font-weight: 700;
        margin-bottom: .3rem;
      }
      &__subtitle {
        font-size: 0.92rem;
        color: $dark-grey;
        font-weight: 400;
        margin-bottom: 0.5rem;
      }
      &__subtitle-2 {
        font-size: 0.92rem;
        color: $red;
        font-weight: 300;
      }
    }

    &__btn-close {
      padding: 0;
      color: $dark-grey;
      background-color: transparent;
      border: none;
      cursor: pointer;
      outline: none;
      margin-left: 1rem;
      font-size: 1rem;

      &:hover {
        color: $greyish-brown;
      }
    }
  }

  &__bodyheader {
    font-size: 0.92rem;
    font-weight: 300;
    flex-shrink:0;
  }

  &__body {
    font-size: 0.92rem;
    color: $dark-grey;
    flex-grow: 1;
    padding: 1rem 0;
    max-height: 70vh;
    overflow: auto;
    overflow-x: hidden;
    padding-right: 0.3rem;

    &--no-footer {
      margin-bottom: 0;
    }
    &--no-scroll {
      overflow: hidden;
    }
  }
  &__footer {
    font-size: 0.92rem;
    font-weight: 300;
    flex-shrink:0;
    border-top: 1px solid rgba($grey, .5);
    padding-top: 1rem;
  }

}
</style>
