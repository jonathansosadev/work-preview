<template>
  <TableRow class="table-ereput">
    <TableRowCell :style="{ flex: 2 }">
      <span class="table__garage table__garage">
        <template v-if="index !== null">{{ index + 1 }}.</template>
        <template v-if="row && row.externalId">[{{ row.externalId }}] - </template>
        {{ row && row.garagePublicDisplayName }}
        <AppText
          class="table__link--garage--subscription"
          type="danger"
          tag="span"
          v-if="!hasSubscription"
        >
          {{ $t_locale('components/cockpit/e-reputation/garages/TableEreputationRowGarage')('unsubscribed') }}
        </AppText>
      </span>

      <div class="cell-sources">
        <div
          class="img bg-google"
          :class="sourceBtnClass('Google')"
          @click="connect('Google', row)"
          v-tooltip="{ content: $t_locale('components/cockpit/e-reputation/garages/TableEreputationRowGarage')('google') }"
        />
        <div
          class="img bg-facebook"
          :class="sourceBtnClass('Facebook')"
          @click="connect('Facebook', row)"
          v-tooltip="{ content: $t_locale('components/cockpit/e-reputation/garages/TableEreputationRowGarage')('facebook') }"
        />
        <div
          v-if="isFrench"
          class="img bg-pagesjaunes"
          :class="sourceBtnClass('PagesJaunes')"
          @click="connect('PagesJaunes', row)"
          v-tooltip="{ content: $t_locale('components/cockpit/e-reputation/garages/TableEreputationRowGarage')('pagesJaunes') }"
        />
      </div>

      <span @click="onGoToReviews(row.garageId)" class="table__team-link">
        <i class="icon-gs-desktop-star table__team-link--icon-left" />
        <span class="table__team-link--label">{{ $t_locale('components/cockpit/e-reputation/garages/TableEreputationRowGarage')('reviews') }}</span>
        <i class="icon-gs-right table__team-link--icon-right" />
      </span>
    </TableRowCell>
    <TableRowCell center>
      <AppText
        v-if="hasSubscription"
        tag="span"
        type="muted"
        bold
      >
        {{ countReviews }}
      </AppText>
      <span v-else>--</span>
    </TableRowCell>
    <TableRowCell center>
      <AppText
        v-if="hasSubscription"
        tag="span"
        :type="npsTextTypeBinding"
        bold
      >
        {{ scoreNPS }}
      </AppText>
      <span v-else>--</span>
    </TableRowCell>
    <TableRowCell center>
      <AppText
        v-if="hasSubscription"
        tag="span"
        :type="scoreTextTypeBinding"
        bold
      >
        {{ score }}
      </AppText>
      <span v-else>--</span>
    </TableRowCell>
    <TableRowCell center>
      <AppText
        v-if="hasSubscription"
        tag="span"
        :type="recommendPercentTextTypeBinding"
        bold
      >
        {{ recommendPercent }}
      </AppText>
      <!-- <AppText v-if="hasSubscription" tag="span" size="mds">({{ countRecommend }})</AppText> -->
      <span v-else>--</span>
    </TableRowCell>
    <TableRowCell center>
      <template v-if="hasSubscription">
        <AppText
          tag="span"
          :type="promotorsPercentTextTypeBinding"
          bold
        >
          <a
            @click="goToReviews(row.garageId, { scoreFilter: 'Promoter' })"
            class="table__link"
          >
            {{ promotorsPercent }}
          </a>
        </AppText>&nbsp;
        <AppText
          tag="span"
          size="mds"
          type="muted"
        >
          {{ `(${row && row.countPromotors ?  row.countPromotors : 0})` }}
        </AppText>
      </template>
      <span v-else>--</span>
    </TableRowCell>
    <TableRowCell center>
      <template v-if="hasSubscription">
        <AppText
          tag="span"
          :type="neutralsPercentTextTypeBinding"
          bold
        >
          <a
            @click="goToReviews(row.garageId, { scoreFilter: 'Neutral' })"
            class="table__link"
          >
            {{ neutralsPercent }}
          </a>
        </AppText>&nbsp;
        <AppText
          tag="span"
          size="mds"
          type="muted"
        >
          {{ `(${row && row.countNeutrals ?  row.countNeutrals : 0})` }}
        </AppText>
      </template>
      <span v-else>--</span>
    </TableRowCell>
    <TableRowCell center>
      <template v-if="hasSubscription">
        <AppText
          v-if="hasSubscription"
          tag="span"
          :type="detractorsPercentTextTypeBinding"
          bold
        >
          <a
            class="table__link"
            @click="goToReviews(row.garageId, { scoreFilter: 'Detractor' })">
            {{ detractorsPercent }}
          </a>
        </AppText>&nbsp;
        <AppText
          tag="span"
          size="mds"
          type="muted"
        >
          {{ `(${row && row.countDetractors ? row.countDetractors : 0})` }}
        </AppText>
      </template>
      <span v-else>--</span>
    </TableRowCell>
  </TableRow>
</template>

<script>
export default {
  props: {
    row: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    },
    setFromRowClick: {
      type: Function,
      required: true,
    },
    onGoToReviews: {
      type: Function,
      required: true,
    },
    connectSource: {
      type: Function,
      required: true,
    },
    onChangeCurrentGarage: {
      type: Function,
      required: true,
    },
    isFrench: {
      type: Boolean,
    },
  },

  computed: {
    countReviews() {
      return this.row?.countReviews ? this.row?.countReviews : '--';
    },
    score() {
      return this.row?.countReviews ? this.$options.filters.oneDecimal(this.row?.score / 2) : '--';
    },
    scoreNPS() {
      return this.row?.countReviews ? this.$options.filters.oneDecimal(this.row?.scoreNPS) : '--';
    },
    promotorsPercentRaw() {
      return this.row?.countReviews ? this.$options.filters.oneDecimalReputyScore(this.row?.promotorsPercent) : 0;
    },
    neutralsPercentRaw() {
      return this.row?.countReviews ? this.$options.filters.oneDecimalReputyScore(this.row?.neutralsPercent) : 0;
    },

    detractorsPercentRaw() {
      if (!this.row?.countReviews) {
        return 0;
      }
      const value = 100 - this.promotorsPercentRaw - this.neutralsPercentRaw;
      if (value >= 10 || value <= -10) return Math.round(value);
      return Number.parseFloat(Number.parseFloat(value).toFixed(1));
    },
    recommendPercentRaw() {
      return this.row?.countReviewsWithRecommendation
        ? this.$options.filters.oneDecimal(this.row?.recommendPercent)
        : null;
    },

    promotorsPercent() {
      return this.row?.countReviews ? `${this.promotorsPercentRaw}%` : '--';
    },

    neutralsPercent() {
      return this.row?.countReviews ? `${this.neutralsPercentRaw}%` : '--';
    },
    detractorsPercent() {
      return this.row?.countReviews ? `${this.detractorsPercentRaw}%` : '--';
    },
    recommendPercent() {
      return this.row?.countReviewsWithRecommendation ? `${this.recommendPercentRaw}%` : '--';
    },
    npsTextTypeBinding() {
      if (this.row?.scoreNPS >= 60) return 'success';
      else if (this.row?.scoreNPS >= 40) return 'warning';
      return 'danger';
    },
    scoreTextTypeBinding() {
      if (this.score > 4) return 'success';
      else if (this.score > 3) return 'warning';
      return 'danger';
    },
    recommendPercentTextTypeBinding() {
      if (this.recommendPercentRaw > 85) return 'success';
      else if (this.recommendPercentRaw > 75) return 'warning';
      return 'danger';
    },
    promotorsPercentTextTypeBinding() {
      if (this.promotorsPercentRaw > 85) return 'success';
      else if (this.promotorsPercentRaw > 75) return 'warning';
      return 'danger';
    },
    neutralsPercentTextTypeBinding() {
      if (this.neutralsPercentRaw < 10) return 'success';
      else if (this.neutralsPercentRaw < 20) return 'warning';
      return 'danger';
    },
    detractorsPercentTextTypeBinding() {
      if (this.detractorsPercentRaw < 5) {
        return 'success';
      } else {
        if (this.detractorsPercentRaw < 10) {
          return 'warning';
        }
      }
      return 'danger';
    },

    hasSubscription() {
      return this.row?.hasSubscription;
    },
  },

  methods: {
    sourceBtnClass(source) {
      return { off: !this.isConnected(source) };
    },

    isConnected(source) {
      return Boolean(this.row?.kpisBySource[source]?.connection?.connected && this.hasSubscription);
    },
    connect(source, garage) {
      if (this.isConnected(source)) {
        return;
      }
      if (this.hasSubscription) {
        this.connectSource({
          garageId: garage.garageId,
          source,
        });
      } else {
        this.onChangeCurrentGarage(garage.garageId);
      }
    },
    async goToReviews(garageId, filters) {
      await this.setFromRowClick(this.$route);
      await this.$router.push({
        name: 'cockpit-e-reputation-reviews',
        query: { garageId, ...filters },
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.table {
  &__link {
    cursor: pointer;
  }
  &__garage {
    display: block;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 14px;

    font-weight: bold;
    font-size: 1.15rem;
  }

  &__first-cell {
    padding: 1rem 0 1rem !important;
  }

  &__team-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: $dark-grey;
    margin-top: 1rem;
    font-weight: 700;
    cursor: pointer;

    &:hover {
      color: $greyish-brown;
    }

    &--icon-left {
      margin-right: .5rem;
    }
    &--label {
      font-size: 0.92rem;
      font-weight: 700;
    }
    &--icon-right {
      margin-left: .2rem;
      position: relative;
      top: 1px;
      font-size: .8rem;
    }
  }

  ::v-deep .text {
    font-size: 1rem;
  }
}

.cell-sources {
  display: flex;
  align-items: center;
  max-width: 80px;
  width: 100%;
  margin-bottom: 14px;

  .img {
    height: 18px;
    width: 18px;
    &:not(:last-child) {
      margin-right: 13px;
    }
    &.bg-google {
      background: URL('/e-reputation/google-mini.png') top center/cover no-repeat;
    }

    &.bg-facebook {
      background: URL('/e-reputation/facebook-mini.png') top center/cover no-repeat;
    }

    &.bg-pagesjaunes {
      background: URL('/e-reputation/pagesjaunes-mini.png') top center/cover no-repeat;
    }

    &.off {
      cursor: pointer;

      &.bg-google {
        background: URL('/e-reputation/google-mini-gray.png') top center/cover no-repeat;
      }

      &.bg-facebook {
        background: URL('/e-reputation/facebook-mini-gray.png') top center/cover no-repeat;
      }

      &.bg-pagesjaunes {
        background: URL('/e-reputation/pagesjaunes-mini-gray.png') top center/cover no-repeat;
      }

      &:hover {
        filter: none;

        &.bg-google {
          background: URL('/e-reputation/google-mini.png') top center/cover no-repeat;
        }

        &.bg-facebook {
          background: URL('/e-reputation/facebook-mini.png') top center/cover no-repeat;
        }

        &.bg-pagesjaunes {
          background: URL('/e-reputation/pagesjaunes-mini.png') top center/cover no-repeat;
        }
      }
    }
  }
}

@media (max-width: $breakpoint-max-sm) {
  .table {
    &__row-cell {
      &:first-child {
        width: 100%;
        flex: none;
      }
    }

    &__header-item {
      &:first-child {
        display: none;
      }
    }
  }
}
</style>
