<template>
  <button type="button" class="dropdown-mobile" v-on="$listeners" :class="classBinding" :track-id="trackId">
    <div class="dropdown-mobile__icon-wrapper" :track-id="trackId">
      <div class="dropdown-mobile__icon-status" v-show="active" />
      <slot name="icon" />
    </div>
    <label class="dropdown-mobile__label" :track-id="trackId">
      <slot name="dropdown-label" />
    </label>
  </button>
</template>

<script>
export default {
  props: {
    open: Boolean,
    active: Boolean,
    trackId: String
  },

  computed: {
    classBinding() {
      return {
        "dropdown-mobile--active": this.active
      };
    }
  }
};
</script>


<style lang="scss" scoped>
.dropdown-mobile {
  border: none;
  background-color: transparent;
  cursor: pointer;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: $dark-grey;

  outline: 0px;

  &--active {
    color: $blue;

    .dropdown-mobile__label {
      color: $blue;
    }

    .dropdown-mobile__icon-wrapper {
      background-color: rgba($blue, 0.1);
    }
  }

  &__icon-status {
    position: absolute;
    border-radius: 50%;
    height: 8px;
    width: 8px;
    background-color: $blue;
    border: 1px solid $white;

    top: 6px;
    right: 4px;
  }

  &__icon-wrapper {
    width: 35px;
    height: 35px;
    background-color: white;
    border-radius: 50%;
    position: relative;

    display: flex;
    justify-content: center;
    align-items: center;

    i {
      font-size: 1.3rem;
    }
  }

  &__label {
    margin-top: 7px;
    font-size: 10px;
    text-align: center;
    display: block;
  }
}
</style>