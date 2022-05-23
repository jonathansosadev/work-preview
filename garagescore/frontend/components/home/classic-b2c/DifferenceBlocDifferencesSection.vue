<template>
  <div class="differencebox">
    <div class="differencebox__container">
      <div class="differencebox__container__halfcircle">
        <div class="differencebox__container__halfcircle__hide"></div>
        <i :class="iconClass"></i>
      </div>
      <div class="differencebox__container__txt">
        <div class="differencebox__container__txt__title">{{ title }}</div>
        <div>{{ text }}</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.differencebox {
  position: relative;
  padding-right: 15px;
  padding-left: 15px;
  box-sizing: border-box;
  min-height: 1px;
  flex: 0 0 25%;
  max-width: 25%;
  @media (max-width: $breakpoint-min-lg) {
    flex: 0 0 50%;
    max-width: 50%;
    margin-bottom: 30px;
  }
  @media (max-width: $breakpoint-min-md) {
    flex: 0 0 100%;
    max-width: 100%;
  }
  color: white;
  &__container {
    height: 200px;
    border: 1px solid #ffffff;
    display: block;
    margin-bottom: 15px;
    border-radius: 4px;
    &__halfcircle {
      display: flex;
      justify-content: center;
      width: 100%;
      border-top-width: 0;
      margin-left: auto;
      margin-right: auto;
      position: relative;
      &__hide {
        /*margin: auto;*/
        width: 60px;
        height: 30px;
        background-color: #43b9ad;
        margin-top: -1px;
        z-index: 2;
        border: 1px solid white;
        border-radius: 0 0 50px 50px;
        border-top-color: #43b9ad;
      }
      &__icon {
        font-size: 50px;
        float: left;
        position: absolute;
        right: calc(50% - 25px);
        z-index: 3;
        top: -25px;
      }
    }
    &__txt {
      padding-top: 18px;
      color: white;
      text-align: center;
      font-size: 16px;
      padding-left: 15px;
      padding-right: 15px;
      margin: auto;
      line-height: 1.5;
      font-weight: 300;
      &__title {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 5px;
      }
    }
  }
}
</style>
<script>
export default {
  props: ["icon", "title", "text"],
  data() {
    const boxes = [
      {
        title: "100% des clients sondés",
        icon: "icon-gs-groupe-bubble",
        text: "Après leur passage dans l’établissement"
      },
      {
        title: "Nombreux et récents",
        icon: "icon-gs-avis-bubble",
        text:
          "Le reflet de la satisfaction grâce aux centaines d’avis clients sur l’établissement"
      },
      {
        title: "Avis authentiques",
        icon: "icon-gs-cadnat-bubble",
        text:
          "Aucun tiers ne peut modifier ou supprimer l’avis déposé par le client"
      },
      {
        title: "100% des avis publiés",
        icon: "icon-gs-checked-bubble",
        text:
          "Satisfait ou non, les avis sont publiés dans le respect de la norme AFNOR NF Z74-501"
      }
    ];
    return {
      boxes
    };
  },
  computed: {
    iconClass() {
      const c = { differencebox__container__halfcircle__icon: true };
      c[this.icon] = true;
      return c;
    }
  }
};
</script>

