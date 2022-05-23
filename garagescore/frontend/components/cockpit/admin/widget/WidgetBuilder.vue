<template>
  <Card class="widget-builder mt-m">
    <div class="widget-builder__header">
      <div class="widget-builder__header-part">
        <Title icon="icon-gs-hyperlink">
          {{ translatedTitle }}
        </Title>
      </div>
    </div>
    <div class="widget-builder__body">
      <WidgetForm
        :availableGarages="availableGarages"
        :checkboxLabelStyle="checkboxLabelStyle"
        :garageIds="garageIds"
        :onBackgroundUpdate="setBackground"
        :onBrandUpdate="setBrand"
        :onGroupUpdate="updateGroup"
        :onLanguageUpdate="setLanguage"
        :onShapeUpdate="setShape"
        :onSizeUpdate="setSize"
        :onSlugUpdate="setSlug"
        :selectedGarage="selectedGarage"
      />
      <WidgetIframePreview
        :slug="selectedWidget.slug"
        :iframeStyle="selectedIframeStyle"
        :baseUrl="baseUrl"
        :baseUrlScript="baseUrlScript"
        :iframeUrl="iframeUrl"
      />
    </div>
    <div class="widget-builder__footer">
      <WidgetCodeSnippet
        :slug="selectedWidget.slug"
        :showCodeSnippet="showCodeSnippet"
        :iframeStyle="selectedIframeStyle"
        :baseUrl="baseUrl"
        :baseUrlScript="baseUrlScript"
        :iframeUrl="iframeUrl"
      />
    </div>
  </Card>
</template>

<script>
  import { DarkGrey, Blue } from '~/assets/style/global.scss';
  import WidgetCodeSnippet
    from '~/components/cockpit/admin/widget/WidgetCodeSnippet';
  import WidgetForm from '~/components/cockpit/admin/widget/WidgetForm';
  import WidgetIframePreview
    from '~/components/cockpit/admin/widget/WidgetIframePreview';
  import { makeApolloMutations } from '~/util/graphql';
  import { garagesValidator } from '~/utils/components/validators';

  export default {
    name: 'WidgetBuilder',
    components: {
      WidgetForm,
      WidgetIframePreview,
      WidgetCodeSnippet
    },
    props: {
      availableGarages: {
        type: Array,
        default: () => [],
      },
      optionSelected: {
        type: String,
        default: 'garages'
      },
      garageIds: {
        required: true,
        validator: garagesValidator,
      },
      selectedTags:{
        type: Array,
        default: () => []
      },
      selectedGarage: {
        type: Object,
        required: true,
      },
    },

    data() {
      return {
        selectedWidget: {
          shape: 'rectangle',
          size: 'xsmall',
          language: 'fr-fr',
          brand: 'garagescore',
          background: true,
          slug: null,
        },
        wwwUrl: '',
        isGroupSlug: false,
        shapeOptions: {
          value: 'rectangle',
          sizes: [
            { value: 'xsmall', width: '130', height: '157' },
            { value: 'small', width: '180', height: '218' },
            { value: 'medium', width: '265', height: '321' },
            { value: 'large', width: '350', height: '424' },
            { value: 'xlarge', width: '400', height: '485' },
          ]
        },
        width: '130',
        height: '157'
      };
    },

    computed: {
      translatedTitle() {
        return this.$t_locale(
          'components/cockpit/admin/widget/WidgetBuilder'
        )("title");
      },
      checkboxLabelStyle() {
        const background = !this.selectedWidget.background;
        if (background) {
          return `color: ${Blue};font-weight: 700;`;
        }
        return `color: ${DarkGrey}; font-weight: 700;`;
      },
      selectedIframeStyle() {
        return `width:${this.width}px;height:${this.height}px;`;
      },
      showCodeSnippet() {
        return !!(this.selectedWidget.slug);
      },
      baseUrlScript() {
        const wwwUrl = this.selectedGarage.wwwUrl;
        const type = this.isGroupSlug ? 'group' : 'garage';
        return `${wwwUrl}/seo/${type}`;
      },
      baseUrl() {
        const wwwUrl = this.selectedGarage.wwwUrl;
        const type = this.isGroupSlug ? 'group' : 'garage';
        return `${wwwUrl}/widget/${type}`;
      },
      iframeUrl() {
        const shape = this.selectedWidget.shape;
        const size = `size=${this.selectedWidget.size}`;
        const background = `background=${this.selectedWidget.background}`;
        const brand = `brand=${this.selectedWidget.brand}`;
        const locale = `locale=${this.selectedWidget.language}`;
        const url = `${this.baseUrl}/${this.selectedWidget.slug}/${shape}`;

        return `${url}?${size}&${background}&${locale}&${brand}`;
      }
    },
    methods: {
      setSlug(value) {
        this.selectedWidget.slug = value;
      },
      setShape(value) {
        this.selectedWidget.shape = value.value;
        this.shapeOptions = value;
        this.setSize(this.selectedWidget.size);
      },
      setSize(size) {
        this.selectedWidget.size = size;

        if ('sizes' in this.shapeOptions) {
          const matchingSize = this.shapeOptions.sizes.find(
            (option) => option.value === size
          );

          const { height, width } = matchingSize;
          this.height = height;
          this.width = width;
        }
      },
      setLanguage(value) {
        this.selectedWidget.language = value;
      },
      setBrand(value) {
        this.selectedWidget.brand = value;
      },
      setBackground(value) {
        this.selectedWidget.background = value;
      },
      async updateGroup(garageIds) {
        const hasManyGarageIds = garageIds.length > 1;
        if (hasManyGarageIds) {
          await this.addWidgetGroup(garageIds);
        }
        this.isGroupSlug = hasManyGarageIds;
      },
      async addWidgetGroup(garageIds) {
        const request = {
          name: 'WidgetGroupCreateWidgetGroup',
          args: { garageIds },
          fields:
            `newWidgetGroup
              widgetGroup {
                id
                garageIds
              }
            `
        };
        const result = await makeApolloMutations([request]);
        const id = result.data.WidgetGroupCreateWidgetGroup.widgetGroup.id;
        this.selectedWidget.slug = id;
        return id;
      },
    }
  }
</script>

<style lang="scss" scoped>
  .widget-builder {
    display: flex;
    height: auto;
    flex-direction: column;

    &__header {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding-bottom: 0.7rem;
      padding-left: 1rem;
      border-bottom: 1px solid rgba($grey, .5);
      overflow: hidden;
    }
    &__body {
      width: 100%;
      margin-top: 1.5rem;
      display: flex;
      flex-wrap: wrap;
      padding: 0 1rem;
      box-sizing: border-box;
    }
  }
</style>
