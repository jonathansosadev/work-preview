<template>
  <ModalBase class="modal-connect-garages">
    <template #header-icon>
      <img :src="`/e-reputation/${source}.svg`" :alt="source">
    </template>
    <template #header-title>
      <AppText
        tag="p"
        size="md"
        bold
      >
        {{ source }}
      </AppText>
    </template>
    <template #header-subtitle>
      <AppText tag="p" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('plugSource', { source }) }}
      </AppText>
    </template>
    <template #header-subtitle-2>
      <AppText
        v-if="countDisconnectedGarages"
        tag="div"
        type="danger"
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('notPluggedGarages', { countDisconnectedGarages }) }}
      </AppText>
      <AppText
        v-else
        tag="div"
        type="success"
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('allGaragesPlugged') }}
      </AppText>
    </template>
    <template #bodyheader>
      <div class="modal-connect-garages__subscription" v-if="countUnsubscribeGarages">
        {{ $tc_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('unsubscribedGarages', countUnsubscribeGarages, { countUnsubscribeGarages }) }}
        <span
          v-if="!subscriptionRequestPending"
          class="modal-connect-garages__subscription--emphase"
          @click="subscribeErep"
        >{{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('subscribeNow') }}</span>
        <div v-if="subscriptionRequestPending">
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('pendingRequest') }}
        </div>
      </div>
      <div class="modal-connect-garages__status-selector">
        <div class="modal-connect-garages__status-selector__status">
          <input
            type="radio"
            id="all"
            value=""
            v-model="filter"
          >
          <label for="all">{{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('all') }}</label>
        </div>
        <div class="modal-connect-garages__status-selector__status">
          <input
            type="radio"
            id="connected"
            value="connected"
            v-model="filter"
          >
          <label for="connected">{{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('connectedGarages') }}</label>
        </div>
        <div class="modal-connect-garages__status-selector__status">
          <input
            type="radio"
            id="disconnected"
            value="disconnected"
            v-model="filter"
          >
          <label for="disconnected">{{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('notConnectedGarages') }}</label>
        </div>
      </div>
    </template>
    <template #body>
      <div class="modal-connect-garages__garage-list">
        <div
          class="modal-connect-garages__garage-list__garage-item"
          v-for="garage in filteredGarages"
          :key="garage.garageId"
        >
          <AppText tag="span">
            {{ garage.garagePublicDisplayName }} <AppText
              tag="span"
              type="danger"
              v-if="!garage.hasSubscription"
              bold
            >
              &nbsp;{{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('notConnected') }}
            </AppText>
          </AppText>
          <div class="button-wrapper">
            <Button
              v-if="!garage.hasSubscription"
              type="disabled"
              border="square"
              size="sm"
              disabled
            >
              {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('plug') }}
            </Button>
            <Button
              v-else-if="!isConnected(garage)"
              type="orange"
              border="square"
              size="sm"
              @click="connect(garage)"
            >
              {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('plug') }}
            </Button>
            <Button
              v-else
              type="white"
              border="square"
              size="sm"
              @click="disconnect(garage)"
            >
              {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectGarages')('unplug') }}
            </Button>
          </div>
        </div>
      </div>
    </template>
  </ModalBase>
</template>

<script>

export default {
  name: 'ModalConnectGarages',
  props: {
    source: String,
    erepConnections: {
      type: Object,
      required: true,
    },
    hasPendingSubscriptionRequest: Boolean,
    connectSource: {
      type: Function,
      required: true,
    },
    openModal: {
      type: Function,
      required: true,
    },
    closeModal: {
      type: Function,
      required: true,
    },
    childModalProps: Object,
  },

  data() {
    return {
      filter: '',
      erepGarages: null,
      countDisconnectedGarages: null
    }
  },

  async mounted() {
    this.erepGarages = this.erepConnections?.garages ?? [];
    this.countDisconnectedGarages = this.erepGarages.filter((garage) => !this.isConnected(garage)).length;
  },
  computed: {
    filteredGarages() {
      if (this.filter === 'connected') {
        return (
          Array.isArray(this.erepGarages)
          && this.erepGarages.filter((garage) => garage.hasSubscription
          && this.isConnected(garage))
        );
      } else if (this.filter === 'disconnected') {
        return (
          Array.isArray(this.erepGarages)
          && this.erepGarages.filter((garage) => !this.isConnected(garage))
        );
      }
      return this.erepGarages;
    },
    unsubscribeGarages() {
      return (
        this.erepGarages?.filter(g => !g.hasSubscription)
        || []
      );
    },
    countUnsubscribeGarages() {
      return this.unsubscribeGarages?.length;
    },
    subscriptionRequestPending() {
      return this.hasPendingSubscriptionRequest;
    },
  },
  methods: {
    isConnected({ connectedSources }) {
      return !!(connectedSources?.some(({ name }) => name === this.source));
    },
    connect(garage) {
      this.connectSource({
        garageId: garage.garageId,
        source: this.source,
      });
    },
    disconnect(garage) {
      this.closeModal();
      this.openModal({
        component: 'ModalDisconnectService',
        props: {
          ...this.getModalPropsByName('ModalDisconnectService'),
          source: this.source,
          garage,
        },
      });
    },
    getModalPropsByName(modalName) {
      return this.childModalProps?.[modalName] || {};
    },
    subscribeErep() {
      this.closeModal();
      this.openModal({
        component: 'ModalConfirmSubscription',
        props: {
          ...this.getModalPropsByName('ModalConfirmSubscription'),
          pricing: true,
          garageId: this.unsubscribeGarages[0].garageId,
          childModalProps: this.childModalProps,
        },
      });
    },
  }
}
</script>

<style lang="scss" scoped>

  .modal-connect-garages {
    overflow: hidden;

    :nth-child(2) {
      border-bottom: none;
    }
    &__subscription {
      background: $golden;
      color: $white;
      text-align: center;
      font-size: 1rem;
      border-radius: 2px;
      padding: 1rem 0;
      margin: 1rem 0 1rem 0;

      &--emphase {
        text-decoration: underline;
        font-weight: 600;
        cursor: pointer;
      }
    }

    &__status-selector {
      display: flex;
      align-items: center;
      margin: .5rem 0 1rem 0;

      &__status {
        margin-right:1rem;
        > input {
          margin-right:0.25rem;
        }
        > label {
          position:relative;
          top:-0.15rem;
        }
        &:last-child {
          margin:0;
        }
      }
    }

    &__garage-list {
      display:flex;
      flex-direction:column;
      overflow:auto;
      max-height:100%;
      @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
        max-height: 350px;
      }
      &__garage-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-top: 1px solid #dedede;

        & > span {
          margin-right: 15px;
        }

        .button-wrapper {
          width: 100px;
          display: flex;
          flex-flow: column;
          align-items: stretch;
          margin-right: 1rem;
        }
      }
    }
  }
</style>
