<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td class="margin"></td>
      <td>
        <div class="title">{{ title }}</div><br>
        <div v-for="bullet in list" class="element">
          <span class="label">- {{ bullet.label }}</span>
          <span>&nbsp{{ bullet.item }}</span>
        </div>
        <div class="spacing"></div>
      </td>
      <td class="margin"></td>
    </tr>
  </table>
</template>


<script>

export default {
  data() {
    return {
    }
  },
  components: { },
  methods: {
  },
  computed: {
  },
  props: {
    title: String,
    list: Array
  }
}
</script>


<style lang="scss" scoped>
  .margin {
    width: 20px;
  }
  .title {
    font-weight: bold;
  }
  .element {
    margin-bottom: 10px;
    margin-left: 20px;
    color: $dark-grey
  }
  .label {
    font-weight: bold;
  }
</style>
