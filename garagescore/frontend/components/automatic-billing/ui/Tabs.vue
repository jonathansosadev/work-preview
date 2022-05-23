<template>
  <div class="tabs" v-if="tabs.length > 0">
    <div class="tabs__nav">
      <div class="tabs__nav-item" v-for="(tab, index) in tabs" :key="index" :class="classBinding(index)" @click="setCurrentIndex(index)">
        {{ tab.label }}
      </div>
    </div>
    <div class="tabs__body">
      <div :is="tabs[currentIndex].component" v-bind="tabs[currentIndex].props || {}"/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tabs: Array,
    activeIndex: {
      default: 0,
    }
  },

  data() {
    return {
      currentIndex: this.activeIndex,
    }
  },

  methods: {
    classBinding(index) {
      return {
        'tabs__nav-item--active': this.currentIndex === index,
      }
    },

    setCurrentIndex(index) {
      this.currentIndex = index;
    },
  }
}
</script>

<style lang="scss" scoped>
.tabs {
  width: 100%;
  height: 100%;

  &__nav {
    display: flex;
    flex-flow: row;
    /*margin-left: 2rem;*/
  }

  &__nav-item {
    position: relative;
    z-index: 10;

    background-color: #494949;
    color: white;

    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 1rem 1rem;
    width: 25%;
    border-radius: 5px 5px 0 0;
    // Animation déactivé suite au retour client
    transform: translateY(5px);
    // transition: transform .3s;

    // &:hover {
    //   transform: translateY(0);
    // }

    cursor: pointer;
    font-weight: 400;
    font-size: 1.25rem;

    &--active {
      background-color: white;
      color: #494949;
      transform: translateY(0);
    }
  }

  &__body {
    position: relative;
    background-color: white;
    padding: 1rem 1rem;
    border-radius: 5px;
    z-index: 20;
  }
}
</style>
