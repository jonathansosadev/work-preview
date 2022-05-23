<template>
  <div class="layout-darkbo">
    <div class="layout-darkbo__main">
      <nuxt/>
    </div>
  </div>
</template>

<script>

export default {
  components: { },
  middleware: ['appMounted', 'authenticated', 'hasAccessToDarkbo']
}
</script>


<style lang="scss" scoped>
.layout-darkbo {
  display: grid;
  height: 100vh;
  width: 100vw;


  grid-template-columns: 20rem 1fr;
  grid-template-rows: 4.5rem 1fr;
  ::placeholder {
    color: gray;
  }

  &__main {
    grid-area: main;
    overflow: auto;
  }
}
</style>
