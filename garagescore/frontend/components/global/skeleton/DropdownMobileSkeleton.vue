<template>
  <div class="dropdown-mobile-skeleton">
    <div class="dropdown-mobile-skeleton__circle">
      <Skeleton />
    </div>
    <div class="dropdown-mobile-skeleton__subtitle">
      <Skeleton />
    </div>
  </div>
</template>


<style lang="scss" scoped>
.dropdown-mobile-skeleton {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  &__circle {
    width: 35px;
    height: 35px;
    background-color: white;
    border-radius: 50%;
    padding: 0.5rem;
    box-sizing: border-box;

    ::v-deep .skeleton {
      border-radius: 50%;
    }
  }

  &__subtitle {
    width: 4rem;
    margin-top: 0.5rem;
    padding: 0.25rem;
    box-sizing: border-box;
    background-color: white;

    ::v-deep .skeleton {
      height: 1rem;
    }
  }
}
</style>