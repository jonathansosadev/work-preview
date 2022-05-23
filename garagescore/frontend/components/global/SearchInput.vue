<template>
  <div class="search-input">
    <div class="search-input__search">
      <i class="icon-gs-search" />
      <input :placeholder="placeholder" v-model="search" />
    </div>
  </div>
</template>
<script>
export default {
  name: 'SearchInput',
  data() {
    return {
      search: '',
      debounceTimeout: null
    }
  },
  props:{
    placeholder:{
      type: String,
      default: 'Search'
    },
    searchItems:{
      type: Function,
      default: ()=>console.error('SearchInput.vue :: searchItems not set')
    }
  },
  methods: {
    debounceSearch() {
      if (this.debounceTimeout) {
        clearInterval(this.debounceTimeout)
      }
      const self = this
      this.debounceTimeout = setTimeout( () => {
        self.searchItems(self.search)
      }, 350);
    }
  },
  watch:{
    search(){
      this.debounceSearch()
    },
    
  }
}
</script>
<style lang="scss" scoped>
  .search-input{
    padding: 0.464rem 0.714rem 0.464rem 0.714rem;
    border-radius: 5px;
    background-color: #e8e8e8;
    overflow: hidden;
    &__search{
      display: flex;
      justify-content: center;
      align-items: center;
      i{
        color: $dark-grey;
        margin-right: 0.357rem;
        font-weight: 900;
      }
      input{
        width: 100%;
        height: 1rem;
        border: none;
        color: $dark-grey;
        outline: 0px;
        background-color: #e8e8e8;
        font-size: 0.857rem;
      }
    }
  }
</style>