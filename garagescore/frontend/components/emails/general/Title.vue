<template>
    <div>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td width="20px"></td>
                <td :style="customStyle" class="title"><div>{{ title }}</div></td>
                <td width="20px"></td>
            </tr>
        </table>
    </div>
</template>
<script>
export default {
 props: {
   title: String,
   customStyle: Object
 }
}
</script>
<style scoped>
.title {
    padding: 21px 0 31px 0;
    display: block;
    font-size: 28px;
    font-stretch: normal;
    line-height: 1.43;
    text-align: center;
    font-family: Arial, sans-serif;
    font-style: normal;
    font-weight: 700;
    color: #000000;
}
</style>