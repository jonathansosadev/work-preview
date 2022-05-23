<template>
  <span>{{$t_locale('components/emails/notifications/JobHandler')(jobKey, {}, jobKey)}}</span>
</template>


<script>

export default {
  props: {
    job: String,
  },
  data() {
    return {
      jobKey : this.job.replace(/'/g,'')
    }
  },
}
</script>


<style lang="scss" scoped>

</style>
