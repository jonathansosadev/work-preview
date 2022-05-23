<template>
  <IconLabel type="header">
    <template slot="icon">
      <i class="icon-gs-car-old c-icon-pointer" @click="setTypeFilter('UsedVehicleSale')" :class="classBinding('UsedVehicleSale')"/>
      <i class="icon-gs-car c-icon-pointer" @click="setTypeFilter('NewVehicleSale')" :class="classBinding('NewVehicleSale')"/>
      <i class="icon-gs-repair c-icon-pointer" @click="setTypeFilter('Maintenance')" :class="classBinding('Maintenance')"/>
    </template>
    Prestations
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

  methods: {
    setTypeFilter(val) {
      this.filter = (val === this.filter) ? null : val;
      this.$emit('input', this.filter)
    },

    classBinding(val) {
      return {
        'c-icon-pointer--active': this.value === val,
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.c-icon-pointer {
  cursor: pointer;
  &:hover {
    color: $white;
  }

  &--active {
    color: $white;
  }
}
</style>
