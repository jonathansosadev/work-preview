<template>
  <div class="dropdown-content"  >
    <div class="dropdown-content__search-block" v-if="searchCallback">
      <div class="dropdown-content__search">
        <i class="icon-gs-search" />
        <input :placeholder="placeholder" v-model="search" ref="search" />
      </div>
    </div>
    <div class="dropdown-content__items custom-scrollbar" ref="content" @scroll="scrollEvent">
      <template v-if="loading">
        <span class="dropdown-content__loading">
          <i class="icon-gs-loading" />
          {{$t_locale('components/ui/DropdownContent')("loading")}}
        </span>
      </template>
      <button
        v-else
        class="dropdown-content__item"
        v-for="(item, index) in filteredItems"
        :key="index"
        @click="changeValue(item)"
        :class="classBindingItem(item)"
      >
        <span v-if="item.link && item.link.to && item.link.label">{{ item.label }}<nuxt-link :to="item.link.to">{{ item.link.label }}</nuxt-link></span> 
        <span v-else>{{ item.label }}</span>
        
        <i class="icon-gs-validation-check-circle dropdown-content__item-icon" v-if="isActive(item)" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    placeholder: { 
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => []
    },
    value: [Object, String, Number],
    withSearch: { 
      type: Boolean, 
      default: false 
    },
    searchCallback: {
      type: Function,
      default: () => ({})
    },
    limit: {
      type: Number,
      default: 0
    },
    scrollCallback: {
      //to implement infinte scroll
      type: Function,
      default: () => ({})
    },
    hasMore:{
      type: Boolean,
      default: false
    },
    link:{
      type: Object,
      default: null
    },
    loading:{
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      search: null
    };
  },

  mounted() {
    this.$refs.search && this.$refs.search.focus();
  },

  computed: {
    filteredItems() {
      const items = this.searchCallback
        ? this.items.filter(i => this.searchCallback(this.search, i))
        : this.items;

      return this.limit ? items.slice(0, this.limit) : items;
    }
  },
  methods: {
    async scrollEvent(evt){
      if(this.hasMore){
        await this.scrollCallback(this.$refs.content)
      }
    },
    isActive(item) {
      return item.key === this.value.key;
    },

    classBindingItem(item) {
      return {
        "dropdown-content__item--active": this.isActive(item)
      };
    },

    changeValue(item) {
      if (item.key !== this.value.key) {
        this.$emit("input", item);
        this.search = "";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown-content {
  border-radius: 5px;
  background-color: $white;
  overflow: hidden;
  min-width: 250px;

  &__search-block {
    box-sizing: border-box;
    margin: 1rem 1rem 7px 1rem;
    border-bottom: 1px solid rgba($grey, 0.5);
  }

  &__search {
    border: 1px solid rgba($grey, 0.5);
    border-radius: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: .5rem;
    padding: 0 0.5rem;

    i {
      font-size: 1rem;
      margin: 0 0.5rem;
      color: $dark-grey;
    }

    input {
      border: none;
      margin: 7px 7px 7px 0px;
      outline: 0px;
      width: 100%;
    }
  }

  &__items {
    max-height: 40vh;
    overflow-y: auto;
    padding-bottom: 0.5rem;
  }
  &__loading{
    display: flex;
    justify-content: center;
    padding: 1rem;
    color: $blue;
  }
  &__item {
    padding: 0.7rem 1rem;
    color: $dark-grey;
    width: 100%;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-weight: 400;

    display: flex;
    flex-direction: row;
    align-items: center;

    &--active {
      color: $blue!important;
      font-weight: 700;
    }

    &:focus,
    &:hover {
      background-color: $bg-grey;
      color: $greyish-brown;
    }

    span {
      flex: 1;
      text-align: left;

      text-overflow: ellipsis;
      max-width: 100%;
      overflow: hidden;
      display: block;
      white-space: nowrap;
    }
  }

  &__item-icon {
    font-size: 1rem;
    margin-left: 3px;
  }
}
</style>
