<template>
  <ModalBase class="modal-edit-source">
    <template slot="header-icon">
      <div class="modal-edit-source__icon">
        <img :src="`/cross-leads/${crossLead.type}.svg`"/>
      </div>
    </template>
    <template slot="header-title">
      <span>{{ $t_locale('components/cockpit/admin/sources/ModalEditSource')("title") }}</span>
    </template>
    <template slot="header-subtitle">
      <span>{{ $t_locale('components/cockpit/admin/sources/ModalEditSource')("infos") }}</span>
    </template>
    <template slot="body">
      <div class="modal-edit-source__content__field">
        <InputMaterial :value="source.garagePublicDisplayName" :disabled="!!source">
          <template slot="label" required>{{ $t_locale('components/cockpit/admin/sources/ModalEditSource')("garage") }}</template>
        </InputMaterial>
      </div>

      <div class="modal-edit-source__content__field">
        <InputMaterial
          v-model="source.followed_email"
          type="email"
          :isValid="emailValid ? 'Valid' : 'Invalid'"
          :validate="validateEmail">
          <template slot="label" required>{{ $t_locale('components/cockpit/admin/sources/ModalEditSource')("emailLabel") }}</template>
        </InputMaterial>
      </div>

      <Notification type="primary" class="notification" fixed>
        <template slot>
          <i class="icon-gs-alert-information-circle icon"></i>
          <span>{{ restrictMobile ? $t_locale('components/cockpit/admin/sources/ModalEditSource')('infoNoMobile') : $t_locale('components/cockpit/admin/sources/ModalEditSource')('info') }}</span>
        </template>
      </Notification>

      <div class="modal-edit-source__fields">
        <div class="modal-edit-source__content__field" v-for="(phone, index) in phones" :key="index">
          <PhoneInputMaterial
            v-model="phones[index].value"
            :validate="res => validatePhone(res, index)"
            :mode="restrictMobile ? 'landLine' : 'any'"
            :countries="['FR', 'MC']"
            :placeholder="$t_locale('components/cockpit/admin/sources/ModalEditSource')('phonePlaceholder')"
            required
          >
            <template slot="label">
              {{ !index ? $t_locale('components/cockpit/admin/sources/ModalEditSource')("phoneLabel") : $t_locale('components/cockpit/admin/sources/ModalEditSource')("phoneLabelPrev") }}
            </template>
            <template slot="kill">
              <i v-if="!phones[index + 1] && index" v-on:click="phones.pop()" class="icon-gs-close modal-edit-source__remove"></i>
            </template>
          </PhoneInputMaterial>
        </div>
      </div>

      <button class="add-phone" @click="handleAddPhone">
        <i class="icon-gs-add-outline-circle"></i>
        <span class="add-phone__label">{{ $t_locale('components/cockpit/admin/sources/ModalEditSource')("addPhone") }}</span>
      </button>
      <SourcePreview class="modal-edit-source__preview" v-if="source" :email="source.email" :phone="source.phone" :url="crossLead.url" :sourceType="$t_locale('components/cockpit/admin/sources/ModalEditSource')(source.type)" />
      <LoadingScreen :message="$t_locale('components/cockpit/admin/sources/ModalEditSource')('wait')" v-if="loading"/>
    </template>
    <template slot="footer">
      <div class="modal-edit-source__footer">
        <Button type="cancel" class="btn" @click="handleCancel">{{ $t_locale('components/cockpit/admin/sources/ModalEditSource')("cancel") }}</Button>
        <Button type="orange" class="btn validate-closing-btn" @click="handleEditSource">{{ $t_locale('components/cockpit/admin/sources/ModalEditSource')("submit") }}</Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
import SourcePreview from "~/components/cockpit/admin/sources/SourcePreview.vue";
import InputMaterial from "~/components/ui/InputMaterial.vue";
import LoadingScreen from "~/components/global/LoadingScreen.vue";

export default {
  props: {
    source: { type: Object }
  },

  components: { SourcePreview, InputMaterial, LoadingScreen },

  data() {
    return {
      loading: false,
      phones:
        this.source && this.source.followed_phones
          ? this.source.followed_phones.map(p => ({
              value: p,
              valid: true
            }))
          : [{ value: "", valid: false }],
      emailValid: true
    };
  },

  computed: {
    crossLead() {
      return this.$store.getters["cockpit/admin/crossLeads/crossLeadByType"](this.source.type);
    },
    restrictMobile() {
      if (!this.selectedGarage) return false;
      return this.selectedGarage.subscriptions && this.selectedGarage.subscriptions.restrictMobile;
    },
    availableCrossLeadsGarages() {
      return this.$store.getters["cockpit/availableCrossLeadsGarages"];
    },
    selectedGarage() {
      return this.availableCrossLeadsGarages.find(g => (g.id === this.source.garageId));
    }
  },

  methods: {
    validatePhone(validationResult, index) {
      this.phones[index].valid = validationResult;
    },

    validateEmail(res) {
      this.emailValid = res;
    },

    async handleEditSource() {
      this.loading = true;
      await this.$store.dispatch("cockpit/admin/crossLeads/addOrUpdateSource", {
        mutation: "setUpdatedSource",
        payload: {
          type: this.sourceType || this.source.type,
          garageId: this.selectedGarage.id,
          followed_phones: this.phones.map((p) => p.value),
          followed_email: this.email || this.source.followed_email
        }
      });
      this.loading = false;
      this.$store.dispatch("closeModal");
    },

    handleCancel() {
      this.$store.dispatch("closeModal");
    },

    handleAddPhone() {
      this.phones = [...this.phones, { value: "", valid: false }];
    }
  }
};
</script>

<style lang="scss" scoped>
  ::v-deep .phone-input-material__prompt__input {
    width: calc(100% - 76px - 0.5rem - 35px) !important;
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
  .modal-edit-source {
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

    &__infos {
      font-size: 0.93rem;
      margin-bottom: 1rem;
      font-weight: 400;
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
