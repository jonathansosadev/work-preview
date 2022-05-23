<template>
  <ModalBase class="modal-add-source">
    <template slot="header-icon">
      <div class="modal-add-source__icon">
        <img :src="`/cross-leads/${crossLead.type}.svg`"/>
      </div>
    </template>
    <template slot="header-title">
      <span>{{ $t_locale('components/cockpit/admin/sources/ModalAddSource')("title") }}</span>
    </template>
    <template slot="header-subtitle">
      <span>{{ $t_locale('components/cockpit/admin/sources/ModalAddSource')("infos") }}</span>
    </template>
    <template slot="body">
      <div class="modal-add-source__content__field">
        <div class="modal-add-source__content__field__label">
          {{ $t_locale('components/cockpit/admin/sources/ModalAddSource')("garage") }}
        </div>
        <multiselect
          :placeholder="$t_locale('components/cockpit/admin/sources/ModalAddSource')('ChooseGarage')"
          label="publicDisplayName"
          track-by="publicDisplayName"
          v-model="selectedGarage"
          :multiple="false"
          :hide-selected="true"
          :select-label="$t_locale('components/cockpit/admin/sources/ModalAddSource')('clickToConfirm')"
          :options="garages"
          :disabled="!!source"
          :custom-label="customLabel"
        >
          <template slot="singleLabel" slot-scope="{ option }">
            {{ option.publicDisplayName }}
            <AppText tag="span" type="danger" v-if="!isRunning(option)" bold>&nbsp;- {{ $t_locale('components/cockpit/admin/sources/ModalAddSource')('notStarted').toLowerCase() }}</AppText>
          </template>
          <template slot="noResult">{{ $t_locale('components/cockpit/admin/sources/ModalAddSource')("NoGarages") }}.</template>
        </multiselect>
      </div>

      <Notification v-if="isConflict" type="danger" class="notification" fixed>
        <template slot>
          <i class="icon-gs-alert-information-circle icon"></i>
          <span>{{ isConflict }}</span>
        </template>
      </Notification>

      <div class="modal-add-source__content__field">
        <InputMaterial
          v-model="email"
          :placeholder="$t_locale('components/cockpit/admin/sources/ModalAddSource')('typeEmail')"
          :disabled="!!source || !!isConflict"
          type="email"
          :isValid="emailValid ? 'Valid' : 'Invalid'"
          :validate="res => validateEmail(res)"
          required
        >
          <template slot="label">{{ `${$t_locale('components/cockpit/admin/sources/ModalAddSource')("emailLabel")} ${$t_locale('components/cockpit/admin/sources/ModalAddSource')(crossLead.type)}` }}</template>
        </InputMaterial>
      </div>

      <Notification type="primary" class="notification" fixed>
        <template slot>
          <i class="icon-gs-alert-information-circle icon"></i>
          <span>{{ restrictMobile ? $t_locale('components/cockpit/admin/sources/ModalAddSource')('infoNoMobile') : $t_locale('components/cockpit/admin/sources/ModalAddSource')('info') }}</span>
        </template>
      </Notification>

      <div class="modal-add-source__fields">
        <div class="modal-add-source__content__field" v-for="(phone, index) in phones" :key="index">
          <PhoneInputMaterial
            v-model="phones[index].value"
            :validate="res => validatePhone(res, index)"
            :mode="restrictMobile ? 'landLine' : 'any'"
            :countries="['FR', 'MC']"
            :placeholder="$t_locale('components/cockpit/admin/sources/ModalAddSource')('phonePlaceholder')"
            :disabled="!!source || !!isConflict"
            required
          >
            <template slot="label">
              <span>{{ !index ? `${$t_locale('components/cockpit/admin/sources/ModalAddSource')("phoneLabel")} ${$t_locale('components/cockpit/admin/sources/ModalAddSource')(crossLead.type)}` : $t_locale('components/cockpit/admin/sources/ModalAddSource')("phoneLabelPrev") }}</span>
            </template>
            <template slot="kill">
              <i v-if="!phones[index + 1] && index" v-on:click="phones.pop()" class="icon-gs-close modal-add-source__remove"></i>
            </template>
          </PhoneInputMaterial>
        </div>
      </div>
      <button v-if="!source" class="add-phone" @click="handleAddPhone">
        <i class="icon-gs-add-outline-circle"></i>
        <span class="add-phone__label">{{ $t_locale('components/cockpit/admin/sources/ModalAddSource')("addPhone") }}</span>
      </button>
      <SourcePreview class="modal-add-source__preview" v-if="source" :email="source.email" :phone="source.phone" :url="crossLead.url" :sourceType="$t_locale('components/cockpit/admin/sources/ModalAddSource')(sourceType)" />
      <LoadingScreen :message="$t_locale('components/cockpit/admin/sources/ModalAddSource')('wait')" v-if="loading"/>
      <div v-if="error" class="modal-add-source__error-container">
        {{ $t_locale('components/cockpit/admin/sources/ModalAddSource')(error) }}
      </div>
    </template>
    <template slot="footer">
      <div v-if="!source" class="modal-add-source__footer">
        <Button type="cancel" class="btn" @click="handleCancel">{{ $t_locale('components/cockpit/admin/sources/ModalAddSource')("cancel") }}</Button>
        <Button type="orange" class="btn validate-closing-btn" :disabled="isFormInvalid" @click="handleAddSource">
          {{ $t_locale('components/cockpit/admin/sources/ModalAddSource')("submit") }}
        </Button>
      </div>
      <div v-else class="modal-add-source__footer">
        <Button type="cancel" class="btn" @click="handleCancel">{{ $t_locale('components/cockpit/admin/sources/ModalAddSource')("close") }}</Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
import SourcePreview from "~/components/cockpit/admin/sources/SourcePreview.vue";
import LoadingScreen from "~/components/global/LoadingScreen.vue";
import sourceTypes from "../../../../utils/models/source-types";

export default {
  props: {
    sourceType: { type: String },
    onAddSource: { type: Function }
  },

  components: { SourcePreview, LoadingScreen },

  data() {
    return {
      loading: false,
      selectedGarage: null,
      phones: [{ value: "", valid: false }],
      email: "",
      emailValid: false,
      phonesCount: 1,
      source: null
    };
  },

  computed: {
    crossLead() {
      return this.$store.getters["cockpit/admin/crossLeads/crossLeadByType"](this.sourceType);
    },

    availableCrossLeadsGarages() {
      return this.$store.getters["cockpit/availableCrossLeadsGarages"];
    },

    crossLeads() {
      return this.$store.getters["cockpit/admin/crossLeads/crossLeads"];
    },

    garages() {
      const crossLead = this.crossLeads.find(c => c.type === this.sourceType);
      let garageIds = [];
      if (crossLead) garageIds = crossLead.sources.map(s => s.garageId);
      return this.availableCrossLeadsGarages.filter(g => !garageIds.includes(g.id));
    },

    isFormInvalid() {
      return !(
        !!this.selectedGarage &&
        !!this.email &&
        !!this.emailValid &&
        this.phones.every(p => p.valid === true) &&
        this.isRunning(this.selectedGarage)
      );
    },

    restrictMobile() {
      if (!this.selectedGarage) return false;
      return this.selectedGarage.subscriptions && this.selectedGarage.subscriptions.restrictMobile;
    },

    error() {
      return this.$store.getters["cockpit/admin/crossLeads/error"];
    },

    isConflict() {
      if (!this.selectedGarage) return;
      let configuredGarages = null;
      let sourceConflict = null;
      switch (this.sourceType) {
        case sourceTypes.OUEST_FRANCE_AUTO:
          configuredGarages = this.crossLeads.find(c => c.type === sourceTypes.ZOOMCAR);
          sourceConflict = configuredGarages.sources.find(g => g.garageId === this.selectedGarage.id);
          if (sourceConflict) return this.$t_locale('components/cockpit/admin/sources/ModalAddSource')('conflict', { sourceType: sourceTypes.ZOOMCAR });
          break;
        case sourceTypes.ZOOMCAR:
          configuredGarages = this.crossLeads.find(c => c.type === sourceTypes.OUEST_FRANCE_AUTO);
          sourceConflict = configuredGarages.sources.find(g => g.garageId === this.selectedGarage.id);
          if (sourceConflict) return this.$t_locale('components/cockpit/admin/sources/ModalAddSource')('conflict', { sourceType: sourceTypes.OUEST_FRANCE_AUTO });
          break;
        default:
          return;
      }
    },
  },

  beforeDestroy() {
    this.$store.commit("cockpit/admin/crossLeads/setError", null);
  },

  watch: {
    selectedGarage(val) {
      if (val && !this.isRunning(val)) {
        this.$store.commit("cockpit/admin/crossLeads/setError", 'notStartedError');
      } else this.$store.commit("cockpit/admin/crossLeads/setError", null);
    }
  },

  methods: {
    isRunning: ({ status }) => ['RunningAuto', 'RunningManual'].includes(status),
    customLabel(garage) {
      let customLabel = garage.publicDisplayName;
      if (!this.isRunning(garage)) customLabel += ` - ${this.$t_locale('components/cockpit/admin/sources/ModalAddSource')('notStarted')}`;
      return customLabel;
    },
    validatePhone(validationResult, index) {
      this.phones[index].valid = validationResult && (this.phones.filter(p => p.value === this.phones[index].value).length === 1);
    },

    validateEmail(res) {
      this.emailValid = res;
    },

    async handleAddSource() {
      if (this.selectedGarage) {
        this.$store.commit("cockpit/admin/crossLeads/setError", null);
        this.loading = true;
        this.source = await this.$store.dispatch("cockpit/admin/crossLeads/addOrUpdateSource", {
          mutation: "setSource",
          payload: {
            type: this.sourceType,
            garageId: this.selectedGarage.id,
            followed_phones: this.phones.map(p => p.value),
            followed_email: this.email
          }
        });
        let container = this.$el.querySelector(".modal-base__body--long-body");
        if (container && container.length) container = container[0];
        if (container) container.scrollTop = container.scrollHeight;
        this.loading = false;
      }
    },

    handleCancel() {
      this.$store.dispatch("closeModal");
    },

    handleAddPhone() {
      this.phonesCount += 1;
      this.phones = [...this.phones, { value: "", valid: false }];
    }
  }
};
</script>

<style lang="scss" scoped>
  ::v-deep .multiselect__tags {
    padding: 8px 40px 0 0;
    border: none;
    border-radius: unset;
    display: block;
    border-bottom: 2px solid #bcbcbc;
    width: 100%;
  }
  ::v-deep .multiselect__option--highlight {
    background: $light-grey;
    color: $black;
  }
  ::v-deep .multiselect__option {
    padding: 6px;
    height: 30px;
    min-height: 30px;
    line-height: 14px;
  }
  ::v-deep span.multiselect__option.multiselect__option--highlight::after {
    display: none;
  }
  ::v-deep .multiselect__placeholder {
    font-size: 1.15rem;
    font-weight: 400;
  }
  ::v-deep .multiselect__content-wrapper {
    max-height: 14rem !important;
  }
  .notification {
    font-family: Lato;
    font-weight: 400;
    font-size: 1rem;
    margin-top: 0;
    margin-bottom: 0.6rem;
  }
  .icon {
    margin-right: 0.5rem;
    font-size: 1.36rem;
    vertical-align: bottom;
  }
  ::v-deep .phone-input-material__prompt__input {
    width: calc(100% - 76px - 0.5rem - 35px) !important;
  }
  .modal-add-source {
    &__preview {
      margin-top: 1rem;
    }
    &__remove {
      cursor: pointer;
    }
    &__content {
      position: relative;
      &__field {
        margin-bottom: 1rem;
        &__label {
          font-size: 1rem;
        }
        &__input {
          margin: 0;
        }
      }
    }

    &__icon {
      height: 2.5rem;
      width: 2.5rem;

      img {
        display: block;
        height: 100%;
        width: 100%;
        object-fit: contain;
      }
    }

    &__help {
      margin-left: 0.36rem;
      color: $grey;
      font-size: 0.64rem;
    }

    &__fields {
    }

    &__error-container {
      color: $red;
      font-size: 1rem;
      margin-top: 1rem;
    }

    &__infos {
      font-size: 0.93rem;
      margin-bottom: 1rem;
      font-weight: 400;
    }

    &__title {
      margin: 1.5rem 0 1rem;
    }

    &__footer {
      display: flex;
      justify-content: flex-end;
      > * {
        margin-right: 1rem;
        &:last-child {
          margin-right: 0;
        }
      }
    }

    .add-phone {
      cursor: pointer;
      outline: none;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      padding-left: 0;
      margin-top: 0.5rem;

      i {
        font-size: 1.5rem;
        color: $grey;
        margin-right: 0.5rem;
      }
      &__label {
        font-size: 1rem;
        color: $black;
      }
    }
  }
</style>
