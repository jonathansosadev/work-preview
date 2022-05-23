<template>
  <div class="modal-mobile">
    <div class="modal-mobile__header">
      <button class="modal-mobile__close" @click="() => $emit('close')">
        <i class="icon-gs-close" />
      </button>
      <h1 class="modal-mobile__title">
        <slot name="title" />
      </h1>
    </div>
    <div class="modal-mobile__body">
      <slot />
    </div>
    <div class="modal-mobile__footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    document.documentElement.style.overflow = "hidden";
  },

  beforeDestroy() {
    document.documentElement.style.overflow = "auto";
  }
};
</script>

<style lang="scss" scoped>
.modal-mobile {
  height: 100vh;
  width: 100vw;
  background-color: $extra-light-grey;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1200;

  &__header {
    background-color: $white;
    padding: 1rem;
    height: 50px;
    box-sizing: border-box;
    position: fixed;
    width: 100vw;

    display: flex;
    flex-direction: row;
    align-items: center;
  }

  &__close {
    font-size: 1rem;
    margin-right: 21px;
    border: none;
    background-color: transparent;
    color: $dark-grey;
  }

  &__title {
    font-size: 14px;
    font-weight: bold;
    line-height: 1.21;
  }

  &__body {
    height: 100vh;
    padding: calc(50px + 1rem) 1rem calc(50px + 1rem) 1rem;
    box-sizing: border-box;
    overflow: auto;
  }

  &__footer {
    height: 50px;
    position: fixed;
    width: 100vw;
    background-color: #ffffff;
    bottom: 0;
    box-shadow: 0 -6px 20px 0 rgba(0, 0, 0, 0.16);
  }
}
</style>