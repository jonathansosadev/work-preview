<template>
  <TableRow>
    <div class="row-reply__cell" :style="{ flex: 7 }">
      <div class="row-reply__card">
        <CardGrey>
          <template slot="title">
            {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReviewComment')('YourReply') }}
          </template>
          <div class="row-reply__content">
            <div class="row-reply__template">
              <DropdownTemplate
                ref="dropdownTemplate"
                :label="$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReviewComment')('ResponseModels')"
                icon="icon-gs-at-symbol"
                :configResponsesScore="configResponsesScore"
                :setContent="setContent"
                :appendResponses="appendResponses"
                :dataTemplate="dataTemplate"
                :rating="rating"
                :loading="loadingAdminCustomResponse"
                :hasMoreTemplates="hasMoreTemplates"
              />
            </div>
            <div class="row-reply__item">
              <textarea
                class="row-reply__textarea"
                :placeholder="$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReviewComment')('placeholder')"
                :type="textareaType"
                v-model="editableComment"
              />
            </div>
            <div class="row-reply__item" v-if="getRejectedReason">
              <div class="row-reply__rejected-reason">
                {{ getRejectedReason }}
              </div>
            </div>
            <div class="row-reply__item">
              <strong class="row-reply__strong">{{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReviewComment')('Rules') }} :</strong>
              <span
                class="row-reply__rule"
                v-for="index in 4"
                :key="index"
              >- {{ $t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReviewComment')(`Rule${index}`) }}</span>
            </div>
          </div>
          <div class="row-reply__item row-reply__item--end">
            <Button
              type="orange"
              size="sm"
              @click="save"
              :disabled="buttonIsDisabled"
            >
              <i v-if="saving" class="icon-gs-loading" />
              {{ getConfirmationMessage }}
            </Button>
          </div>
        </CardGrey>
      </div>
    </div>
  </TableRow>
</template>


<script>
import CardGrey from '~/components/global/CardGrey.vue';
import DropdownTemplate from '~/components/global/DropdownTemplate.vue';
import { getDeepFieldValue as deep } from '~/utils/object';
import { getDataTemplate } from '~/util/filters.js';
import RejectedReasons from '~/utils/models/rejected-reasons.type.js';

export default {
  components: { CardGrey, DropdownTemplate },
  props: {
    id: String,
    review: Object,
    row: { type: Object, default: () => ({}) },
    appendResponses: { type: Function, default: () => ({}) },
    currentUser: { type: Object, default: () => ({}) },
    rating: { type: Number, default: 0 },
    configResponsesScore: { type: Array, default: () => [] },
    garageSignatures: { type: Array, default: () => [] },
    hasMoreTemplates: { type: Boolean, default: false },
    setRowSubview: { type: Function, required: true },
    createReviewReply: { type: Function, required: true },
    updateReviewReply: { type: Function, required: true },
    refreshView: { type: Function, required: true },
    loadingAdminCustomResponse: Boolean,
  },

  computed: {
    textareaType() {
      const status = deep(this.review, 'comment.status');

      if (status === 'Approved') {
        return 'success';
      } else if (status === 'Rejected') {
        return 'danger';
      }

      return 'muted';
    },
    dataTemplate() {
      return getDataTemplate(
        this.garageSignatures,
        this.row.garage.id,
        this.currentUser,
        deep(this.row, 'customer.fullName.value'),
        deep(this.row, 'garage.publicDisplayName'),
      );
    },
    getComment() {
      return this.$refs.dropdownTemplate.changeValuesDataTemplate(deep(this.review, 'reply.text'), this.dataTemplate);
    },
    getConfirmationMessage() {
      return deep(this.review, 'reply.text') ? this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReviewComment')('ConfirmUpdate') : this.$t_locale('components/cockpit/satisfaction/reviews/TableCockpitRowPublicReviewComment')('ConfirmUpdateAndSave');
    },
    buttonIsDisabled() {
      return this.saving || !this.editableComment || this.editableComment.length === 0;
    },
    getRejectedReason() {
      const reason = deep(this.review, 'comment.rejectedReason');
      return !RejectedReasons.values().includes(reason) ? reason : '';
    },
  },

  data() {
    return {
      saving: false,
      editableComment: '',
    };
  },
  mounted() {
    this.editableComment = this.getComment;
  },
  methods: {
    async save() {
      if (!this.saving) {
        this.saving = true;
        if (deep(this.review, 'reply.text')) {
          await this.updateReviewReply({ id: this.id, comment: this.editableComment });
        } else {
          await this.createReviewReply({ id: this.id, comment: this.editableComment });
        }

        if (deep(this.review, 'comment.status') === 'Approved') {
          this.setRowSubview({ id: this.id, view: '' });
        }
        this.saving = false;
        await this.refreshView();
      }
    },
    setContent(content) {
      this.editableComment = content;
    },

  },
};
</script>

<style lang="scss" scoped>
.row-reply {
  &__rejected-reason {
    color: $red;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .blue {
      color: $blue;
    }
  }

  &__template {
    margin-left: -0.6rem;
    width: 320px;
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
  }

  &__rule {
    color: $dark-grey;
    font-size: 0.9rem;

    & + & {
      margin-top: 10px;
    }
  }

  &__textarea {
    min-height: 6rem;
    border-radius: 5px;
    background-color: $white;
    border: 1px solid $grey;
    box-sizing: border-box;
    padding: 0.7rem;
    width: 100%;
    color: $dark-grey;
    line-height: 1.5;

    &::placeholder {
      color: $grey;
    }
  }

  &__strong {
    padding-bottom: 1rem;
    display: inline-block;
    color: $black;
    font-size: 0.9rem;
  }
}
</style>
