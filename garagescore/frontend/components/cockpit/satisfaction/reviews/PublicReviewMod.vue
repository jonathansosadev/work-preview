<template>
  <div class="public-review-mod">
    <div class="public-review-mod__body">
      <div class="public-review-mod__body-part">
        <AppText
          tag="label"
          class="public-review-mod__label"
          size="sm"
        >
          {{ $t_locale('components/cockpit/satisfaction/reviews/PublicReviewMod')('Intro') }} :
        </AppText>
      </div>
      <div class="public-review-mod__body-part">
        <TextareaMaterial
          rows="5"
          v-model="message"
          v-if="!requestSuccessfullySent"
        />
        <div v-if="requestSuccessfullySent" class="public-review-mod__green-box">
          {{ $t_locale('components/cockpit/satisfaction/reviews/PublicReviewMod')('Sent') }}
        </div>
        <div v-if="error" class="public-review-mod__red-box">
          {{ $t_locale('components/cockpit/satisfaction/reviews/PublicReviewMod')('serverError') }}
        </div>
      </div>
      <div
        class="public-review-mod__body-part public-review-mod__body-part--mt-b public-review-mod__body-part--end"
        v-if="!requestSuccessfullySent"
      >
        <Button
          type="orange"
          @click="submit"
          :disabled="loading || message === ''"
          size="sm"
          :loading="loading"
        >
          {{ $t_locale('components/cockpit/satisfaction/reviews/PublicReviewMod')('Send') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: { type: String, required: true },
    submitPublicReviewReport: { type: Function, required: true },
  },

  data() {
    return {
      message: '',
      loading: false,
      requestSuccessfullySent: false,
      error: false,
    };
  },

  methods: {
    async submit() {
      this.loading = true;
      const resp = await this.submitPublicReviewReport({ id: this.id, message: this.message });
      this.loading = false;
      if (resp && resp.status) {
        this.error = false;
        this.requestSuccessfullySent = true;
      } else {
        this.error = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.public-review-mod {
  &__submit-wrapper {
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba($black, 0.9);
  }

  &__body {
    display: flex;
    flex-flow: column;
    position: relative;
  }

  &__green-box {
    background-color: #dff0d8;
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 1rem;
  }

  &__red-box {
    background-color: #d50000;
    padding: 1rem;
    border-radius: 5px;
    margin-bottom: 1rem;
  }

  &__body-part {
    display: flex;
    flex-wrap: wrap;

    & + & {
      margin-top: 0.25rem;

      &--mt-b {
        margin-top: 1rem;
      }
    }

    &--end {
      justify-content: flex-end;
    }
  }


  &__label {
    margin-bottom: 1rem;
  }

  &__textarea {
    border: 1px solid $black-grey;
    background-color: white;
    border-radius: 10px;
    padding: 1rem;
    outline: none;
    margin-bottom: 1rem;
    border-radius: 5px;
  }
}
</style>



