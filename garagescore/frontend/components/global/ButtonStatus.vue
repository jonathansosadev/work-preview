<template>
  <div class="button-status">
    <Button
      role="button"
      :type="type"
      :disabled="type === 'muted'"
      :link="link"
      :to="to"
      v-on="$listeners"
      class="button-status__button"
      :size="this.$mq === 'sm' ? 'xs' : undefined"
    >
      <template>
        <div class="button-status__button-content">
          <span class="button-status__button-text">
            <slot />
          </span>
        </div>
      </template>
    </Button>
    <div class="button-status__message" v-if="$slots.message">
      <AppText tag="span" :type="messageType" size="sm" align="center">
        <slot name="message" />
      </AppText>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    messageType: String,
    type: String,
    link: Boolean,
    to: [Object, String]
  }
};
</script>

<style lang="scss" scoped>
.button-status {
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  &__button {
    padding: 0.25rem 0.5rem;
    box-sizing: border-box;
  }

  &__message {
    margin-top: 0.5rem;
    text-align: center;
    display: none;
  }
}

@media (min-width: $breakpoint-min-md) {
  .button-status {
    &__button {
      max-width: 11rem;
      width: 80%;
    }

    &__message {
      display: block;
    }
  }
}
</style>
