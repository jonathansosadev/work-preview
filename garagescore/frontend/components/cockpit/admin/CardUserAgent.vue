<template>
  <Card class="card-user-agent">
    <div class="card-user-agent__header">
      <div class="card-user-agent__header-part">
        <Title icon="icon-gs-garage">{{$t_locale('components/cockpit/admin/CardUserAgent')("agents")}} ({{ agents.length }})</Title>
      </div>
    </div>
    <div class="card-user-agent__body">
      <div class="card-user-agent__item" v-for="agent in slicedAgents" :key="agent.id">
        <span class="card-user-agent__item-label">{{ agent.publicDisplayName }}</span>
      </div>
    </div>
    <div class="card-user-agent__footer">
      <Button type="success" @click="displayMore" size="sm" v-if="agentDisplayCount < agents.length">{{$t_locale('components/cockpit/admin/CardUserAgent')("LoadMore")}}</Button>
    </div>
  </Card>
</template>


<script>
export default {
  props: {
    agents: { type: Array, default: () => ([]) }
  },

  data() {
    return {
      agentDisplayCount: 10
    }
  },

  watch: {
  },

  methods: {
    displayMore() {
      this.agentDisplayCount += 10;
    }
  },

  computed: {
    slicedAgents() {
      return this.agents.slice(0, this.agentDisplayCount);
    }
  }
}
</script>

<style lang="scss" scoped>
$item-bcg: #f5f5f5;
$item-bdr: $light-grey;

.card-user-agent {
  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 0.7rem;
    padding-left: 1rem;
    border-bottom: 1px solid rgba($grey, .7);
  }

  &__header-part {
    display: flex;
    align-items: center;
  }


  &__body {
    margin-top: .5rem;
    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    border: 2px solid $item-bdr;
    background-color: $item-bcg;
    padding: 0.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0.5rem;
    box-sizing: border-box;

    min-height: 40px; // vue-multiselect height
  }

  &__item-label {
    font-size: 0.8rem;
    margin-right: 0.5rem;
    margin-left: 0.5rem;
    white-space: nowrap;
    user-select: none;
  }

  &__footer {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
@media (max-width: $breakpoint-min-md) {
  .card-user-agent {
    &__header {
      padding-left: 0;
    }
  }
}
</style>
