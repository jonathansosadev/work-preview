<template>
    <div class="button" align="center">
        <span :style="linkStyle">{{ text }}</span>
    </div>
</template>
<script>
export default {
    name:"AutomationCentralButton",
    props: {
    text: String,
    fullWidth: Boolean,
    linkStyle: Object
  },
}
</script>
<style>
</style>