<template>
    <div>
        <EmailCopyright/>
        <EmailTracking/>
    </div>
</template>

<script>
import EmailCopyright from "../../../components/emails/survey/EmailCopyright.vue";
import EmailTracking from '../../../components/emails/survey/EmailTracking.vue';
export default {
    components: {
        EmailCopyright,
        EmailTracking
    },
     layout() {
        return "email";
    },
}
</script>

<style>

</style>