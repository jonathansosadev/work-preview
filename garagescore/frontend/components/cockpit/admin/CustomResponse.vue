<template>
  <section class="responses-wraper">
    <AppText class="responses-wraper__title" tag="h1" type="black" size="lg" extraBold>
      {{ $t_locale('components/cockpit/admin/CustomResponse')('Title') }}
    </AppText>
    <AppText class="responses-wraper__subtitle" tag="h3" type="black" size="mdm" bold>
      {{ $t_locale('components/cockpit/admin/CustomResponse')('SubTitle') }}
    </AppText>
    <div class="responses-wraper__options">
      <div class="option-add">
        <Button type="contained-orange" @click="createNewModelAnswer()">
          <template>
            <template slot="left">
              <i class="icon-gs-add" />
            </template>
            <AppText tag="span" bold>{{ $t_locale('components/cockpit/admin/CustomResponse')('AddModule') }}</AppText>
          </template>
        </Button>
      </div>
      <div class="option-configuration">
        <Button type="contained-white" @click="openConfigTimeAnswer()">
          <template>
            <template slot="left">
              <i class="icon-gs-time-setting" />
            </template>
            <AppText tag="span" bold>{{ $t_locale('components/cockpit/admin/CustomResponse')('ConfigureResponse') }}</AppText>
          </template>
        </Button>
      </div>
    </div>
    <div class="responses-wraper__table">
      <PlaceholderLoading v-if="loading" fullScreen />
      <TableCustomResponse
        :customResponses="customResponses"
        :loading="loading"
        :noResultText="$t_locale('components/cockpit/admin/CustomResponse')('noResultText')"
        :loadMore="loadMore"
        :hasMore="hasMore"
        :loadingMore="loadingMore"
        :confirmDeleteModelResponse="confirmDeleteModelResponse"
        :updateModelAnswer="updateModelAnswer"
        :garagesOptions="garagesOptions"
      />
    </div>
  </section>
</template>
<script>
import AppText from '~/components/ui/AppText';
import TableCustomResponse from './TableCustomResponse.vue';
import { SourceTypes, RatingCategories, ResponsesTypes } from '~/utils/enumV2.js';
export default {
  name: 'CustomResponse',
  components: {
    AppText,
    TableCustomResponse,
  },
  props: {
    customResponses: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    garagesConfigDelay: {
      type: Array,
      default: () => [],
    },
    reponseTime: {
      type: Array,
      default: () => [],
    },
    garagesOptions: {
      type: Array,
      default: () => [],
    },
    itemsTag: {
      type: Array,
      default: () => [],
    },
    saveGarageDelay: {
      type: Function,
      default: () => {},
    },
    closeModal: {
      type: Function,
      default: () => {},
    },
    addModel: {
      type: Function,
      default: () => {},
    },
    hasMore: {
      type: Boolean,
      default: false,
    },
    loadingMore: {
      type: Boolean,
      default: false,
    },
    loadMore: {
      type: Function,
      default: () => ({}),
    },
    saveModelTemp: {
      type: Function,
      default: () => ({}),
    },
    configResponseTemp: {
      type: Object,
      default: () => {},
    },
    deleteModel: {
      type: Function,
      default: () => ({}),
    },
    updateModel: {
      type: Function,
      default: () => ({}),
    },
    getHasMoreDataDelay:{
      type: Function,
      default: () => ({}),
    },
    appendResponsesDelay: {
      type: Function,
      default: () => ({})
    },
    getGaragesDelay: {
      type: Function,
      default: () => ({})
    }
  },
  methods: {
    openConfigTimeAnswer() {
      const payload = {
        component: 'ModalConfigTimeAnswer',
        props: {
          reponseTime: this.reponseTime,
          saveGarageDelay: this.saveGarageDelay,
          closeModal: this.closeModal,
          getHasMoreDataDelay: this.getHasMoreDataDelay,
          appendResponsesDelay: this.appendResponsesDelay,
          getGaragesDelay: this.getGaragesDelay
        },
      };
      this.$store.dispatch('openModal', payload);
    },
    createNewModelAnswer() {
      const dataTemp = this.formatDataModelResponse(this.configResponseTemp);
      this.openModalModelResponse(dataTemp);
    },
    updateModelAnswer(row) {
      const dataTemp = this.formatDataModelResponse(row);
      this.openModalModelResponse(dataTemp);
    },
    openModalModelResponse(dataTemp) {
      const payload = {
        component: 'ModalConfigModelResponse',
        props: {
          ...dataTemp,
          garagesOptions: this.garagesOptions,
          itemsTag: this.itemsTag,
          addModel: this.addModel,
          updateModel: this.updateModel,
          closeModal: this.closeModal,
          saveModelTemp: this.saveModelTemp,
        },
      };
      this.$store.dispatch('openModal', payload);
    },

    formatDataModelResponse(data) {
      if (!data) {
        return {};
      }

      //TagSelector component returns null when nothing is chosen, how we save values in store its correct save null
      let automatedTemp = null;
      if (data.automated !== null) {
        automatedTemp = data.automated ? ResponsesTypes.AUTOMATIC  : ResponsesTypes.MANUAL;
      }
      return {
        ...data,
        _id: data._id || '',
        automated: automatedTemp,
        garagesIds: this.garagesOptions.filter((item) => data.garageIds.includes(item.value)),
        ratingCategories: this.getRatingCategoriesSelected(data),
        sources: this.getSourcesSelected(data),
      };
    },
    getRatingCategoriesSelected(data) {
      return {
        promoter: data.ratingCategories.includes(RatingCategories.PROMOTER),
        passive: data.ratingCategories.includes(RatingCategories.PASSIVE),
        detractor: data.ratingCategories.includes(RatingCategories.DETRACTOR),
      };
    },
    getSourcesSelected(data) {
      return {
        DataFile: data.sources.includes(SourceTypes.DATAFILE),
        Google: data.sources.includes(SourceTypes.GOOGLE),
        Facebook: data.sources.includes(SourceTypes.FACEBOOK),
      };
    },
    confirmDeleteModelResponse(templateId, nGarages) {
      const payload = {
        component: 'ModalDeleteModelResponse',
        props: {
          closeModal: this.closeModal,
          deleteModel: this.deleteModel,
          templateId,
          nGarages,
        },
      };
      this.$store.dispatch('openModal', payload);
    },
  },
};
</script>
<style lang="scss" scoped>
.responses-wraper {
  padding: 1.5rem 1rem;
  &__title {
    margin-bottom: 1rem !important;
  }
  &__subtitle {
    margin-bottom: 1rem !important;
    color: $dark-grey !important;
  }
  &__subtitle2 {
    margin-bottom: 1.5rem !important;
    color: $blue !important;
  }
  &__options {
    display: flex;
    justify-content: start;
    .option-configuration {
      margin-left: 1rem;
    }
  }
  &__table {
    margin-top: 1rem;
  }
}
@media (max-width: $breakpoint-min-md) {
  .responses-wraper {
    &__title {
      font-size: 1.286rem;
      letter-spacing: 0.5px;
    }
    &__subtitle {
      font-size: 1rem;
      letter-spacing: 0.5px;
    }
    &__subtitle2 {
      letter-spacing: 0.5px;
    }
  }
}
@media (max-width: $breakpoint-min-sm) {
  .responses-wraper {
    &__title {
      font-size: 1.143rem;
      letter-spacing: 1px;
    }
    &__subtitle {
      font-size: 0.857rem;
      line-height: 1.42;
      letter-spacing: 1px;
    }
    &__subtitle2 {
      font-size: 0.857rem;
      margin-bottom: 1rem !important;
      line-height: 1.42;
      letter-spacing: 1px;
    }
  }
}
</style>
