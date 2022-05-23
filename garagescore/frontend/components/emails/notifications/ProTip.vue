<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td class="margin"></td>
      <td class="content" :class="`content--${color}`">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <div class="icon">
                <span class="icon__helper"></span>
                <img class="icon__img" :src="payload.gsClient.latestStaticUrl(imgUrl)"/>
              </div>
            </td>
            <td>
              <div class="text-wrapper">
                <div class="text-wrapper__title" :class="`text-wrapper__title--${color}`">
                  {{ title }}
                </div>
                <div class="text-wrapper__text">
                  <span>{{ tip }}</span>
                  <span v-if="link"><slot name="link"></slot></span>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </td>
      <td class="margin"></td>
    </tr>
  </table>
</template>

<script>
import GarageTypes from '~/utils/models/garage.type.js';

export default {
  data() {
    return {
      leadAmount: 4,
      unsatisfiedAmount: 5
    }
  },
  components: { },
  methods: {
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    tip() {
      const amountName = `${this.tipSet}Amount`;
      // [SGS] do not show tooltip unsatisfied1
      const min = this.isVehicleInspection && this.tipSet === 'unsatisfied' ? 2 : 1;
      return this.text || this.$t_locale('components/emails/notifications/ProTip')(`${this.tipSet}${Math.floor(Math.random() * (this[amountName] - min + 1) + min)}`)
    },
    isVehicleInspection() {
      return this.payload && this.payload.garage && this.payload.garage.type === GarageTypes.VEHICLE_INSPECTION;
    }
  },
  props: {
    text: String,
    title: String,
    imgUrl: String,
    color: String,
    tipSet: String,
    link: String,
    // linkLabel: String,
    // preLinkLabel: String
  }
}
</script>


<style lang="scss" scoped>
  .margin {
    width: 20px;
  }
  .content {
    width: 560px;
    border-radius: 3px;
    border: 1px solid black;
    &--green {
      background-color: rgba(0, 176, 80, 0.1);
      border-color: #00b050
    }
    &--red {
      background-color: rgba(208, 67, 49, 0.1);
      border-color: #d04331;
    }
    &--gold {
      background-color: rgba(200, 151, 79, 0.1);
      border-color: #C8974F;
    }
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

  .text-wrapper {
    // padding-right: 15px;
    // min-height: 61px;
    &__title {
      margin-bottom: 7px;
      &--green {
        color: #00b050;
        font-weight: bold;
      }
      &--red {
        color: #d04331;
        font-weight: bold;
      }
      &--gold {
        color: #C8974F;
        font-weight: bold;
      }
    }
    &__text {
      color: $dark-grey;
    }
  }
</style>
