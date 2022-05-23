<template>
  <IconLabel type="header">
    <template slot="icon">
      <i class="c-icon-saletype__icon" @click="setTypeFilter('NewVehicleSale')" :class="classBinding('NewVehicleSale')"/>
      <i class="c-icon-saletype__icon" @click="setTypeFilter('UsedVehicleSale')" :class="classBinding('UsedVehicleSale')"/>
      <i class="icon-gs-help-question-circle c-icon-saletype__icon c-icon-saletype__icon--fix" @click="setTypeFilter('Unknown')" :class="classBinding('Unknown')"/>
    </template>
    <span :class="classBindingLabel" class="c-icon-saletype__label">{{ label }}</span>
  </IconLabel>
</template>


<script>
import IconLabel from '~/components/global/IconLabel';

export default {
  components: { IconLabel },
  props: {
    value: String,
  },

  data() {
    return {
      filter: this.value,
    }
  },

  computed: {
    label() {
      switch(this.value) {
        case 'NewVehicleSale': return this.$t_locale('components/global/IconLabelFilterSaleType')('VN');
        case 'UsedVehicleSale': return this.$t_locale('components/global/IconLabelFilterSaleType')('VO');
        case 'Unknown': return this.$t_locale('components/global/IconLabelFilterSaleType')('VN ou VO');
        default: return this.$t_locale('components/global/IconLabelFilterSaleType')('Type projet');
      }
    },

    classBindingLabel() {
      return {
        'c-icon-saletype__label--active': this.value !== null,
      }
    },
  },

  methods: {
    setTypeFilter(val) {
      this.filter = (val === this.filter) ? null : val;
      this.$emit('input', this.filter)
    },

    classBinding(val) {
      return [this.value === val ? 'c-icon-saletype__icon--active': '', this.$store.getters[`cockpit/${val}Icon`]];
    },
  }
}
</script>

<style lang="scss" scoped>
.c-icon-saletype {
  &__icon {
    cursor: pointer;
    color: $white;

    &:hover {
      color: $white;
    }

    &--active {
      color: $blue;
    }

    &--fix {
      font-size: 1.15rem !important; // sorry
    }

    font-size: 1.4rem;
  }

  &__label {
    font-size: 0.85714286rem;
    display: none;

    &--active {
      color: $blue;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .c-icon-saletype {
    &__label {
      display: block;
    }
  }
}
</style>
