<template>
  <section class="kpi-digest">
    <div class="kpi-digest__top">
      <AppText tag="div" type="success" size="lgl" extra-bold class="kpi-digest__number">
        {{ renderNumber(done) }}
        <AppText tag="div" type="success" size="xs" class="kpi-digest__number__power">
          ({{ donePercentage }}%)
        </AppText>
      </AppText>
      <AppText tag="div" type="black" size="sml" class="kpi-digest__explanation">
        {{ doneText }}
        <i class="icon-gs-filter-solid kpi-digest__explanation__icon" />
      </AppText>
      <AppText tag="div" type="black" size="sml" class="kpi-digest__explanation">
        {{ $t_locale('components/global/KpiDigest')('affected', { count: renderNumber(total) }) }}
      </AppText>
    </div>

    <div class="kpi-digest__bottom" v-if="displaySalesPerType">
      <AppText
        tag="div"
        type="success"
        class="kpi-digest__bottom__value"
        size="sml"
        extra-bold
        v-if="typeof doneApv === 'number'"
      >{{ renderNumber(doneApv) }} {{ $t_locale('components/global/KpiDigest')('maintenance') }}</AppText>
      <AppText
        tag="div"
        type="success"
        class="kpi-digest__bottom__value"
        size="sml"
        extra-bold
        v-if="typeof doneVn === 'number'"
      >{{ renderNumber(doneVn) }} {{ $t_locale('components/global/KpiDigest')('newCar') }}</AppText>
      <AppText
        tag="div"
        type="success"
        class="kpi-digest__bottom__value"
        size="sml"
        extra-bold
        v-if="typeof doneVo === 'number'"
      >{{ renderNumber(doneVo) }} {{ $t_locale('components/global/KpiDigest')('usedCar') }}</AppText>
    </div>

    <!-- RESPONSIVE MOBILE VERSION, IT'S SO DIFFERENT IT IS EASIER TO HAVE ANOTHER TEMPLATE -->
    <div class="kpi-digest__responsive">
      <div class="kpi-digest__responsive__element" v-if="typeof doneApv === 'number'">
        <AppText
          class="kpi-digest__responsive__element__top"
          tag="div"
          type="success"
          size="sml"
          extra-bold
        >{{ renderNumber(doneApv) }}</AppText>
        <AppText
          class="kpi-digest__responsive__element__bottom"
          tag="div"
          type="black"
          size="sm"
        >{{ $t_locale('components/global/KpiDigest')('maintenance') }}</AppText>
      </div>
      <div class="kpi-digest__responsive__element" v-else>
        <AppText
          class="kpi-digest__responsive__element__top"
          tag="div"
          type="success"
          size="sml"
          extra-bold
        >{{ renderNumber(doneVn) }}</AppText>
        <AppText
          class="kpi-digest__responsive__element__bottom"
          tag="div"
          type="black"
          size="sm"
        >{{ $t_locale('components/global/KpiDigest')('newCar') }}</AppText>
      </div>

      <div class="kpi-digest__responsive__element">
        <AppText
          class="kpi-digest__responsive__element__top"
          tag="div"
          type="success"
          size="sml"
          extra-bold
        >{{ renderNumber(done) }}</AppText>
        <AppText
          class="kpi-digest__responsive__element__bottom"
          tag="div"
          type="black"
          size="sm"
        >{{ doneText }}</AppText>
      </div>

      <div class="kpi-digest__responsive__element" v-if="typeof doneApv === 'number'">
        <AppText
          class="kpi-digest__responsive__element__top"
          tag="div"
          type="success"
          size="sml"
          extra-bold
        >{{ renderNumber(doneVo + doneVn) }}</AppText>
        <AppText
          class="kpi-digest__responsive__element__bottom"
          tag="div"
          type="black"
          size="sm"
        >{{ $t_locale('components/global/KpiDigest')('usedAndNew') }}</AppText>
      </div>
      <div class="kpi-digest__responsive__element" v-else>
        <AppText
          class="kpi-digest__responsive__element__top"
          tag="div"
          type="success"
          size="sml"
          extra-bold
        >{{ renderNumber(doneVo) }}</AppText>
        <AppText
          class="kpi-digest__responsive__element__bottom"
          tag="div"
          type="black"
          size="sm"
        >{{ $t_locale('components/global/KpiDigest')('usedCar') }}</AppText>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "KpiDigest",

  props: {
    done: { type: Number, required: true },
    doneText: { type: String, required: true },
    total: { type: Number, required: true },
    doneApv: { type: Number, required: false },
    doneVn: { type: Number, required: false },
    doneVo: { type: Number, required: false },
    displaySalesPerType: { type: Boolean, default: true },
  },

  computed: {
    donePercentage() {
      return this.total ? Math.round((this.done / this.total) * 100) : "--";
    }
  },
  methods: {
    renderNumber(value) {
      if (isNaN(value)) {
        return "-";
      }
      return value.toString().length > 3
        ? value.toString().replace(/(.*)(\d{3,3}$)/, "$1.$2")
        : value;
    }
  }
};
</script>

<style lang="scss" scoped>
.kpi-digest {
  display: flex;
  flex-flow: column;
  flex: 1 0 auto;
  &__responsive {
    display: none;
  }
  &__top {
    padding: 1rem 0 0.5rem 0;
  }
  &__bottom {
    padding: 0.5rem 0 1rem 0;
    &__value {
      margin-top: 0.25rem;
      &:first-child {
        margin-top: 0;
      }
    }
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
  .kpi-digest {
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

      &__icon {
        font-size: 0.6rem;
      }
    }
    &__bottom {
      &__value {
        font-size: 0.75rem;
      }
    }
  }
}

@media (max-width: $breakpoint-max-sm) {
  .kpi-digest {
    &__top,
    &__bottom {
      display: none;
    }
    &__responsive {
      display: flex;
      flex-flow: row;
      &__element {
        flex: 1 0 auto;
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        &__top {
          font-size: 1rem;
        }
        &__bottom {
          font-size: 0.85rem;
        }
      }
    }
  }
}
</style>
