<template>
    <div class="footer">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="20px"></td>
            <td class="footer__greetings">
              <slot name="greetings"></slot>
            </td>
            <td width="20px"></td>
          </tr>
          <tr>
            <td width="20px"></td>
            <td class="footer__sender">
              <slot name="sender"></slot>
            </td>
            <td width="20px"></td>
          </tr>
          <tr>
            <td width="20px"></td>
            <td class="footer__cgu">
              <slot name="cgu"></slot>
            </td>
            <td width="20px"></td>
          </tr>
        </table>
    </div>
</template>
<script>
export default {
 props: {
   title: String,
   customStyle: Object
 }
}
</script>
<style lang="scss" scoped>
  .footer {
    color: $dark-grey;
    &__greetings {
      padding-bottom: 5px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: normal;
      color: $dark-grey;
      text-align: left;
      font-size: 14px;
    }
    &__sender {
      padding-bottom: 30px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: normal;
      font-size: 14px;
      color: $dark-grey;
    }
    &__cgu {
      font-size: 12px;
      color: $grey;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: normal;
      text-align: left;
    }
  }

</style>