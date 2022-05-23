<template>
  <div class="page-greybo">
    <nuxt-child/>
  </div>
</template>

<script>
export default {
  layout: 'greybo',

  async fetch({store, req, redirect }) {
    redirect('/grey-bo/test-survey');
  }
}
</script>
