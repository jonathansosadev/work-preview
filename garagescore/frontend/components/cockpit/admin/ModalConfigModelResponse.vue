<template>
  <ModalBase class="modal-config-model-response" type="danger">
    <template slot="header-icon">
      <img ref="logo" src="/logo/logo-custeed-picto.svg" class="modal-exports__logo" alt="custeed">
    </template>

    <template slot="header-title" class="header-title">
      <span>{{ $t_locale('components/cockpit/admin/ModalConfigModelResponse')('title') }}</span>
    </template>

    <template slot="header-subtitle" class="header-subtitle">
      <span>{{ $t_locale('components/cockpit/admin/ModalConfigModelResponse')('subtitle') }}</span>
    </template>
    <template slot="body">
      <SetupStep v-bind="getSetupStepProps('name')">
        <template #input>
          <input-material :fixedWidth="'265px'" v-model="nameInputValue" :minLength="1" :maxLength="50">
            <template slot="label">{{ $t_locale('components/cockpit/admin/ModalConfigModelResponse')('name') }}</template>
          </input-material>
        </template>
      </SetupStep>
      <SetupStep v-bind="getSetupStepProps('typeResponse')">
        <template #input>
          <TagSelector
            :tags="buttonResponses"
            :savedTag="typeResponseInputValue"
            :onTagSelected="setTagSelected"
            size="none"
            :key="typeResponseInputValue"
          />
        </template>
      </SetupStep>
      <SetupStep v-bind="getSetupStepProps('garages')" v-if="areResponsesTypeAutomatic">
        <template #input>
          <MultiSelectMaterial
            class="setup-custom-content__multiselect"
            :placeholder="$t_locale('components/cockpit/admin/ModalConfigModelResponse')('garages_placeholer')"
            v-model="garagesInputValue"
            :multiple="true"
            :options="garagesOptions"
            noResult="no resultados"
          />
        </template>
      </SetupStep>
      <SetupStep v-bind="getSetupStepProps('contentResponse')">
        <template #input>
          <TextAreaHighlight
            :itemsTag="itemsTag"
            v-model="contentResponseInputValue"
            :labelTag="$t_locale('components/cockpit/admin/ModalConfigModelResponse')('add_tag')"
            :labelTextarea="$t_locale('components/cockpit/admin/ModalConfigModelResponse')('editor_placeholer')"
          />
        </template>
      </SetupStep>
      <SetupStep v-bind="getSetupStepProps('typeRevision')">
        <template #input>
          <div class="type-revision" v-for="item in typeRevisionFields" :key="item.name">
            <CheckBox
              class="type-revision__checkbox"
              :checked="typeRevision[item.name]"
              @change="toogleTypeRevision(item.name)"
            />
            <i :class="[item.icon, item.color]" />
            <span :class="{ 'type-revision__active': typeRevision[item.name] === true }">
              {{ $t_locale('components/cockpit/admin/ModalConfigModelResponse')(item.name, {}, item.name ) }}
            </span>
          </div>
        </template>
      </SetupStep>
      <SetupStep v-bind="getSetupStepProps('socialMedias')" v-if="areResponsesTypeAutomatic">
        <template #input>
          <div class="social-medias" v-for="item in sourceFields" :key="item.name">
            <CheckBox
              class="social-medias__checkbox"
              :checked="socialMedias[item.name]"
              @change="toogleSocialMedias(item.name)"
            />
            <img :title="item['name']" :src="item['src']" :alt="item['name']">
            <span :class="{ 'social-medias__active': socialMedias[item.name] === true }">{{ $t_locale('components/cockpit/admin/ModalConfigModelResponse')(item.name, {}, item.name) }}</span>
          </div>
        </template>
      </SetupStep>
    </template>
    <template slot="footer">
      <div class="modal-config-model-response__footer">
        <template>
          <Button type="phantom" @click="closeModal()" thick>
            <span>{{ $t_locale('components/cockpit/admin/ModalConfigModelResponse')('cancel') }}</span>
          </Button>
          &nbsp;&nbsp;
          <Button
            type="orange"
            thick
            :disabled="confirmButtonDisabled"
            @click="!_id ? addModel() : updateModelResponse()"
          >
            <span>{{ $t_locale('components/cockpit/admin/ModalConfigModelResponse')('save') }}</span>
          </Button>
        </template>
      </div>
    </template>
  </ModalBase>
</template>
<script>
import TagSelector from '~/components/global/TagSelector.vue';
import TextAreaHighlight from '~/components/global/TextAreaHighlight.vue';
import { searchAndReplaceValues } from '~/util/filters.js';
import { SourceTypes, RatingCategories, ResponsesTypes, StepResponse } from '~/utils/enumV2.js';

export default {
  name: 'ModalConfigModelResponse',
  components: {
    TagSelector,
    TextAreaHighlight,
  },
  props: {
    garagesOptions: {
      type: Array,
      default: () => [],
    },
    itemsTag: {
      type: Array,
      default: () => [],
    },
    // eslint-disable-next-line vue/prop-name-casing
    _id: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: null,
    },
    automated: {
      type: String,
      default: null,
    },
    garagesIds: {
      type: Array,
      default: () => [],
    },
    content: {
      type: String,
      default: '',
    },
    ratingCategories: {
      type: Object,
      default: () => {},
    },
    sources: {
      type: Object,
      default: () => {},
    },
    addModel: {
      type: Function,
      default: () => {},
    },
    updateModel: {
      type: Function,
      default: () => {},
    },
    closeModal: {
      type: Function,
      default: () => {},
    },
    saveModelTemp: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      typeRevisionFields: [
        { name: RatingCategories.PROMOTER, color: 'green-smile', icon: 'icon-gs-happy' },
        { name: RatingCategories.PASSIVE, color: 'yellow-smile', icon: 'icon-gs-straight' },
        { name: RatingCategories.DETRACTOR, color: 'red-smile', icon: 'icon-gs-sad' },
      ],
      sourceFields: [
        { name: SourceTypes.DATAFILE, src: '/e-reputation/GarageScore.svg' },
        { name: SourceTypes.GOOGLE, src: '/e-reputation/Google.svg' },
        { name: SourceTypes.FACEBOOK, src: '/e-reputation/Facebook.svg' },
      ],
      buttonResponses: [],
      openedStep: '',
      nameInputValue: this.title,
      nameValidatedValue: null,
      typeResponseInputValue: this.automated,
      typeResponseValidatedValue: null,
      garagesInputValue: this.garagesIds,
      garagesValidatedValue: [],
      contentResponseInputValue: this.content,
      contentResponseValidatedValue: '',
      typeRevision: this.ratingCategories,
      typeRevisionValidatedValue: { promoter: false, passive: false, detractor: false },
      socialMedias: this.sources,
      socialMediasValidatedValue: { DataFile: false, Google: false, Facebook: false },
      confirmButtonDisabled: true,
      isUpdated: false,
      ALL_OPTIONS: [
        StepResponse.NAME,
        StepResponse.TYPE_RESPONSE,
        StepResponse.GARAGES,
        StepResponse.CONTENT_RESPONSE,
        StepResponse.TYPE_REVISION,
        StepResponse.SOCIAL_MEDIAS,
      ],
      MANUAL_OPTIONS: [
        StepResponse.NAME,
        StepResponse.TYPE_RESPONSE,
        StepResponse.CONTENT_RESPONSE,
        StepResponse.TYPE_REVISION,
      ],
    };
  },
  mounted() {
    this.setButtonResponses();

    this.ALL_OPTIONS.map((item) => {
      this.validateInput(item);
      this.isFilled(item);
    });

    if (this.content !== '') {
      this.contentResponseInputValue = this.replaceContent(this.itemsTag, this.contentResponseInputValue, 'Input');
    }
  },
  updated() {
    this.isUpdated = true;
  },
  computed: {
    areResponsesTypeAutomatic() {
      return this.typeResponseValidatedValue === ResponsesTypes.AUTOMATIC;
    },
    isValid() {
      if (!this.openedStep) {
        return false;
      }

      const isValidFunctions = {
        [StepResponse.NAME]: () => {
          return !!this.nameInputValue;
        },
        [StepResponse.TYPE_RESPONSE]: () => {
          return !!this.typeResponseInputValue;
        },
        [StepResponse.GARAGES]: () => {
          return this.garagesInputValue.length > 0;
        },
        [StepResponse.CONTENT_RESPONSE]: () => {
          return !!this.contentResponseInputValue;
        },
        [StepResponse.TYPE_REVISION]: () => {
          return this.checkSelection(this.typeRevision);
        },
        [StepResponse.SOCIAL_MEDIAS]: () => {
          return this.checkSelection(this.socialMedias);
        },
      };
      return isValidFunctions[this.openedStep]();
    },
  },
  methods: {
    getSetupStepProps(fieldName) {
      return {
        stepName: fieldName,
        label: this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')(`${fieldName}_label`, {}, fieldName),
        subLabel: this.formattedSubLabel(fieldName),
        isOpen: this.openedStep === fieldName,
        filled: this.isFilled(fieldName),
        isValid: this.isValid,
        onSetActive: this.setActiveStep,
        onValidate: this.validateInput,
        onCancel: this.cancelInput,
        disabled: false
      };
    },
    formattedSubLabel(fieldName) {
      if (!fieldName) {
        return '';
      }

      const subLabel = this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')(`${fieldName}_sublabel`, {}, fieldName);
      const validatedValue = this[`${fieldName}ValidatedValue`];

      const formattedLabelFunctions = {
        [StepResponse.NAME]: () => {
          return validatedValue || subLabel;
        },
        [StepResponse.TYPE_RESPONSE]: () => {
          return this.isFilled(StepResponse.TYPE_RESPONSE)
            ? this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')(`responseType_${this.typeResponseValidatedValue}`)
            : subLabel;
        },
        [StepResponse.GARAGES]: () => {
          if (!validatedValue || !validatedValue.length) {
            return subLabel;
          }
          return `${validatedValue.length} ${
            validatedValue.length > 1 ? this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')('garages_selected') : this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')('garage_selected')
          }`;
        },
        [StepResponse.CONTENT_RESPONSE]: () => {
          return this.isFilled(StepResponse.CONTENT_RESPONSE) ? this.contentResponseInputValue : subLabel;
        },
        [StepResponse.TYPE_REVISION]: () => {
          if (this.checkSelection(this.typeRevisionValidatedValue)) {
            return Object.keys(this.typeRevisionValidatedValue)
              .filter((key) => this.typeRevisionValidatedValue[key])
              .map((item) => this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')(item, {}, item))
              .join(' ');
          }
          return subLabel;
        },
        [StepResponse.SOCIAL_MEDIAS]: () => {
          if (this.checkSelection(this.socialMediasValidatedValue)) {
            return Object.keys(this.socialMediasValidatedValue)
              .filter((key) => this.socialMediasValidatedValue[key])
              .map((item) => this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')(item, {}, item))
              .join(' ');
          }
          return subLabel;
        },
      };
      return formattedLabelFunctions[fieldName]();
    },
    setActiveStep(stepName) {
      this.$nextTick(() => {
        this.openedStep = stepName;
      });
    },
    isFilled(fieldName) {
      const isFilledFunctions = {
        [StepResponse.NAME]: () => {
          return !!this.nameValidatedValue;
        },
        [StepResponse.TYPE_RESPONSE]: () => {
          return !!this.typeResponseValidatedValue;
        },
        [StepResponse.GARAGES]: () => {
          return this.garagesValidatedValue.length > 0;
        },
        [StepResponse.CONTENT_RESPONSE]: () => {
          return !!this.contentResponseValidatedValue;
        },
        [StepResponse.TYPE_REVISION]: () => {
          return this.checkSelection(this.typeRevisionValidatedValue);
        },
        [StepResponse.SOCIAL_MEDIAS]: () => {
          return this.checkSelection(this.socialMediasValidatedValue);
        },
      };
      return isFilledFunctions[fieldName]();
    },
    validateInput(stepName) {
      const isFilledFunctions = {
        [StepResponse.NAME]: () => {
          this.nameValidatedValue = this.nameInputValue;
        },
        [StepResponse.TYPE_RESPONSE]: () => {
          this.typeResponseValidatedValue = this.typeResponseInputValue;
        },
        [StepResponse.GARAGES]: () => {
          this.garagesValidatedValue = this.garagesInputValue.map((item) => Object.assign({}, item));
        },
        [StepResponse.CONTENT_RESPONSE]: () => {
          this.contentResponseValidatedValue = this.replaceContent(
            this.itemsTag,
            this.contentResponseInputValue,
            'validated'
          );
        },
        [StepResponse.TYPE_REVISION]: () => {
          this.typeRevisionValidatedValue = Object.assign({}, this.typeRevision);
        },
        [StepResponse.SOCIAL_MEDIAS]: () => {
          this.socialMediasValidatedValue = Object.assign({}, this.socialMedias);
        },
      };
      isFilledFunctions[stepName]();
      this.setNextStep();
    },
    replaceContent(itemsTag, contentResponse, type) {
      let tempContentResponse = contentResponse;
      itemsTag.map(({ value, label }) => {
        const searchString = type === 'Input' ? value : label;
        if (tempContentResponse.includes(searchString)) {
          const replaceValue = type === 'Input' ? label : value;
          tempContentResponse = searchAndReplaceValues(searchString, replaceValue, tempContentResponse);
        }
      });
      return tempContentResponse;
    },
    setNextStep() {
      if (!this.openedStep) {
        return '';
      }
      const nextStepFunctions = {
        [StepResponse.NAME]: () => {
          this.openedStep = StepResponse.TYPE_RESPONSE;
          if (!this._id) {
            this.saveModelTemp('title', this.getTitle());
          }
        },
        [StepResponse.TYPE_RESPONSE]: () => {
          this.openedStep =
            this.typeResponseValidatedValue === ResponsesTypes.AUTOMATIC ?
            StepResponse.GARAGES :
            StepResponse.CONTENT_RESPONSE;
          if (!this._id) {
            this.saveModelTemp(ResponsesTypes.AUTOMATED, this.getAutomated());
          }
        },
        [StepResponse.GARAGES]: () => {
          this.openedStep = StepResponse.CONTENT_RESPONSE;
          if (!this._id) {
            this.saveModelTemp('garageIds', this.getGaragesdId());
          }
        },
        [StepResponse.CONTENT_RESPONSE]: () => {
          this.openedStep = StepResponse.TYPE_REVISION;
          if (!this._id) {
            this.saveModelTemp('content', this.getContent());
          }
        },
        [StepResponse.TYPE_REVISION]: () => {
          this.openedStep = this.typeResponseValidatedValue === ResponsesTypes.AUTOMATIC ? StepResponse.SOCIAL_MEDIAS : '';
          if (!this._id) {
            this.saveModelTemp('ratingCategories', this.getRatingCategories());
          }
        },
        [StepResponse.SOCIAL_MEDIAS]: () => {
          this.openedStep = '';
          if (!this._id) {
            this.saveModelTemp('sources', this.getSources());
          }
        },
      };
      nextStepFunctions[this.openedStep]();

      if (this._id) {
        this.openedStep = '';
      }
      if (this.typeResponseValidatedValue) {
        const tempOptions =
          this.typeResponseValidatedValue === ResponsesTypes.AUTOMATIC ? this.ALL_OPTIONS : this.MANUAL_OPTIONS;
        this.confirmButtonDisabled = this.isFormValid(tempOptions) ? false : true;
      }
    },
    isFormValid(data) {
      if (!data.every((item) => this.isFilled(item))) {
        return false;
      }

      if (this._id !== '' && !this.isUpdated) {
        return false;
      }

      return true;
    },
    cancelInput(stepName) {
      const cancelFunctions = {
        [StepResponse.NAME]: () => {
          this.nameInputValue = this.nameValidatedValue;
        },
        [StepResponse.TYPE_RESPONSE]: () => {
          this.typeResponseInputValue = this.typeResponseValidatedValue;
        },
        [StepResponse.GARAGES]: () => {
          this.garagesInputValue = this.garagesValidatedValue.map((item) => Object.assign({}, item));
        },
        [StepResponse.CONTENT_RESPONSE]: () => {
          this.contentResponseInputValue = this.contentResponseValidatedValue;
          this.contentResponseInputValue = this.replaceContent(
            this.itemsTag,
            this.contentResponseInputValue,
            this.contentResponseInputValue
          );
        },
        [StepResponse.TYPE_REVISION]: () => {
          this.typeRevision = Object.assign({}, this.typeRevisionValidatedValue);
        },
        [StepResponse.SOCIAL_MEDIAS]: () => {
          this.socialMedias = Object.assign({}, this.socialMediasValidatedValue);
        },
      };
      cancelFunctions[stepName]();
      this.openedStep = '';
    },
    setButtonResponses() {
      this.buttonResponses = [
        {
          id: ResponsesTypes.AUTOMATIC,
          label: this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')(`responseType_${ResponsesTypes.AUTOMATIC}`),
          icon: '',
          tooltip: this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')('responseType_automation_tooltip'),
        },
        {
          id: ResponsesTypes.MANUAL,
          label: this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')(`responseType_${ResponsesTypes.MANUAL}`),
          icon: '',
          tooltip: this.$t_locale('components/cockpit/admin/ModalConfigModelResponse')('responseType_manual_tooltip'),
        },
      ];
    },
    setTagSelected(value) {
      this.typeResponseInputValue = value;
    },
    toogleTypeRevision(item) {
      this.typeRevision[item] = !this.typeRevision[item];
    },
    toogleSocialMedias(item) {
      this.socialMedias[item] = !this.socialMedias[item];
    },
    checkSelection(dataSelected) {
      return Object.keys(dataSelected).some((key) => dataSelected[key] === true);
    },
    getTitle() {
      return this.nameValidatedValue;
    },
    getAutomated() {
      return this.typeResponseValidatedValue === ResponsesTypes.AUTOMATIC ? true : false;
    },
    getGaragesdId() {
      return this.garagesValidatedValue.map((item) => item.value);
    },
    getContent() {
      return this.contentResponseValidatedValue;
    },
    getRatingCategories() {
      return Object.keys(this.typeRevisionValidatedValue).filter((key) => this.typeRevisionValidatedValue[key]);
    },
    getSources() {
      return Object.keys(this.socialMediasValidatedValue).filter((key) => this.socialMediasValidatedValue[key]);
    },
    async updateModelResponse() {
      const parameters = {
        templateId: this._id,
        title: this.getTitle(),
        automated: this.getAutomated(),
        garageIds: this.getGaragesdId(),
        content: this.getContent(),
        ratingCategories: this.getRatingCategories(),
        sources: this.getSources(),
      };
      await this.updateModel(parameters);
    },
  },
};
</script>
<style lang="scss" scoped>
.modal-config-model-response {
  overflow: auto;
  height: 100%;
  width: 48.571rem;
  &__footer {
    display: flex;
    justify-content: flex-end;
  }
  .header-subtitle {
    margin-bottom: 0.5rem;
  }
}
.row-editor {
  &__textarea {
    position: relative;
    top: -1.5rem;
    min-height: 6rem;
    border-radius: 3px;
    background-color: $white;
    border: 1px solid $grey;
    box-sizing: border-box;
    padding: 0.5rem;
    width: 100%;
    color: $dark-grey;

    &::placeholder {
      color: $grey;
    }
  }
}
.type-revision {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
  font-weight: 700;
  &__checkbox {
    width: auto;
    position: relative;
    top: -1px;
  }
  &__active {
    color: $blue;
  }
  i {
    margin: 0 0.5rem 0 0.3rem;
    font-size: 18px;
  }
  .green-smile {
    color: $green;
    font-size: 18px;
  }
  .yellow-smile {
    color: $yellow;
    font-size: 18px;
  }
  .red-smile {
    color: $red;
    font-size: 18px;
  }
}
.social-medias {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  font-size: 0.9rem;
  font-weight: 700;

  &__checkbox {
    width: auto;
  }
  &__active {
    color: $blue;
  }
  img {
    margin: 0 0.5rem 0 0.3rem;
    width: 18px;
  }
}
@media (max-width: $breakpoint-min-md) {
  .modal-config-model-response {
    .header-title {
      font-size: 1.143rem;
    }
    .header-subtitle {
      font-size: 0.929rem;
    }
  }
}
@media (max-width: $breakpoint-min-sm) {
  .modal-config-model-response {
    width: 100%;
    .header-title {
      font-size: 1rem;
    }
    .header-subtitle {
      font-size: 0.786rem;
    }
  }
}
</style>
