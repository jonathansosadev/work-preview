<template>
  <div class="kpi">
    <div class="kpi__title">
      <span class="kpi__title__label">
        <Skeleton :style="{ width: '136px', height: '1.5rem' }" />
      </span>
    </div>
    <div class="divider"></div>
    <div class="kpi__main">
      <div class="kpi__value" v-if="!noMainValue">
        <Skeleton :style="{ width: '42px', height: '1.5rem' }" />
      </div>
      <div class="kpi__subtitle" v-if="haveSubtitle">
        <Skeleton :style="{ width: '150px' }" />
      </div>
    </div>
    <div class="kpi__common-stats" v-if="!noBottom">
      <div class="kpi__common-stats__left">
        <div class="kpi__common-stats__upper-value">
          <Skeleton :style="{ width: '3rem', height: '2rem' }" />
        </div>
        <div class="kpi__common-stats__lower-label">
          <Skeleton :style="{ width: '5rem', height: '1rem' }" />
        </div>
      </div>
      <div class="kpi__common-stats__right">
        <div class="kpi__common-stats__upper-value">
          <Skeleton :style="{width: '3rem', height: '2rem' }" />
        </div>
        <div class="kpi__common-stats__lower-label">
          <Skeleton :style="{ width: '5rem', height: '1rem' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    noMainValue: { type: Boolean },
    noBottom: { type: Boolean }, // Use no hide the bottom part (Top 200... Global...)
    haveSubtitle: { type: Boolean }
  }
};
</script>


<style lang="scss" scoped>
.divider {
  height: 1px;
  background-color: rgba($grey, .5);
  width: 100%;
  margin: 14px 0;
}

.kpi {
  display: flex;
  flex-flow: column;
  align-items: center;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.16);
  background-color: white;
  padding: 14px 21px;
  box-sizing: border-box;
  min-height: 195px;

  &__title {
    font-weight: bold;
    text-align: center;
    color: black;

    &__label {
      height: 1rem;
      display: block;
    }
  }

  &__value {
    color: $black;
    text-align: center;
    height: 40px;
    font-weight: 900;
    display: flex;
    justify-content: center;
    white-space: nowrap;
    margin-bottom: 7px;
  }

  &__common-stats {
    display: flex;
    flex-flow: row;
    align-items: center;
    width: 100%;
    text-align: center;

    &__upper-value {
      height: 21px;
      font-weight: bold;
      margin-bottom: 7px;
    }

    &__lower-label {
      height: 13px;
    }

    &__left {
      width: calc(50% - 1px);
      border-right: 1px solid $light-grey;
    }
    &__right {
      width: 50%;
    }
  }

  &__subtitle {
    color: $dark-grey;
    height: 1rem;
    margin-bottom: 21px;
  }
}

@media (min-width: $breakpoint-min-md) {
  .kpi {
    flex-flow: column;

    &__value {
      height: 2.5rem;
      font-weight: 900;
    }

    &__subtitle {
      display: block;
    }

    &__label-subtitle {
      display: inline;
    }
  }
}
</style>
