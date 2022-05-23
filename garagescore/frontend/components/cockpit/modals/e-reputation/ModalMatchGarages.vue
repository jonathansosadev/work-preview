<template>
  <ModalBase class="modal-connect-garages">
    <template #header-icon>
      <img :src="`/e-reputation/${source}.svg`" :alt="source">
    </template>
    <template #header-title>
      <AppText
        tag="div"
        size="md"
        bold
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('connectionTo', { source }) }}
      </AppText>
    </template>

    <template #header-subtitle>
      <AppText tag="div" type="primary">
        {{ $tc_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('garagesDetected', garagesToMatchCount, { garagesToMatchCount, source }) }}
      </AppText>
    </template>

    <template #body>
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('helpRequired', { source }) }}
      </AppText>
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('matchSourceGarages', { source }) }}
      </AppText>
      <div class="garages-header">
        <div class="garages-header-logo">
          <img :src="`/e-reputation/${source}.svg`" :alt="source">
          <AppText tag="span" type="muted">
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('garages', { source }) }}
          </AppText>
        </div>
        <div class="garages-header-logo">
          <img src="/e-reputation/Garagescore.svg" alt="GarageScore">
          <AppText tag="span" type="muted">
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('garages', { source: 'GarageScore' }) }}
          </AppText>
        </div>
      </div>
      <div class="garages-to-match">
        <div
          class="garage"
          v-for="garage in garagesToMatch"
          :key="garage.externalId"
        >
          <div class="garage-name">
            <AppText tag="div" bold>
              {{ garage.name }}
            </AppText>
          </div>
          <select v-model="matchings[garage.externalId].value" @change="debouncedSave(garage.externalId)">
            <option
              v-if="!isMatched(garage.externalId)"
              value=""
              disabled
              selected
            >
              {{ $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('selectGSGarage') }}
            </option>
            <option
              v-else-if="!debouncing"
              :value="matchings[garage.externalId].value"
              disabled
            >
              {{ matchings[garage.externalId].name }}
            </option>
            <option
              v-for="gsGarage in filteredAvailableGsGarages"
              :key="gsGarage.garageId"
              :value="gsGarage.garageId"
              :disabled="isDisabled(gsGarage)"
            >
              {{ gsGarage.hasSubscription ? '' : $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('notSubscribed') }} {{ gsGarage.garagePublicDisplayName }}
            </option>
          </select>
          <div class="garage-state" :title="stateTitle(garage.externalId)">
            <i
              v-if="isSaved(garage.externalId)"
              class="icon-gs-validation-check-circle"
            />
            <i
              v-else-if="isSaving(garage.externalId)"
              class="icon-gs-loading"
            />
            <i v-else class="icon-gs-help-question-circle" />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="message--and--buttons">
        <div class="message">
          <AppText
            v-if="!garagesToMatchCount"
            tag="span"
            type="danger"
          >
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('nothingDetected', { source }) }}
          </AppText>
          <AppText
            v-else-if="remainingGaragesToMatch"
            tag="span"
            type="danger"
          >
            {{ $tc_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('matchingsLeft', remainingGaragesToMatch, { remainingGaragesToMatch }) }}
          </AppText>
          <AppText
            v-else
            tag="span"
            type="success"
          >
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('allGaragesReady') }}
          </AppText>
        </div>
        <div class="buttons">
          <Button
            :type="buttonType"
            border="square"
            :disabled="debouncing"
            @click="close"
          >
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('close') }}
          </Button>
        </div>
      </div>
    </template>
  </ModalBase>
</template>


<script>
import { debounce } from 'lodash';

export default {
  name: 'ModalMatchGarages',
  props: {
    source: String,
    garagesToMatch: Array,
    baseGarageId: String,
    // todo fix prop mutation
    matchings: Object,
    closeModal: {
      type: Function,
      required: true,
    },
    refreshView: {
      type: Function,
      required: true,
    },
    erepConnections: {
      type: Object,
      required: true,
    },
    sendMatchGarages: {
      type: Function,
      required: true,
    },
  },

  async mounted() {
    this.availableGarages = this.erepConnections?.garages ?? [];
    this.debounceEvent = debounce((id) => this.save(id), 1000);
  },

  data() {
    return {
      debounceEvent: null,
      hasChange: false,
      debouncing: false,
      availableGarages: [],
    };
  },

  computed: {
    garagesToMatchCount() {
      return this.garagesToMatch ? this.garagesToMatch.length : 0;
    },
    remainingGaragesToMatch() {
      let nb = 0;

      for (const match of Object.keys(this.matchings)) {
        if (!this.matchings[match].value || this.matchings[match].state !== 'Saved') {
          ++nb;
        }
      }
      return nb;
    },
    matchingValues() {
      return Object.values(this.matchings).map(m => m.value)
    },
    filteredAvailableGsGarages() {
      return this.availableGarages.filter((g) => !g.connectedSources.find(({ name }) => name === this.source));
    },
    buttonType() {
      if (!this.garagesToMatchCount) {
        return 'orange';
      }
      for (const match of Object.keys(this.matchings)) {
        if (!this.matchings[match].value || this.matchings[match].state !== 'Saved') {
          return 'orange';
        }
      }
      return 'success';
    }
  },
  methods: {
    close() {
      this.closeModal();
      if (this.hasChange) {
        this.refreshView();
      }
    },
    isSaved(id) {
      return Boolean(this.matchings[id] && this.matchings[id].state === 'Saved' && this.matchings[id].value !== '');
    },
    isSaving(id) {
      return Boolean(this.matchings[id] && this.matchings[id].state === 'Saving' && this.matchings[id].value !== '');
    },
    stateTitle(id) {
      if (this.isSaved(id)) {
        return this.$t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('savedMatching');
      } else if (this.isSaving(id)) {
        return this.$t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('saving');
      }
      return this.$t_locale('components/cockpit/modals/e-reputation/ModalMatchGarages')('selectGarage');
    },
    debouncedSave(id) {
      this.debouncing = true;
      this.debounceEvent(id);
    },
    isMatched(externalId) {
      for (const { garageId, garagePublicDisplayName, connectedSources } of this.availableGarages) {
        const connectionInfo = connectedSources.find(({ name }) => name === this.source);
        if (connectionInfo && connectionInfo.externalId === externalId) {
          return { gsGarageId: garageId, gsGarageName: garagePublicDisplayName };
        }
      }
      return null;
    },
    async save(id) {
      this.matchings[id].state = 'Saving';
      const success = await this.sendMatchGarages({
        source: this.source,
        externalGarageId: id,
        garageId: this.matchings[id].value,
        oldGarageId: this.matchings[id].oldValue,
        baseGarageId: this.baseGarageId
      });
      this.matchings[id].state = success ? 'Saved' : 'Unsaved';
      if (success) {
        this.hasChange = true;
        const match = this.isMatched(id);
        if (match) {
          this.matchings[id].name = match.gsGarageName;
          this.matchings[id].oldValue = match.gsGarageId;
        }
      }
      this.debouncing = false;
    },
    isDisabled(garage) {
      return !garage.hasSubscription || this.matchingValues.includes(garage.garageId)
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
      height: 40px;
      display: flex;
      flex-flow: column;
      align-items: flex-start;
      justify-content: space-between;
      padding-left: 15px;
    }
  }

  .garages-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 30px 0 15px 0;
    .garages-header-logo {
      display: flex;
      align-items: center;
      img {
        width: 25px;
        margin-right: 10px;
      }
    }
  }

  .garages-to-match {
    display: flex;
    flex-flow: column;
    .garage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #dddddd;
      padding: 12px 0;
      .garage-name {
        flex: 1;
      }
      select {
        width: 350px;
        margin-left: 20px;
      }
      .garage-state {
        margin-left: 10px;
        .icon-gs-validation-check-circle {
          color: $green;
        }
      }
    }
  }

  .message--and--buttons {
    display: flex;
    align-items: center;
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
