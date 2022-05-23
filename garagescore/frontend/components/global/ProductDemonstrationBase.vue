<template>
  <section class="demonstration-page">
    <section class="demonstration-page__layout">
      <div class="demonstration-page__layout__content">

          <!-- LEFT PART -->
          <div class="demonstration-page__layout__content__left-part">
            <img
              class="demonstration-page__layout__content__left-part__logo"
              :title="brand.name"
              :src="brand.logo"
              :alt="brand.name"
              v-tooltip="{ content: brand.name }"
            >
            <div class="demonstration-page__layout__content__left-part__top">{{ brand.title }}</div>
            <div class="demonstration-page__layout__content__left-part__separator" :style="{ background: brand.color }"></div>
            <div v-for="benefit in benefits" :key="benefit.title">
              <BenefitService
                :icon="benefit.icon"
                :title="benefit.title"
                :text="benefit.text"
                :logos="benefit.logos"
              />
            </div>
          </div>

          <!-- RIGHT PART -->
          <div class="demonstration-page__layout__content__right-part">

            <img class="demonstration-page__layout__content__right-part__screen" :title="brand.name" :src="brand.picture" :alt="brand.name">

            <div class="demonstration-page__layout__content__right-part__pricing">
              <div class="demonstration-page__layout__content__right-part__pricing--try" :style="{ color: brand.color }">
                {{ hasOnlyMotorbikeOrAgent ? prices.price2 : prices.price1 }}
              </div>
              <div class="demonstration-page__layout__content__right-part__pricing--price">
                {{ prices.perContact }}
              </div>
              <div class="demonstration-page__layout__content__right-part__pricing--offer">
                {{ prices.offer }}
              </div>
            </div>

            <div class="demonstration-page__layout__content__right-part__footer">
              <div v-if="availableGarages.length || isPrioritaryProfile">
                <Button
                  class="demonstration-page__layout__content__right-part__footer__button"
                  type="orange"
                  border="round"
                  size="md"
                  :disabled="loading"
                  @click="askDemonstration"
                >
                  <template v-if="!loading">
                      {{ demonstration.demoButton }}
                  </template>
                  <template v-else>
                    <i class="icon-gs-loading" />
                    {{ demonstration.loadingButton }}
                  </template>
                </Button>

                <div
                  class="demonstration-page__layout__content__right-part__footer__count-garages"
                  v-if="availableGarages.length > 1 || isPrioritaryProfile"
                  :title="availableGaragesToolTip"
                >
                  {{ demonstration.nUnpluggedGarages }}
                </div>
                <div v-else class="demonstration-page__layout__content__right-part__footer__count-garages" :title="availableGaragesToolTip">
                  {{ demonstration.loneUnpluggedGarage }}
                </div>
              </div>
              <div v-else>
                <Button
                  class="demonstration-page__layout__content__right-part__footer__button demonstration-page__layout__content__right-part__footer__button--success" 
                  type="success"
                  border="round"
                  size="md"
                >
                  <template v-if="!loading">
                    <i class="icon-gs-checked-bubble demonstration-page__layout__content__right-part__footer__button--icon"/>
                    {{ demonstration.preordered }}
                  </template>
                </Button>
              </div>
            </div>

          </div>
      </div>
    </section>
  </section>
</template>

<script>
import BenefitService from '~/components/global/BenefitService.vue';

export default {
  name: "ProductDemonstrationBase",
  components: { BenefitService },
  props: {
      loading: Boolean,
      availableGarages: Array,
      availableGaragesToolTip: String,
      brand: Object,
      prices: Object,
      demonstration: Object,
      benefits: Array,
      hasOnlyMotorbikeOrAgent: Boolean,
      isPrioritaryProfile: Boolean,
      askDemonstration: Function,
  }
}
</script>

<style lang="scss" scoped>
.demonstration-page {
  padding: 1rem;

  &__layout {
    min-height: calc(100vh - 5.5rem);
    padding: 2.5rem;
    background-color: $white;
    box-shadow: 0px 0px 3px 0px rgba($black, .15);
    border-radius: 5px;
    box-sizing: border-box;

    &__content {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      &__left-part {
        color: $dark-grey;
        margin: 0;

        &__top {
          font-size: 2rem;
          font-weight: 900;
          color: $custeedBrandColor;
          text-align: left;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        &__logo {
          width: 17rem;
          margin-bottom: 1rem;
        }
        &__separator {
          width: 2.5rem;
          height: 2px;
          border-radius: 5px;
          background: $automation-orange;
          margin-bottom: 2rem;
        }
      }

      &__right-part {
        margin: 0 0 0 2rem;
        min-width: 400px;
        width: 40%;
        text-align: center;
        display: flex;
        flex-flow: column;
        align-items: center;

        &__screen {
          height: 18rem;
          margin: 0 0 2rem 0;
        }

        &__pricing {

          &--price {
            color: $dark-grey;
            font-size: .9rem;
          }

          &--offer {
            margin: 1rem 0 1rem 0;
            color: $dark-grey;
          }

          &--try {
            font-size: 1.4rem;
            font-weight: 900;
            color: $automation-orange;
            margin: 0 0 1rem 0;
          }
        }
        &__footer {
          margin-top: 1rem;

          &__discount {
            font-size: 1.2rem;
            font-weight: 400;
            color: $automation-orange;
            margin: 0 0 1rem 0;
          }

          &__condition {
            font-size: .9rem;
            color: $dark-grey;
            margin-top: 1rem;
          }

          &__cgv {
            font-size: .9rem;
            color: $dark-grey;
            margin-top: 2rem;

            &--bold {
              font-weight: 700;
              text-decoration: underline;
              color: inherit;
            }
          }

          &__button {
            font-size: 1.1rem;
            padding: 0 4rem;
            font-weight: 400;
            margin: auto;

            &--success {
              cursor: default;

              &:hover {
                background-color: darken($green, 2%);;
              }
              i {
                vertical-align: middle;
                margin-right: 0.5rem;
              }
            }
            &--icon {
              position: relative;
              top: 0.35rem;
              margin: 0 1rem 0 0;
              font-size: 1.8rem;
            }
          }

          &__count-garages {
            font-size: 0.8rem;
            color: $black-grey;
            font-style: italic;
            padding: 0.7rem 0 0 0;
            cursor: help;
          }
        }
      }
    }
  }
}
</style>