<template>
  <div class="team-details">
    <span class="team-details__team">
      <template v-if="index !== null">{{ index + 1 }}.</template>
      {{ name }}
    </span>
    <div class="team-details__garage-name">
      <i class="icon-gs-garage" />
      <span>{{ garageName }}</span>
    </div>
    <span @click="() => $emit('click')" class="team-details__link">
      <i :class="iconName" class="team-details__link--icon-left" />
      <span class="team-details__link--label">{{ $t_locale('components/global/TeamDetails')(`goToReviews-${type || 'default'}`) }}</span>
      <i class="icon-gs-right team-details__link--icon-right" />
    </span>
  </div>
</template>

<script>
export default {
  props: {
    index: Number,
    name: String,
    garageName: String,
    garageId: String,
    baseRoute: String
  },

  data() {
    return {
      currentRoute: null,
      type: null
    };
  },

  mounted() {
    this.currentRoute = this.$route;
    if (this.currentRoute.name.includes('satisfaction')) this.type = 'satisfaction';
    else if (this.currentRoute.name.includes('unsatisfied')) this.type = 'unsatisfied';
    else if (this.currentRoute.name.includes('leads')) this.type = 'leads';
    else if (this.currentRoute.name.includes('contacts')) this.type = 'contacts';
    else this.type = 'default';
  },

  computed: {
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
      
    }
  },

  methods: {
    handleRowClick() {
      this.$store.dispatch("cockpit/setFromRowClick", this.currentRoute);
    }
  }
};
</script>

<style lang="scss" scoped>
.team-details {
  &__team {
    display: inline-block;
    font-weight: 700;
    font-size: 1.15rem;
    color: $black;
    text-decoration: none;
  }

  &__garage-name {
    font-size: 0.92rem;
    color: $grey;
    display: flex;
    align-items: center;
    margin-top: 1rem;

    & > * {
      margin-right: 0.5rem;
    }
  }

  &__link {
    font-size: 1rem;
    display: flex;
    align-items: center;
    text-decoration: none;
    color: $dark-grey;
    margin-top: 1rem;
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
}
</style>