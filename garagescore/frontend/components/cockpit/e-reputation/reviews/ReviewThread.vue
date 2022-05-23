<template>
  <div class="review-thread">
    <div class="review-thread__comments">
      <div
        class="review-thread__comment"
        v-for="comment in comments"
        :key="comment.id"
      >
        <div class="review-thread__comment-body">
          <div class="review-thread__comment-reply">
            <textarea
              class="review-thread__textarea"
              :placeholder="$t_locale('components/cockpit/e-reputation/reviews/ReviewThread')('writeAnswer')"
              v-model="comment.text"
              @input="resize($event)"
            />
            <Button
              type="orange"
              @click="updateReply(comment.id, comment)"
              v-if="updates[comment.id] && comment.text !== updates[comment.id].value"
            >
              {{ $t_locale('components/cockpit/e-reputation/reviews/ReviewThread')('confirm') }}
            </Button>
          </div>

          <div class="review-thread__body-footer">
            <span class="review-thread__comment-date">
              {{ $moment(comment.approvedAt).format('DD MMMM YYYY - h:mm') }}
            </span>
          </div>

          <template v-if="comment.replies">
            <div
              class="review-thread__comment-reply review-thread__comment-replies"
              v-for="replyComment in comment.replies"
              :key="replyComment.id"
            >
              <i class="icon-gs-arrow-bend-down-right review-thread__reply-icon"></i>
              <textarea
                class="review-thread__textarea"
                :placeholder="$t_locale('components/cockpit/e-reputation/reviews/ReviewThread')('writeAnswer')"
                v-model="reply.text"
                @input="resize($event)"
              />
              <Button
                type="orange"
                @click="updateReply(comment.id, reply, reply.id)"
                v-if="updates[reply.id] && reply.text !== updates[reply.id].value"
              >
                {{ $t_locale('components/cockpit/e-reputation/reviews/ReviewThread')('confirm') }}
              </Button>
            </div>
          </template>
          <div class="review-thread__comment-answer">
            <i class="icon-gs-arrow-bend-down-right review-thread__reply-icon"></i>
            <textarea
              class="review-thread__textarea"
              :placeholder="$t_locale('components/cockpit/e-reputation/reviews/ReviewThread')('writeAnswer')"
              v-model="replies[comment.id]"
              @input="resize($event)"
            />
            <Button
              type="orange"
              @click="sendReply(comment, replies[comment.id])"
              v-if="replies[comment.id] && replies[comment.id].length > 0"
            >
              {{ $t_locale('components/cockpit/e-reputation/reviews/ReviewThread')('confirm') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="commentRejectionReason">
      <p class="review-thread__rejected-reason">
        {{ commentRejectionReason }}
      </p>
    </div>
    <div class="review-thread__answer">
      <textarea
        class="review-thread__textarea"
        :placeholder="$t_locale('components/cockpit/e-reputation/reviews/ReviewThread')('writeComment')"
        v-model="reply"
        @input="resize($event)"
      />
      <Button
        type="orange"
        :disabled="reply && reply.length === 0"
        @click="sendReply()"
      >
        {{ $t_locale('components/cockpit/e-reputation/reviews/ReviewThread')('confirm') }}
      </Button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    review: Object,
    onSendReply: {
      type: Function,
      reuired: true,
    },
    onUpdateThreadReply: {
      type: Function,
      required: true,
    }
  },

  data() {
    return {
      replies: {},
      reply: '',
      updates: {},
    };
  },

  mounted() {
    this.reset();
  },

  computed: {
    comments() {
      return this.review.thread || [];
    },

    commentRejectionReason() {
      return this.review.publicReviewCommentRejectionReason || null;
    },
  },

  methods: {
    reset() {
      for (const comment of this.comments) {
        this.$set(this.replies, comment.id, '');
        this.$set(this.updates, comment.id, {
          value: comment.text,
          updating: false,
        });
        for (const subComment of this.subComments(comment)) {
          this.$set(this.updates, subComment.id, {
            value: subComment.text,
            updating: false,
          });
        }
      }
      this.reply = '';
    },

    subComments(comment) {
      return comment?.replies || [];
    },

    async sendReply(comment) {
      this.onSendReply({
        reviewId: this.review.id,
        commentId: comment ? comment.id : null,
        review: this.review,
        text: comment ? this.replies[comment.id] : this.reply,
        replyId: comment && comment.id ? !!this.replies[comment.id] : false,
      });
      this.reset();
    },
    async updateReply(commentId, { text }, replyId = undefined) {
      this.onUpdateThreadReply({
        replyId: replyId ? replyId : undefined,
        commentId,
        review: this.review,
        text,
      });
      this.reset();
    },

    resize(e) {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    },
  },
};
</script>

<style lang="scss" scoped>
.review-thread {
  &__rejected-reason {
    color: $red;
  }

  &__reply {
    margin-left: 1em;
  }

  &__comment {
    & + & {
      margin-top: 1rem;
    }
  }

  &__comment-title {
    font-size: 0.9rem;
    font-weight: bold;
  }

  &__comment-date {
    color: $dark-grey;
    font-size: 0.9rem;
  }

  &__body-footer {
    margin: 0.3rem 0 0.7rem 0;
  }

  &__reply-icon {
    color: $grey;
  }

  &__comment-answer,
  &__comment-reply {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

    * + * {
      margin-left: 0.5rem;
    }
  }

  &__answer {
    margin-top: 1rem;

    display: flex;
    align-items: flex-end;
    flex-direction: column;

    * + * {
      margin-top: 1rem;
    }
  }

  &__textarea {
    padding: 0.5rem;
    box-sizing: border-box;
    border-radius: 5px;
    border: 1px solid $grey;
    color: $greyish-brown;
    width: 100%;
    background-color: $white;
    resize: vertical;
    line-height: 1.5;
    outline: none;
    display: block;

    &:focus {
      box-shadow: inset 0 0 2px $blue;
      border: 1px solid $blue;
    }

    &::placeholder {
      color: $grey;
    }

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background-color: $grey;
      border-radius: 10px;
      box-shadow: 0 0 6px rgba($black, 0.2);
    }

    &::-webkit-scrollbar-thumb {
      background: rgba($white, 0.5);
      border-radius: 10px;
    }
  }
}
</style>
