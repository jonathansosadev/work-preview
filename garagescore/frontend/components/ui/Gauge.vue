<template>
  <div class="gauge" :class="classBindingBackground">
    <div class="gauge__value">{{ computeScore }}</div>
  </div>
</template>


<script>
export default {
  props: {
    value: {
      type: [String, Number]
    },
    baseRating: {
      type: Number,
      default: 10,
      validator: function (value) {
        // Handle only /10 or /5 for now
        return [10, 5].includes(value);
      }
    },
    nobg: Boolean,
    inFolder: Boolean
  },

  computed: {
    classBindingBackground() {
      let floorRating = this.value;
      if (typeof this.value === "string")
        floorRating = floorRating.replace(/,/, ".");
      floorRating = Math.floor(floorRating);
      return {
        "gauge--table": !this.inFolder,
        "gauge--nobg": this.nobg,
        "gauge--bg-1": floorRating === 1,
        "gauge--bg-2": floorRating === 2,
        "gauge--bg-3": floorRating === 3,
        "gauge--bg-4": floorRating === 4,
        "gauge--bg-5": floorRating === 5,
        "gauge--bg-6": floorRating === 6,
        "gauge--bg-7": floorRating === 7,
        "gauge--bg-8": floorRating === 8,
        "gauge--bg-9": floorRating === 9,
        "gauge--bg-10": floorRating === 10
      };
    },
    // [SGS] : display rating /5
    computeScore() {
        return (this.value * this.baseRating) / 10;
    }
  }
};
</script>

<style lang="scss" scoped>
.gauge {
  position: relative;
  background-size: cover;
  height: 26px;
  width: 38px;
  background-image: url("/gauge/0_1.png");

  @for $i from 1 through 10 {
    &--bg-#{$i} {
      background-image: url("/gauge/#{$i}_1.png");
    }
  }

  &--table {
    top: -0.25rem;
  }

  &--nobg {
    background: none !important; //@ What !important ????
  }

  &__value {
    color: $black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1rem;
    font-weight: 900;
  }
}
</style>

