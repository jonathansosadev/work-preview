<template>
  <TableRow class="table-banner-info" v-show="!hideBanner">
    <div class="table-banner-info__cell table-banner-info__cell--no-mobile">
      <Notification type="primary" class="notification" @close="hideBanner = true">
        <template slot>
          <span>{{ $t_locale('components/cockpit/leads/reviews/BannerInfo')('asAgent') }}</span>
          &nbsp;
          <span class="bold clickable" @click="goFollowedLeads">{{ $t_locale('components/cockpit/leads/reviews/BannerInfo')('transferredProject') }}</span>
        </template>
      </Notification>
    </div>
  </TableRow>
</template>

<script>
export default {
  data() {
    return {
      hideBanner: false,
    };
  },

  methods: {
    goFollowedLeads() {
      this.$router.push({ name: 'cockpit-leads-followed' });
    },
  },
};
</script>

<style lang="scss" scoped>
$add-padding: 1rem;
.clickable {
  cursor: pointer;
  text-decoration: underline;
}

.table-banner-info {
  width: 100%;

  &__notification {
    width: 100%;
    display: flex;
    padding: $add-padding;
    height: 6rem;
    box-sizing: border-box;
  }

  &__cell {
    width: 100%;
    padding: $add-padding;
    border-bottom: 1px solid $active-cell-color;

    &--grey {
      background-color: $active-cell-color;
      border-bottom: 1px solid $white;
    }

    &--no-mobile {
      display: none;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .table-banner-info {
    &__cell {
      &--mobile-only {
        display: none;
      }

      &--no-mobile {
        display: block;
      }
    }
  }
}
</style>
