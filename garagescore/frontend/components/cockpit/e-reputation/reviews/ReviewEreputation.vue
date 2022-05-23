<template>
  <div class="review">
    <a
      class="garageName"
      @click="setCurrentGarage(garageId)"
      v-if="!isViewOnOneGarageOnly"
    >
      {{ garageNameSafe }}
    </a>
    <div class="customer">
      <AppText
        class="review__title"
        tag="span"
        bold
      >
        {{ customerFullNameSafe }}
      </AppText>
    </div>
    <div class="review__part">
      <div class="review__part-left" v-if="score">
        <AppText
          class="review__subtitle"
          tag="span"
          type="muted"
          v-if="date"
        >
          {{ $d(new Date(date), "cockpit") }}
        </AppText>
        <div style="width:5px;" />
        <StarsScore v-if="hasScore" :score="score" />
      </div>
    </div>
    <div class="review__part review__part--paragraph" v-if="comment && comment !== ''">
      <TextEmphasis
        :text="comment"
        class="review__comment"
        :class="classBindingComment"
      />
    </div>
    <div class="review__part review__part--paragraph" v-else>
      <AppText
        tag="span"
        type="muted"
        size="mds"
        italic
      >
        {{ $t_locale('components/cockpit/e-reputation/reviews/ReviewEreputation')("noComment") }}
      </AppText>
    </div>
  </div>
</template>

<script>
import TextEmphasis from "~/components/global/TextEmphasis";

export default {
  components: { TextEmphasis },
  props: {
    comment: {
      type: String,
      default: "",
    },
    customerFullName: String,
    date: String,
    garageName: String,
    garageId: String,
    rating: Number,
    score: Number,
    cockpitProps: {
      type: Object,
      required: true,
    }
  },

  computed: {
    isViewOnOneGarageOnly() {
      return this.cockpitProps.selectedGarageId;
    },
    hasScore() {
      return (
        typeof this.score !== "undefined"
        && this.score >= 0
        && this.score <= 10
      );
    },
    garageNameSafe() {
      if (this.garageName) {
        return this.garageName || '';
      }
      const garage = this.cockpitProps.allGaragesNotFiltered.find(
        (garage) => garage.id === this.garageId
      );

      return garage?.publicDisplayName || '';
    },
    customerFullNameSafe() {
      return this.customerFullName || this.$t_locale('components/cockpit/e-reputation/reviews/ReviewEreputation')("weAreLegion");
    },
    classBindingComment() {
      if (this.rating > 8) {
        return "review__comment--success";
      }
      if (this.rating > 6) {
        return "review__comment--warning";
      }
      return "review__comment--danger";
    }
  },
  methods: {
    setCurrentGarage(garageId) {
      this.cockpitProps.changeCurrentGarage(garageId);
      this.cockpitProps.refreshRouteParameters();
    }
  },
};
</script>

<style lang="scss" scoped>
.review {
  font-size: 0.9rem;

  &__title {
    margin-right: 0.5rem;
  }

  &__part {
    display: flex;
    align-items: center;

    &--paragraph {
      margin-top: 0.5rem;
      font-weight: 700;
    }

    &--vehicule {
      margin-top: 0.5rem;
    }

    &--customer {
      margin-top: 0.5rem;
    }
  }

  &__comment {
    font-weight: bold;
    line-height: 1.5;

    &--success {
      color: $green;
    }

    &--warning {
      color: $erep-gold;
    }

    &--danger {
      color: $red;
    }
  }

  &__part-left {
    margin-right: 0.5rem;
    display: flex;
  }

  &__paragraph {
    max-width: 35rem;
  }

  &__button {
    display: inline-block;
    border: none;
    background-color: transparent;
    color: $black-grey;
    outline: 0;
    font-weight: 300;
    padding: 0;
    margin: 0;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
  .garageName {
    margin-bottom: 0.5rem;
    color: $dark-grey;
    display: block;

    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }

  .customer {
    margin-bottom: 4px;
  }
}
</style>
