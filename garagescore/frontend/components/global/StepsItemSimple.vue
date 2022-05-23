<template>
  <StepsItem class="steps-item" :class="classBinding">
    <template slot="header">
      <div class="steps-item__header">
        <AppText tag="span" bold>{{ title }}</AppText>
      </div>
    </template>
    <template>
      <i class="steps-item__icon" :class="icon" />
    </template>
    <template slot="footer">
      <div class="steps-item__footer">
        <div class="steps-item__status">
          {{ status }}
        </div>
        <div class="steps-item__status-value">
          {{ value }}
        </div>
      </div>
    </template>
  </StepsItem>
</template>


<script>
export default {
  props: {
    title: String,
    icon: String,
    status: String,
    value: String,
    type: String
  },

  computed: {
    classBinding() {
      return {
        'steps-item--danger': this.type === 'danger',
        'steps-item--primary': this.type === 'primary',
        'steps-item--success': this.type === 'success',
        'steps-item--warning': this.type === 'warning',
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.steps-item {
  &__header {
    color: $black;
    font-size: 1rem;
    text-align: center;
    display: flex;
    align-items: center;
    height: 2rem;
  }

  &__icon {
    font-size: 1.5rem;
    color: $black-grey;
  }

  &__footer { 
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
  }

  &__status {
    color: $black;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  &__status-value {
    color: $dark-grey;
    font-size: 0.85rem;
  }

  &--primary {
    ::v-deep .steps-item__body {
      border-color: $blue;
    }
    .steps-item__icon {
      color: $blue;
    }
    .steps-item__status {
      color: $blue;
    }
  }

  &--danger {
    ::v-deep .steps-item__body {
      border-color: $red;
    }
    .steps-item__icon {
      color: $red;
    }
    .steps-item__status {
      color: $red;
    }
  }

  &--success {
    ::v-deep .steps-item__body {
      border-color: $green;
    }
    .steps-item__icon {
      color: $green;
    }
    .steps-item__status {
      color: $green;
    }
  }

  &--warning {
    ::v-deep .steps-item__body {
      border-color: $yellow;
    }
    .steps-item__icon {
      color: $yellow;
    }
    .steps-item__status {
      color: $yellow;
    }
  }
}
</style>
