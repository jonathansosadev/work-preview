<template>
  <section class="kpi-basic">
    <div class="kpi-basic__top">
      <div class="kpi-basic__top__todo">
        <AppText tag="div" type="danger" size="lgl" extra-bold class="kpi-basic__number">
          {{ todo | renderNumber }}
          <AppText
            tag="div"
            type="warning-darker"
            size="xs"
            v-if="typeof reminders === 'number'"
            class="kpi-basic__number__power"
          >
            (
            <i class="icon-gs-programming-time" />
            {{ reminders | renderNumber }})
          </AppText>
        </AppText>
      </div>
      <AppText tag="div" type="black" size="sml" class="kpi-basic__explanation">
        {{ todoText }}
        <i class="icon-gs-filter-solid kpi-basic__explanation__icon" />
      </AppText>
    </div>
    <div class="kpi-basic__bottom">
      <div class="kpi-basic__bottom__todo">
        <AppText tag="div" type="success" size="lgl" bold class="kpi-basic__number">
          {{ done | renderNumber }}
          <AppText
            tag="div"
            type="success"
            size="xs"
            class="kpi-basic__number__power"
          >({{ donePercentage }}%)</AppText>
        </AppText>
      </div>
      <AppText tag="div" type="black" size="sml" class="kpi-basic__explanation">{{ doneText }}</AppText>
    </div>
  </section>
</template>

<script>
export default {
  name: "KpiBasic",

  props: {
    todo: { type: Number, required: true },
    reminders: { type: Number, required: false },
    done: { type: Number, required: true },
    todoText: { type: String, required: true },
    doneText: { type: String, required: true }
  },
  computed: {
    total() {
      return this.todo + this.done;
    },
    donePercentage() {
      return this.total ? Math.round((this.done / this.total) * 100) : "--";
    }
  }
};
</script>

<style lang="scss" scoped>
.kpi-basic {
  display: flex;
  flex-flow: column;
  flex: 1 0 auto;
  &__top {
    padding: 1rem 0 1rem 0;
  }
  &__bottom {
    padding: 1rem 0 1rem 0;
    border-top: 1px solid rgba($grey, .5);
  }
  &__number {
    display: inline-block;
    position: relative;
    &__power {
      position: absolute;
      bottom: 0.25rem;
      left: calc(100% + 0.4rem);
      white-space: nowrap;
    }
  }
  &__explanation {
    margin-top: 0.25rem;
    font-weight: 300;

    &__icon {
      font-size: 0.65rem;
      color: $black;
      position: relative;
      top: 1px;
      left: 4px;
    }
  }
}

@media (max-width: $breakpoint-max-md) {
  .kpi-basic {
    &__number {
      font-size: 1rem;
      &__power {
        font-size: 0.7rem;
        bottom: 0.1rem;
        left: calc(100% + 0.1rem);
      }
    }
    &__explanation {
      font-size: 0.75rem;
      .icon-gs-filter-solid {
        font-size: 0.6rem;
      }
    }
  }
}

@media (max-width: $breakpoint-max-sm) {
  .kpi-basic {
    flex-flow: row;
    &__top {
      padding: 0;
      flex: 1 0 auto;
      width: 50%;

      justify-content: center;
      align-items: center;

      .icon-gs-filter-solid {
        display: none;
      }
    }
    &__bottom {
      flex: 1 0 auto;
      padding: 0;
      width: 50%;

      justify-content: center;
      align-items: center;

      border-top: 0;
      border-left: 1px solid $grey;
      &__todo {
        .kpi-basic__number__power {
          display: none;
        }
      }
    }
    &__explanation {
      margin-top: 0;
    }
  }
}
</style>
