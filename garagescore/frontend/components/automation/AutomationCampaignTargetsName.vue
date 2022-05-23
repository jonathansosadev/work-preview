<template>
    <span>
        {{ $t_locale('components/automation/AutomationCampaignTargetsName')(target, {}, target) }} {{ displayTag }}
    </span>
</template>
<script>

export default {
  props: {
    target: {
      type: String,
      default: "",
    },
    tag: {
      type: String,
      default: "",
    }
  },

  computed: {
    displayTag () {
      if (this.tag) {
        return `- ${this.$t_locale('components/automation/AutomationCampaignTargetsName')(this.tag, {}, this.tag)}`;
      }
      return "";
    }
 }
}

</script>
<style scoped>
</style>
