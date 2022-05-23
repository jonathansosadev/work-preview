<template>
  <div class="dropdown">
    <button type="button" class="dropdown__button">
      <div class="dropdown__label">
        <Skeleton />
      </div>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.dropdown {
  position: relative;
  width: auto;
  color: $white;
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 30px;
  border-radius: 30px;

  &__button {
    display: block;
    background-color: transparent;
    border: none;
    color: $dark-grey;
    padding: 0 1rem;
    height: 100%;
    width: 100%;
    cursor: pointer;
    outline: 0;
  }

  &__label {
    margin-right: 1rem;
    max-width: 16rem;
    height: 1rem;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    cursor: inherit;

    &--selected {
      color: $blue;
    }
  }
}
</style>