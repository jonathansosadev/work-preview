<template>
  <button class="button" @click="$emit('click')">
    <i class="icon-gs-add-outline-circle"></i>
    <span>{{ $t_locale('components/cockpit/admin/sources/AddSourceButton')('configure') }}</span>
  </button>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.button {
  cursor: pointer;
  outline: none;
  width: 100%;
  height: 40px;
  border-radius: 3px;
  border: dashed 1px $grey;
  background-color: $white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $dark-grey;
  i {
    margin-right: 7px;
    font-size: 21px;
  }
  span {
    font-size: 13px;
  }
}
</style>
