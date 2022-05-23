<template>
  <div class="tab">
    <div class="tab__header" v-if="$slots.title">
      <AppText tag="span" bold class="tab__title"><slot name="title"/></AppText>
    </div>
    <div class="tab__body" v-if="$slots.body">
      <slot name="body"/>
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
$all-around-margin: 1rem;

.tab {
  background-color: $white;
  min-height: 4rem;
  font-size: 1rem;
  padding: $all-around-margin;
  box-sizing: border-box;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.16);
  border-radius: 3px;

  &__header {
    display: flex;
    align-items: center;
    padding: 0 0 0.5rem 1rem;
    border-bottom: 1px solid $grey;
    margin-bottom: calc(#{$all-around-margin} / 2);
  }

  &__body {
  }
}


</style>
