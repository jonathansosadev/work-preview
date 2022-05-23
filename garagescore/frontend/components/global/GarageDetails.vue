<template>
  <div class="garage-details">
    <span class="garage-details__garage" >
      <template v-if="index !== null">{{ index + 1 }}.</template>
      <template v-if="externalId">[{{externalId}}] - </template>
      {{ garageName }}
      <AppText
        v-if="!hasSubscription"
        tag="span"
        type="danger"
        bold
      >&nbsp;
        {{ $t_locale('components/global/GarageDetails')('notSubscribed') }}
      </AppText>
    </span>
    <a
      v-if="!isAutomation"
      class="garage-details__flag"
      :href="certificateUrl"
      :class="classBindingFlag"
      target="_blank"
    >
      <i class="icon-gs-map-flag" />
    </a>
    <span
      v-if="!isAutomation && hasAccessToTeam"
      class="garage-details__link"
      @click="handleRowClick('team')"
    >
      <i
        class="
          icon-gs-group
          garage-details__link--icon-left
        "
      />
      <span>{{ $t_locale('components/global/GarageDetails')('teamDetails') }}</span>
      <i
        class="
          icon-gs-right
          garage-details__link--icon-right
        "
      />
    </span>
    
    <span
      v-if="!isAutomation"
      class="garage-details__link"
      @click="handleRowClick('reviews')"
    >
      <i :class="iconName" class="garage-details__link--icon-left" />
      <span>{{ $t_locale('components/global/GarageDetails')(`reviews-${type}`) }}</span>
      <i
        class="
          icon-gs-right
          garage-details__link--icon-right
        "
      />
    </span>
    <span
      v-if="isAutomation"
      class="garage-details__link"
      @click="handleRowClick('campaigns')"
    >
      <i
        class="
          icon-gs-send
          garage-details__link--icon-left
        "
      />
      <span class="garage-details__link--label">
        {{ $t_locale('components/global/GarageDetails')(`campaigns`) }}
      </span>
      <i
        class="
          icon-gs-right
          garage-details__link--icon-right
        "
      />
    </span>
  </div>
</template>

<script>
export default {
  props: {
    index: Number,
    garageName: String,
    certificateUrl: String,
    certificatePublished: Boolean,
    garageId: String,
    externalId: String,
    baseRoute: String,
    hasSubscription: { type: Boolean, default: true }
  },

  computed: {
    classBindingFlag() {
      return {
        "garage-details__flag--published": this.certificatePublished
      };
    },
    isAutomation() {
      return this.type === 'automation';
    },

    hasAccessToTeam() {
      return this.$store.getters["auth/hasAccessToTeam"];
    },
    iconName() {
      if (this.type === 'satisfaction') {
        return 'icon-gs-chat-bubble';
      } else if (this.type === 'unsatisfied') {
        return 'icon-gs-sad';
      } else if (this.type === 'leads') {
        return 'icon-gs-car-repair';
      } else if (this.type === 'contacts') {
        return 'icon-gs-database';
      }
    },
  },

  data() {
    return {
      currentRoute: null,
      type: 'default'
    };
  },

  mounted() {
    this.currentRoute = this.$route;
    if (this.currentRoute.name.includes('satisfaction')) this.type = 'satisfaction';
    else if (this.currentRoute.name.includes('unsatisfied')) this.type = 'unsatisfied';
    else if (this.currentRoute.name.includes('leads')) this.type = 'leads';
    else if (this.currentRoute.name.includes('automation')) this.type = 'automation';
    else if (this.currentRoute.name.includes('contacts')) this.type = 'contacts';
    else this.type = 'default';
  },

  methods: {
    async handleRowClick(interfaceName) {
      await this.$store.dispatch("cockpit/setFromRowClick", this.$route);
      await this.$store.dispatch("cockpit/changeCurrentGarage", this.garageId);
      await this.$store.dispatch("cockpit/refreshRouteParameters");
      await this.$router.push({ name: `${this.baseRoute}-${interfaceName}` });
    },
  }
};
</script>

<style lang="scss" scoped>
.garage-details {
  &__link {
    font-size: 1rem;
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
  &__flag {
    margin-left: 0.5rem;
    color: $red;
    font-size: 0.9rem;
    text-decoration: none;

    &--published {
      color: $green;
    }
  }
  &__garage {
    display: inline;
    font-weight: bold;
    font-size: 1.15rem;
    color: $black;
    text-decoration: none;
    font-weight: 700;
  }
}
</style>
