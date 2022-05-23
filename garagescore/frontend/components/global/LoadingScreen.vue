<!--  Fullscreen Message  -->
<!--                      -->
<!-- Simple fullscreen message display (not really beautiful though) -->
<!-- Its Z-index is 9001, if an element overlaps it, it means its Z-index is even higher (which should not really be the case) -->

<template>
  <div class="base-fullscreen-loading">
    <div class="background-loading"></div>
    <h3>
      <i class="icon-gs-loading" />
      <br/>
      <br/>
      <span class="loading_message">{{ message }}</span>
    </h3>
  </div>
</template>
<script>
  export default {
    props: [
      'message' // The message to display
    ]
  }
</script>

<style scoped lang="scss">
  @import "../../assets/style/variables.scss";

  .loading {
    &_message {
      color: white;
      font-size: 1.6rem;
    }
  }

  .base-fullscreen-loading {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10000;
  }
  .background-loading {
    background-color: black;
    opacity: 0.5;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  h3 {
    position: absolute;
    color: white;
    opacity: 1;
    width: 100%;
    margin-top: 25%;
    text-align: center;
  }
</style>
