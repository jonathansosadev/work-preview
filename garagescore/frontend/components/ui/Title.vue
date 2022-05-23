<template>
  <div class="title" :class="classBinding">
    <div class="title__part title__part--icon" v-if="icon">
      <i class="title__icon" :class="icon" />
    </div>
    <div class="title__part title__part--text">
      <h1 class="title__title">
        <slot />
      </h1>
      <div class="title__subtitle" v-if="$slots.subtitle">
        <slot name="subtitle" />
      </div>
    </div>
	<div class="title__hover-title" v-if="hoverTitle">
	  	<span
          class="title__hover-title-tooltip"
          v-tooltip="{ content: hoverTitle, html: true }"
        >
          <i class="icon-gs-help" />
        </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: { type: String },
    type: String,
    direction: String,
    small: Boolean,
    hoverTitle: String
  },

  computed: {
    classBinding() {
      return {
        "title--with-subtitle": this.$slots.subtitle,
        "title--danger": this.type === "danger",
        "title--primary": this.type === "primary",
        "title--black": this.type === "black",
        "title--direction-column": this.direction === "column",
        "title--small": this.small
      };
    }
  }
};
</script>


<style lang="scss" scoped>
.title {
  display: flex;
  flex-direction: row;
  align-items: center;

  &--direction-column {
    .title__part {
      flex-direction: column;
    }

    .title__subtitle {
      margin-left: 0;
      margin-top: 0.5rem;
    }
  }

  &__part {
    &--icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 0.5rem;
    }

    &--text {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      overflow: hidden;
    }
  }

  &__icon {
    font-size: 1.4rem;
  }

  &__hover-title {
    color: #bcbcbc;
    font-size: 0.85rem;
    cursor: pointer;
    position: relative;
    left: 5px;
  }

  &__title {
    margin: 0;
    max-width: 100%;
    font-size: 1.2rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__subtitle {
    color: $black-grey;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &--small {
    .title {
      &__part {
        &--icon {
          margin-right: 0.5rem;
        }
      }
      &__icon {
        font-size: 1.5rem;
      }
      &__title {
        font-size: 1rem;
      }
      &__subtitle {
        font-size: 1rem;
      }
    }
  }

  &--with-subtitle {
    .title__icon {
      font-size: 3rem;
    }
  }

  &--danger {
    .title__title {
      color: $red;
    }

    .title__icon {
      color: $red;
    }
  }

  &--primary {
    .title__title {
      color: $blue;
    }

    .title__icon {
      color: $blue;
    }
  }

  &--black {
    .title__title {
      color: $black;
    }

    .title__icon {
      color: $black;
    }
  }
}
</style>
