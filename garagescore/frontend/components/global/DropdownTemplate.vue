<template>
  <div>
    <Dropdown
      :active="false"
      type="phantom-orange"
      size="max-width"
      :caret="false"
      class="template-select"
      ref="dropdown"
    >
      <template slot="icon">
        <i class="icon-gs-chat-bubble" />
      </template>
      <template slot="label">
        <div class="button-dropdwon__label">
          {{ label }}
        </div>
      </template>
      <template>
        <DropdownContent
          :items="items"
          v-model="activeResponses"
          :searchCallback="filteredAvailablesGarages"
          :placeholder="placeholder"
          :class="{ 'template-select__list-empty': (!configResponsesScore || !configResponsesScore.length) }"
          :scrollCallback="scrollCallback"
          :loading="loading"
          :hasMore="hasMoreTemplates"
        />
      </template>
    </Dropdown>
  </div>
</template>
<script>
import DropdownBase from './DropdownBase';
import {getSearchFilterRegexp} from '~/util/filterRegexp.js'
import {searchAndReplaceValues, getRatingCategory, getInitialsName} from '~/util/filters.js'
import { OptionResponse } from '~/utils/enumV2.js';
export default {
  components: {
    DropdownBase,
  },
    props: {
    label: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    configResponsesScore: {
      type: Array,
      default: () => [],
    },
    setContent: {
      type: Function,
      default: () => ({}),
    },
    appendResponses: {
      type: Function,
      default: () => ({}),
    },
    hasMoreTemplates: {
      type: Boolean,
      default: false,
    },
    dataTemplate: {
      type: Object,
      default: () => {},
    },
    rating: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentResponse: null,
      placeholder: this.$t_locale('components/global/DropdownTemplate')('placeholder'),
    };
  },
  computed: {
    activeResponses: {
      get() {
        const g = this.configResponsesScore.find((g) => g._id === this.currentResponse);
        return g
          ? {
              key: g._id,
              label: g.title,
              content: g.content,
              value: g,
            }
          : { key: null, value: { id: null }, content: '', label: this.defaultResponseLabel };
      },
      set(item) {
        this.$refs.dropdown && this.$refs.dropdown.closeDropdown();
        this.setResponse(item);
        return item;
      },
    },
    items() {
      if (!this.configResponsesScore || !this.configResponsesScore.length) {
        const link = {
          to: `/cockpit/admin/pageCustomResponses`,
          label: this.$t_locale('components/global/DropdownTemplate')('createModel'),
        };
        const rating = getRatingCategory(this.rating);
        const label = this.$t_locale('components/global/DropdownTemplate')('emptyTemplate', {ratingCategory: this.$t_locale('components/global/DropdownTemplate')(rating)});
        
        return [{ key: null, value: { id: null }, content: '', label, link }];
      }
      return [
        ...this.configResponsesScore.map((a) => ({
          key: a._id,
          label: a.title,
          content: a.content,
          value: a,
        })),
      ];
    },
    defaultResponseLabel() {
      return `${this.$t_locale('components/global/DropdownTemplate')('allResponses')} (${this.configResponsesScore.length})`;
    },
  },
  methods: {
    filteredAvailablesGarages(search, i) {
      const regexp = getSearchFilterRegexp(search || '', true);
      return (i.label && i.label.match(regexp)) || (i.externalId && i.externalId.match(regexp));
    },
    setResponse(item) {
      this.currentResponse = item.key;
      this.setContent(this.changeValuesDataTemplate(item.content, this.dataTemplate));
    },
    async scrollCallback(scroll) {
      if (scroll.offsetHeight + scroll.scrollTop >= scroll.scrollHeight) {
        await this.appendResponses();
      }
    },
    changeValuesDataTemplate(text, dataTemplate) {
      if(!text){
        return ''
      }
      let tempText = text
      Object.keys(dataTemplate).map((key) => {
        if (tempText.includes(key)) {
          const searchString = `@${key}`
          tempText = searchAndReplaceValues(searchString, this.getLabelTemplate(key, dataTemplate), tempText);
        }
      });
      return tempText;
    },
    getLabelTemplate(dataTemplateKey, dataTemplate) {
      const label = dataTemplateKey === OptionResponse.INITIAL_NAME ? 
        getInitialsName(dataTemplate[dataTemplateKey]) : dataTemplate[dataTemplateKey];

      if(label !== '-' && label !== 'UNDEFINED')
        return label
      return ''
    },
  },
};
</script>
<style lang="scss" scoped>
.template-select {
  position: relative;
  margin-bottom: 3px;
  &__list-empty::v-deep span {
    white-space: inherit;
    color: $dark-grey;
  }
}
::v-deep .dropdown-button--phantom-orange {
  padding-left: 0.7rem !important;
}
::v-deep .dropdown-button--open {
  color: $orange !important;
}
::v-deep .dropdown-button__right {
  color: $orange !important;
}
::v-deep .dropdown__dropdown--max-width {
  max-width: 200px !important;
  max-height: 230px !important;
  margin-left: 0.65rem !important;
  overflow-y: auto;
  overflow-x: hidden;
}
::v-deep .dropdown__dropdown {
  width: 200px !important;
}
::v-deep .dropdown-content {
  min-width: 200px !important;
}
</style>
