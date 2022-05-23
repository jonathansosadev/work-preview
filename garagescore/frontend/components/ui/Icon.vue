<template>
  <div class="icon">
    <i
      :class="[
        `icon-gs-${name}`,
        `icon-color-${color}`,
        `icon-size-${size}`,
        `icon-animation-${animation}`,
        isDisabled,
      ]"
      :disabled="disabled"
    />
  </div>
</template>

<script>
export default {
  name: 'Icon',
  props: {
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    animation: String,
    disabled: Boolean,
  },
  computed: {
    isDisabled() {
      return {
        "icon-color-disabled": this.disabled,
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .icon {
    display: inline-flex;
    & i {
      // For animation
      display: inline-flex;
    }
  }
</style>