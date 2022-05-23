<template>
  <AppText tag="p" class="text-paragraph" :type="classComment" :align="align">
    <span style="white-space: pre-wrap;">{{ showAllText ? text : smallText }}</span>
    <button
      type="button"
      class="text-paragraph__button-view-more"
      @click="toggleText()"
      v-if="text && text.length > limit"
    >
      {{ showAllText ? $t_locale('components/global/TextEmphasis')('showLess') : $t_locale('components/global/TextEmphasis')('showMore') }}
      <i class="text-paragraph__icon" :class="showAllText ? 'icon-gs-up' : 'icon-gs-down'"/>
    </button>
  </AppText>
</template>

<script>
export default {
  props: {
    text: {
      default: '',
      type: String,
    },

    limit: {
      default: 140,
      type: Number,
    },

    align: String,

    classComment: {
      type: String,
      default: "primary"
    }
  },

  data() {
    return {
      showAllText: false,
    }
  },

  computed: {
    smallText() {
      return (this.text && this.text.length > this.limit) ? `${this.text.substr(0, this.limit)}...` : this.text;
    }
  },

  methods: {
    toggleText() {
      this.showAllText = !this.showAllText;
    }
  }
}
</script>

<style lang="scss" scoped>
.text-paragraph {
  font-weight: inherit;
  word-break: break-word;

  &__button-view-more {
    display: inline-block;
    border: none;
    background-color: transparent;
    color: $black-grey;
    outline: 0;
    font-weight: 300;

    &:hover {
      cursor: pointer;
    }
  }

  &__icon {
    font-size: .65rem;
  }
}
</style>

