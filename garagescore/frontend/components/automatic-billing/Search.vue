<template>
  <div class="form-group" style="display: inline-block; width: 40%;">
    <label class="sr-only" for="search-box">Recherche</label>
    <div class="input-group">
      <input type="text" class="form-control" id="search-box" placeholder="Recherche" v-model="searchFilter" @keyup.enter="$emit('input', searchFilter)"/>
      <div class="input-group-addon clickable" @click="$emit('input', searchFilter)">
        <i class="icon-gs-search"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      searchFilter: this.value,
    };
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
