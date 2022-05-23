<template>
  <div class="source-details">
    <span class="source-details__source" @click="() => $emit('click')">
      <template v-if="index !== null">
        {{ index + 1 }}.
      </template>
      {{ $t_locale('components/global/SourceDetails')(sourceType, {}, sourceType) }}
    </span>
    <span class="source-details__link" @click="handleRowClick">
      <i class="icon-gs-car-repair source-details__link--icon-left" />
      <span>{{ $t_locale('components/global/SourceDetails')("clientProject") }}</span>
      <i class="icon-gs-right source-details__link--icon-right" />
    </span>
  </div>
</template>

<script>
export default {
  props: {
    index: Number,
    sourceType: String,
    baseRoute: String
  },

  data() {
    return {
      currentRoute: null
    };
  },

  mounted() {
    this.currentRoute = this.$route;
  },

  methods: {
    async handleRowClick() {
      this.$store.dispatch("cockpit/setFromRowClick", this.currentRoute);
      this.$router.push({ name: 'cockpit-leads-reviews', params: { leadSource: this.sourceType } });
    }
  }
};
</script>

<style lang="scss" scoped>
.source-details {
  &__link {
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    text-decoration: none;
    font-size: 0.92rem;
    color: #757575;
    margin-top: 1rem;

    &--icon-left {
      margin-right: .5rem;
    }
    &--icon-right {
      margin-left: .2rem;
      position: relative;
      top: 1px;
      font-size: .8rem;
    }
  }
  &__source {
    display: inline-block;
    font-weight: bold;
    font-size: 1.15rem;

    color: $black;
    text-decoration: none;
    font-weight: bold;
    /*cursor: pointer;*/
  }
}
</style>
