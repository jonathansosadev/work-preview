<template>
  <nuxt-child
    :modalMixin="modalMixin"
    :navigationDataProvider="navigationDataProvider"
  />
</template>

<script>
  export default {
    props: {
      navigationDataProvider: {
        type: Object,
        required: true,
      },
      modalMixin: {
        type: Object,
        required: true,
      },
    },
  }
</script>
