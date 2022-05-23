<template>
  <div class="widget-code-snippet">
    <div class="widget-code-snippet__container">
      <template v-if="showCodeSnippet">
        <div class="widget-code-snippet__container__header">
          <AppText tag="div" type="black">
            {{ $t_locale('components/cockpit/admin/widget/WidgetCodeSnippet')('help') }}
          </AppText>
        </div>
        <div id="code" class="widget-code-snippet__container__code">
          <p>
            &lt;script src="{{ baseUrlScript }}/{{ slug }}/enrich.js"&gt;&lt;/script&gt;
            &lt;iframe border="0" scrolling="0" frameBorder="0" src="{{ iframeUrl }}" style="{{ iframeStyle }}" &gt;&lt;/iframe&gt;
          </p>
        </div>
      </template>
    </div>
    <Button
      type="contained-orange"
      class="ml-auto mr-s"
      :disabled="!showCodeSnippet"
      @click="copy"
    >
      <template #left>
        <i class="icon-gs-copy" />
      </template>
      <AppText
        bold
        tag="span"
      >
        {{ $t_locale('components/cockpit/admin/widget/WidgetCodeSnippet')("CodeCopy") }}
      </AppText>
    </Button>
  </div>
</template>

<script>
  export default {
    name: 'WidgetCodeSnippet',
    props: {
      showCodeSnippet: {
        type: Boolean,
        default: false
      },
      slug: String,
      iframeStyle: String,
      baseUrl: String,
      baseUrlScript: String,
      iframeUrl: String,
    },
    methods: {
      copy() {
        const txtCopy = document.querySelector('#code');
        navigator.clipboard.writeText(txtCopy.textContent);
        this.$toast.success(this.$t_locale('components/cockpit/admin/widget/WidgetCodeSnippet')("CodeCopied"));
      }
    }
  }
</script>

<style lang="scss" scoped>
  .widget-code-snippet {

    &__container {
      margin: 1.5rem 1rem 1rem 1rem;
      display: flex;
      flex-wrap: wrap;
      padding: 1.5rem;
      flex-direction: column;
      background: $bg-grey;
      border-radius: 5px;

      &__header {
        margin-bottom: 10px;
      }
      &__code {
        background: $white;
        border-radius: 5px;
        padding: 1rem;
        color: $dark-grey;
        line-height: 1.5;
      }
    }
  }
</style>