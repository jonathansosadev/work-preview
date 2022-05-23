<template>
  <section class="kpi-basic-skeleton">
    <div class="kpi-basic-skeleton__top">
      <div class="kpi-basic-skeleton__top__todo">
        <Skeleton />
      </div>
      <div class="kpi-basic-skeleton__explanation">
        <Skeleton />
      </div>
    </div>
    <div class="kpi-basic-skeleton__bottom">
      <div class="kpi-basic-skeleton__bottom__todo">
        <Skeleton />
      </div>
      <div class="kpi-basic-skeleton__explanation">
        <Skeleton />
      </div>
    </div>
  </section>
</template>


<style lang="scss" scoped>
.kpi-basic-skeleton {
  display: flex;
  flex-flow: column;
  flex: 1 0 auto;

  &__top {
    padding: 1rem 0 1rem 0;

    &__todo {
      height: 1.9rem;
      display: flex;
      justify-content: center;
      align-items: center;

      ::v-deep .skeleton {
        width: 30px;
      }
    }
  }

  &__bottom {
    padding: 1rem 0 1rem 0;
    border-top: 1px solid rgba($grey, .5);

    &__todo {
      height: 1.9rem;
      display: flex;
      justify-content: center;
      align-items: center;

      ::v-deep .skeleton {
        width: 30px;
      }
    }
  }

  &__explanation {
    margin-top: 0.25rem;
    height: 0.85rem;

    display: flex;
    justify-content: center;
    align-items: center;

    ::v-deep .skeleton {
      width: 100px;
    }
  }
}

@media (max-width: $breakpoint-max-md) {
  .kpi-basic-skeleton {
    &__explanation {
      font-size: 0.75rem;
    }
  }
}

@media (max-width: $breakpoint-max-sm) {
  .kpi-basic-skeleton {
    flex-flow: row;
    &__top {
      padding: 0;
      flex: 1 0 auto;
      text-align: left;
      width: 50%;
    }
    &__bottom {
      flex: 1 0 auto;
      padding: 0;
      text-align: right;
      width: 50%;
      border-top: 0;
      border-left: 1px solid $grey;
      &__todo {
        .kpi-basic__number__power {
          display: none;
        }
      }
    }
    &__explanation {
      margin-top: 0.25rem;
    }
  }
}
</style>
