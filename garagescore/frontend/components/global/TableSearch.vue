<template>
  <div class="table-search">
    <InputBasic :placeholder="$t_locale('components/global/TableSearch')('Search')" validateEvent :value="value" class="table-search__input" v-on="listeners">
      <template slot="right"><i class="icon-gs-search"/></template>
    </InputBasic>
  </div>
</template>


<script>
export default {
  props: {
      value: [String, Number],
  },

  computed: {
    listeners() {
      return {
        input: (event) => {
          this.$emit('input', event.target.value)
        },
        submit: (event) => {
          this.$emit('submit', event.target.value)
        },
        ...this.$listeners,
      };
    }
  }
}
</script>


<style lang="scss" scoped>
.table-search {
  width:100%;
  max-width:20rem;
  &__input {
    width:100%;
    border: none!important;
  }
}

@media (min-width: $breakpoint-min-md) {
  .table-search {
    /*::v-deep .input {*/
      /*&__input {*/
        /*width: 20rem;*/
      /*}*/
    /*}*/
  }
}
</style>
