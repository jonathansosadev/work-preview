<template>
  <TableRow>
    <div class="row-customer" :style="{ flex: colspan }">
      <div class="row-customer__content" v-if="unsatisfiedCriterias && unsatisfiedCriterias.length > 0">
        <CardGrey class="row-customer__part row-customer__part--unsatisfaction-criterias">
          <template slot="title">{{ $t_locale('components/global/TableRowUnsatisfiedCriteria')("UnsatisfiedCriteria") }}</template>
          <div class="row-customer__group" v-for="(criteria, index) in unsatisfiedCriterias" :key="index">
            <AppText tag="label" :type="isEmpty(criteria.values) ? 'danger' : ''" class="row-customer__label" bold>
              {{ isEmpty(criteria.values) ? $t_locale('components/global/TableRowUnsatisfiedCriteria')(`long-${criteria.label}`) : `${$t_locale('components/global/TableRowUnsatisfiedCriteria')(criteria.label)} :` }}
            </AppText>
            <AppText tag="span" :type="isEmpty(criteria.values) ? 'muted' : 'danger'" class="row-customer__value row-customer__value--unsatisfied">
              {{ subCriterias(criteria.values) }}
            </AppText>
          </div>
        </CardGrey>
      </div>
    </div>
  </TableRow>
</template>

<script>
import CardGrey from "~/components/global/CardGrey.vue";

export default {
  components: { CardGrey },

  props: {
    unsatisfiedCriterias: {
      required: false
    },

    colspan: Number,
    colspanBg: { type: Number, default: 2 },
    colspanEnd: { type: Number, default: 1 }
  },

  methods: {
    isEmpty(val) {
      return (
        val === "" ||
        !val ||
        val === this.$t_locale('components/global/TableRowUnsatisfiedCriteria')("Undefined") ||
        (Array.isArray(val) && !val.length)
      );
    },
    format(value) {
      return value === "" || !value ? this.$t_locale('components/global/TableRowUnsatisfiedCriteria')("Undefined") : value;
    },
    subCriterias(subCriteria) {
      if (subCriteria) {
        return subCriteria.map(crit => this.$t_locale('components/global/TableRowUnsatisfiedCriteria')(`_${crit}`)).join(", ");
      } 
      return '';
    }
  }
};
</script>

<style lang="scss" scoped>
.row-customer {
  padding: 0;

  &__content {
    display: flex;
    flex-flow: row;
  }

  &__part {
    flex: 1;
    max-width: 34%;
    &:not(:last-child) {
      border-right: 1px solid white;
    }
    &--unsatisfaction-criterias {
      max-width: 100%;
    }
  }

  &__label {
    white-space: nowrap;
  }

  &__value {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    &--unsatisfied {
      white-space: normal;
    }
  }

  &__group {
    padding: 0.5rem 0;

    display: flex;
    flex-flow: column;

    & > & {
      margin-bottom: 1rem;
    }

    & > .row-customer__label {
      margin-right: 0.5rem;
    }
  }
}

.row-bg {
  background-color: $active-cell-color;

  display: none;
}

.row-end {
  display: none;
}

@media (min-width: $breakpoint-min-md) {
  .row-customer {
    &__group {
      flex-flow: row;
    }
  }

  .row-end,
  .row-bg {
    display: unset;
  }
}
</style>
