<template>
    <div>
        <div class="code">
            <code><pre>{{code}}</pre></code>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        code: String,
  }
}
</script>
<style lang="scss" scoped>
.code {
    font-size: .9rem;
    font-family: Lato, sans-serif;
    line-height: 1.43;
    text-align: left;
    display: block;
    background-color: #f4f5f6;
    overflow-x: auto !important;
    color: #cd3939;
    padding: 0 1rem;
    border-radius: .25rem;
    letter-spacing: 0.4px;
}
</style>