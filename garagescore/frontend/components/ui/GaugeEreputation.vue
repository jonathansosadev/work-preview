<template>
  <div class="gauge" :class="classBindingBackground">
    <div class="gauge__value">
      <span class="value">{{ safeValue }}</span>
      <span class="max" v-if="max">/{{ max }}</span>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    value: {
      type: [Number]
    },
    max: {
      type: [Number]
    },
    safe: Boolean,
    size: String,
    bold: Boolean
  },

  computed: {
    safeValue() {
      if (!this.safe) { return this.value }
      let result = this.value.toString();

      return `${result.length === 3 ? result : `${result}.0`}`;
    },
    classBindingBackground() {
      return {
        'bold': this.bold,
        'xl': this.size === 'xl',
        'gauge--bg-1': this.value < 1,
        'gauge--bg-2': this.value >= 1 && this.value < 1.5,
        'gauge--bg-3': this.value >= 1.5 && this.value < 2,
        'gauge--bg-4': this.value >= 2 && this.value < 2.5,
        'gauge--bg-5': this.value >= 2.5 && this.value < 3,
        'gauge--bg-6': this.value >= 3 && this.value < 3.5,
        'gauge--bg-7': this.value >= 3.5 && this.value < 4,
        'gauge--bg-8': this.value >= 4 && this.value < 4.5,
        'gauge--bg-9': this.value >= 4.5 && this.value < 5,
        'gauge--bg-10': this.value >= 5,
      };
    }
  }
}
</script>

<style lang="scss" scoped>
.gauge {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-size: cover;
  height: 26px;
  width: 38px;
  background-image: url('/gauge/0_1.png');
  color: #757575;
  
  @for $i from 1 through 10 {
    &--bg-#{$i} {
      background-image: url('/gauge/#{$i}_1.png');
    }
  }

  &__value {
    position: absolute;
    top: 40%;
    left: 25%;
    .value {
      font-size: 1rem;
      font-weight: 900;
    }
    .max {
      font-size: 0.8rem;
      font-weight: 900;
    }
  }
}

  .xl {
    height: 35px;
    width: 51px;

    .gauge__value {
      position: absolute;
      top: 44%;
      left: 25%;
      .value {
        font-size: 1.2rem;
        font-weight: 700;
      }
      .max {
        font-size: 0.8rem;
      }
    }
  }

  .bold {
    .gauge__value {
      .value {
        font-weight: 700;
      }
      .max {
        font-weight: 700;
      }
    }
  }
</style>

