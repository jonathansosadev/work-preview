<template>
  <TableRow>
    <div class="row__cell" :style="{ flex: colspan }">
      <div class="row__card">
        <CardGrey>
          <template slot="title">{{ $t_locale('components/global/TableRowFollowUp')('answer') }}</template>

          <div class="row__card-part">
            <div class="row__group">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowUp')('followupDetails') }}</AppText>
              <AppText tag="span" type="primary">
                {{ sendDate ? dateFormat(sendDate) : $t_locale('components/global/TableRowFollowUp')('notSentYet') }}
              </AppText>
            </div>
            <div class="row__group">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowUp')("answerDate") }}</AppText>
              <AppText tag="span" type="primary">
                {{ responseDate ? dateFormat(responseDate) : $t_locale('components/global/TableRowFollowUp')('noAnswer') }}
              </AppText>
            </div>
          </div>
          <div class="row__card-part" v-if="responseDate">
            <AppText tag="h1" class="row__title" type="danger" bold>
              {{ $t_locale('components/global/TableRowFollowUp')('answerDetails') }}
            </AppText>
            <div class="row__group">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowUp')('staff') }}</AppText>
              <AppText tag="span" type="primary" v-if="responseDate">
                {{ transformedResolved }}
              </AppText>
            </div>
            <div class="row__group">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowUp')('recontacted') }}</AppText>
              <AppText tag="span" type="primary" v-if="responseDate">
                {{ transformedHasCustomerBeenRecontacted }}
              </AppText>
            </div>
            <div class="row__group">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowUp')('modification') }}</AppText>
              <AppText tag="span" type="primary">
                {{ $t_locale('components/global/TableRowFollowUp')(changeEvaluationFormat) }}
              </AppText>
            </div>
            <div class="row__group" v-if="comment">
              <AppText tag="span">{{ $t_locale('components/global/TableRowFollowUp')('comment') }}</AppText>
              <AppText tag="span" type="primary">{{ comment }}</AppText>
            </div>
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
    sendDate: String,
    responseDate: String,
    hasCustomerBeenRecontacted: String,
    comment: String,
    resolved: String,
    changeEvaluation: [String, Boolean],

    colspan: Number,
    colspanBg: Number,
    colspanEnd: { type: Number, default: 1 }
  },

  methods: {

    dateFormat(val) {
      if (!val) return '';
      return this.$t_locale('components/global/TableRowFollowUp')('dateFormat', {
        date: this.$moment(val).format('DD/MM/YYYY'),
        time: this.$moment(val).format('HH:mm')
      });
    }
  },

  computed: {
    changeEvaluationFormat() {
      return this.changeEvaluation ? 'yes' : 'no';
    },
    transformedResolved() {
      // transformed can have strange behavior
      switch (this.resolved) {
        case 'Resolved':
          return this.$t_locale('components/global/TableRowFollowUp')('yes');

        case 'NotResolved':
          return this.$t_locale('components/global/TableRowFollowUp')('no');

        case 'InProgress':
          return this.$t_locale('components/global/TableRowFollowUp')('inProgress');

        default:
          return this.$t_locale('components/global/TableRowFollowUp')(this.resolved);
      }
    },
    transformedHasCustomerBeenRecontacted() {
      if (
        this.hasCustomerBeenRecontacted === true ||
        this.hasCustomerBeenRecontacted === 'true'
      ) {
        return this.$t_locale('components/global/TableRowFollowUp')('yes');
      }
      if (
        this.hasCustomerBeenRecontacted === false ||
        this.hasCustomerBeenRecontacted === 'false'
      ) {
        return this.$t_locale('components/global/TableRowFollowUp')('no');
      }
      return this.$t_locale('components/global/TableRowFollowUp')(this.hasCustomerBeenRecontacted);
    }
  }
};
</script>

<style lang="scss" scoped>
.row {
  &__cell {
    padding: 0;
  }

  &__card-part {
    margin-bottom: 1rem;
  }

  &__group {
    *:not(:last-child) {
      margin-right: 0.5rem;
    }

    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }

  &__title {
    font-size: 1rem;
    margin-bottom: 1.25rem;
    text-decoration: underline;
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
  .row-end,
  .row-bg {
    display: unset;
  }
}
</style>
