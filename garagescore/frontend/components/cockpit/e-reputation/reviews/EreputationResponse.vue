<template>
  <section class="ereputation-response">
    <Button
      v-if="isOpen"
      type="muted"
      border="square"
      @click="toggle()"
    >
      <div class="button-content">
        <i class="icon-gs-up" />
        <span class="button-text">{{ $t_locale('components/cockpit/e-reputation/reviews/EreputationResponse')('cancel') }}</span>
      </div>
    </Button>

    <Button
      v-else-if="approved"
      type="success"
      border="square"
      @click="toggle()"
    >
      <div class="button-content">
        <i class="icon-gs-validation-check-circle"></i>
        <span class="button-text">{{ $t_locale('components/cockpit/e-reputation/reviews/EreputationResponse')('approved') }}</span>
      </div>
    </Button>

    <Button
      v-else-if="rejected"
      type="danger"
      border="square"
      @click="toggle()"
    >
      <div class="button-content">
        <i class="icon-gs-edit"></i>
        <span class="button-text">{{ $t_locale('components/cockpit/e-reputation/reviews/EreputationResponse')('rejected') }}</span>
      </div>
    </Button>

    <Button
      v-else
      type="orange"
      border="square"
      @click="toggle()"
    >
      <div class="button-content">
        <i class="icon-gs-edit"></i>
        <span class="button-text">{{ $t_locale('components/cockpit/e-reputation/reviews/EreputationResponse')('answer') }}</span>
      </div>
    </Button>

    <div v-if="approved" style="margin-top:0.8rem; text-align:center;">
      <AppText
        type="muted"
        tag="span"
        bold
      >
        {{ $t_locale('components/cockpit/e-reputation/reviews/EreputationResponse')('response') }}
      </AppText>
      <AppText bold tag="span">
        {{ $moment(commentDate).format('DD/MM/YYYY') }}
      </AppText>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    review: Object,
    getRowSubview: {
      type: Function,
      required: true,
    },
  },

  computed: {
    comment() {
      return this.review.publicReviewComment;
    },
    approved() {
      return (
        (this.comment &&
          this.review.publicReviewCommentStatus === "Approved") ||
        this.threadResponded
      );
    },
    rejected() {
      return this.review.publicReviewCommentStatus === "Rejected";
    },
    commentDate() {
      return (
        this.review.publicReviewCommentApprovedAt ||
        this.threadResponseFromOwner.approvedAt
      );
    },
    thread() {
      return this.review.thread || [];
    },
    isOpen() {
      return this.getRowSubview(this.review.id) === "publicReviewComment";
    },
    threadResponded() {
      return this.thread.some(
        e => e.isFromOwner || (e.replies && e.replies.some(r => r.isFromOwner))
      );
    },
    threadResponseFromOwner() {
      return (
        this.thread.find(
          e =>
            e.isFromOwner || (e.replies && e.replies.find(r => r.isFromOwner))
        ) || {}
      );
    }
  },

  methods: {
    toggle() {
      this.$emit("toggle");
    }
  }
};
</script>

<style lang="scss" scoped>
.ereputation-response {
  display: flex;
  flex-flow: column;
  align-items: stretch;
  justify-content: center;
  width: 80%;

  .button-content {
    display: flex;
    align-items: center;
    padding: 0 1rem;

    i {
      display: none;
    }

    span {
      flex: 1;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .ereputation-response {
    .button-content {
      i {
        display: block;
      }
    }
  }
}
</style>
