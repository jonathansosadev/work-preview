<template>
  <Tile class="tile-purchase-project">
    <Title
      class="tile-purchase-project__header"
      icon="icon-gs-car-repair"
    >
      {{ $t_locale('components/cockpit/dashboard/TilePurchaseProject')('headerTitle') }}
    </Title>
    <div class="tile-purchase-project__padding-bar" />
    <div class="tile-purchase-project__body" :class="classBindingStats">
      <template v-if="hasRights">
        <Stats
          :value="kpiByPeriodSingle.countLeads"
          blueOnly
        >
          <template slot="label">{{ $t_locale('components/cockpit/dashboard/TilePurchaseProject')('leads') }}</template>
          <template v-if="hasRights" slot="subtitle">
            <InlineList class="tile-purchase-project__details">
              <AppText
                tag="li"
                type="muted"
                nowrap
              >
                {{ kpiByPeriodSingle.countLeadsApv | renderNumber }}
                {{ $t_locale('components/cockpit/dashboard/TilePurchaseProject')('apv') }}
              </AppText>
              <AppText
                tag="li"
                type="muted"
                nowrap
              >
                {{ kpiByPeriodSingle.countLeadsVn | renderNumber }}
                {{ $t_locale('components/cockpit/dashboard/TilePurchaseProject')('vn') }}
              </AppText>
            </InlineList>
            <br/>
            <InlineList class="tile-purchase-project__details">
              <AppText
                tag="li"
                type="muted"
                nowrap
              >
                {{ kpiByPeriodSingle.countLeadsVo | renderNumber }}
                {{ $t_locale('components/cockpit/dashboard/TilePurchaseProject')('vo') }}
              </AppText>
              <AppText
                tag="li"
                type="muted"
                nowrap
              >
                {{ kpiByPeriodSingle.countLeadsUnknown | renderNumber }}
                {{ $t_locale('components/cockpit/dashboard/TilePurchaseProject')('undefined') }}
              </AppText>
            </InlineList>
          </template>
        </Stats>
      </template>
      <template v-else>
        <div class="tile-purchase-project__part">
          <AppText
            align="center"
            tag="span"
            type="muted"
          >
            {{ $t_locale('components/cockpit/dashboard/TilePurchaseProject')('unavailable') }}
          </AppText>
          <Button
            @click="subscribe"
            class="tile-purchase-project__button-link"
            type="link"
          >
            <span class="tile-purchase-project__underline">
              {{ $t_locale('components/cockpit/dashboard/TilePurchaseProject')('subscribe') }}
            </span>
          </Button>
        </div>
      </template>
    </div>
    <InterfaceLink
      v-if="hasRights"
      :routename="'cockpit-leads-garages'"
      :valid="hasAccessToLeads"
      class="tile-solved-unsatisfied-period__link"
    >
      {{ $t_locale('components/cockpit/dashboard/TilePurchaseProject')('goTo') }}
    </InterfaceLink>
  </Tile>
</template>

<script>
export default {
  props: {
    authorizations: {
      type: Object,
      default: () => ({}),
    },
    closeModal: {
      type: Function,
      required: true,
    },
    kpiByPeriodSingle: {
      type: Object,
      required: true,
    },
    hasAccessToLeads: {
      type: Boolean,
      required: true,
    },
    openModal: {
      type: Function,
      required: true,
    }
  },
  methods: {
    subscribe() {
      this.openModal({
        component: "ModalSubscriptionLeads",
        props: {
          isKPI: true,
          onClose: this.closeModal,
        },
      });
    }
  },
  computed: {
    classBindingStats() {
      return {
        "tile-purchase-project__body--hide-mobile tile-purchase-project__body--no-content": !this.hasRights
      };
    },
    hasRights() {
      if(!this.authorizations.hasLeadAtLeast) {
        return false;
      } // subscriptions.Lead
      if(this.authorizations.hasMaintenanceAtLeast) {
        return true;
      } // subscriptions.Maintenance
      if(this.authorizations.hasViAtLeast) {
        return true;
      } //subscriptions.VehicleInspection
      return false;
    },
  }
};
</script>

<style lang="scss" scoped>
.tile-purchase-project {
  ::v-deep .button {
    height: auto;
  }

  &__padding-bar {
    // IE hack for height 1px
    padding: 1px 0px 0px 0px;
    height: 0px;

    background-color: $light-grey;
    width: 100%;
  }

  &__link {
    margin-top: 10px;
    text-align: right;
    color: $orange;
    text-decoration: none;
    width: 100%;
    padding-right: 14px;
  }

  &__details {
    margin-bottom: 0 !important;
  }

  &__header {
    justify-content: center;
    margin-bottom: 1rem;
  }

  &__body {
    display: flex;
    flex-flow: column;
    justify-content: center;
    margin-top: 16.5px;

    & > *:not(:first-child) {
      margin-top: 2rem;
    }
  }

  &__stats {
    &--hide-mobile {
      display: none;
    }
  }

  &__part {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 19px;
  }

  &__underline {
    position: relative;

    &:after {
      position: absolute;
      content: "";
      background-color: $blue;
      width: 100%;
      height: 1px;
      bottom: 0px;
      right: 0px;
      left: 0px;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .tile-purchase-project {
    &__header {
      justify-content: center;
    }

    &__body {
      flex-flow: column;
      align-items: flex-start;
      height: 100%;
      justify-content: space-around;

      & > *:not(:first-child) {
        margin-top: 0px;
      }
    }

    &__body--no-content {
      margin-top: 0;
    }
  }
}
</style>
