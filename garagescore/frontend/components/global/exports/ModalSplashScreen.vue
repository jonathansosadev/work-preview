<template>
    <ModalBase class="modal-splash-screen" type="danger" :class="{ loader: true }">
        <template slot="body">
            <div>
              <img width="90" height="90" src="/analytics/check-animation.gif" alt="" />
            </div>
            <div :class="{ loader: true, fadein: !isLoading }">
                {{ $t_locale('components/global/exports/ModalSplashScreen')('ExportConfirm') }}
            </div>
            <div :class="{ mail: true, fadein: !isLoading }">
                {{ recipients.join(', ') }}
            </div>
        </template>
          <template slot="footer">
          <div class="modal-splash-screen__footer">
            <Button @click="closeModal()" type="orange" thick>
              <span>{{ $t_locale('components/global/exports/ModalSplashScreen')('Close') }}</span>
            </Button>
          </div>
        </template>

    </ModalBase>
</template>

<script>
export default {
    name: 'ModalSplashScreen',
    props: {
      isSaved: {
        type: Boolean,
        default: false,
      },
      isLoading: {
        type: Boolean,
        default: false,
      },
      recipients: {
        type: Array,
        default: () => [],
      },
      closeModalFunction: {
        type: Function,
        default: () => console.error('ModalSplashScreen.vue ::closeModalFunction not set')
      },
      openCustomExportModalFunction: {
        type: Function,
        default: () => console.error('ModalSplashScreen.vue :: openCustomExportModalFunction not set')
      }
    },

  methods: {
    closeModal() {
      if (this.isSaved) {
        this.openCustomExportModalFunction();
      } else {
        this.closeModalFunction();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-splash-screen {
  overflow: auto;
  min-width: 680px;

  &__question {
    font-size: 18px;
    color: $black;
    font-weight: 900;
    margin: 1.5rem 0 .5rem;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}

.loader {
  color: $custeedBrandColor;
  font-weight: 400;
  font-size: 18px;
  text-align: center;
  margin-top: 1.5rem;
}

.mail {
  color: $dark-grey;
  font-weight: 400;
  font-size: 1rem;
  text-align: center;
  margin-top: 10px;
}

.fadein {
  animation: fadein 2s forwards;
}

@keyframes fadein {
  from { opacity: 0; }
    to { opacity: 1; }
}
</style>
