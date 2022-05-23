<template>
  <div class="row">
    <div class="row__item row__item--small">{{ source.garagePublicDisplayName }}</div>
    <div class="row__item row__item--center row__item--smaller"><OvhPhone :phone="source.phone"/></div>
    <div class="row__item row__item--center">{{ source.email }}</div>
    <button class="row__icon-button" @click="$emit('onClickEdit')">
      <i class="icon-gs-edit" />
    </button>
    <button class="row__icon-button" @click="openModalDeleteSource(source)">
      <i class="icon-gs-trash" />
    </button>
  </div>
</template>

<script>
  import OvhPhone from "~/components/cockpit/admin/sources/OvhPhone.vue";

  export default {
  props: {
    source: Object,
    openModalDeleteSource: Function
  },
  components: { OvhPhone }
};
</script>

<style lang="scss" scoped>
.row {
  padding: 0 1rem;
  height: 50px;
  background-color: $white;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba($grey, .5);

  &__item {
    color: $dark-grey;
    font-size: 1rem;
    flex: 1;
    width: 0;
    display: flex;
    overflow: hidden;

    &--center {
      justify-content: center;
      align-items: center;
    }

    &--small {
      flex: 0.47;
    }

    &--smaller {
      flex: 0.3;
    }
  }

  &__icon-button {
    cursor: pointer;
    width: 1.7rem;
    background: rgba($grey, .20);
    border-radius: 3px;
    margin-left: .5rem;
    padding: 0.3rem;
    box-sizing: border-box;
    border: none;
    outline: none;
    
    &:hover {
      background: rgba($grey, .30);
    }
    i {
      font-size: .85rem;
      color: $dark-grey;
      position: relative;
      top: 2px;

      &:hover {
        color: $greyish-brown;
      }
    }
  }
}
</style>
