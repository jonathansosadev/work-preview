<template>
    <div>
        <h1 :style="customStyle" class="title">{{ title }}</h1>
    </div>
</template>
<script>
export default {
    name:"AutomationTitle",
    props: {
    title: String,
    customStyle: Object
    }
}
</script>
<style scoped>
.title {
    font-size: 1.9rem;
    line-height: 1.43;
    text-align: center;
}
</style>