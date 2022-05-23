<template>
  <ModalBase class="modal-connect-garages">
    <template slot="header-icon">
      <img :src="`/e-reputation/${source}.svg`" :alt="source">
    </template>

    <template slot="header-title">
      <AppText
        tag="div"
        size="md"
        bold
      >
        {{ source }}
      </AppText>
    </template>

    <template slot="header-subtitle">
      <AppText tag="div" type="muted">
        {{ garageName }}
      </AppText>
    </template>

    <template slot="header-subtitle-2">
      <AppText tag="div" type="primary">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalDeleteReply')('subtitle') }}
      </AppText>
    </template>

    <template slot="body">
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalDeleteReply')('whereDeleted', { source }) }}
      </AppText><br>
      <AppText
        tag="div"
        type="muted"
        italic
      >
        "{{ text }}"
      </AppText>
    </template>

    <template slot="footer">
      <div class="buttons">
        <Button
          type="orange"
          border="square"
          @click="remove"
        >
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalDeleteReply')('confirm') }}
        </Button>
        <Button
          type="white"
          border="square"
          @click="cancel"
        >
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalDeleteReply')('cancel') }}
        </Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>

export default {
  name: "ModalDeleteReply",
  props: {
    review: Object,
    removeReviewReply: {
      type: Function,
      required: true,
    },
    closeModal: {
      type: Function,
      required: true,
    }
  },
  computed: {
    source() {
      return this.review.source;
    },
    garageName() {
      return this.review.garagePublicDisplayName;
    },
    text() {
      return this.review.publicReviewComment;
    }
  },
  methods: {
    async remove() {
      await this.removeReviewReply({ review: this.review });
      await this.closeModal();
    },
    cancel() {
      this.closeModal();
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-connect-garages {
  max-height: 80vh;
  overflow-y: auto;

  .header-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: left;

    .header-logo {
      img {
        width: 40px;
      }
    }

    .header-info {
      flex: 1;
      height: 65px;
      display: flex;
      flex-flow: column;
      align-items: flex-start;
      justify-content: space-between;
      padding-left: 15px;
    }
  }

  .buttons {
    display: flex;
    flex: 1;
    align-items: stretch;
    justify-content: flex-end;

    button {
      margin-left: 10px;
    }
  }
}
</style>
