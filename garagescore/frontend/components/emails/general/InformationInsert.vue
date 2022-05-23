
<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="information-insert">
    <tr style="margin: 20px;">
      <td class="margin"></td>
      <td class="content" :style="contentStyle">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <div class="icon" v-if="iconUrl">
                <span class="icon__helper"></span>
                <img class="icon__img" :src="iconUrl"/>
              </div>
            </td>
            <td>
              <div class="custom-content" :style="blueHighlightStyle" v-html="htmlContent"></div>
            </td>
          </tr>
        </table>
      </td>
      <td class="margin"></td>
    </tr>
  </table>
</template>

<script>
import { Blue } from '~/assets/style/global.scss';

export default {
  data() {
    return {
    }
  },
  props: {
    color: String,
    htmlContent: String,
    iconUrl: String,
    blueHighlight: Boolean,
    isEditCustomContent: Boolean,
  },
  methods: {
  },
  computed: {
    contentStyle() {
      return {
        'background-color': `${this.color}10`,
        'border-color': this.color
      }
    },
    blueHighlightStyle() {
      if (this.blueHighlight && this.isEditCustomContent) {
        return {
          border: `3px solid ${Blue}`,
        }
      }
    },
  }
}
</script>

<style lang="scss" scoped>
  .margin {
    width: 20px;
  }
  .content {
    word-break:break-word;
    width: 560px;
    border-radius: 3px;
    border: 1px solid black;
    margin: 14px;
    font-size: 14px;
    color: $dark-grey;
    line-height: 1.5;
  }
  .icon {
    margin: 14px;
    height: 61px;
    width: 38px;
    white-space: nowrap;
    text-align: center;
    &__helper {
      display: inline-block;
      height: 100%;
      vertical-align: middle;
    }
    &__img {
      max-height: 100%;
      max-width: 100%;
      vertical-align: middle;
      width: 38px;
    }
  }
  .custom-content {
    padding: 5px;
    margin: 8px;
    border-radius: 4px;
  }
</style>
