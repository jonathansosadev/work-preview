<template>
  <div
    class="tag text-align-center border-radius-xxl"
    :class="[
      `bg-color-${background}`,
      `p-${padding}`,
    ]"
  >
    <Icon
      v-if="icon"
      class="mr-xxs"
      :name="icon"
      color="white"
      size="s"
    />
    <span class="
        text-size-caption-2
        text-color-white
        text-weight-bold
        pl-xs
        pr-xs
      "
    >
      {{ content }}
    </span>
  </div>
</template>

<script>
import Icon from "~/components/ui/Icon";

export default {
  name: 'Tag',
  components: {
    Icon
  },
  props: {
    icon: String,
    content: [
      Number,
      String,
      Array
    ],
    background: {
      type: String,
      required: true
    },
    padding: {
      type: String,
      default: 'xxs'
    },
  },
}
</script>

<style lang="scss" scoped>
.tag {
  display: inline-flex;
  align-items: flex-end;
}
</style>
