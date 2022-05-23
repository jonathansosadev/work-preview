<template>
    <section class="source-icon">
        <img :src="`/e-reputation/${source}.svg`">
        <AppText v-if="showName" tag="span" type="muted">{{source}}</AppText>
    </section>
</template>

<script>
  export default {
    props: {
      source: String,
      showName: { type: Boolean, default: true }
    }
  }
</script>

<style lang="scss" scoped>
  .source-icon {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;
    img {
      margin-top: 10px;
      width: 25px;
    }
  }
</style>
