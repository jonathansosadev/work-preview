<template>
  <div>
    <div class="badge" 
    >
      <span>
        {{valueBadge}}
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props:{
    valueBadge:{
      type: String,
      default: '0'
    }
  }
}
</script>

<style lang="scss" scoped>
  .badge{
    border-radius: 50%;
    background: $greyish-brown;
    color: $white;
    position:relative;
    display: flex;
    justify-content: center;
    width: 0.929rem;
    height: 0.929rem;
    padding: 0.143rem 0.214rem ;
    span{
      font-size: 0.786rem;
      font-weight: bold;
    }
  }
</style>