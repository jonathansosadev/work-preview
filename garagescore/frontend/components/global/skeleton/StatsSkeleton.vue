<template>
  <div class="stats-skeleton">
    <div class="stats-skeleton__left">
      <Skeleton class="stats-skeleton__value" v-if="!noMainValue" />
    </div>
    <div class="stats-skeleton__right">
      <div class="stats-skeleton__label">
        <Skeleton class="stats-skeleton__label-value" />
      </div>
      <Skeleton class="stats-skeleton__subtitle" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    noMainValue: { type: Boolean }
  }
};
</script>

<style lang="scss" scoped>
.stats-skeleton {
  display: flex;
  flex-flow: column;
  align-items: center;

  &__label {
    width: 100%;
  }

  &__value {
    height: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  &__right {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
  }

  &__label-value {
    height: $KPI-title-size;
    display: inline-block;
    width: 50%;
  }

  &__label-subtitle {
    height: $KPI-subtitle-size;
    margin-left: 0.2rem;
    display: none;
  }

  &__subtitle {
    display: none;
    color: $dark-grey;
    height: $KPI-subtitle-size;
    margin-top: 5px;
  }
}

@media (min-width: $breakpoint-min-md) {
  .stats-skeleton {
    flex-flow: row;
    width: 100%;

    &__value {
      height: 2.5rem;
    }

    &__label-value {
      height: 1rem;
    }

    &__left {
      width: 33%;
    }

    &__right {
      width: 66%;
      padding-left: 1rem;
    }

    &__subtitle {
      display: block;
    }

    &__label-subtitle {
      display: inline-block;
    }

    &__hover-title {
      display: inline-block;
    }
  }
}
</style>
