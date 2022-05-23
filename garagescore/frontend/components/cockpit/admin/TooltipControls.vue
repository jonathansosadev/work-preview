<template>
    <div class="tooltip-control">
      <slot name="content">
      </slot>    
    </div>
</template>
<style lang="scss" scoped>
  .tooltip-control{
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 5.7rem;
    align-items: center;
    top: 2.2rem;
    border-radius: 3px;
    position: absolute;
    padding: 0.4rem 0 .4rem .6rem;
    background-color: $white;
    box-shadow: 0 1px 10px 0 rgba($black, 0.1);
    right: 6px;
    ::before{
      content: "";
      position: absolute;
      height: 10px;
      width: 10px;
      background: white;
      transform: rotate(45deg);
      right: 8px;
      bottom: 20px;
      box-shadow: 0 0px 10px 0 rgba($black, 0.01);
    }
  }
</style>