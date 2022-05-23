<template>
  <div class="field-group">
    <div class="field-group__close" v-if="canBeClose">
      <button class="field-group__btn" @click="$emit('close')">
        <i class="icon-gs-close-circle"/>
      </button>
    </div>
    <div class="field-group__content">
      <slot/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    canBeClose: Boolean,
  }
}
</script>



<style lang="scss" scoped>
.field-group {
  display: flex;
  flex-flow: column;
  width: 100%;
  position: relative;

  &__close {
    position: absolute;
    top: 0;
    right: 0;
  }

  &__btn {
    color: $red;
    border: 0;
    background-color: transparent;
    cursor: pointer;
    outline: 0;
    padding: 0.25rem;
  }

  &__content {
    * {
        width: 100%;
      }

    &:last-child {
      flex: 1;
    }

    * + * {
      margin-top: 0.5rem;
    }
  }
}
</style>
