<template>
  <!-- We can only answer with Google & Facebook at the moment -->
  <TableRow v-if="canAnswer">
    <div class="row-reply__cell" :style="{ flex: 4 }">
      <div class="row-reply__card">
        <CardGrey>
          <template slot="title">
            {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('YourReply') }}
          </template>

          <div class="row-reply__content">
            <ReviewThread
              v-if="hasThread"
              :review="review"
              :onSendReply="onSendReviewReply"
              :onUpdateThreadReply="onUpdateReviewThreadReply"
            />
            <template v-else>
              <div class="row-reply__template">
                <DropdownTemplate
                  ref="dropdownTemplate"
                  :label="$t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('ResponseModels')"
                  icon="icon-gs-at-symbol"
                  :configResponsesScore="configResponsesScore"
                  :setContent="setContent"
                  :dataTemplate="dataTemplate"
                  :appendResponses="appendResponses"
                  :rating="rating"
                  :loading="loading"
                  :hasMoreTemplates="hasMoreTemplates"
                />
              </div>
              <div class="row-reply__item">
                <textarea
                  class="row-reply__textarea"
                  :placeholder="$t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('placeholder')"
                  :type="textareaType"
                  v-model="editableComment"
                />
              </div>

              <div class="row-reply__item" v-if="commentRejectionReason">
                <div class="row-reply__rejected-reason">
                  {{ commentRejectionReason }}
                </div>
              </div>
              <div class="row-reply__item">
                <strong class="row-reply__strong">{{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('Rules') }} :</strong>
                <span class="row-reply__rule">- {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('Rule1') }}</span>
                <span class="row-reply__rule">- {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('Rule2') }}</span>
                <span class="row-reply__rule">- {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('Rule3') }}</span>
                <span class="row-reply__rule">- {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('Rule4') }}</span>
              </div>
              <div class="row-reply__item row-reply__item--end row-reply__item--space row-reply__buttons">
                <Button
                  v-if="updating"
                  type="danger"
                  @click.native="remove"
                  :disabled="saving"
                >
                  {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('Delete') }}
                </Button>

                <Button
                  v-if="!updating"
                  :type="noChange ? 'disabled' : 'orange'"
                  @click.native="save"
                  :disabled="saving || noChange"
                >
                  <i v-if="saving" class="icon-gs-loading" />
                  {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('Confirm') }}
                </Button>
                <Button
                  v-else
                  :type="noChange ? 'disabled' : 'orange'"
                  @click.native="save"
                  :disabled="saving || noChange"
                >
                  <i v-if="saving" class="icon-gs-loading" />
                  {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('ConfirmUpdate') }}
                </Button>
              </div>
            </template>
          </div>
        </CardGrey>
      </div>
    </div>
  </TableRow>

  <TableRow v-else-if="editableComment">
    <div class="row-reply__cell" :style="{ flex: 4 }">
      <div class="row-reply__card">
        <div class="row-reply__header">
          {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('YourReply') }}
        </div>
        <div class="row-reply__content">
          <div class="row-reply__item">
            <label class="row-reply__label">{{ editableComment }}</label>
          </div>
          <div class="row-reply__item">
            <div class="row-reply__cannot-answer">
              <AppText tag="div">
                {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('warnUpdateSource', { source }) }}.
              </AppText>
            </div>
          </div>
          <div class="row-reply__item">
            <div class="row-reply__cannot-answer--redirection">
              <a :href="externalRedirection" target="_blank">
                <Button type="orange" border="square">
                  {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('updateInSource', { source }) }}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TableRowCell background="grey" />
    <TableRowCell :style="{ flex: 0.25 }" />
  </TableRow>

  <!-- PagesJaunes and Allogarage -->
  <TableRow v-else>
    <div class="row-reply__cell" :style="{ flex: 4 }">
      <div class="row-reply__card">
        <div class="row-reply__header">
          {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('YourReply') }}
        </div>
        <div class="row-reply__content">
          <div class="row-reply__item">
            <div class="row-reply__cannot-answer">
              <AppText tag="div">
                {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('warnReplySource', { source }) }}.
              </AppText>
            </div>
          </div>
          <div class="row-reply__item">
            <div class="row-reply__cannot-answer--redirection">
              <a :href="externalRedirection" target="_blank">
                <Button type="orange" border="square">
                  {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment')('replyInSource', { source }) }}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TableRowCell background="grey" />
    <TableRowCell :style="{ flex: 0.25 }" />
  </TableRow>
</template>

<script>
import ReviewThread from '~/components/cockpit/e-reputation/reviews/ReviewThread';
import CardGrey from '~/components/global/CardGrey.vue';
import DropdownTemplate from '~/components/global/DropdownTemplate.vue';
import {getDataTemplate} from '~/util/filters.js'
import { SourceTypes } from '~/utils/enumV2.js';
export default {
  name: "TableEreputationRowPublicReviewComment",
  components: { ReviewThread, CardGrey, DropdownTemplate },
  props: {
    review: {
      type: Object,
      default: () => {},
    },
    configResponsesScore: {
      type: Array,
      default: () => [],
    },
    appendResponses: {
      type: Function,
      default: () => {},
    },
    hasMoreTemplates:{
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0,
    },
    garageSignatures:{
      type: Array,
      default: () => []
    },
    currentUser:{
      type: Object,
      default: () => {}
    },
    allGarages:{
      type: Array,
      default: () => []
    },
    isCustomResponseLoading: Boolean,
    openModal: {
      type: Function,
      required: true,
    },
    createReviewReply: {
      type: Function,
      required: true,
    },
    updateReviewReply: {
      type: Function,
      required: true,
    },
    changeRowSubview: {
      type: Function,
      required: true,
    },
    onSendReviewReply: {
      type: Function,
      required: true,
    },
    onUpdateReviewThreadReply: {
      type: Function,
      required: true,
    },
    childModalProps: Object,
  },

  mounted() {
    this.editableComment = String(this.review.publicReviewComment || '');
    this.updating = !!this.review.publicReviewComment;
  },

  data() {
    return {
      saving: false,
      updating: false,
      editableComment: '',
    };
  },

  computed: {
    loading() {
      return this.isCustomResponseLoading;
    },
    commentStatus() {
      return this.review.publicReviewCommentStatus;
    },
    commentRejectionReason() {
      return this.review.publicReviewCommentRejectionReason;
    },
    textareaType() {
      if (this.commentStatus === 'Approved') {
        return 'success';
      } else if (this.commentStatus === 'Rejected') {
        return 'danger';
      } else {
        return 'muted';
      }
    },
    noChange() {
      return this.review.publicReviewComment === this.editableComment;
    },
    approved() {
      return this.commentStatus === 'Approved';
    },
    canAnswer() {
      const availableSources = [SourceTypes.GOOGLE, SourceTypes.FACEBOOK];
      return availableSources.includes(this.review.source);
    },
    source() {
      return this.review.source;
    },
    externalRedirection() {
      if (this.source === SourceTypes.PAGESJAUNES) {
        return 'https://cas.solocalgroup.com/connexion/login';
      } else if (this.source === 'Allogarage') {
        return 'https://www.allogarage.fr/';
      }
      return undefined;
    },
    hasThread() {
      return this.review.source === SourceTypes.FACEBOOK;
    },
    dataTemplate() {
      return getDataTemplate(
        this.garageSignatures,
        this.review.garageId,
        this.currentUser,
        this.review.customerFullName,
        this.garageName
      );
    },
    garageName() {
      if (this.review.garagePublicDisplayName) {
        return this.review.garagePublicDisplayName;
      }
      const garage = this.allGarages.find(
        (garage) => garage.id === this.review.garageId
      );
      if (garage) {
        return garage.publicDisplayName;
      }
      return '';
    },
  },
  methods: {
    async save() {
      if (this.saving) {
        return;
      }
      this.saving = true;
      if (this.updating) {
        await this.updateReviewReply({
          review: this.review,
          comment: this.editableComment,
        });
      } else {
        await this.createReviewReply({
          review: this.review,
          comment: this.editableComment,
        });
      }

      if (this.approved) {
        await this.changeRowSubview({
          id: this.review.id,
          view: 'publicReviewComment',
        });
      }
      this.saving = false;
    },
    getModalPropsByName(modalName) {
      return this.childModalProps?.[modalName] || {};
    },
    remove() {
      this.openModal({
        component: 'ModalDeleteReply',
        props: {
          ...this.getModalPropsByName('ModalDeleteReply'),
          review: this.review,
        },
      });
    },
    setContent(content) {
      this.editableComment = content;
    },
  },

  watch: {
    'review.publicReviewComment'(val) {
      this.saving = true;
      this.editableComment = String(val || '');
      this.updating = !!val;
      this.changeRowSubview({
        id: this.review.id,
        view: 'publicReviewComment',
      });
      this.saving = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.row-reply {
  &__cell {
    background: #f1f1f1;
  }

  &__card {
    background-color: $very-light-grey;
    position: relative;
    left: -1.4rem;
    width: calc(100% + 2.8rem);
  }

  &__rejected-reason {
    color: $red;
  }

  &__label {
    border-bottom: 2px solid $green;
    padding: 10px 0;
    font-style: italic;
    flex: 1;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .blue {
      color: $blue;
    }
  }

  &__textarea {
    min-height: 37px;
    border-radius: 5px;
    background-color: $white;
    border: 1px solid $grey;
    box-sizing: border-box;
    padding: 0.5rem;
  }

  &__item {
    display: flex;
    flex-direction: column;

    & + & {
      margin-top: 1rem;
    }

    &--end {
      align-items: flex-end;
      justify-content: space-between;
    }

    &--space {
      * + * {
        margin-top: 0.5rem;
      }
    }
  }

  &__buttons {
    flex-direction: row;
    justify-content: flex-end;
    .button {
      margin-right: 1rem;
      &:last-child {
        margin-right: 0;
      }
    }
  }

  &__strong {
    padding-bottom: 0.5rem;
    display: inline-block;
    color: $black;
    font-size: 0.9rem;
  }

  &__rule {
    color: $dark-grey;
    font-size: 0.9rem;

    & + & {
      margin-top: 0.25rem;
    }
  }

  &__textarea {
    min-height: 6rem;
    border-radius: 5px;
    background-color: $white;
    border: 1px solid $grey;
    box-sizing: border-box;
    padding: 0.5rem;
    width: 100%;

    &::placeholder {
      color: $grey;
    }
  }

  &__count {
    flex: 1;
    text-align: right;
  }

  &__cannot-answer {
    flex: 1;
    padding: 20px 0;
    text-align: center;
    &--redirection {
      flex: 1;
      padding: 0 0 20px 0;
      text-align: center;
      color: $orange;
      display: flex;
      justify-content: center;
      a {
        color: $orange;
        text-decoration: none;
      }
      & > a:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }
  &__template {
    margin-left: -0.6rem;
    width: 320px;
  }
}
</style>
