<template>
  <div class="widget-iframe custom-scrollbar">
    <template v-if="slug">
      <script
        :src="`${baseUrlScript}/${slug}/enrich.js`"
        type="application/javascript"
      ></script>
      <div class="iframe-wrapper">
        <iframe
          scrolling="no"
          frameBorder="0"
          border="0"
          :src="previewIframeUrl"
          :style="iframeStyle"
        >
        </iframe>
      </div>
    </template>
    <template v-else>
      {{ $t_locale('components/cockpit/admin/widget/WidgetIframePreview')("noGarage") }}
    </template>
  </div>
</template>

<script>
  export default {
    name: 'WidgetIframePreview',
    props: {
      slug: String,
      iframeStyle: String,
      baseUrlScript: String,
      iframeUrl: String,
    },

    computed: {
      previewIframeUrl() {
        return (
          this.iframeUrl
            ? `${this.iframeUrl}&preview=true`
            : '#'
        );
      }
    },
  }
</script>

<style lang="scss" scoped>
  .widget-iframe {
    width: calc(50% - 4rem);
    margin-left: 2rem;
    min-height: 100%;
    background: #ffffff;
    border: 1px solid rgba(188, 188, 188, 0.5);
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    overflow-x: auto;

    & .iframe-wrapper {
      min-width: 100%;
      pointer-events: none;
      text-align: center;
      & iframe {
        margin: auto;
      }
    }
  }
</style>
