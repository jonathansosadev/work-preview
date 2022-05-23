<template>
    <div class="footer">
        <div class="footer__part-1">
            <slot name="greetings"></slot>
        </div>
        <div class="footer__part-2">
            <slot name="sender"></slot>
        </div>
        <div class="footer__part-3">
            <slot name="cgu"></slot>
        </div>
    </div>
</template>
<script>
export default {
    name:"AutomationFooter",
}
</script>
<style lang="scss" scoped>
.footer {
    font-family: Arial,sans-serif;
    padding: 2rem;
    padding-top: 0;
    font-size: 1.2rem;
    color: $dark-grey;
    line-height: 1.43;

    &__part-1 {
        margin-bottom: 5px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        letter-spacing: normal;
        text-align: left;
    }
    &__part-2 {
        margin-bottom: 5px;
        font-weight: bold;
        font-style: normal;
        font-stretch: normal;
        letter-spacing: normal;
    }
    &__part-3 {
        margin-top: 35px;
        font-size: 12px;
        color: $grey;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        letter-spacing: normal;
        text-align: center;

        a {
            color: $grey;
        }
    }
}
@media (max-width: $breakpoint-min-md) {
    .footer {
      padding: 1rem;
      padding-top: 0;
    }
}
</style>