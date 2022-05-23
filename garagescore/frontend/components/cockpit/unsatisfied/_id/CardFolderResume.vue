<template>
  <Card class="card-folder-resume">
    <div class="card-folder-resume__part card-folder-resume__part--header">
      <div class="card-folder-resume__header-left">
        <div class="card-folder-resume__header-left-part">
          <Gauge
            :value="rating"
            v-if="rating || rating === 0"
            inFolder
            :baseRating="getBaseRating"
          />
          <i v-else class="icon-gs-sad card-folder-resume__header-left-part__icon" />
        </div>
        <div class="card-folder-resume__header-left-part">
          <Title type="danger" direction="column">
            {{ deep('unsatisfiedTicket.customer.fullName') }}{{ deep('unsatisfiedTicket.type') ? ' - ' : '' }}
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')(deep('unsatisfiedTicket.type')) }}
            <template slot="subtitle">
              <i class="icon-gs-garage" />
              {{ deep('garage.publicDisplayName' ) }}
            </template>
          </Title>
        </div>
      </div>

      <div class="card-folder-resume__header-right">
        <div class="card-folder-resume__header-right-part" v-if="!isClose">
          <AppText tag="span" class="card-folder-resume__header-text" bold>
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('openSince') }}
          </AppText>
          <ElapsedTime
            tag="span"
            class="card-folder-resume__header-text"
            type="muted"
            :startDate="deep('unsatisfiedTicket.createdAt')"
          />
        </div>
        <div class="card-folder-resume__header-right-part" v-else>
          <AppText tag="span" class="card-folder-resume__header-text" bold>
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('processedSince') }}
          </AppText>
          <ElapsedTime
            tag="span"
            class="card-folder-resume__header-text"
            type="muted"
            :startDate="deep('unsatisfiedTicket.createdAt')"
            :endDate="deep('unsatisfiedTicket.closedAt')"
          />
        </div>
        <div class="card-folder-resume__header-right-part" v-if="isClose">
          <Button type="orange" size="sm" @click="showReopenModal">
            <template slot="left">
              <i class="icon-gs-unlock" />
            </template>
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('reopen') }}
          </Button>
        </div>
      </div>
    </div>

    <div class="card-folder-resume__part">
      <div class="card-folder-resume__thought">
        <div class="card-folder-resume__thought-header">
          <AppText tag="h3" class="card-folder-resume__thought-title" bold>
            {{ deep('unsatisfiedTicket.comment') ? $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('comment') : $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('review') }}
          </AppText>
        </div>
        <div class="card-folder-resume__thought-body">
          <TextEmphasis :classComment="classBindingComment" :limit="800" :text="displayComment" v-if="displayComment" />
          <AppText tag="span" type="muted" v-else>
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('notSpecified') }}
          </AppText>
        </div>
        <div class="reply--block" v-if="reviewHasText">
          <div class="card-folder-resume__thought-header">
            <AppText bold tag="h4" class="card-folder-resume__thought-title2">
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('answer') }} {{ textareaType === 'success' ? $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('validated') : '' }}:
            </AppText>
            <a
              @click="switchReply(true)"
              target="_blank"
              class="card-folder-resume__thought-link-answer"
              :class="'reply--' + textareaType"
              v-if="!replyOpened && reviewHasText && (rating || rating === 0)"
            >
              <i class="icon-gs-edit" />
              {{ replyStatusMessage }}
            </a>
          </div>
          <div class="card-folder-resume__thought-body" v-if="deep('review.reply.text') !== ''">
            <TextEmphasis :limit="800" :text="replyText || deep('review.reply.text')" />
          </div>
        </div>
        <div class="reply__card" v-show="replyOpened">
          <div class="reply__header">
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('YourReply') }}
            <div>
              <i class="icon-gs-close-circle reply__cancel" @click="switchReply()" />
            </div>
          </div>
          <div class="reply__content">
            <div class="reply__template">
              <DropdownTemplate
                ref="dropdownTemplate"
                :label="$t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('ResponseModels')"
                icon="icon-gs-at-symbol"
                :configResponsesScore="configResponsesScore"
                :setContent="setContent"
                :appendResponses="appendResponses"
                :dataTemplate="dataTemplate"
                :rating="rating"
                :loading="customResponseLoading"
                :hasMoreTemplates="customResponseHasMoreTemplates"
              />
            </div>
            <div class="reply__item">
              <TextareaMaterial :title="$t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('title')" :type="textareaType" v-model="reply" />
            </div>
            <div class="reply__item" v-if="deep('review.reply.rejectedReason')">
              <div class="reply__rejected-reason">
                {{ deep('review.reply.rejectedReason') }}
              </div>
            </div>
            <div class="reply__item">
              <div class="reply__left">
                <strong class="reply__strong">{{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('Rules') }} :</strong>
                <br />
                <span>- {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('Rule1') }}</span>
                <br />
                <span>- {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('Rule2') }}</span>
                <br />
                <span>- {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('Rule3') }}</span>
                <br />
                <span>- {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('Rule4') }}</span>
                <br />
              </div>
              <div class="reply__right">
                <Button
                  type="orange"
                  size="sm"
                  @click="save"
                  :disabled="saving || !reply || reply.length === 0"
                >
                  <i v-if="saving" class="icon-gs-loading" />
                  {{ deep('review.reply.text') ? this.$t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')("ConfirmUpdate") : this.$t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')("ConfirmUpdateAndSave") }}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div class="card-folder-resume__thought-header criteria">
          <AppText tag="h4" class="card-folder-resume__thought-title" type="danger" bold>
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('criteria') }}
          </AppText>
        </div>
        <div
          class="card-folder-resume__thought-body"
          v-if="deep('unsatisfied.criteria') && deep('unsatisfied.criteria').length"
        >
          <AppText
            v-for="criterion of deep('unsatisfied.criteria')"
            tag="div"
            :key="criterion.label"
            class="card-folder-resume__thought-body__criterion"
          >
            <AppText tag="span" bold>
              {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')(criterion.label) }}
            </AppText>
            &nbsp;&nbsp;&nbsp;{{ subCriteria(criterion.value) }}
          </AppText>
        </div>
        <div class="card-folder-resume__thought-body" v-else>
          <AppText tag="span" class="card-folder-resume__thought-body__criterion" type="muted">
            {{ $t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('notSpecified') }}
          </AppText>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
import DropdownTemplate from '~/components/global/DropdownTemplate.vue';
import TextEmphasis from '~/components/global/TextEmphasis.vue';
import { getDataTemplate } from '~/util/filters.js';
import GarageTypes from '~/utils/models/garage.type.js';
import { getDeepFieldValue } from '~/utils/object.js';

export default {
  data: function () {
    return {
      replyOpened: false,
      reply: this.unsatisfiedTicket?.review?.reply?.text || this.unsatisfiedTicket?.review?.reply,
      saving: false,
      replyText: '',
      deep: (fieldName) => getDeepFieldValue(this.unsatisfiedTicket, fieldName),
    };
  },
  components: { TextEmphasis, DropdownTemplate },
  props: {
    unsatisfiedTicket: {
      type: Object,
      default: () => {},
    },
    isClose: Boolean,
    configResponsesScore: {
      type: Array,
      default: () => [],
    },
    garageSignatures: {
      type: Array,
      default: () => [],
    },
    currentUser: {
      type: Object,
      default: () => {},
    },
    fetchResponses: {
      type: Function,
      default: () => ({}),
    },
    createReviewReply: Function,
    updateReviewReply: Function,
    openModal: Function,
    customResponseAppendResponses: Function,
    customResponseLoading: Boolean,
    customResponseHasMoreTemplates: Boolean,
    addTicketAction: Function,
  },

  computed: {
    id() {
      return this.deep('id');
    },
    rating() {
      return this.deep('review.rating.value');
    },

    reviewReplyStatus() {
      return this.deep('review.reply.status');
    },

    classBindingComment() {
      if (this.rating >= 9) return 'success';
      if (this.rating >= 6) return 'erep-gold';
      return 'danger';
    },

    replyStatusMessage() {
      if (this.deep('review.reply.rejectedReason')) return this.deep('review.reply.rejectedReason');
      if (this.reviewReplyStatus === 'Approved') return this.$t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('modify');
      return this.$t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')('response');
    },

    textareaType() {
      if (this.reviewReplyStatus === 'Approved') {
        return 'success';
      } else if (this.reviewReplyStatus === 'Rejected') {
        return 'danger';
      } else if (this.reviewReplyStatus !== 'Rejected' && this.reviewReplyStatus !== 'Approved') {
        return 'muted';
      }
      return 'muted';
    },

    displayComment() {
      return this.deep('unsatisfiedTicket.comment') || this.deep('review.comment.text') || '';
    },

    // [SGS] show rating /5
    getBaseRating() {
      return this.deep('garage.type') === GarageTypes.VEHICLE_INSPECTION && this.deep('garage.ratingType') === 'stars'
        ? 5
        : 10;
    },
    dataTemplate() {
      return getDataTemplate(
        this.garageSignatures,
        this.deep('garage.id'),
        this.currentUser,
        this.deep('unsatisfiedTicket.customer.fullName'),
        this.deep('garage.publicDisplayName')
      );
    },
    reviewHasText() {
      return this.review?.comment?.text !== '' || false;
    },
  },
  mounted() {
    this.replyText = this.$refs.dropdownTemplate.changeValuesDataTemplate(this.deep('reply.text'), this.dataTemplate);
  },
  methods: {
    subCriteria(subCriteria) {
      if (subCriteria) {
        return subCriteria.map((crit) => this.$t_locale('components/cockpit/unsatisfied/_id/CardFolderResume')(`_${crit}`)).join(', ');
      }
      return '';
    },
    async switchReply(state = false) {
      if (state) {
        await this.fetchTemplateResponses();
      }
      this.replyOpened = state;
    },
    async save() {
      if (!this.saving) {
        this.saving = true;
        if (this.deep('review.reply.text')) {
          await this.createReviewReply({ id: this.id, comment: this.reply });
        } else {
          await this.updateReviewReply({ id: this.id, comment: this.reply });
        }
        if (this.reviewReplyStatus === 'Approved') {
          await this.switchReply();
        }
        this.saving = false;
        this.replyText = this.$refs.dropdownTemplate.changeValuesDataTemplate(
          this.deep('reply.text'),
          this.dataTemplate
        );
      }
    },
    showReopenModal() {
      this.openModal({
        component: 'ModalUnsatisfiedTicketReopen',
        props: {
          id: this.id,
          customerFullName: this.deep('unsatisfiedTicket.customer.fullName'),
          garageName: this.deep('garage.publicDisplayName'),
          addTicketAction: this.addTicketAction,
        },
      });
    },
    async fetchTemplateResponses() {
      await this.fetchResponses(this.rating, this.deep('garage.id'));
    },
    setContent(content) {
      this.reply = content;
    },
    async appendResponses() {
      await this.customResponseAppendResponses(this.rating);
    },
  },
};
</script>

<style lang="scss" scoped>
.reply {
  &--block {
    margin-left: 1rem;
  }

  &--muted {
    color: $black-grey;
  }

  &--success {
    color: $black-grey;
  }

  &--danger {
    color: $red;
  }

  &__cancel {
    cursor: pointer;
  }

  &__card {
    background-color: $very-light-grey;
  }

  &__rejected-reason {
    color: $red;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    background-color: $light-grey;
    padding: 0.5rem 1rem;
    font-weight: bold;
  }

  &__content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0.5rem 1rem;

    .blue {
      color: $blue;
    }
  }

  &__item {
    margin-bottom: 0.5rem;
    display: flex;
  }

  &__strong {
    padding-bottom: 0.5rem;
    display: inline-block;
    color: $black;
  }

  &__left {
    margin-top: 1rem;
    width: 75%;
    color: $dark-grey;
  }

  &__right {
    width: 25%;
    position: relative;

    .button--orange {
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }

  &__template {
    margin-left: -0.6rem;
    width: 320px;
  }
}

.card-folder-resume {
  padding: 1rem;

  &__part {
    &--header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-direction: column;
      overflow: hidden;
    }
  }

  &__header-left {
    display: flex;
    overflow: hidden;
  }

  &__header-left-part {
    &__icon {
      font-size: 2rem;
      color: $red;
      margin-left: 0.5rem;
    }
  }

  &__header-left-part + &__header-left-part {
    margin-left: 0.5rem;
    overflow: hidden;
  }

  &__header-right {
    display: none;
    flex-flow: column;
    margin-top: 0.5rem;
    margin-left: 52px;
  }

  &__header-right-part {
    display: flex;

    align-items: center;
    justify-content: flex-end;

    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
  }

  &__header-text {
    ::v-deep .text:not(:last-child) {
      padding-right: 0.5rem;
    }
  }

  &__thought {
    margin-top: 1rem;
  }

  &__thought-header {
    display: flex;
    flex-flow: row;
    align-items: center;
    margin: 0.5rem 0;

    &.criteria {
      margin-bottom: 0.7rem;
      margin-top: 1rem;
    }
  }

  &__thought-body {
    &__criterion {
      margin-left: 1rem;
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }
  }

  &__thought-link-answer {
    text-decoration: none;
    margin-left: 0.5rem;
    cursor: pointer;
  }
}

@media (min-width: $breakpoint-min-md) {
  .card-folder-resume {
    &__part {
      &--header {
        flex-direction: unset;
      }
    }

    &__header-right {
      display: flex;
      margin-top: 0;
      margin-left: 0;
    }
  }
}

// Below fixes a bug where IE11 fails to take the media query into account
_:-ms-fullscreen,
:root .card-folder-resume__part--header {
  flex-direction: row;
}
</style>
