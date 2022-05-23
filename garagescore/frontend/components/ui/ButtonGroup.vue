<template>
  <div class="button-group-container">
    <button
      v-for="(slotName, index) in slotsKeys"
      :key="index"
      role="button"
      class="button-group-container__button"
      :class="classBinding(slotName)"
      @click="handleClick(slotName)"
    >
    <div class="button-group-container__button__content">
      <slot :name="slotName" />
    </div>
  </button>
  </div>
</template>


<script>
export default {
  name: "ButtonGroup",
  props: {
    activeSlotName : { type: String, required: true },
    size: { type : String, default: "md" },
    type: String,
  },

  methods : {
    handleClick(slotName) {
      if(slotName !== this.$props.activeSlotName){
        this.$emit("change", slotName);
      }
    }
  },

  computed: {
    slotsKeys() {
      return Object.keys(this.$slots);
    },

    classBinding() {
      return function (slotName) {
        return {
          "button-group-container__button--active": this.$props.activeSlotName === slotName ? "active" : "",
          "button-group-container__button--sm": this.$props.size === "sm",
          "button-group-container__button--md": this.$props.size === "md",
          "button-group-container__button--lg": this.$props.size === "lg",
        };
      }

    }
  }
};
</script>


<style lang="scss" scoped>

.button-group-container {
  display: flex;
  flex-wrap: nowrap;
  background-color: transparent;
  border: 1px solid $light-grey;
  border-radius: 5px;
  width: 4.286rem;
  padding: 1px;

  &__button {
    position: relative;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    cursor: pointer;
    border: 0;
    // border-left: 1px solid $light-grey;
    // border-right: 1px solid $light-grey;
    background-color: $bg-grey;
    color: $dark-grey;
    outline: 0;
    overflow: hidden;
    box-sizing: border-box;
    border-radius: 2px;

    &--sm {
      height: 1rem;
      padding: 0.393rem 0.714rem;
      font-size: 10px;
    }

    &--md {
      height: 1.5rem;
      padding: 0.393rem 0.714rem;
      font-size: 10px;
    }

    &--lg {
      height: 2rem;
      padding: 0.393rem 0.714rem;
      font-size: 13px;
    }

    &--active {
      background-color: $white;
      color: $blue;
      box-shadow: 0 0 3px 0 rgba($black, .16);
    }

    &__content {
      flex-grow: 1;
      display: inline;
      text-align: center;
      position: relative;
      top: 1px;
    }

    &--disabled {
      background-color: $grey;
      color: $white;
      box-shadow: none;
      cursor: not-allowed;
    }
  }
}
</style>
