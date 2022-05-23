<template>
  <div class="widget-form">
    <div class="widget-form__tabs">
      <DropdownGarageFilter
        class="mb-l"
        :labelTop="$tl('garage')"
        :availableGarages="availableGarages"
        :garages="garagesOptions"
        :applyItemsSelected="updateTemporarySelectedGarages"
        :selectedGarageIds="temporarySelectedGarages"
        :setGarageFilterMode="setGarageFilterMode"
        :optionSelected="temporaryOptionSelected"
        :selectedTags="temporarySelectedTags"
        :setSelectedTags="setSelectedTags"
        :icon="false"
        :saveOption="false"
        type="new-design-flat"
        width="max-width"
        height="md"
      />
      <div class="widget-form__tabs__field-group mt-l">
        <div class="widget-form__tabs__field-group__field">
          <DropdownSelector
            :labelTop="$tl('shape')"
            v-model="widget.shape.value"
            :title="widget.shape.title"
            :items="widget.shape.options"
            :callback="setShape"
            type="new-design-flat"
            size="max-width"
            :active="true"
          />
        </div>
        <div class="widget-form__tabs__field-group__field">
          <DropdownSelector
            :labelTop="$tl('size')"
            v-model="widget.size.value"
            :title="widget.size.title"
            :items="widget.size.options"
            :callback="setSize"
            type="new-design-flat"
            size="max-width"
            :active="true"
          />
        </div>
      </div>
      <div class="widget-form__tabs__field-group mt-l">
        <div class="widget-form__tabs__field-group__field">
          <DropdownSelector
            :labelTop="$tl('language')"
            v-model="widget.language.value"
            :title="widget.language.title"
            :items="widget.language.options"
            :callback="setLanguage"
            type="new-design-flat"
            size="max-width"
            :active="true"
          />
        </div>
        <div class="widget-form__tabs__field-group__field">
          <DropdownSelector
            :labelTop="$tl('brand')"
            v-model="widget.brand.value"
            :title="widget.brand.title"
            :items="widget.brand.options"
            :callback="setBrand"
            type="new-design-flat"
            size="max-width"
            :active="true"
          />
        </div>
      </div>
      <CheckBox
        class="mt-l"
        :label="$tl('background')"
        :labelStyle="checkboxLabelStyle"
        :checked="!widget.background"
        @change='setBackground'
      />
    </div>
  </div>
</template>

<script>
  import DropdownGarageFilter from '~/components/global/DropdownGarageFilter';
  import { sortArrayObject } from '~/util/arrayTools.js';
  import { garagesValidator } from '~/utils/components/validators';
  import DropdownSelector from '~/components/global/DropdownSelector';

  export default {
    name: 'WidgetForm',
    components: {
      DropdownGarageFilter,
      DropdownSelector,
    },
    props: {
      availableGarages: {
        type: Array,
        default: () => [],
      },
      selectedGarage: {
        type: Object,
        required: true,
      },
      garageIds: {
        required: true,
        validator: garagesValidator,
      },
      checkboxLabelStyle: String,
      onBackgroundUpdate: {
        type: Function,
        required: true,
      },
      onBrandUpdate: {
        type: Function,
        required: true,
      },
      onGroupUpdate: {
        type: Function,
        required: true,
      },
      onLanguageUpdate: {
        type: Function,
        required: true,
      },
      onShapeUpdate: {
        type: Function,
        required: true,
      },
      onSizeUpdate: {
        type: Function,
        required: true,
      },
      onSlugUpdate: {
        type: Function,
        required: true,
      },
    },

    mounted() {
      this.setGarageIds();
    },

    data() {
      const prefix = 'components/cockpit/admin/widget/WidgetForm';
      this.$tl = (key) => this.$t_locale(prefix)(key);

      return {
        temporarySelectedGarages: [],
        temporaryOptionSelected: this.optionSelected,
        temporarySelectedTags: this.selectedTags,

        widget: {
          shape: {
            value: 'rectangle',
            title: this.$tl('rectangle'),
            options: [
              {
                label: this.$tl('rectangle'),
                value: 'rectangle',
                sizes: [
                  { value: 'xsmall', width: '130', height: '157' },
                  { value: 'small', width: '180', height: '218' },
                  { value: 'medium', width: '265', height: '321' },
                  { value: 'large', width: '350', height: '424' },
                  { value: 'xlarge', width: '400', height: '485' },
                ]
              },
              {
                label: this.$tl('vertical'),
                value: 'vertical',
                sizes: [
                  { value: 'xsmall', width: '105', height: '212' },
                  { value: 'small', width: '125', height: '252' },
                  { value: 'medium', width: '155', height: '313' },
                  { value: 'large', width: '175', height: '353' },
                  { value: 'xlarge', width: '198', height: '393' },
                ]
              },
              {
                label: this.$tl('banner'),
                value: 'banner',
                sizes: [
                  { value: 'xsmall', width: '338', height: '46' },
                  { value: 'small', width: '468', height: '62' },
                  { value: 'medium', width: '598', height: '94' },
                  { value: 'large', width: '728', height: '94' },
                  { value: 'xlarge', width: '858', height: '110' },
                ]
              },
            ]
          },
          size: {
            value: 'xsmall',
            title: this.$tl('xsmall'),
            options: [
              {
                label: this.$tl('xsmall'),
                value: 'xsmall'
              },
              {
                label: this.$tl('small'),
                value: 'small'
              },
              {
                label: this.$tl('medium'),
                value: 'medium'

              },
              {
                label: this.$tl('large'),
                value: 'large'
              },
              {
                label: this.$tl('xlarge'),
                value: 'xlarge'
              },
            ],
          },
          language: {
            value: 'fr-fr',
            title: this.$tl('fr-fr'),
            options: [
              {
                value: 'fr-fr',
                label: this.$tl('fr-fr'),
              },
              {
                value: 'en-us',
                label: this.$tl('en-us'),
              },
              {
                value: 'es-es',
                label: this.$tl('es-es'),
              },
            ]
          },
          brand: {
            value: 'garagescore',
            title: this.$tl('garagescore'),
            options: [
              {
                value: 'garagescore',
                label: this.$tl('garagescore')
              },
              {
                value: 'custeed',
                label: this.$tl('custeed')
              },
            ]
          },
          background: true,
          slug: ''
        }
      }
    },

    computed: {
      garagesOptions(){
        const garagesTemp = this.availableGarages.map(({ id, publicDisplayName }) => (
          {
            key: id,
            value: publicDisplayName
          }
        ));
        return sortArrayObject(garagesTemp, 'value');
      },

    },
    methods: {
      async updateTemporarySelectedGarages(garages) {
        this.temporarySelectedGarages = garages;
        try {
          const selectedGarageIds = this.temporarySelectedGarages;
          const allGarages = this.selectedGarage.allGaragesNotFiltered;
          this.onGroupUpdate(selectedGarageIds);

          allGarages.forEach((el, i) => {
            if(selectedGarageIds.length === 1 && selectedGarageIds.includes(allGarages[i].id)) {
              this.widget.slug = el.slug;
              this.onSlugUpdate(this.widget.slug);
            }
          });
        } catch (error) {
          console.log(error)
        }
      },
      setGarageFilterMode(optionSelected) {
        this.temporaryOptionSelected = optionSelected;
      },
      setGarageIds(){
        if (this.garageIds?.length){
          this.temporarySelectedGarages = this.garagesOptions
            ?.filter(garage => this.garageIds?.includes(garage.key))
            .map(({ key }) => key);
        } else{
          this.temporarySelectedGarages = this.garageIds;
        }
      },
      setSelectedTags(tags){
        this.temporarySelectedTags = tags;
      },
      setShape({ value }) {
        const shape = this.widget.shape;
        shape.title = value;
        const selectedShape = this.widget.shape.options.find(
          ({ value: shapeName }) => value === shapeName
        );
        this.onShapeUpdate(selectedShape);
        shape.title = this.$tl(value || 'shape');
      },
      setSize({ value }) {
        const size = this.widget.size;
        size.title = value;
        this.onSizeUpdate(value);
        size.title = this.$tl(value || 'size');
      },
      setLanguage({ value }) {
        const language = this.widget.language;
        language.title = value;
        this.onLanguageUpdate(language.title);
        language.title = this.$tl(value || 'language')
      },
      setBrand({ value }) {
        const brand = this.widget.brand;
        brand.title = value;
        this.onBrandUpdate(brand.title);
        brand.title = this.$tl(value || 'brand');
      },
      setBackground() {
        this.widget.background = !this.widget.background;
        this.onBackgroundUpdate(this.widget.background);
      },
    }
  }
</script>

<style lang="scss" scoped>
  .widget-form {
    width: calc(50% - 4rem);

    &__tabs {
      flex-direction: column;
      border-right: 1px solid rgba($grey, .5);
      padding-right: 2rem;

      &__field-group {
        display: flex;
        flex-direction: row;

        &__field {
          width: 100%;

          &:first-child {
            margin-right: 1.5rem;
          }
        }
      }
    }
  }
</style>
