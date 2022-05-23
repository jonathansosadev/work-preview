<template>
  <div class="tree">
    <div class="tree__branch" v-for="branch of branches" :key="branch.name">
      <div class="tree__branch__name" @click="toggleFold(branch)">
        <span v-if="branch.folded">
        <i class="icon-gs-right-caret tree__branch__arrow" />
        </span>
        <span v-else>
          <i class="icon-gs-down-caret tree__branch__arrow tree__branch__arrow__active" />
        </span>
        <AppText tag="div" type="black" bold>{{ branch.name }}</AppText>
      </div>
      <tree :node="branch.tree" :showleaves="true" v-if="!branch.folded" :setActiveComponent="setActiveComponent"></tree>
    </div>
    <div class="tree__leaf" v-for="leaf of leaves" :key="leaf.name">
      <div class="tree__leaf__name" @click="setActiveComponent(leaf.component)">{{ leaf.name }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["node", "setActiveComponent" ],
  name: "tree",
  data(){
    const branches = Object.keys(this.node).filter(n => !this.node[n].leaf).map(name => ({
      name,
      hasTree: true,
      tree: this.node[name],
      folded: true,
    }));
    const leaves = Object.keys(this.node).filter(n => this.node[n].leaf).map(name => ({
      name,
      hasTree: false,
      component: this.node[name].component
    }));
    return {
      branches,
      leaves
    }
  },
  mounted() {
    const treeFromUrl = this.$route.hash && this.$route.hash.substring(1).split(',') || null;
    if (!treeFromUrl) return;
    for (const node of treeFromUrl) {
      for (const leaf of this.leaves) {
        if (leaf.name === node) {
          this.setActiveComponent(leaf.component);
        }
      }
      for (const branch of this.branches) {
        if (branch.name === node) {
          branch.folded = false;
        }
      }
    }
  },
  methods: {
    toggleFold(branch) {
      this.$set(branch, 'folded', !branch.folded) ;
    }
  }
}
</script>

<style scoped lang="scss">

.tree {
  padding: 1rem 0 1rem 1.5rem;
  background-color: $white;

  &__branch {
    //background-color: rgba($grey, .2);

    &__name {
      display: flex;
      cursor: pointer;
      margin-top: .5rem;
    }

    &__arrow {
      font-size: 1rem;
      color: $dark-grey;
      margin-right: .5rem;

      &__active {
        color: $blue;
      }
    }
  }
  &__leaf {

    &__name {
      color: $dark-grey;
      cursor: pointer;
      font-size: 1.2rem;
      margin-top: .5rem;
    }
  }
}

</style>
