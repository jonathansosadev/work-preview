<template>
  <ModalBase class="modal-make-surveys">
    <template #header-icon>
      <i class="icon-gs-brand icon-size-xxl icon-gs-brand--garagescore">
        <span class="icon-icon-gs-brand"><span class="path1"></span><span class="path2 brand-color"></span><span class="path3"></span></span>
      </i>
    </template>

    <template #header-title>
      <span>{{ $t_locale('components/cockpit/admin/surveys/ModalMakeSurveys')('titleGS') }}</span>
    </template>

    <template #header-subtitle>
      <AppText tag="span" type="muted">
        {{ $t_locale('components/cockpit/admin/surveys/ModalMakeSurveys')('subtitleGS') }}
      </AppText>
    </template>

    <template #body>
      <div class="modal-make-surveys__part">
        <AppText tag="p">{{ $t_locale('components/cockpit/admin/surveys/ModalMakeSurveys')('bodySurvey') }}</AppText>
      </div>
    </template>

    <template #footer>
      <div class="modal-make-surveys__footer">
        <div>
          <Checkbox
            :label="$t_locale('components/cockpit/admin/surveys/ModalMakeSurveys')('notifyAdmin')"
            :labelStyle="labelStyle"
            :checked="shouldNotifyAdmin"
            @change="onCheckboxChange"
            class="checkbox"
          />
        </div>
        <div>
          <Button
            @click="closeModal"
            type="cancel"
          >
            {{ $t_locale('components/cockpit/admin/surveys/ModalMakeSurveys')('cancel') }}
          </Button>
          <Button
            @click="sendMakeSurveysModifications"
            type="orange"
          >
            {{ $t_locale('components/cockpit/admin/surveys/ModalMakeSurveys')('confirm') }}
          </Button>
        </div>
      </div>
    </template>
  </ModalBase>
</template>


<script>
  import Checkbox from '~/components/ui/CheckBox.vue';
  import Icon from '~/components/ui/Icon';

  export default {
    name: "ModalMakeSurveys",
    components: {
      Icon,
      Checkbox,
    },
    props: {
      closeModal: {
        type: Function,
        required: true,
      },
      // Surveys
      surveySignaturesModifications: [Array, Object],
      saveModifications: {
        type: Function,
        required: true,
      },
      updateGarageSurveySignature: {
        type: Function,
        required: true,
      },
    },

    data () {
      return {
        shouldNotifyAdmin: false,
      };
    },

    computed: {
      labelStyle() {
        return 'font-size: 0.92rem';
      },
    },
    methods: {
      async sendMakeSurveysModifications() {
        this.closeModal();
        await this.updateGarageSurveySignature(this.surveySignaturesModifications);
        this.saveModifications({
          shouldNotifyAdmin: this.shouldNotifyAdmin,
        });
      },
      onCheckboxChange(value) {
        this.shouldNotifyAdmin = value;
      },
    },
  }
</script>

<style lang="scss" scoped>
.icon-gs-brand:not(:empty) {
    &.icon-gs-brand--garagescore {
      .brand-color:before {
        color: $gsBrandColor !important;
      }
    }
  }
  .checkbox {
    color: rgb(117,117,117);
    font-weight: bold;
    font-size: 1rem;
    line-height: 15px;
  }
  .modal-make-surveys {
    &__icon {
      height: 3rem;
      width: 3rem;
    }

    &__part {
      line-height: 1.54;
      & :last-child:not(:empty) {
        margin-top: 0.3rem;
        margin-bottom: 0.4rem;
      }
    }
    &__footer {
      display: flex;
      justify-content: space-between;
      & > div {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      & Button {
        padding-left: 2rem;
        padding-right: 2rem;
        &:first-child {
          margin-right: 1rem;
        }
      }
    }
  }
  @media screen and (max-width: 479px) {
    .modal-make-surveys {
      &__footer {
        flex-wrap: wrap;
        justify-content: center;
        & > div {
          margin: 1rem 0 1rem 0;
        }
      }
    }
  }
</style>
