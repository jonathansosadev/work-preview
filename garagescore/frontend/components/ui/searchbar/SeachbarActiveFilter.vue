<template>
  <button class="searchbar-active-filter" v-on="$listeners">
    <div class="searchbar-active-filter__icon">
      <i :class="icon"></i>
    </div>
    <div class="searchbar-active-filter__label">{{ label }}</div>
    <i class="icon-gs-close-circle searchbar-active-filter__cancel-icon"></i>
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      type: String
    },

    label: {
      type: String
    }
  }
};
</script>

<style lang="scss" scoped>
.searchbar-active-filter {
  padding: 0.25rem 0.7rem;
  border-radius: 20px;
  border: solid 1px $grey;
  background-color: $white;
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  outline: none;
  cursor: pointer;

  &:hover {
    .searchbar-active-filter__cancel-icon {
      color: $greyish-brown;
    }
  }

  &__icon {
    width: 1rem;
    height: 1rem;
    color: $blue;
  }

  &__label {
    color: $blue;
    font-size: .92rem;
    font-weight: bold;
  }

  &__cancel-icon {
    font-size: .85rem;
    color: $dark-grey;
    position: relative;
    top: 1px;
  }

  * + * {
    margin-left: 0.5rem;
  }
}
</style>
